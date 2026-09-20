import type { AppLanguage } from "../types";
import { getChapterList, getChapterContent, getChapterManifestEntry, getChapterTitle } from "./contentLoader";
import { getAllVerifiedQuestions } from "./questionLoader";

export type SearchResultType = "study" | "practice";

export type SearchResult = {
  type: SearchResultType;
  chapterId: string;
  chapterTitle: string;
  /** For "study": the matching heading/paragraph/bullet. For
   *  "practice": the matching question's own text. */
  snippet: string;
  /** Only set for "practice" results. */
  questionId?: string;
};

/** Below this many characters, a query matches too much of the content
 *  to be a useful result list (e.g. a single letter). */
const MIN_QUERY_LENGTH = 2;
/** Caps practice results only - study results are naturally capped at
 *  one per chapter (10 chapters), but a common word can appear in
 *  dozens of questions, which would otherwise flood the list. */
const MAX_PRACTICE_RESULTS = 20;

/**
 * Case-insensitive substring search across both Study content (chapter
 * headings/paragraphs/bullets) and Practice content (question text),
 * in whichever language is passed. Returns at most one Study hit per
 * chapter - enough to point the learner at the right chapter without
 * flooding the list with every paragraph that happens to match.
 */
export function searchContent(query: string, language: AppLanguage): SearchResult[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < MIN_QUERY_LENGTH) return [];

  const results: SearchResult[] = [];

  for (const chapter of getChapterList()) {
    const content = getChapterContent(chapter.id, language);
    if (!content) continue;
    for (const section of content.sections) {
      const candidates = [section.heading, ...section.paragraphs, ...section.bullets];
      const match = candidates.find((text): text is string => !!text && text.toLowerCase().includes(needle));
      if (match) {
        results.push({
          type: "study",
          chapterId: chapter.id,
          chapterTitle: getChapterTitle(chapter, language),
          snippet: match,
        });
        break;
      }
    }
  }

  const questionMatches = getAllVerifiedQuestions().filter((question) => question[language].question.toLowerCase().includes(needle));
  for (const question of questionMatches.slice(0, MAX_PRACTICE_RESULTS)) {
    const chapter = getChapterManifestEntry(question.chapterId);
    results.push({
      type: "practice",
      chapterId: question.chapterId,
      chapterTitle: chapter ? getChapterTitle(chapter, language) : question.chapterId,
      snippet: question[language].question,
      questionId: question.id,
    });
  }

  return results;
}
