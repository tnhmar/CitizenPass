# Content Governance — CitizenPass

## Purpose

This document defines how study content and practice questions are sourced, cited, reviewed, and released in CitizenPass.

## Source of truth

- English: *Discover Canada: The Rights and Responsibilities of Citizenship* (official Government of Canada / IRCC guide)
- French: *Découvrir le Canada : Les droits et responsabilités liés à la citoyenneté* (official Government of Canada / IRCC guide)

See `docs/source-register.md` for exact URLs and edition metadata.

## Question count policy

**Question count per chapter is not fixed.** The number of verified questions a chapter receives is determined entirely by how many distinct, independently testable facts that chapter's official content actually supports — not by a target number like "8 per chapter."

- A short chapter with few distinct facts will have fewer questions.
- A long, fact-dense chapter (e.g., one spanning centuries of history with many names, dates, and events) will have more questions, because it supports more non-overlapping learning objectives.
- Do not pad a chapter with near-duplicate or trivial questions just to hit a round number.
- Do not omit a well-supported, distinct fact just to keep chapters "even." If a chapter genuinely supports 20 verified questions and another only supports 5, that asymmetry is correct and expected.
- Each question must still map to exactly one `learningObjectiveId` and pass every step in the "Question production workflow" below. Volume is a byproduct of verified coverage, never a target.

## Exam question style (based on official "Study Questions" section)

The official guide's own "Study Questions" / "Exemples de questions d'examen" section is the style template for every question in CitizenPass. Observed pattern:

- The question stem is direct and self-contained (e.g., "What are three responsibilities of citizenship?"). It never references the guide itself (no "According to Discover Canada..." framing inside the question).
- Every question has exactly 4 answer options, each a complete, plausible statement — not single words or numbers in isolation.
- Distractors are plausible-sounding but factually wrong statements, often mixing an unrelated true fact with an incorrect claim.
- Exactly one option is correct.
- The official guide's sample section does not use true/false questions at all — only 4-option multiple choice. CitizenPass follows this: **new questions default to 4-option multiple-choice**. The `true-false` type in the data model is retained for schema flexibility but should only be used with a deliberate reason; existing true/false questions have been converted to 4-option multiple-choice to match the official style.
- The source citation, exact excerpt, and explanation remain attached to the question record and are shown to the user only after they answer or during review — never embedded in the question stem itself.

## Question production workflow

1. Identify a single learning objective from the official guide.
2. Locate supporting text in the English guide.
3. Locate the equivalent supporting text in the official French guide (never a machine translation of the English excerpt).
4. Capture a short, exact excerpt in both languages.
5. Record chapter, section, printed page, PDF page (when available), source URL, edition, and verification date.
6. Write one original, unambiguous practice question per learning objective, following the exam question style above.
7. Write plausible but clearly incorrect distractors.
8. Confirm exactly one correct answer.
9. Confirm the English and French versions test the same learning objective.
10. Check for exact or near-duplicate questions already in the bank.
11. Set `reviewStatus` to `verified` only once all the above steps pass; otherwise set it to `needs-review`.

## Release rule

Only questions with `reviewStatus: "verified"` may be included in the production question pool used by Practice Mode, Study chapter quizzes, and Simulated Exam Mode.

## Citation display rule

Every question must show its source citation (guide, chapter, section, page reference, and excerpt) after the user answers and during any review screen.

## Time-sensitive facts

Facts about current officeholders, elections, or government composition must be flagged for periodic review, since they can become outdated independently of the guide edition.

## Non-representation rule

Practice questions must never be presented as actual, leaked, official, or guaranteed citizenship-test questions. They are original educational questions based on the official guides.
