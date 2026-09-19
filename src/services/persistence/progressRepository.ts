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

/**
 * One answered question, practice or exam, with enough context
 * (chapter + tags) to compute per-chapter/per-tag accuracy and
 * activity trends without re-joining against the question bank every
 * time a stats screen renders. `mode` keeps practice and exam activity
 * distinguishable for anything that should only count one of the two
 * (e.g. a future "practice streak" vs. a combined mastery view).
 */
export type AttemptLogEntry = {
  dateIso: string;
  questionId: string;
  chapterId: string;
  tags: string[];
  correct: boolean;
  mode: "practice" | "exam";
};

/**
 * Practice is high-frequency enough that an unbounded log could grow
 * without limit over months of use; exam history (a handful of rows a
 * week at most) is left uncapped. This many entries is already far more
 * than any trend/streak/accuracy view built on top of it needs to look
 * back over.
 */
export const MAX_ATTEMPT_LOG_ENTRIES = 2000;

export type PersistedProgress = {
  schemaVersion: 2;
  chapterProgress: Record<string, ChapterProgress>;
  bookmarkedQuestionIds: string[];
  incorrectQuestionIds: string[];
  practiceStats: {
    totalAttempts: number;
    totalCorrect: number;
  };
  examHistory: ExamAttempt[];
  attemptLog: AttemptLogEntry[];
};

/**
 * Shape written by app versions before the attempt log existed. Kept
 * only so `loadProgress` can migrate a device's existing data forward
 * instead of discarding bookmarks/exam history/practice stats the first
 * time this version runs - see the migration branch below.
 */
type PersistedProgressV1 = {
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
  schemaVersion: 2,
  chapterProgress: {},
  bookmarkedQuestionIds: [],
  incorrectQuestionIds: [],
  practiceStats: {
    totalAttempts: 0,
    totalCorrect: 0,
  },
  examHistory: [],
  attemptLog: [],
};

/**
 * Loads persisted progress (chapter completion, bookmarks, practice
 * stats, exam history, attempt log). Falls back to a fresh default
 * state if nothing is stored or the schema version is unrecognized.
 *
 * A `schemaVersion: 1` record (written by any app version before the
 * attempt log existed) is upgraded in place - every existing field is
 * kept exactly as stored, and `attemptLog` starts empty going forward.
 * This only back-fills future activity; it does not attempt to
 * reconstruct history the old schema never recorded.
 */
export async function loadProgress(): Promise<PersistedProgress> {
  const stored = await readJson<PersistedProgress | PersistedProgressV1>(STORAGE_KEYS.PROGRESS);
  if (!stored) {
    return DEFAULT_PROGRESS;
  }
  if (stored.schemaVersion === 2) {
    return stored;
  }
  if (stored.schemaVersion === 1) {
    return {
      schemaVersion: 2,
      chapterProgress: stored.chapterProgress,
      bookmarkedQuestionIds: stored.bookmarkedQuestionIds,
      incorrectQuestionIds: stored.incorrectQuestionIds,
      practiceStats: stored.practiceStats,
      examHistory: stored.examHistory,
      attemptLog: [],
    };
  }
  return DEFAULT_PROGRESS;
}

export async function saveProgress(progress: PersistedProgress): Promise<void> {
  await writeJson(STORAGE_KEYS.PROGRESS, progress);
}

export async function clearProgress(): Promise<void> {
  await removeKey(STORAGE_KEYS.PROGRESS);
}
