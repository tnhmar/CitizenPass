import { useProgressStore } from "../../src/store/useProgressStore";
import { getAllVerifiedQuestions } from "../../src/data/questionLoader";
import { MAX_ATTEMPT_LOG_ENTRIES } from "../../src/services/persistence/progressRepository";

const [questionA, questionB] = getAllVerifiedQuestions();

describe("useProgressStore - attempt log", () => {
  beforeEach(async () => {
    await useProgressStore.getState().resetProgress();
  });

  it("recordPracticeAnswer appends a practice-mode entry stamped with the question's chapter and tags", async () => {
    await useProgressStore.getState().recordPracticeAnswer(questionA.id, true);
    const { attemptLog } = useProgressStore.getState();

    expect(attemptLog).toHaveLength(1);
    expect(attemptLog[0]).toMatchObject({
      questionId: questionA.id,
      chapterId: questionA.chapterId,
      tags: questionA.tags,
      correct: true,
      mode: "practice",
    });
    expect(typeof attemptLog[0].dateIso).toBe("string");
  });

  it("still updates practiceStats and incorrectQuestionIds exactly as before, alongside the new log entry", async () => {
    await useProgressStore.getState().recordPracticeAnswer(questionA.id, false);
    const state = useProgressStore.getState();

    expect(state.practiceStats).toEqual({ totalAttempts: 1, totalCorrect: 0 });
    expect(state.incorrectQuestionIds).toEqual([questionA.id]);
    expect(state.attemptLog).toHaveLength(1);
    expect(state.attemptLog[0].correct).toBe(false);
  });

  it("logExamAttempts appends every question from one exam in a single batch, tagged mode: exam", async () => {
    await useProgressStore
      .getState()
      .logExamAttempts([
        { questionId: questionA.id, correct: true },
        { questionId: questionB.id, correct: false },
      ]);
    const { attemptLog, practiceStats, incorrectQuestionIds } = useProgressStore.getState();

    expect(attemptLog).toHaveLength(2);
    expect(attemptLog.every((entry) => entry.mode === "exam")).toBe(true);
    expect(attemptLog.map((entry) => entry.questionId)).toEqual([questionA.id, questionB.id]);
    // Exam answers are a separate stream: they must never leak into the
    // practice-only aggregates "Smart Practice" and the practice-accuracy
    // stat already depend on.
    expect(practiceStats).toEqual({ totalAttempts: 0, totalCorrect: 0 });
    expect(incorrectQuestionIds).toEqual([]);
  });

  it("skips an entry whose questionId no longer resolves in the question bank, instead of logging it with missing context", async () => {
    await useProgressStore.getState().logExamAttempts([{ questionId: "not-a-real-id", correct: true }]);
    expect(useProgressStore.getState().attemptLog).toHaveLength(0);
  });

  it("caps the log at MAX_ATTEMPT_LOG_ENTRIES, dropping the oldest entries first", async () => {
    const seeded = Array.from({ length: MAX_ATTEMPT_LOG_ENTRIES }, (_, i) => ({
      dateIso: new Date(i).toISOString(),
      questionId: `seed-${i}`,
      chapterId: "justice-system",
      tags: [] as string[],
      correct: true,
      mode: "practice" as const,
    }));
    useProgressStore.setState({ attemptLog: seeded });

    await useProgressStore.getState().recordPracticeAnswer(questionA.id, true);
    const { attemptLog } = useProgressStore.getState();

    expect(attemptLog).toHaveLength(MAX_ATTEMPT_LOG_ENTRIES);
    expect(attemptLog[attemptLog.length - 1].questionId).toBe(questionA.id);
    // The very first seeded entry (oldest) was pushed out; the second
    // oldest is now at the front.
    expect(attemptLog[0].questionId).toBe("seed-1");
  });

  it("resetProgress clears the attempt log along with everything else", async () => {
    await useProgressStore.getState().recordPracticeAnswer(questionA.id, true);
    expect(useProgressStore.getState().attemptLog).toHaveLength(1);

    await useProgressStore.getState().resetProgress();
    expect(useProgressStore.getState().attemptLog).toEqual([]);
  });

  it("hydrate loads a previously-saved attempt log back from disk", async () => {
    await useProgressStore.getState().recordPracticeAnswer(questionA.id, true);
    // Simulate a fresh app start: hydrate re-reads whatever was persisted.
    useProgressStore.setState({ attemptLog: [], hydrated: false });

    await useProgressStore.getState().hydrate();
    const { attemptLog } = useProgressStore.getState();
    expect(attemptLog).toHaveLength(1);
    expect(attemptLog[0].questionId).toBe(questionA.id);
  });
});
