import type { Question, LocalizedQuestion, OptionAnnotation, OptionRelevance } from "../types";

import referenceBank from "./reference/reference-511-bank.json";
import preservedLegacyFacts from "./questions/preserved-legacy-facts.json";
import verifiedApplyingForCitizenship from "./questions/verified/applying-for-citizenship.json";

// ---------------------------------------------------------------------
// Reference-511-bank adapter
//
// The app runs on the reference 511-question bank directly now (English
// only) rather than a hand-migrated copy of it - see
// docs/content-governance.md, "Importing from the reference 511-question
// bank" and docs/question-bank-comparison-report.md for why. This
// section maps its raw shape (question_text/options[].is_correct/
// source_chapter/etc.) onto this app's Question type at load time. No
// question text, options, or citations are rewritten here - only
// mechanical, deterministic transforms (field renames, type mapping,
// chapter classification, and one integrity fix - see the
// "mislabeled CORRECT_ANSWER" comment below). French is intentionally
// absent: every question's `fr` is undefined until the French-sourcing
// phase (real translation from the French guide, not machine
// translation) happens. See getLocalizedQuestion() in
// src/utils/questionDisplay.ts for how the rest of the app handles that
// gap gracefully.
// ---------------------------------------------------------------------

type ReferenceOption = {
  text: string;
  is_correct: boolean;
  annotation?: { relevance?: string; explanation?: string };
};

type ReferenceQuestion = {
  id: string;
  question_type: "multiple_choice" | "true_false";
  topic?: string;
  subtopic?: string;
  difficulty?: string;
  question_text: string;
  options: ReferenceOption[];
  source_chapter?: string;
  source_section?: string;
  source_page?: number;
  test_tip?: string;
  cross_references?: string[];
};

/** source_chapter -> this app's chapterId. "How Canadians Govern
 *  Themselves" isn't listed here - the reference bank doesn't pre-split
 *  Federal Elections out of it, so that one case is handled by
 *  mapChapterId() below instead of this static table. */
const CHAPTER_MAP: Record<string, string> = {
  "Applying for Citizenship": "applying-for-citizenship",
  "Rights and Responsibilities": "rights-responsibilities",
  "Rights and Responsibilities of Citizenship": "rights-responsibilities",
  "Who We Are": "who-we-are",
  "Canada's History": "canadas-history",
  "Canada's History (Modern)": "canadas-history",
  "Modern Canada": "modern-canada",
  "The Justice System": "justice-system",
  "Canadian Symbols": "canadian-symbols",
  "Canada's Economy": "canadas-economy",
  "Canada's Regions": "canadas-regions",
};

const ELECTION_SUBTOPIC_KEYWORDS = ["elect", "vote", "voting", "riding", "ballot", "candidate", "poll"];

const DIFFICULTY_MAP: Record<string, 1 | 2 | 3> = { easy: 1, medium: 2, hard: 3 };

const VALID_RELEVANCE: OptionRelevance[] = [
  "CORRECT_ANSWER",
  "PARTIALLY_CORRECT",
  "PLAUSIBLE_DISTRACTOR",
  "COMMON_MISCONCEPTION",
  "RELATED_FACT",
  "WRONG_CATEGORY",
  "ANACHRONISM",
];

const NOT_PROVIDED = /^not provided\.?$/i;

function mapChapterId(raw: ReferenceQuestion): string | null {
  const sourceChapter = (raw.source_chapter ?? "").trim();
  if (sourceChapter === "How Canadians Govern Themselves") {
    const subtopic = (raw.subtopic ?? "").toLowerCase();
    return ELECTION_SUBTOPIC_KEYWORDS.some((keyword) => subtopic.includes(keyword))
      ? "federal-elections"
      : "how-canadians-govern-themselves";
  }
  return CHAPTER_MAP[sourceChapter] ?? null;
}

