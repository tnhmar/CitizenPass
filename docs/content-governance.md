# Content Governance — CitizenPass

## Purpose

This document defines how study content and practice questions are sourced, cited, reviewed, and released in CitizenPass.

## Source of truth

- English: *Discover Canada: The Rights and Responsibilities of Citizenship* (official Government of Canada / IRCC guide)
- French: *Découvrir le Canada : Les droits et responsabilités liés à la citoyenneté* (official Government of Canada / IRCC guide)

See `docs/source-register.md` for exact URLs and edition metadata.

## Question production workflow

1. Identify a single learning objective from the official guide.
2. Locate supporting text in the English guide.
3. Locate the equivalent supporting text in the official French guide (never a machine translation of the English excerpt).
4. Capture a short, exact excerpt in both languages.
5. Record chapter, section, printed page, PDF page (when available), source URL, edition, and verification date.
6. Write one original, unambiguous practice question per learning objective.
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
