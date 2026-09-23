import {
  getAllQuestions,
  getQuestionsByChapter,
  getQuestionById,
  drawRandomQuestions,
  drawFilteredQuestions,
  shuffle,
} from "../../src/data/questionLoader";

describe("questionLoader", () => {
  it("loads 522 questions across all 11 chapters (the adapted reference 511-bank plus 13 preserved legacy facts)", () => {
    const all = getAllQuestions();
    expect(all.length).toBe(522);
    for (const question of all) {
      // English is mandatory; French is not yet populated for
      // reference-bank-derived questions - see src/types/index.ts.
      expect(question.en.source.language).toBe("en");
      const expectedOptionCount = question.type === "true-false" ? 2 : 4;
      expect(question.en.options.length).toBe(expectedOptionCount);
    }
  });

  it("every question has a unique chapterId drawn from the 11-chapter manifest", () => {
    const chapterIds = new Set(getAllQuestions().map((q) => q.chapterId));
    expect(chapterIds.size).toBe(11);
  });

  it("filters questions by chapter", () => {
    const chapterQuestions = getQuestionsByChapter("justice-system");
    expect(chapterQuestions.length).toBe(22);
    for (const question of chapterQuestions) {
      expect(question.chapterId).toBe("justice-system");
    }
  });

  it("splits Federal Elections out of How Canadians Govern Themselves", () => {
    const elections = getQuestionsByChapter("federal-elections");
    const government = getQuestionsByChapter("how-canadians-govern-themselves");
    expect(elections.length).toBeGreaterThan(0);
    expect(government.length).toBeGreaterThan(0);
    for (const question of elections) {
      expect(question.chapterId).toBe("federal-elections");
    }
  });

  it("preserved legacy facts (no reference-bank equivalent) are present with their original citations intact", () => {
    const ageExemption = getQuestionById("q-ac-004");
    expect(ageExemption).not.toBeNull();
    expect(ageExemption?.en.source.reviewStatus).toBe("verified");
    expect(ageExemption?.en.source.sourceUrl).toContain("canada.ca");

    const oilDiscovery = getQuestionsByChapter("modern-canada").filter((q) => q.learningObjectiveId.startsWith("mc-oil-discovery-alberta"));
    expect(oilDiscovery.length).toBeGreaterThan(0);
  });

  it("Applying for Citizenship is fully upgraded to verified, with real French, as the first completed chapter", () => {
    const chapterQuestions = getQuestionsByChapter("applying-for-citizenship");
    expect(chapterQuestions.length).toBe(5);
    for (const question of chapterQuestions) {
      expect(question.en.source.reviewStatus).toBe("verified");
      expect(question.fr).toBeDefined();
      expect(question.fr?.source.reviewStatus).toBe("verified");
      expect(question.fr?.source.sourceUrl).toContain("canada.ca");
    }
  });

  it("most questions are needs-review (freshly adapted, no live-URL citation yet)", () => {
    const all = getAllQuestions();
    const needsReview = all.filter((q) => q.en.source.reviewStatus === "needs-review");
    expect(needsReview.length).toBeGreaterThan(all.length / 2);
  });

  it("carries topic/subtopic metadata through from the reference bank", () => {
    const withTopic = getAllQuestions().filter((q) => q.topic);
    expect(withTopic.length).toBeGreaterThan(400);
  });

  it("every variantOf reference points to a learning objective that exists in the same chapter", () => {
    const all = getAllQuestions();
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
    const question = getQuestionById("q-ac-004");
    expect(question).not.toBeNull();
    expect(question?.chapterId).toBe("applying-for-citizenship");
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
      const [sample] = getAllQuestions().filter((q) => q.tags.length > 0);
      const drawn = drawFilteredQuestions(3, { tag: sample.tags[0] });
      expect(drawn.length).toBeGreaterThan(0);
      for (const question of drawn) {
        expect(question.tags).toContain(sample.tags[0]);
      }
    });

    it("restricts the pool to exactly onlyIds - Smart Practice's 'missed questions' case", () => {
      const allowed = getAllQuestions()
        .slice(0, 3)
        .map((q) => q.id);
      const drawn = drawFilteredQuestions(10, { onlyIds: allowed });
      expect(drawn.length).toBe(3);
      for (const question of drawn) {
        expect(allowed).toContain(question.id);
      }
    });

    it("still applies excludeIds on top of a filter (e.g. questions already seen this session)", () => {
      const allowed = getAllQuestions()
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