/** "citizenship_application" -> "citizenship-application", matching this
 *  app's existing tag vocabulary style. */
function subtopicToTag(subtopic: string | undefined): string | null {
  if (!subtopic) return null;
  return subtopic.trim().replace(/_/g, "-").toLowerCase() || null;
}

function cleanExplanation(text: string | undefined, fallback: string): string {
  const trimmed = text?.trim();
  return trimmed && !NOT_PROVIDED.test(trimmed) ? trimmed : fallback;
}

function adaptReferenceQuestion(raw: ReferenceQuestion): Question | null {
  const chapterId = mapChapterId(raw);
  if (!chapterId) return null; // e.g. the one stray "Authorities" record

  const correctIndex = raw.options.findIndex((option) => option.is_correct);
  if (correctIndex < 0) return null; // structurally broken record, skip rather than crash

  const options = raw.options.map((option) => option.text);
  const explanation = cleanExplanation(
    raw.options[correctIndex].annotation?.explanation,
    `The correct answer is: ${raw.options[correctIndex].text}`
  );

  const hasFullAnnotations = raw.options.every((option) => option.annotation);
  const optionAnnotations: OptionAnnotation[] | undefined = hasFullAnnotations
    ? raw.options.map((option, index) => {
        const isCorrect = index === correctIndex;
        const rawRelevance = option.annotation?.relevance ?? "";
        const declaredRelevance: OptionRelevance = VALID_RELEVANCE.includes(rawRelevance as OptionRelevance)
          ? (rawRelevance as OptionRelevance)
          : "RELATED_FACT";
        // Mechanical fix for a confirmed data bug in this reference bank
        // (docs/question-bank-comparison-report.md §5): ~50% of its
        // true/false questions had the *wrong* option's relevance
        // mislabeled CORRECT_ANSWER. is_correct/correctIndex were always
        // right - only this label was wrong - so this is a deterministic
        // correction, not editorial judgment: the correct option is
        // always CORRECT_ANSWER, and no other option ever is.
        const relevance: OptionRelevance = isCorrect
          ? "CORRECT_ANSWER"
          : declaredRelevance === "CORRECT_ANSWER"
            ? "RELATED_FACT"
            : declaredRelevance;
        return { relevance, explanation: cleanExplanation(option.annotation?.explanation, explanation) };
      })
    : undefined;

  const tag = subtopicToTag(raw.subtopic);

  const en: LocalizedQuestion = {
    question: raw.question_text,
    options,
    correctIndex,
    explanation,
    source: {
      guide: "Discover Canada",
      language: "en",
      chapter: raw.source_chapter,
      section: raw.source_section,
      pdfPage: raw.source_page,
      // Not "verified": these citations are the reference bank's own PDF
      // page numbers, not a live canada.ca URL + excerpt this project
      // would normally require - see docs/content-governance.md.
      reviewStatus: "needs-review",
    },
    optionAnnotations,
  };

  return {
    id: raw.id,
    chapterId,
    type: raw.question_type === "true_false" ? "true-false" : "multiple-choice",
    tags: tag ? [tag] : [],
    learningObjectiveId: `ref-${raw.id.toLowerCase()}`,
    difficulty: DIFFICULTY_MAP[raw.difficulty ?? "medium"] ?? 2,
    en,
    topic: raw.topic,
    subtopic: raw.subtopic,
    testTip: raw.test_tip,
    crossReferences: raw.cross_references && raw.cross_references.length > 0 ? raw.cross_references : undefined,
  };
}

