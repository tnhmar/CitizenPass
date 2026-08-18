import {
  getAllVerifiedQuestions,
  getVerifiedQuestionsByChapter,
  getQuestionById,
  drawRandomQuestions,
  shuffle,
} from "../../src/data/questionLoader";

describe("questionLoader", () => {
  it("loads 154 verified questions across all 9 chapters", () => {
    const all = getAllVerifiedQuestions();
    expect(all.length).toBe(154);
    for (const question of all) {
      expect(question.en.source.reviewStatus).toBe("verified");
      expect(question.fr.source.reviewStatus).toBe("verified");
      expect(question.en.options.length).toBe(4);
      expect(question.fr.options.length).toBe(4);
    }
  });

  it("filters questions by chapter", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("justice-system");
    expect(chapterQuestions.length).toBe(19);
    for (const question of chapterQuestions) {
      expect(question.chapterId).toBe("justice-system");
    }
  });

  it("expanded rights-responsibilities chapter with variant questions", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("rights-responsibilities");
    expect(chapterQuestions.length).toBe(26);
  });

  it("expanded who-we-are chapter with variant questions", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("who-we-are");
    expect(chapterQuestions.length).toBe(24);
  });

  it("every variantOf reference points to a learning objective that exists in the same chapter", () => {
    const all = getAllVerifiedQuestions();
    const objectiveIdsByChapter = new Map<string, Set<string>>();
    for (const question of all) {
      const set = objectiveIdsByChapter.get(question.chapterId) ?? new Set<string>();
      set.add(question.learningObjectiveId);
      objectiveIdsByChapter.set(question.chapterId, set);
    }
    for (const question of all) {
      if (!question.variantOf) continue;
      const chapterObjectiveIds = objectiveIdsByChapter.get(question.chapterId);
      expect(chapterObjectiveIds?.has(question.variantOf)).toBe(true);
    }
  });

  it("finds a question by id", () => {
    const question = getQuestionById("q-js-001");
    expect(question).not.toBeNull();
    expect(question?.chapterId).toBe("justice-system");
    expect(getQuestionById("does-not-exist")).toBeNull();
  });

  it("draws the requested number of unique random questions", () => {
    const drawn = drawRandomQuestions(20);
    expect(drawn.length).toBe(20);
    const ids = new Set(drawn.map((q) => q.id));
    expect(ids.size).toBe(20);
  });

  it("excludes specified ids when drawing", () => {
    const first = drawRandomQuestions(5);
    const excludeIds = first.map((q) => q.id);
    const second = drawRandomQuestions(5, excludeIds);
    for (const question of second) {
      expect(excludeIds).not.toContain(question.id);
    }
  });

  it("draws only from the specified chapter when chapterId is provided", () => {
    const drawn = drawRandomQuestions(5, [], "rights-responsibilities");
    for (const question of drawn) {
      expect(question.chapterId).toBe("rights-responsibilities");
    }
  });

  it("shuffle does not mutate the input array and preserves all elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
