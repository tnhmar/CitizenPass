import { useExamStore, getRemainingMs, formatRemainingTime, EXAM_DURATION_MS, EXAM_QUESTION_COUNT } from "../../src/store/useExamStore";

describe("useExamStore", () => {
  beforeEach(() => {
    useExamStore.getState().resetExam();
  });

  it("starts an exam with the correct question count and status", () => {
    useExamStore.getState().startExam();
    const state = useExamStore.getState();
    expect(state.status).toBe("in-progress");
    expect(state.questions.length).toBe(EXAM_QUESTION_COUNT);
    expect(state.startTimeMs).not.toBeNull();
  });

  it("records answers only while in progress", () => {
    useExamStore.getState().startExam();
    const questionId = useExamStore.getState().questions[0].id;
    useExamStore.getState().selectAnswer(questionId, 2);
    expect(useExamStore.getState().answers[questionId]).toBe(2);

    useExamStore.getState().submitExam();
    useExamStore.getState().selectAnswer(questionId, 0);
    // Status is now "submitted"; the answer must not change after submission.
    expect(useExamStore.getState().answers[questionId]).toBe(2);
  });

  it("scores correctly and determines pass/fail at the 75% threshold", () => {
    useExamStore.getState().startExam();
    const { questions } = useExamStore.getState();

    // Answer 15 correctly and 5 incorrectly to hit exactly the pass threshold.
    questions.forEach((question, index) => {
      const correctIndex = question.en.correctIndex;
      const answerIndex = index < 15 ? correctIndex : (correctIndex + 1) % 4;
      useExamStore.getState().selectAnswer(question.id, answerIndex);
    });

    const result = useExamStore.getState().submitExam();
    expect(result.correct).toBe(15);
    expect(result.total).toBe(20);
    expect(result.passed).toBe(true);
  });

  it("fails when fewer than 15 answers are correct", () => {
    useExamStore.getState().startExam();
    const { questions } = useExamStore.getState();

    questions.forEach((question, index) => {
      const correctIndex = question.en.correctIndex;
      const answerIndex = index < 14 ? correctIndex : (correctIndex + 1) % 4;
      useExamStore.getState().selectAnswer(question.id, answerIndex);
    });

    const result = useExamStore.getState().submitExam();
    expect(result.correct).toBe(14);
    expect(result.passed).toBe(false);
  });

  it("getRemainingMs returns the full duration before the exam starts", () => {
    expect(getRemainingMs({ startTimeMs: null, pausedMs: 0, pausedAt: null })).toBe(EXAM_DURATION_MS);
  });

  it("getRemainingMs subtracts elapsed and paused time", () => {
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const remaining = getRemainingMs({ startTimeMs: tenMinutesAgo, pausedMs: 0, pausedAt: null });
    expect(remaining).toBeLessThanOrEqual(35 * 60 * 1000);
    expect(remaining).toBeGreaterThan(34 * 60 * 1000);
  });

  it("formatRemainingTime formats minutes and seconds with zero-padding", () => {
    expect(formatRemainingTime(45 * 60 * 1000)).toBe("45:00");
    expect(formatRemainingTime(65 * 1000)).toBe("1:05");
    expect(formatRemainingTime(5 * 1000)).toBe("0:05");
  });
});
