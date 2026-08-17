export type ChapterSection = {
  id: string;
  heading: string | null;
  paragraphs: string[];
  bullets: string[];
};

export type ChapterContentSource = {
  guide: string;
  language: "en" | "fr";
  edition: string;
  sourceUrl: string;
  verifiedAt: string;
};

export type ChapterContent = {
  chapterId: string;
  title: string;
  source: ChapterContentSource;
  sections: ChapterSection[];
};

export type ManifestChapterEntry = {
  id: string;
  en: { title: string; contentPath: string };
  fr: { title: string; contentPath: string };
  questionsPath: string;
  questionCount: number;
  reviewStatus: "verified" | "needs-review";
};

export type Manifest = {
  chapters: ManifestChapterEntry[];
};
