# Content Governance — CitizenPass

## Purpose

This document defines how study content and practice questions are sourced, cited, reviewed, and released in CitizenPass.

## Source of truth

- English: *Discover Canada: The Rights and Responsibilities of Citizenship* (official Government of Canada / IRCC guide)
- French: *Découvrir le Canada : Les droits et responsabilités liés à la citoyenneté* (official Government of Canada / IRCC guide)
- Official exam format: [IRCC — Étudier pour l’examen](https://www.canada.ca/fr/immigration-refugies-citoyennete/services/citoyennete-canadienne/examen/etudier.html)

See `docs/source-register.md` for guide edition metadata and source URLs.

## Official exam format

The official IRCC exam-format page is the controlling source for CitizenPass exam-format rules. Verified on 2026-08-18 from the official French IRCC page above:

- The citizenship test has 20 questions.
- Questions may be multiple choice or true/false.
- The test is offered in English or French.
- The time limit is 45 minutes.
- A score of at least 15 correct answers out of 20 is required to pass.
- Candidates have a maximum of three attempts to pass.
- All official test questions are based on the official study guide.

CitizenPass must model its simulated exam on these rules. Practice questions are original educational items, not official, leaked, or guaranteed test questions, but they must use one of the official question types: `multiple-choice` or `true-false`.

## Question count policy

**Question count per chapter is not fixed.** The number of verified questions a chapter receives is determined entirely by how many distinct, independently testable facts that chapter's official content actually supports — not by a target number like "8 per chapter."

- A short chapter with few distinct facts will have fewer questions.
- A long, fact-dense chapter (e.g., one spanning centuries of history with many names, dates, and events) will have more questions, because it supports more non-overlapping learning objectives.
- Do not pad a chapter with near-duplicate or trivial questions just to hit a round number.
- Do not omit a well-supported, distinct fact just to keep chapters "even." If a chapter genuinely supports 20 verified questions and another only supports 5, that asymmetry is correct and expected.
- Each question must still map to exactly one `learningObjectiveId` and pass every step in the "Question production workflow" below. Volume is a byproduct of verified coverage, never a target.

## Question style

The official guide's own "Study Questions" / "Exemples de questions d'examen" section remains the writing-quality reference for direct, self-contained question stems and plausible distractors. However, the official IRCC exam-format page confirms that the real test may use either multiple-choice or true/false questions.

### Multiple-choice rules

- The question stem must be direct and self-contained. It must never refer to the guide (for example, no "According to Discover Canada..." framing).
- Use exactly 4 answer options unless the official format source changes.
- Each option must be a complete, plausible statement; do not use isolated words or numbers where a complete answer can be written.
- Exactly one option must be correct.
- Distractors must be plausible but factually wrong. They may combine an unrelated true fact with a false claim, but must not create ambiguity.

### True/false rules

- Use exactly 2 options: `True` / `False` in English and `Vrai` / `Faux` in French.
- The statement must test one clear, guide-supported claim.
- Avoid negatives where a direct multiple-choice question would be clearer; a true/false question must not become a reading trick.
- Exactly one option must be correct.

For both formats, the source citation, exact excerpt, and explanation remain attached to the question record and are shown only after the user answers or during review — never embedded in the question stem.

## Variant question rules

An optional `variantOf` field may link an additional framing of a verified fact to its base `learningObjectiveId`.

- A variant may reuse an already-verified bilingual `SourceCitation` only when it tests exactly the same underlying fact.
- A variant must ask from a genuinely different angle: for example, direct recall, reverse name/date lookup, a clear negative/elimination question, application, or a valid true/false statement.
- Changing only the distractor order or swapping a few words is not a valid variant.
- Before release, run duplicate and near-duplicate checks within each variant family. Replace or mark `needs-review` any question that is substantially redundant.
- A true/false variant is valid only when it conforms to the true/false rules above.

## Question production workflow

1. Identify a single learning objective from the official guide.
2. Locate supporting text in the English guide.
3. Locate the equivalent supporting text in the official French guide (never a machine translation of the English excerpt).
4. Capture a short, exact excerpt in both languages.
5. Record chapter, section, printed page, PDF page (when available), source URL, edition, and verification date.
6. Write one original, unambiguous practice question that conforms to the official exam format and the style rules above.
7. Write plausible but clearly incorrect distractors for multiple-choice questions, or a clear verified statement for true/false questions.
8. Confirm exactly one correct answer.
9. Confirm the English and French versions test the same learning objective.
10. Check for exact or near-duplicate questions already in the bank, including questions in the same `variantOf` family.
11. Set `reviewStatus` to `verified` only once all the above steps pass; otherwise set it to `needs-review`.

## Release rule

Only questions with `reviewStatus: "verified"` may be included in the production question pool used by Practice Mode, Study chapter quizzes, and Simulated Exam Mode.

## Citation display rule

Every question must show its source citation (guide, chapter, section, page reference, and excerpt) after the user answers and during any review screen.

## Time-sensitive facts

Facts about current officeholders, elections, government composition, current electoral district counts, or political-party standings must be flagged for periodic review. If the official guide contains a stale time-sensitive statement, mark it `needs-review` and do not include it in the verified production pool.

## Non-representation rule

Practice questions must never be presented as actual, leaked, official, or guaranteed citizenship-test questions. They are original educational questions based on the official guides.
