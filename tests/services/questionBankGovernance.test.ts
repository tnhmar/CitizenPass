import { getAllVerifiedQuestions } from "../../src/data/questionLoader";

function normalizeQuestionText(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

describe("question bank governance", () => {
  const questions = getAllVerifiedQuestions();

  it("has unique question IDs", () => {
    const ids = questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has bilingual questions with matching option counts and valid correct indexes", () => {
    for (const question of questions) {
      expect(question.en.options).toHaveLength(question.fr.options.length);
      expect(question.en.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.en.correctIndex).toBeLessThan(question.en.options.length);
      expect(question.fr.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.fr.correctIndex).toBeLessThan(question.fr.options.length);
    }
  });

  it("uses only official-supported question formats", () => {
    for (const question of questions) {
      if (question.type === "multiple-choice") {
        expect(question.en.options).toHaveLength(4);
        expect(question.fr.options).toHaveLength(4);
      } else {
        expect(question.en.options).toEqual(["True", "False"]);
        expect(question.fr.options).toEqual(["Vrai", "Faux"]);
      }
    }
  });

  it("has verified, language-matched source citations for every localization", () => {
    for (const question of questions) {
      expect(question.en.source.language).toBe("en");
      expect(question.fr.source.language).toBe("fr");
      expect(question.en.source.reviewStatus).toBe("verified");
      expect(question.fr.source.reviewStatus).toBe("verified");
      expect(question.en.source.sourceUrl).toContain("canada.ca");
      expect(question.fr.source.sourceUrl).toContain("canada.ca");
      expect(question.en.source.excerpt.trim().length).toBeGreaterThan(0);
      expect(question.fr.source.excerpt.trim().length).toBeGreaterThan(0);
      expect(question.en.source.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(question.fr.source.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("links every variant to a base objective in its own chapter", () => {
    const objectiveIdsByChapter = new Map<string, Set<string>>();
    for (const question of questions) {
      const objectives = objectiveIdsByChapter.get(question.chapterId) ?? new Set<string>();
      objectives.add(question.learningObjectiveId);
      objectiveIdsByChapter.set(question.chapterId, objectives);
    }

    for (const question of questions) {
      if (!question.variantOf) continue;
      expect(objectiveIdsByChapter.get(question.chapterId)?.has(question.variantOf)).toBe(true);
      expect(question.variantOf).not.toBe(question.learningObjectiveId);
    }
  });

  it("does not contain exact duplicate question text in either language", () => {
    const englishQuestions = questions.map((question) => normalizeQuestionText(question.en.question));
    const frenchQuestions = questions.map((question) => normalizeQuestionText(question.fr.question));

    expect(new Set(englishQuestions).size).toBe(englishQuestions.length);
    expect(new Set(frenchQuestions).size).toBe(frenchQuestions.length);
  });
});
