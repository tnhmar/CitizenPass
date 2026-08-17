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

export type Question = {
  id: string;
  chapterId: string;
  type: "multiple-choice" | "true-false";
  tags: string[];
  learningObjectiveId: string;
  difficulty: 1 | 2 | 3;
  en: LocalizedQuestion;
  fr: LocalizedQuestion;
};

export type AppLanguage = "en" | "fr";
export type AppTheme = "light" | "dark" | "system";
