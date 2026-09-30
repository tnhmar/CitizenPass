import { create } from "zustand";
import {
  DEFAULT_PROGRESS,
  loadProgress,
  saveProgress,
  clearProgress,
  MAX_ATTEMPT_LOG_ENTRIES,
  type PersistedProgress,
  type ExamAttempt,
  type AttemptLogEntry,
} from "../services/persistence/progressRepository";
import { getQuestionById } from "../data/questionLoader";

type ProgressState = {
  hydrated: boolean;
  chapterProgress: PersistedProgress["chapterProgress"];
  bookmarkedQuestionIds: string[];
  incorrectQuestionIds: string[];
  practiceStats: PersistedProgress["practiceStats"];
  examHistory: ExamAttempt[];
  attemptLog: AttemptLogEntry[];

  hydrate: () => Promise<void>;
  setChapterCompletion: (chapterId: string, completionPercent: number) => Promise<void>;
  toggleBookmark: (questionId: string) => Promise<void>;
  recordPracticeAnswer: (questionId: string, correct: boolean) => Promise<void>;
  recordExamAttempt: (attempt: ExamAttempt) => Promise<void>;
  /**
   * Logs every question of a just-submitted exam into the attempt log in
   * one batch (one state update, one disk write) rather than one call per
   * question. Separate from `recordExamAttempt`, which only stores the
   * exam's aggregate score/pass-fail in `examHistory` - that summary shape
   * predates the attempt log and other code already depends on it as-is.
   */
  logExamAttempts: (entries: { questionId: string; correct: boolean }[]) => Promise<void>;
  resetProgress: () => Promise<void>;
};

function snapshot(state: ProgressState): PersistedProgress {
  return {
    schemaVersion: 2,
    chapterProgress: state.chapterProgress,
    bookmarkedQuestionIds: state.bookmarkedQuestionIds,
    incorrectQuestionIds: state.incorrectQuestionIds,
    practiceStats: state.practiceStats,
    examHistory: state.examHistory,
    attemptLog: state.attemptLog,
  };
}

/**
 * Appends new attempts to the log, stamping each with the question's
 * current chapter/tags (looked up from the verified question bank, not
 * passed in by callers, so every call site only ever needs a questionId).
 * A question that can't be found (e.g. retired from the bank since it was
 * answered) is silently skipped rather than logged with missing context.
 * Trims from the front once `MAX_ATTEMPT_LOG_ENTRIES` is exceeded - see
 * that constant in progressRepository.ts for why.
 */
function appendAttempts(
  current: AttemptLogEntry[],
  newAttempts: { questionId: string; correct: boolean; mode: AttemptLogEntry["mode"] }[]
): AttemptLogEntry[] {
  const dateIso = new Date().toISOString();
  const entries: AttemptLogEntry[] = [];
  for (const { questionId, correct, mode } of newAttempts) {
    const question = getQuestionById(questionId);
    if (!question) continue;
    entries.push({ dateIso, questionId, chapterId: question.chapterId, tags: question.tags, correct, mode });
  }
  const merged = [...current, ...entries];
  return merged.length > MAX_ATTEMPT_LOG_ENTRIES ? merged.slice(merged.length - MAX_ATTEMPT_LOG_ENTRIES) : merged;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  hydrated: false,
  chapterProgress: DEFAULT_PROGRESS.chapterProgress,
  bookmarkedQuestionIds: DEFAULT_PROGRESS.bookmarkedQuestionIds,
  incorrectQuestionIds: DEFAULT_PROGRESS.incorrectQuestionIds,
  practiceStats: DEFAULT_PROGRESS.practiceStats,
  examHistory: DEFAULT_PROGRESS.examHistory,
  attemptLog: DEFAULT_PROGRESS.attemptLog,

  hydrate: async () => {
    const stored = await loadProgress();
    set({
      chapterProgress: stored.chapterProgress,
      bookmarkedQuestionIds: stored.bookmarkedQuestionIds,
      incorrectQuestionIds: stored.incorrectQuestionIds,
      practiceStats: stored.practiceStats,
      examHistory: stored.examHistory,
      attemptLog: stored.attemptLog,
      hydrated: true,
    });
  },

  setChapterCompletion: async (chapterId, completionPercent) => {
    const chapterProgress = {
      ...get().chapterProgress,
      [chapterId]: { completionPercent },
    };
    set({ chapterProgress });
    await saveProgress(snapshot(get()));
  },

  toggleBookmark: async (questionId) => {
    const current = get().bookmarkedQuestionIds;
    const bookmarkedQuestionIds = current.includes(questionId)
      ? current.filter((id) => id !== questionId)
      : [...current, questionId];
    set({ bookmarkedQuestionIds });
    await saveProgress(snapshot(get()));
  },

  recordPracticeAnswer: async (questionId, correct) => {
    const { practiceStats, incorrectQuestionIds } = get();
    const nextStats = {
      totalAttempts: practiceStats.totalAttempts + 1,
      totalCorrect: practiceStats.totalCorrect + (correct ? 1 : 0),
    };
    const nextIncorrect = correct
      ? incorrectQuestionIds.filter((id) => id !== questionId)
      : incorrectQuestionIds.includes(questionId)
        ? incorrectQuestionIds
        : [...incorrectQuestionIds, questionId];
    const attemptLog = appendAttempts(get().attemptLog, [{ questionId, correct, mode: "practice" }]);
    set({ practiceStats: nextStats, incorrectQuestionIds: nextIncorrect, attemptLog });
    await saveProgress(snapshot(get()));
  },

  recordExamAttempt: async (attempt) => {
    const examHistory = [...get().examHistory, attempt];
    set({ examHistory });
    await saveProgress(snapshot(get()));
  },

  logExamAttempts: async (entries) => {
    const attemptLog = appendAttempts(
      get().attemptLog,
      entries.map((entry) => ({ ...entry, mode: "exam" as const }))
    );
    set({ attemptLog });
    await saveProgress(snapshot(get()));
  },

  resetProgress: async () => {
    await clearProgress();
    set({
      chapterProgress: DEFAULT_PROGRESS.chapterProgress,
      bookmarkedQuestionIds: DEFAULT_PROGRESS.bookmarkedQuestionIds,
      incorrectQuestionIds: DEFAULT_PROGRESS.incorrectQuestionIds,
      practiceStats: DEFAULT_PROGRESS.practiceStats,
      examHistory: DEFAULT_PROGRESS.examHistory,
      attemptLog: DEFAULT_PROGRESS.attemptLog,
    });
  },
}));
