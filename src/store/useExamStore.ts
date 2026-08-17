import { create } from "zustand";
import { drawRandomQuestions } from "../data/questionLoader";
import type { Question } from "../types";

export const EXAM_QUESTION_COUNT = 20;
export const EXAM_DURATION_MS = 45 * 60 * 1000;
export const EXAM_PASS_THRESHOLD = 0.75;

export type ExamStatus = "idle" | "in-progress" | "submitted";

export type ExamResult = {
  correct: number;
  total: number;
  passed: boolean;
};

type ExamState = {
  questions: Question[];
  answers: Record<string, number>;
  status: ExamStatus;
  startTimeMs: number | null;
  pausedMs: number;
  pausedAt: number | null;
  result: ExamResult | null;

  startExam: () => void;
  selectAnswer: (questionId: string, index: number) => void;
  pause: () => void;
  resume: () => void;
  submitExam: () => ExamResult;
  resetExam: () => void;
};

export const useExamStore = create<ExamState>((set, get) => ({
  questions: [],
  answers: {},
  status: "idle",
  startTimeMs: null,
  pausedMs: 0,
  pausedAt: null,
  result: null,

  startExam: () => {
    set({
      questions: drawRandomQuestions(EXAM_QUESTION_COUNT),
      answers: {},
      status: "in-progress",
      startTimeMs: Date.now(),
      pausedMs: 0,
      pausedAt: null,
      result: null,
    });
  },

  selectAnswer: (questionId, index) => {
    if (get().status !== "in-progress") return;
    set({ answers: { ...get().answers, [questionId]: index } });
  },

  pause: () => {
    if (get().status !== "in-progress" || get().pausedAt !== null) return;
    set({ pausedAt: Date.now() });
  },

  resume: () => {
    const { pausedAt, pausedMs } = get();
    if (pausedAt === null) return;
    set({ pausedMs: pausedMs + (Date.now() - pausedAt), pausedAt: null });
  },

  submitExam: () => {
    const { questions, answers } = get();
    let correct = 0;
    for (const question of questions) {
      // Scoring uses the English localization's correctIndex, which is
      // identical to the French one by construction — see
      // docs/content-governance.md, question production workflow, step 9
      // ("Confirm the English and French versions test the same
      // learning objective"), so this is language-independent.
      if (answers[question.id] === question.en.correctIndex) {
        correct += 1;
      }
    }
    const total = questions.length;
    const passed = total > 0 && correct / total >= EXAM_PASS_THRESHOLD;
    const result: ExamResult = { correct, total, passed };
    set({ status: "submitted", result });
    return result;
  },

  resetExam: () => {
    set({
      questions: [],
      answers: {},
      status: "idle",
      startTimeMs: null,
      pausedMs: 0,
      pausedAt: null,
      result: null,
    });
  },
}));

/**
 * Computes remaining exam time in milliseconds, accounting for any time
 * the app spent backgrounded (paused) since the exam started. Pure
 * function so it is easy to unit test without mocking Zustand.
 */
export function getRemainingMs(state: {
  startTimeMs: number | null;
  pausedMs: number;
  pausedAt: number | null;
}): number {
  if (state.startTimeMs === null) return EXAM_DURATION_MS;
  const now = Date.now();
  const activePausedMs = state.pausedAt !== null ? now - state.pausedAt : 0;
  const elapsed = now - state.startTimeMs - state.pausedMs - activePausedMs;
  return Math.max(0, EXAM_DURATION_MS - elapsed);
}

export function formatRemainingTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
