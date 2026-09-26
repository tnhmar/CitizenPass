/**
 * Citation completeness scales with review status: a "verified" question
 * must have sourceUrl/excerpt/verifiedAt (this project's original bar -
 * a live canada.ca page, quoted). A "needs-review" question - notably,
 * everything freshly imported from the reference 511-question bank,
 * which only ever provided a PDF page number, not a canada.ca URL - may
 * have only pdfPage/paragraph populated instead. See
 * docs/content-governance.md, "Importing from the reference
 * 511-question bank" for the workflow that upgrades a question from one
 * state to the other.
 */
export type SourceCitation = {
  guide: "Discover Canada" | "Découvrir le Canada";
  language: "en" | "fr";
  edition?: string;
  sourceUrl?: string;
  chapter?: string;
  section?: string;
  printedPage?: number;
  pdfPage?: number;
  paragraph?: number;
  excerpt?: string;
  verifiedAt?: string;
  reviewStatus: "verified" | "needs-review";
};

/**
 * Per-option "why" - not just for the correct answer, but a category +
 * explanation for every option, so a future UI could show why each wrong
 * option is wrong, not only which one is right. Optional and additive:
 * existing questions with no annotations still work exactly as before,
 * falling back to LocalizedQuestion.explanation (which every question
 * has). See docs/question-bank-comparison-report.md §4-5 for where this
 * shape comes from and a data-quality pitfall to avoid when authoring
 * it: a wrong option's `relevance` must never be "CORRECT_ANSWER" - that
 * exact mislabeling was found in ~50% of the reference bank's true/false
 * questions there, and `questionBankGovernance.test.ts` now rejects it
 * (see the "option annotation integrity" describe block).
 */
export type OptionRelevance =
  | "CORRECT_ANSWER"
  | "PARTIALLY_CORRECT"
  | "PLAUSIBLE_DISTRACTOR"
  | "COMMON_MISCONCEPTION"
  | "RELATED_FACT"
  | "WRONG_CATEGORY"
  | "ANACHRONISM";

export type OptionAnnotation = {
  relevance: OptionRelevance;
  explanation: string;
};

export type LocalizedQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: SourceCitation;
  /** Same length and order as `options`, when present. Optional - see OptionAnnotation. */
  optionAnnotations?: OptionAnnotation[];
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
  /**
   * Optional as of the reference-511-bank import: the app is running
   * English-only for now (see docs/content-governance.md and the
   * "French sourcing" phase in docs/question-bank-comparison-report.md).
   * UI code must not assume this exists - use
   * getLocalizedQuestion(question, language) from
   * src/utils/questionDisplay.ts, which falls back to `en`, rather than
   * indexing `question[language]` directly.
   */
  fr?: LocalizedQuestion;
  /** Present only for questions that have an Arabic translation so far (rollout is in progress). */
  ar?: ArabicTranslation;
  /**
   * Coarse/fine category labels, independent of `tags` and `chapterId` -
   * carried over from a broader reference question bank's own taxonomy
   * (e.g. topic: "history", subtopic: "confederation_year") rather than
   * derived from this app's chapter/tag vocabulary. Optional: only
   * questions authored from that source populate these; existing
   * questions are unaffected. Not localized (internal identifiers, same
   * rationale as `tags` - see humanizeTag in src/utils/progressStats.ts).
   */
  topic?: string;
  subtopic?: string;
  /** A short memorization aid, shown regardless of app language (an
   *  internal study hint, not sourced/cited content). Optional. */
  testTip?: string;
  /** Ids of related questions (e.g. the reverse-lookup or a commonly
   *  confused fact), for a future "related questions" UI. Optional. */
  crossReferences?: string[];
};

export type AppLanguage = "en" | "fr";
export type AppTheme = "light" | "dark" | "system";

/**
 * Accent color family, independent of the light/dark mode in `AppTheme`.
 * "classicRed" is the original Canada-inspired default; the rest are the
 * alternate palettes proposed in the theme audit (see
 * docs/theme-navigation-responsive-overhaul.md). Adding a new scheme means
 * adding one entry to `COLOR_SCHEMES` in `src/theme/tokens.ts` plus a label
 * key in i18n - nothing else needs to change.
 */
export type AppColorScheme =
  | "classicRed"
  | "oceanBlue"
  | "twilightIndigo"
  | "terracotta"
  | "slateCharcoal"
  | "plumMagenta";
