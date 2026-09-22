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

/**
 * Deliberately has no questionsPath/questionCount/reviewStatus:
 * questions are no longer stored one file per chapter (see
 * src/data/questionLoader.ts's reference-511-bank adapter), so a static
 * per-chapter count here would just be one more place to go stale - see
 * the manifest-drift bug class questionBankGovernance.test.ts used to
 * guard against before this change. Study's chapter list now computes
 * its question count live via getQuestionsByChapter().
 */
export type ManifestChapterEntry = {
  id: string;
  en: { title: string; contentPath: string };
  fr: { title: string; contentPath: string };
};

export type Manifest = {
  chapters: ManifestChapterEntry[];
};
