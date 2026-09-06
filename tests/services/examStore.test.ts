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

  // getRemainingMs takes `now` explicitly (rather than reading Date.now()
  // itself) specifically so this stays trivial to test - see
  // src/store/useExamStore.ts and useExamCountdown.ts.
  it("getRemainingMs returns the full duration before the exam starts", () => {
    expect(getRemainingMs(null)).toBe(EXAM_DURATION_MS);
  });

  it("getRemainingMs subtracts elapsed time, with no pause/resume math anymore", () => {
    // IRCC-parity refactor: the timer never pauses, so this is now a pure
    // "duration minus elapsed" calculation - see docs section 7.
    const now = 1_000_000_000;
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const remaining = getRemainingMs(tenMinutesAgo, now);
    expect(remaining).toBe(EXAM_DURATION_MS - 10 * 60 * 1000);
  });

  it("getRemainingMs never goes below zero once the duration has elapsed", () => {
    const now = 1_000_000_000;
    const wayBefore = now - EXAM_DURATION_MS - 60 * 60 * 1000;
    expect(getRemainingMs(wayBefore, now)).toBe(0);
  });

  it("formatRemainingTime formats minutes and seconds with zero-padding", () => {
    expect(formatRemainingTime(45 * 60 * 1000)).toBe("45:00");
    expect(formatRemainingTime(65 * 1000)).toBe("1:05");
    expect(formatRemainingTime(5 * 1000)).toBe("0:05");
  });

  // Regression coverage for the "quitting and resuming resets the question
  // index to 0" bug: currentIndex now lives in this store (not local
  // component state in app/exam/index.tsx), so it survives the component
  // being unmounted and remounted.
  describe("currentIndex", () => {
    it("starts at 0 and can be moved forward/backward, clamped to the question list", () => {
      useExamStore.getState().startExam();
      expect(useExamStore.getState().currentIndex).toBe(0);

      useExamStore.getState().setCurrentIndex(5);
      expect(useExamStore.getState().currentIndex).toBe(5);

      useExamStore.getState().setCurrentIndex(-3);
      expect(useExamStore.getState().currentIndex).toBe(0);

      useExamStore.getState().setCurrentIndex(9999);
      expect(useExamStore.getState().currentIndex).toBe(EXAM_QUESTION_COUNT - 1);
    });

    it("is ignored once the exam has been submitted", () => {
      useExamStore.getState().startExam();
      useExamStore.getState().setCurrentIndex(3);
      useExamStore.getState().submitExam();
      useExamStore.getState().setCurrentIndex(7);
      expect(useExamStore.getState().currentIndex).toBe(3);
    });
  });

  describe("restartExam", () => {
    it("keeps the same drawn questions but clears answers, index, and result", () => {
      useExamStore.getState().startExam();
      const originalQuestionIds = useExamStore.getState().questions.map((q) => q.id);
      const firstQuestionId = originalQuestionIds[0];
      useExamStore.getState().selectAnswer(firstQuestionId, 1);
      useExamStore.getState().setCurrentIndex(4);

      useExamStore.getState().restartExam();
      const state = useExamStore.getState();
      expect(state.questions.map((q) => q.id)).toEqual(originalQuestionIds);
      expect(state.answers).toEqual({});
      expect(state.currentIndex).toBe(0);
      expect(state.status).toBe("in-progress");
      expect(state.result).toBeNull();
    });

    it("does nothing if there is no exam to restart", () => {
      useExamStore.getState().restartExam();
      expect(useExamStore.getState().status).toBe("idle");
    });
  });

  it("resetExam clears back to idle with a fresh currentIndex", () => {
    useExamStore.getState().startExam();
    useExamStore.getState().setCurrentIndex(6);
    useExamStore.getState().resetExam();
    const state = useExamStore.getState();
    expect(state.status).toBe("idle");
    expect(state.currentIndex).toBe(0);
    expect(state.questions).toHaveLength(0);
  });

  // Regression coverage for the IRCC-parity refactor: matching the real
  // test exactly, a question can only be marked for review *after* it has
  // an answer - see docs/theme-navigation-responsive-overhaul.md section 7.
  describe("markedForReview", () => {
    it("is a no-op on a question with no answer yet", () => {
      useExamStore.getState().startExam();
      const questionId = useExamStore.getState().questions[0].id;
      useExamStore.getState().toggleMarkedForReview(questionId);
      expect(useExamStore.getState().markedForReview[questionId]).toBeUndefined();
    });

    it("toggles on and off once the question has an answer, independent of other questions", () => {
      useExamStore.getState().startExam();
      const [firstId, secondId] = useExamStore.getState().questions.map((q) => q.id);
      useExamStore.getState().selectAnswer(firstId, 0);

      useExamStore.getState().toggleMarkedForReview(firstId);
      expect(useExamStore.getState().markedForReview[firstId]).toBe(true);
      expect(useExamStore.getState().markedForReview[secondId]).toBeUndefined();

      useExamStore.getState().toggleMarkedForReview(firstId);
      expect(useExamStore.getState().markedForReview[firstId]).toBeUndefined();
    });

    it("is ignored once the exam has been submitted", () => {
      useExamStore.getState().startExam();
      const questionId = useExamStore.getState().questions[0].id;
      useExamStore.getState().selectAnswer(questionId, 0);
      useExamStore.getState().submitExam();
      useExamStore.getState().toggleMarkedForReview(questionId);
      expect(useExamStore.getState().markedForReview[questionId]).toBeUndefined();
    });

    it("is cleared by restartExam and resetExam", () => {
      useExamStore.getState().startExam();
      const questionId = useExamStore.getState().questions[0].id;
      useExamStore.getState().selectAnswer(questionId, 0);
      useExamStore.getState().toggleMarkedForReview(questionId);

      useExamStore.getState().restartExam();
      expect(useExamStore.getState().markedForReview).toEqual({});

      const freshQuestionId = useExamStore.getState().questions[0].id;
      useExamStore.getState().selectAnswer(freshQuestionId, 0);
      useExamStore.getState().toggleMarkedForReview(freshQuestionId);
      useExamStore.getState().resetExam();
      expect(useExamStore.getState().markedForReview).toEqual({});
    });
  });
});
