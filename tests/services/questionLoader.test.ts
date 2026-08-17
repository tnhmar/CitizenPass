import {
  getAllVerifiedQuestions,
  getVerifiedQuestionsByChapter,
  getQuestionById,
  drawRandomQuestions,
  shuffle,
} from "../../src/data/questionLoader";

describe("questionLoader", () => {
  it("loads 107 verified questions across all 9 chapters", () => {
    const all = getAllVerifiedQuestions();
    expect(all.length).toBe(107);
    for (const question of all) {
      expect(question.en.source.reviewStatus).toBe("verified");
      expect(question.fr.source.reviewStatus).toBe("verified");
      expect(question.en.options.length).toBe(4);
      expect(question.fr.options.length).toBe(4);
    }
  });

  it("filters questions by chapter", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("justice-system");
    expect(chapterQuestions.length).toBe(6);
    for (const question of chapterQuestions) {
      expect(question.chapterId).toBe("justice-system");
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

  it("shuffle does not mutate the input array and preserves all elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
