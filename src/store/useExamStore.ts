import { create } from "zustand";
import { drawRandomQuestions } from "../data/questionLoader";
import { randomOptionOrder } from "../utils/questionDisplay";
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
  /** Per-question shuffled option index order, generated once at startExam
   *  so the correct answer is not always the first authored option, and
   *  so the order stays stable across Previous/Next navigation. Answers
   *  are still stored using the original (canonical) option index — see
   *  app/exam/index.tsx for the shuffled-position <-> canonical mapping. */
  optionOrder: Record<string, number[]>;
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
  optionOrder: {},
  status: "idle",
  startTimeMs: null,
  pausedMs: 0,
  pausedAt: null,
  result: null,

  startExam: () => {
    const questions = drawRandomQuestions(EXAM_QUESTION_COUNT);
    const optionOrder: Record<string, number[]> = {};
    for (const question of questions) {
      optionOrder[question.id] = randomOptionOrder(question.en.options.length);
    }
    set({
      questions,
      answers: {},
      optionOrder,
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
      // Scoring compares against the canonical (unshuffled) correctIndex.
      // answers[] always stores the canonical option index regardless of
      // the shuffled display order (see app/exam/index.tsx), so this
      // comparison is correct independent of how options were displayed.
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
      optionOrder: {},
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
