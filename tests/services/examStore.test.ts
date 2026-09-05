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

  // Regression coverage for "quit the exam and come back later - the timer
  // had reset instead of continuing from where it was." Simulates exactly
  // that: pause (as "Exit Exam" does), let real time pass while paused,
  // resume (as coming back to either exam screen does via
  // useExamSessionLifecycle), and confirm the paused interval was excluded
  // from elapsed time rather than counted against the exam or dropped.
  describe("pause/resume timer math", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("excludes paused time from elapsed exam time, however long the pause", () => {
      useExamStore.getState().startExam();

      jest.advanceTimersByTime(2 * 60 * 1000); // 2 minutes into the exam
      useExamStore.getState().pause(); // e.g. "Exit Exam"

      jest.advanceTimersByTime(60 * 60 * 1000); // an hour away - longer than the exam itself
      useExamStore.getState().resume(); // back to /exam or /exam/review

      jest.advanceTimersByTime(1 * 60 * 1000); // 1 more active minute

      const state = useExamStore.getState();
      const remaining = getRemainingMs({
        startTimeMs: state.startTimeMs,
        pausedMs: state.pausedMs,
        pausedAt: state.pausedAt,
      });
      // Only 2 + 1 = 3 active minutes should have counted, regardless of
      // the hour spent paused in between - i.e. "continues", not "reset".
      const expectedRemaining = EXAM_DURATION_MS - 3 * 60 * 1000;
      expect(Math.abs(remaining - expectedRemaining)).toBeLessThan(1000);
      expect(state.pausedAt).toBeNull();
    });

    it("pause() is a no-op if already paused (no double-counting)", () => {
      useExamStore.getState().startExam();
      useExamStore.getState().pause();
      const pausedAtFirst = useExamStore.getState().pausedAt;

      jest.advanceTimersByTime(60 * 1000);
      useExamStore.getState().pause(); // calling pause again while already paused

      expect(useExamStore.getState().pausedAt).toBe(pausedAtFirst);
    });

    it("resume() is a no-op if nothing is paused", () => {
      useExamStore.getState().startExam();
      const before = useExamStore.getState().pausedMs;
      useExamStore.getState().resume();
      expect(useExamStore.getState().pausedMs).toBe(before);
    });
  });

  // Regression coverage for "Next enabled with no answer selected" and the
  // new Mark for Review affordance that fixes it: app/exam/index.tsx gates
  // its Next button on (answered OR marked), so the store-level toggle
  // needs to actually flip and needs to reset between attempts.
  describe("markedForReview", () => {
    it("toggles on and off per question, independent of other questions", () => {
      useExamStore.getState().startExam();
      const [firstId, secondId] = useExamStore.getState().questions.map((q) => q.id);

      useExamStore.getState().toggleMarkedForReview(firstId);
      expect(useExamStore.getState().markedForReview[firstId]).toBe(true);
      expect(useExamStore.getState().markedForReview[secondId]).toBeUndefined();

      useExamStore.getState().toggleMarkedForReview(firstId);
      expect(useExamStore.getState().markedForReview[firstId]).toBeUndefined();
    });

    it("is ignored once the exam has been submitted", () => {
      useExamStore.getState().startExam();
      const questionId = useExamStore.getState().questions[0].id;
      useExamStore.getState().submitExam();
      useExamStore.getState().toggleMarkedForReview(questionId);
      expect(useExamStore.getState().markedForReview[questionId]).toBeUndefined();
    });

    it("is cleared by restartExam and resetExam", () => {
      useExamStore.getState().startExam();
      const questionId = useExamStore.getState().questions[0].id;
      useExamStore.getState().toggleMarkedForReview(questionId);

      useExamStore.getState().restartExam();
      expect(useExamStore.getState().markedForReview).toEqual({});

      useExamStore.getState().toggleMarkedForReview(useExamStore.getState().questions[0].id);
      useExamStore.getState().resetExam();
      expect(useExamStore.getState().markedForReview).toEqual({});
    });
  });

  // Regression coverage for the "notify at 5 minutes left" feature: the
  // "already shown" flag has to reset between attempts, or a second exam
  // taken back-to-back would never warn again.
  describe("lowTimeWarningShown", () => {
    it("starts false and can be marked shown", () => {
      useExamStore.getState().startExam();
      expect(useExamStore.getState().lowTimeWarningShown).toBe(false);
      useExamStore.getState().markLowTimeWarningShown();
      expect(useExamStore.getState().lowTimeWarningShown).toBe(true);
    });

    it("resets on restartExam and on a fresh startExam", () => {
      useExamStore.getState().startExam();
      useExamStore.getState().markLowTimeWarningShown();

      useExamStore.getState().restartExam();
      expect(useExamStore.getState().lowTimeWarningShown).toBe(false);

      useExamStore.getState().markLowTimeWarningShown();
      useExamStore.getState().startExam();
      expect(useExamStore.getState().lowTimeWarningShown).toBe(false);
    });
  });
});
