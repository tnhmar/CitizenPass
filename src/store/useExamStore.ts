import { create } from "zustand";
import { drawRandomQuestions } from "../data/questionLoader";
import { randomOptionOrder } from "../utils/questionDisplay";
import {
  loadExamSession,
  saveExamSession,
  clearExamSession,
} from "../services/persistence/examRepository";
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
   *  are still stored using the original (canonical) option index - see
   *  app/exam/index.tsx for the shuffled-position <-> canonical mapping. */
  optionOrder: Record<string, number[]>;
  /** Index of the question currently on screen. Lives here (not as local
   *  component state in app/exam/index.tsx) specifically so that leaving
   *  the exam screen and coming back - whether by in-app navigation or by
   *  fully closing and reopening the app - resumes at the same question
   *  instead of snapping back to question 1. See hydrate() below for the
   *  app-restart half of that fix. */
  currentIndex: number;
  status: ExamStatus;
  startTimeMs: number | null;
  pausedMs: number;
  pausedAt: number | null;
  result: ExamResult | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  startExam: () => void;
  selectAnswer: (questionId: string, index: number) => void;
  setCurrentIndex: (index: number) => void;
  pause: () => void;
  resume: () => void;
  submitExam: () => ExamResult;
  restartExam: () => void;
  resetExam: () => void;
};

/**
 * Writes (or clears) the persisted session snapshot for whatever the
 * store's state is right after a `set()` call. Only an "in-progress" exam
 * is worth resuming, so any other status simply clears storage - this is
 * the single place that decides that, so every action below can just call
 * this instead of duplicating the branch.
 *
 * Fire-and-forget on purpose: every exam action here is a synchronous
 * function (matching its pre-existing call sites and tests, e.g.
 * `submitExam()` returning an `ExamResult` directly, not a `Promise`).
 * `saveExamSession`/`clearExamSession` already catch their own errors
 * internally (see genericStorage.ts), so not awaiting them here never
 * produces an unhandled rejection - worst case a slow write finishes a
 * moment after the UI has already moved on, which is fine for a local
 * resume-state cache.
 */
function persistSession(state: ExamState): void {
  if (state.status !== "in-progress" || state.startTimeMs === null) {
    void clearExamSession();
    return;
  }
  void saveExamSession({
    schemaVersion: 1,
    questions: state.questions,
    answers: state.answers,
    optionOrder: state.optionOrder,
    currentIndex: state.currentIndex,
    startTimeMs: state.startTimeMs,
    pausedMs: state.pausedMs,
    pausedAt: state.pausedAt,
  });
}

export const useExamStore = create<ExamState>((set, get) => ({
  questions: [],
  answers: {},
  optionOrder: {},
  currentIndex: 0,
  status: "idle",
  startTimeMs: null,
  pausedMs: 0,
  pausedAt: null,
  result: null,
  hydrated: false,

  /**
   * Restores an in-progress exam session from disk, if one was left
   * behind by an app quit/crash rather than a normal submit or reset.
   * Called once from RootLayout alongside settings/progress hydration, so
   * by the time any screen can navigate to /exam this has already
   * resolved - no loading state needed in the exam screen itself.
   */
  hydrate: async () => {
    const stored = await loadExamSession();
    if (!stored) {
      set({ hydrated: true });
      return;
    }
    set({
      questions: stored.questions,
      answers: stored.answers,
      optionOrder: stored.optionOrder,
      currentIndex: stored.currentIndex,
      status: "in-progress",
      startTimeMs: stored.startTimeMs,
      pausedMs: stored.pausedMs,
      pausedAt: stored.pausedAt,
      result: null,
      hydrated: true,
    });
  },

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
      currentIndex: 0,
      status: "in-progress",
      startTimeMs: Date.now(),
      pausedMs: 0,
      pausedAt: null,
      result: null,
    });
    persistSession(get());
  },

  selectAnswer: (questionId, index) => {
    if (get().status !== "in-progress") return;
    set({ answers: { ...get().answers, [questionId]: index } });
    persistSession(get());
  },

  setCurrentIndex: (index) => {
    const { status, questions } = get();
    if (status !== "in-progress" || questions.length === 0) return;
    const clamped = Math.max(0, Math.min(index, questions.length - 1));
    set({ currentIndex: clamped });
    persistSession(get());
  },

  pause: () => {
    if (get().status !== "in-progress" || get().pausedAt !== null) return;
    set({ pausedAt: Date.now() });
    persistSession(get());
  },

  resume: () => {
    const { pausedAt, pausedMs } = get();
    if (pausedAt === null) return;
    set({ pausedMs: pausedMs + (Date.now() - pausedAt), pausedAt: null });
    persistSession(get());
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
    persistSession(get());
    return result;
  },

  /**
   * Restarts the *current* exam attempt: same drawn questions and the
   * same shuffled option order, but answers and the timer go back to
   * zero. Distinct from resetExam (which clears back to the idle "Start
   * Exam" screen) and from startExam/the "New Exam" action (which draws a
   * brand new set of questions) - see the in-exam options menu in
   * app/exam/index.tsx.
   */
  restartExam: () => {
    const { questions } = get();
    if (questions.length === 0) return;
    set({
      answers: {},
      currentIndex: 0,
      status: "in-progress",
      startTimeMs: Date.now(),
      pausedMs: 0,
      pausedAt: null,
      result: null,
    });
    persistSession(get());
  },

  resetExam: () => {
    set({
      questions: [],
      answers: {},
      optionOrder: {},
      currentIndex: 0,
      status: "idle",
      startTimeMs: null,
      pausedMs: 0,
      pausedAt: null,
      result: null,
    });
    persistSession(get());
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
