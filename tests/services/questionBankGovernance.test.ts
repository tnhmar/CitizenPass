import { getAllQuestions } from "../../src/data/questionLoader";

function normalizeQuestionText(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

describe("question bank governance", () => {
  const questions = getAllQuestions();

  it("has unique question IDs", () => {
    const ids = questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // `fr` is optional now (see src/types/index.ts) - the app runs on the
  // reference 511-question bank English-only for now, French sourcing
  // is a later phase (docs/content-governance.md). Every check below
  // that touches `fr` only runs when a question actually has one.
  it("when a French localization exists, it has a matching option count and a valid correct index", () => {
    for (const question of questions) {
      if (!question.fr) continue;
      expect(question.fr.options).toHaveLength(question.en.options.length);
      expect(question.fr.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.fr.correctIndex).toBeLessThan(question.fr.options.length);
    }
    // English is mandatory regardless.
    for (const question of questions) {
      expect(question.en.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.en.correctIndex).toBeLessThan(question.en.options.length);
    }
  });

  it("uses only official-supported question formats, in every localization present", () => {
    for (const question of questions) {
      const localizations = [question.en, question.fr].filter((l): l is NonNullable<typeof l> => !!l);
      for (const localized of localizations) {
        if (question.type === "multiple-choice") {
          expect(localized.options).toHaveLength(4);
        } else {
          expect(["True", "False"]).toContainEqual(localized.options[0]);
          expect(localized.options).toHaveLength(2);
        }
      }
    }
  });

  it("every English localization has a language-matched source with at least a chapter/section/page reference", () => {
    for (const question of questions) {
      expect(question.en.source.language).toBe("en");
      // Not requiring sourceUrl/excerpt here - a "needs-review" question
      // (see next test) may only have chapter/section/pdfPage so far.
      // What every question needs, regardless of review status, is
      // *some* indication of where the fact came from.
      const hasSomeLocation = !!(question.en.source.chapter || question.en.source.section || question.en.source.pdfPage || question.en.source.printedPage);
      expect(hasSomeLocation).toBe(true);
      if (question.fr) {
        expect(question.fr.source.language).toBe("fr");
      }
    }
  });

  // The original, stricter bar (a live canada.ca URL + a verbatim
  // excerpt + a verification date) still applies in full, but only to
  // questions that actually claim reviewStatus "verified" - see
  // docs/content-governance.md, "Release rule". Most of the bank is
  // "needs-review" right now (adapted straight from the reference
  // 511-question bank's own PDF-page citations); this test does not
  // relax the bar for them, it just doesn't apply a bar they were never
  // claimed to meet.
  it("every question claiming reviewStatus 'verified' meets the full citation bar", () => {
    for (const question of questions) {
      for (const localized of [question.en, question.fr]) {
        if (!localized || localized.source.reviewStatus !== "verified") continue;
        expect(localized.source.sourceUrl).toContain("canada.ca");
        expect((localized.source.excerpt ?? "").trim().length).toBeGreaterThan(0);
        expect(localized.source.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
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

  it("does not contain exact duplicate question text within the same chapter, in either language present", () => {
    const findDuplicateEntries = (language: "en" | "fr") => {
      const firstIndexByKey = new Map<string, number>();
      const duplicates: string[] = [];
      questions.forEach((question, index) => {
        const localized = question[language];
        if (!localized) return;
        const key = `${question.chapterId}::${normalizeQuestionText(localized.question)}`;
        const firstIndex = firstIndexByKey.get(key);
        if (firstIndex !== undefined) {
          duplicates.push(`${language}: "${key}" appears in both ${questions[firstIndex].id} and ${question.id}`);
        } else {
          firstIndexByKey.set(key, index);
        }
      });
      return duplicates;
    };

    expect(findDuplicateEntries("en")).toEqual([]);
    expect(findDuplicateEntries("fr")).toEqual([]);
  });

  // optionAnnotations is optional (see src/types/index.ts) - most
  // questions have some, and that's fine, most don't need it right now.
  // But for any question that does carry them, this guards against the
  // exact data-quality bug found in the reference 511-question bank
  // during the bank-comparison review
  // (docs/question-bank-comparison-report.md §5): ~50% of its true/false
  // questions had the *wrong* option's relevance mislabeled
  // "CORRECT_ANSWER" (a copy-paste artifact from the base fact's
  // annotation). is_correct/correctIndex stayed right there - only the
  // relevance label was wrong. src/data/questionLoader.ts's adapter
  // already corrects this mechanically on import, so this test is a
  // permanent guard against it ever slipping back in, by hand or
  // otherwise.
  it("option annotations, where present, are internally consistent with correctIndex", () => {
    const problems: string[] = [];
    for (const question of questions) {
      for (const localized of [question.en, question.fr]) {
        if (!localized) continue;
        const annotations = localized.optionAnnotations;
        if (!annotations) continue;

        if (annotations.length !== localized.options.length) {
          problems.push(`${question.id}: ${annotations.length} annotations for ${localized.options.length} options`);
          continue;
        }

        annotations.forEach((annotation, index) => {
          const shouldBeCorrect = index === localized.correctIndex;
          const isMarkedCorrect = annotation.relevance === "CORRECT_ANSWER";
          if (shouldBeCorrect && !isMarkedCorrect) {
            problems.push(`${question.id}: correct option ${index} is not annotated CORRECT_ANSWER`);
          }
          if (!shouldBeCorrect && isMarkedCorrect) {
            problems.push(`${question.id}: wrong option ${index} is mislabeled CORRECT_ANSWER`);
          }
          if (!annotation.explanation || !annotation.explanation.trim()) {
            problems.push(`${question.id}: option ${index} has an empty annotation explanation`);
          }
        });
      }
    }
    expect(problems).toEqual([]);
  });
});