function dedupeByQuestionText(questions: Question[]): Question[] {
  const seen = new Set<string>();
  const result: Question[] = [];
  for (const question of questions) {
    const key = `${question.chapterId}::${question.en.question.trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(question);
  }
  return result;
}

// ---------------------------------------------------------------------
// Verified upgrades
//
// A question is upgraded from `needs-review` to `verified` (real
// canada.ca citation + real, independently-sourced French - see
// docs/content-governance.md, "Current state") by adding it to one of
// these per-chapter files under src/data/questions/verified/, not by
// editing the reference bank. Each file's questions replace their raw
// reference-bank counterpart entirely (same id) rather than merging
// with it, so the excluded-ids set below is exactly which raw records
// to skip when adapting.
// ---------------------------------------------------------------------
const VERIFIED_UPGRADES: Question[][] = [verifiedApplyingForCitizenship as Question[]];

const verifiedQuestions: Question[] = VERIFIED_UPGRADES.flat();
const verifiedIds = new Set(verifiedQuestions.map((question) => question.id));

const adaptedReferenceQuestions: Question[] = dedupeByQuestionText(
  (referenceBank.questions as ReferenceQuestion[])
    .filter((raw) => !verifiedIds.has(raw.id))
    .map(adaptReferenceQuestion)
    .filter((q): q is Question => q !== null)
);

/**
 * Every question the app can draw from: the adapted reference bank
 * (minus any record superseded by a verified upgrade above), the
 * verified upgrades themselves, and a small set of facts from this
 * project's previous (pre-511) bank that the reference bank doesn't
 * cover at all - see docs/content-governance.md, "Reference-bank gap
 * facts" for exactly which four and why. Static imports (not dynamic
 * requires) so Metro bundles everything offline.
 */
const ALL_QUESTIONS: Question[] = [...adaptedReferenceQuestions, ...verifiedQuestions, ...(preservedLegacyFacts as Question[])];

export function getAllQuestions(): Question[] {
  return ALL_QUESTIONS;
}

export function getQuestionsByChapter(chapterId: string): Question[] {
  return ALL_QUESTIONS.filter((question) => question.chapterId === chapterId);
}

export function getQuestionById(questionId: string): Question | null {
  return ALL_QUESTIONS.find((question) => question.id === questionId) ?? null;
}

/** Fisher-Yates shuffle; does not mutate the input array. */
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Draws up to `count` random questions, excluding any ids in `excludeIds`.
 * When `chapterId` is provided, the draw pool is restricted to that
 * chapter's questions only, enabling per-chapter practice.
 */
export function drawRandomQuestions(count: number, excludeIds: string[] = [], chapterId?: string): Question[] {
  const basePool = chapterId ? ALL_QUESTIONS.filter((question) => question.chapterId === chapterId) : ALL_QUESTIONS;
  const pool = basePool.filter((question) => !excludeIds.includes(question.id));
  return shuffle(pool).slice(0, count);
}

export type PracticeQueryFilter = {
  chapterId?: string;
  tag?: string;
  /** Restrict the pool to exactly these ids (e.g. Smart Practice's
   *  "questions I've gotten wrong before"). Combines with chapterId/tag
   *  if more than one is given, though callers currently only ever pass
   *  one filter dimension at a time - see practice.tsx's PracticeFilter. */
  onlyIds?: string[];
};

/**
 * Draws up to `count` random questions matching an optional chapter,
 * tag, and/or explicit id allowlist, excluding ids already seen this
 * session. A separate function from `drawRandomQuestions` (used by the
 * exam) so Smart Practice's filtering can evolve without touching exam
 * question selection at all.
 */
export function drawFilteredQuestions(count: number, filter: PracticeQueryFilter = {}, excludeIds: string[] = []): Question[] {
  let pool = ALL_QUESTIONS;
  if (filter.chapterId) {
    pool = pool.filter((question) => question.chapterId === filter.chapterId);
  }
  if (filter.tag) {
    pool = pool.filter((question) => question.tags.includes(filter.tag as string));
  }
  if (filter.onlyIds) {
    const allowed = new Set(filter.onlyIds);
    pool = pool.filter((question) => allowed.has(question.id));
  }
  pool = pool.filter((question) => !excludeIds.includes(question.id));
  return shuffle(pool).slice(0, count);
}
