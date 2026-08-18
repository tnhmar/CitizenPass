import type { Question } from "../types";

import rightsResponsibilitiesQuestions from "./questions/rights-responsibilities.json";
import whoWeAreQuestions from "./questions/who-we-are.json";
import canadasHistoryQuestions from "./questions/canadas-history.json";
import modernCanadaQuestions from "./questions/modern-canada.json";
import governThemselvesQuestions from "./questions/how-canadians-govern-themselves.json";
import federalElectionsQuestions from "./questions/federal-elections.json";
import justiceSystemQuestions from "./questions/justice-system.json";
import canadianSymbolsQuestions from "./questions/canadian-symbols.json";
import canadasRegionsQuestions from "./questions/canadas-regions.json";

/**
 * Static imports of every chapter's question bank so Metro bundles all
 * questions offline — no dynamic requires, no network fetch. Only
 * `reviewStatus: "verified"` questions are exposed by this module; see
 * docs/content-governance.md, "Release rule."
 */
const ALL_QUESTIONS: Question[] = ([] as Question[]).concat(
  rightsResponsibilitiesQuestions as Question[],
  whoWeAreQuestions as Question[],
  canadasHistoryQuestions as Question[],
  modernCanadaQuestions as Question[],
  governThemselvesQuestions as Question[],
  federalElectionsQuestions as Question[],
  justiceSystemQuestions as Question[],
  canadianSymbolsQuestions as Question[],
  canadasRegionsQuestions as Question[]
);

const VERIFIED_QUESTIONS: Question[] = ALL_QUESTIONS.filter(
  (question) => question.en.source.reviewStatus === "verified" && question.fr.source.reviewStatus === "verified"
);

export function getAllVerifiedQuestions(): Question[] {
  return VERIFIED_QUESTIONS;
}

export function getVerifiedQuestionsByChapter(chapterId: string): Question[] {
  return VERIFIED_QUESTIONS.filter((question) => question.chapterId === chapterId);
}

export function getQuestionById(questionId: string): Question | null {
  return VERIFIED_QUESTIONS.find((question) => question.id === questionId) ?? null;
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
 * chapter's verified questions only, enabling per-chapter practice.
 */
export function drawRandomQuestions(count: number, excludeIds: string[] = [], chapterId?: string): Question[] {
  const basePool = chapterId
    ? VERIFIED_QUESTIONS.filter((question) => question.chapterId === chapterId)
    : VERIFIED_QUESTIONS;
  const pool = basePool.filter((question) => !excludeIds.includes(question.id));
  return shuffle(pool).slice(0, count);
}
