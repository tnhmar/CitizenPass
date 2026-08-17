import { create } from "zustand";
import {
  DEFAULT_PROGRESS,
  loadProgress,
  saveProgress,
  clearProgress,
  type PersistedProgress,
  type ExamAttempt,
} from "../services/persistence/progressRepository";

type ProgressState = {
  hydrated: boolean;
  chapterProgress: PersistedProgress["chapterProgress"];
  bookmarkedQuestionIds: string[];
  incorrectQuestionIds: string[];
  practiceStats: PersistedProgress["practiceStats"];
  examHistory: ExamAttempt[];

  hydrate: () => Promise<void>;
  setChapterCompletion: (chapterId: string, completionPercent: number) => Promise<void>;
  toggleBookmark: (questionId: string) => Promise<void>;
  recordPracticeAnswer: (questionId: string, correct: boolean) => Promise<void>;
  recordExamAttempt: (attempt: ExamAttempt) => Promise<void>;
  resetProgress: () => Promise<void>;
};

function snapshot(state: ProgressState): PersistedProgress {
  return {
    schemaVersion: 1,
    chapterProgress: state.chapterProgress,
    bookmarkedQuestionIds: state.bookmarkedQuestionIds,
    incorrectQuestionIds: state.incorrectQuestionIds,
    practiceStats: state.practiceStats,
    examHistory: state.examHistory,
  };
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  hydrated: false,
  chapterProgress: DEFAULT_PROGRESS.chapterProgress,
  bookmarkedQuestionIds: DEFAULT_PROGRESS.bookmarkedQuestionIds,
  incorrectQuestionIds: DEFAULT_PROGRESS.incorrectQuestionIds,
  practiceStats: DEFAULT_PROGRESS.practiceStats,
  examHistory: DEFAULT_PROGRESS.examHistory,

  hydrate: async () => {
    const stored = await loadProgress();
    set({
      chapterProgress: stored.chapterProgress,
      bookmarkedQuestionIds: stored.bookmarkedQuestionIds,
      incorrectQuestionIds: stored.incorrectQuestionIds,
      practiceStats: stored.practiceStats,
      examHistory: stored.examHistory,
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
    set({ practiceStats: nextStats, incorrectQuestionIds: nextIncorrect });
    await saveProgress(snapshot(get()));
  },

  recordExamAttempt: async (attempt) => {
    const examHistory = [...get().examHistory, attempt];
    set({ examHistory });
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
    });
  },
}));
