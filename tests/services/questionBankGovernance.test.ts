import { getAllVerifiedQuestions, getVerifiedQuestionsByChapter } from "../../src/data/questionLoader";
import { getChapterList } from "../../src/data/contentLoader";

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

  // Regression coverage: the "links every variant..." test above only
  // checks that variantOf resolves to *some* real learningObjectiveId in
  // the chapter - it uses a Set, so two different questions silently
  // sharing the same learningObjectiveId would not fail it (the Set just
  // collapses them into one entry). This test catches that directly:
  // every question must have its own unique learningObjectiveId, whether
  // it's a base fact or a variant with its own "-vN" suffix.
  it("has a unique learningObjectiveId per question - no two questions share one", () => {
    const seenAt = new Map<string, string>();
    const duplicates: string[] = [];
    for (const question of questions) {
      const key = `${question.chapterId}::${question.learningObjectiveId}`;
      const existing = seenAt.get(key);
      if (existing) {
        duplicates.push(`${question.learningObjectiveId}: ${existing} and ${question.id}`);
      } else {
        seenAt.set(key, question.id);
      }
    }
    expect(duplicates).toEqual([]);
  });

  it("does not contain exact duplicate question text in either language", () => {
    const findDuplicateEntries = (language: "en" | "fr") => {
      const firstIndexByText = new Map<string, number>();
      const duplicates: string[] = [];
      questions.forEach((question, index) => {
        const text = normalizeQuestionText(question[language].question);
        const firstIndex = firstIndexByText.get(text);
        if (firstIndex !== undefined) {
          duplicates.push(
            `${language}: "${text}" appears in both ${questions[firstIndex].id} and ${question.id}`
          );
        } else {
          firstIndexByText.set(text, index);
        }
      });
      return duplicates;
    };

    expect(findDuplicateEntries("en")).toEqual([]);
    expect(findDuplicateEntries("fr")).toEqual([]);
  });

  // Regression coverage: manifest.json's questionCount is displayed to
  // users directly (see app/study/index.tsx), so it silently going stale
  // whenever questions are added to a chapter's data file - without
  // anyone remembering to also update the manifest - would show a wrong
  // number in the app with nothing catching it. This test is that catch.
  it("manifest.json's questionCount matches each chapter's actual verified question count", () => {
    const mismatches: string[] = [];
    for (const chapter of getChapterList()) {
      const actual = getVerifiedQuestionsByChapter(chapter.id).length;
      if (actual !== chapter.questionCount) {
        mismatches.push(`${chapter.id}: manifest says ${chapter.questionCount}, actual is ${actual}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  // optionAnnotations is optional (see src/types/index.ts) - most
  // questions have none, and that's fine. But for any question that
  // does carry them, this guards against the exact data-quality bug
  // found in the reference 511-question bank during the bank-comparison
  // review (docs/question-bank-comparison-report.md §5): ~50% of its
  // true/false questions had the *wrong* option's relevance mislabeled
  // "CORRECT_ANSWER" (a copy-paste artifact from the base fact's
  // annotation). is_correct/correctIndex stayed right there - only the
  // relevance label was wrong - but that's exactly the kind of subtle
  // error that's easy to introduce when authoring annotations by hand
  // and easy to miss in review, so it's worth a permanent, cheap check.
  it("option annotations, where present, are internally consistent with correctIndex", () => {
    const problems: string[] = [];
    for (const question of questions) {
      for (const language of ["en", "fr"] as const) {
        const block = question[language];
        const annotations = block.optionAnnotations;
        if (!annotations) continue;

        if (annotations.length !== block.options.length) {
          problems.push(`${question.id} (${language}): ${annotations.length} annotations for ${block.options.length} options`);
          continue;
        }

        annotations.forEach((annotation, index) => {
          const shouldBeCorrect = index === block.correctIndex;
          const isMarkedCorrect = annotation.relevance === "CORRECT_ANSWER";
          if (shouldBeCorrect && !isMarkedCorrect) {
            problems.push(`${question.id} (${language}): correct option ${index} is not annotated CORRECT_ANSWER`);
          }
          if (!shouldBeCorrect && isMarkedCorrect) {
            problems.push(`${question.id} (${language}): wrong option ${index} is mislabeled CORRECT_ANSWER`);
          }
          if (!annotation.explanation || !annotation.explanation.trim()) {
            problems.push(`${question.id} (${language}): option ${index} has an empty annotation explanation`);
          }
        });
      }
    }
    expect(problems).toEqual([]);
  });
});
