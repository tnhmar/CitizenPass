export type SourceCitation = {
  guide: "Discover Canada" | "Découvrir le Canada";
  language: "en" | "fr";
  edition: string;
  sourceUrl: string;
  chapter: string;
  section: string;
  printedPage?: number;
  pdfPage?: number;
  paragraph?: number;
  excerpt: string;
  verifiedAt: string;
  reviewStatus: "verified" | "needs-review";
};

export type LocalizedQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: SourceCitation;
};

/**
 * Arabic is a comprehension aid, not a third exam language: no correctIndex
 * (nothing is ever selectable on the Arabic face) and no SourceCitation
 * (this is a translation of already-verified en/fr content, not an
 * independently-sourced fact — see docs/question-bank-scaling.md).
 */
export type ArabicTranslation = {
  question: string;
  options: string[];
  explanation: string;
};

export type Question = {
  id: string;
  chapterId: string;
  type: "multiple-choice" | "true-false";
  tags: string[];
  learningObjectiveId: string;
  /**
   * When this question is an additional framing (different angle, same
   * underlying verified fact/citation) of another question's learning
   * objective, this references that base learningObjectiveId. Lets the
   * bank scale coverage (multiple question styles per fact — direct
   * recall, reverse/name, negative/elimination, etc.) without requiring
   * new source verification for each variant, while still letting
   * tooling group/audit "families" of related items for the
   * near-duplicate check in docs/content-governance.md.
   */
  variantOf?: string;
  difficulty: 1 | 2 | 3;
  en: LocalizedQuestion;
  fr: LocalizedQuestion;
  /** Present only for questions that have an Arabic translation so far (rollout is in progress). */
  ar?: ArabicTranslation;
};

export type AppLanguage = "en" | "fr";
export type AppTheme = "light" | "dark" | "system";
