import {
  getAllVerifiedQuestions,
  getVerifiedQuestionsByChapter,
  getQuestionById,
  drawRandomQuestions,
  drawFilteredQuestions,
  shuffle,
} from "../../src/data/questionLoader";

describe("questionLoader", () => {
  it("loads 437 verified questions across all 10 chapters", () => {
    const all = getAllVerifiedQuestions();
    expect(all.length).toBe(437);
    for (const question of all) {
      expect(question.en.source.reviewStatus).toBe("verified");
      expect(question.fr.source.reviewStatus).toBe("verified");
      const expectedOptionCount = question.type === "true-false" ? 2 : 4;
      expect(question.en.options.length).toBe(expectedOptionCount);
      expect(question.fr.options.length).toBe(expectedOptionCount);
    }
  });

  it("filters questions by chapter", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("justice-system");
    expect(chapterQuestions.length).toBe(26);
    for (const question of chapterQuestions) {
      expect(question.chapterId).toBe("justice-system");
    }
  });

  it("expanded rights-responsibilities chapter with variant questions", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("rights-responsibilities");
    expect(chapterQuestions.length).toBe(35);
  });

  it("expanded who-we-are chapter with variant questions", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("who-we-are");
    expect(chapterQuestions.length).toBe(32);
  });

  it("expanded federal-elections chapter with variant questions", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("federal-elections");
    expect(chapterQuestions.length).toBe(41);
  });

  it("expanded canadas-history chapter with variant questions", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("canadas-history");
    expect(chapterQuestions.length).toBe(56);
  });

  it("expanded modern-canada chapter with variant questions", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("modern-canada");
    expect(chapterQuestions.length).toBe(59);
  });

  it("expanded how-canadians-govern-themselves chapter with variant questions", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("how-canadians-govern-themselves");
    expect(chapterQuestions.length).toBe(50);
  });

  it("expanded canadian-symbols chapter with variant questions", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("canadian-symbols");
    expect(chapterQuestions.length).toBe(59);
  });

  it("expanded canadas-regions chapter with variant questions", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("canadas-regions");
    expect(chapterQuestions.length).toBe(64);
  });

  it("loads the canadas-economy chapter", () => {
    const chapterQuestions = getVerifiedQuestionsByChapter("canadas-economy");
    expect(chapterQuestions.length).toBe(15);
    for (const question of chapterQuestions) {
      expect(question.chapterId).toBe("canadas-economy");
    }
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

  describe("drawFilteredQuestions", () => {
    it("draws only from the specified chapter", () => {
      const drawn = drawFilteredQuestions(5, { chapterId: "justice-system" });
      for (const question of drawn) {
        expect(question.chapterId).toBe("justice-system");
      }
    });

    it("draws only questions carrying the given tag", () => {
      const [sample] = getAllVerifiedQuestions().filter((q) => q.tags.length > 0);
      const drawn = drawFilteredQuestions(3, { tag: sample.tags[0] });
      expect(drawn.length).toBeGreaterThan(0);
      for (const question of drawn) {
        expect(question.tags).toContain(sample.tags[0]);
      }
    });

    it("restricts the pool to exactly onlyIds - Smart Practice's 'missed questions' case", () => {
      const allowed = getAllVerifiedQuestions()
        .slice(0, 3)
        .map((q) => q.id);
      const drawn = drawFilteredQuestions(10, { onlyIds: allowed });
      expect(drawn.length).toBe(3);
      for (const question of drawn) {
        expect(allowed).toContain(question.id);
      }
    });

    it("still applies excludeIds on top of a filter (e.g. questions already seen this session)", () => {
      const allowed = getAllVerifiedQuestions()
        .slice(0, 3)
        .map((q) => q.id);
      const drawn = drawFilteredQuestions(10, { onlyIds: allowed }, [allowed[0]]);
      expect(drawn.length).toBe(2);
      expect(drawn.map((q) => q.id)).not.toContain(allowed[0]);
    });

    it("returns an empty array once every matching question has been excluded", () => {
      expect(drawFilteredQuestions(5, { onlyIds: ["not-a-real-id"] })).toEqual([]);
    });
  });
});
