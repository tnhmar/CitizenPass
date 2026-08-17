import { STORAGE_KEYS } from "./storageKeys";
import { readJson, writeJson, removeKey } from "./genericStorage";

export type ChapterProgress = {
  /** 0-100 completion percentage for this chapter's study content. */
  completionPercent: number;
};

export type ExamAttempt = {
  dateIso: string;
  score: number;
  total: number;
  passed: boolean;
};

export type PersistedProgress = {
  schemaVersion: 1;
  chapterProgress: Record<string, ChapterProgress>;
  bookmarkedQuestionIds: string[];
  incorrectQuestionIds: string[];
  practiceStats: {
    totalAttempts: number;
    totalCorrect: number;
  };
  examHistory: ExamAttempt[];
};

export const DEFAULT_PROGRESS: PersistedProgress = {
  schemaVersion: 1,
  chapterProgress: {},
  bookmarkedQuestionIds: [],
  incorrectQuestionIds: [],
  practiceStats: {
    totalAttempts: 0,
    totalCorrect: 0,
  },
  examHistory: [],
};

/**
 * Loads persisted progress (chapter completion, bookmarks, practice
 * stats, exam history). Falls back to a fresh default state if nothing
 * is stored or the schema version is incompatible.
 */
export async function loadProgress(): Promise<PersistedProgress> {
  const stored = await readJson<PersistedProgress>(STORAGE_KEYS.PROGRESS);
  if (!stored || stored.schemaVersion !== 1) {
    return DEFAULT_PROGRESS;
  }
  return stored;
}

export async function saveProgress(progress: PersistedProgress): Promise<void> {
  await writeJson(STORAGE_KEYS.PROGRESS, progress);
}

export async function clearProgress(): Promise<void> {
  await removeKey(STORAGE_KEYS.PROGRESS);
}
