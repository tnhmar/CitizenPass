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
- A variant must ask from a genuinely different angle. The standard angles, in the order they are normally added, are:
  1. **Reverse lookup** (`-v2`) — invert the direction of recall (e.g., the base asks "what word means X," the variant asks "what does word Y mean").
  2. **Restatement / negative-elimination** (`-v3`) — a differently-worded direct question, or a "which of these is NOT..." elimination question.
  3. **A further distinct angle** (`-v4`, where the fact supports one) — either a scope/applicability question (tests *where or when* a principle applies, e.g., "does this apply to criminal matters, civil matters, or both?") where the fact is a principle with a real boundary, or a further specific-detail extraction from the same excerpt (e.g., a name, place, or number the excerpt supports that isn't covered by v2/v3) where the fact is list-like or detail-rich enough to support one. Only add this angle where it is genuinely distinct from v2/v3 — do not force a fourth angle onto a fact that has nothing further to ask (see "do not pad," above).
  4. **True/false** (`-v5` if a fourth angle exists, `-v4` otherwise) — the same fact as a valid true/false statement (see the true/false rules above). This is always the last variant added, after any multiple-choice angles.
- **Before assigning a new variant's ID suffix, check the actual existing suffixes on that base fact - do not infer the next free suffix from the variant count alone.** Some base facts created before this angle-ordering convention was formalized have their true/false variant at `-v4` with only 3 total variants (not 4), so adding a genuine 4th angle to one of those must use `-v5`, not `-v4` - assuming `-v4` is free because "only 3 variants exist so far" produces a duplicate `learningObjectiveId` silently unless caught by the "no duplicate `learningObjectiveId`" governance check.
- Changing only the distractor order or swapping a few words is not a valid variant.
- Before release, run duplicate and near-duplicate checks within each variant family. Replace or mark `needs-review` any question that is substantially redundant.
- A true/false variant is valid only when it conforms to the true/false rules above.
- The normal target depth is 3 variants per base fact: reverse lookup, restatement/elimination, and true/false. A 4th variant (the further distinct angle described above) is additive, not required, and should only exist where it is genuinely useful — a base fact stopping at 3 variants because a further angle would be forced is not a gap to be filled mechanically.

## Matching/combination questions

A fifth angle, distinct from all four in "Variant question rules" above, tests **retention of
multiple related facts at once** rather than one fact in isolation: a "which pairing is correct"
question whose four options each combine two related facts (e.g., a responsibility paired with its
correct level of government), with distractors formed by swapping correct facts against each other
rather than inventing a false fact from scratch.

**On reflection, this needs no new schema, UI, or scoring logic** — an earlier version of this
section said otherwise, but that was wrong: the official IRCC test itself only has multiple-choice
and true/false questions (see `docs/deep-analysis-report.md` §7 for that research), so a "matching"
angle only makes sense here as a `type: "multiple-choice"` question whose *option text* happens to
be compound pairings rather than single facts. It renders, scores, and validates exactly like every
other multiple-choice question, using the app's existing `OptionButton` UI unchanged. Introducing a
genuinely new interactive matching UI (drag-and-drop, connect-the-pairs) would be more complex for
no real benefit, and would move *away* from matching the official exam's actual format rather than
toward it.

**Sourcing rule specific to this angle:** every fact combined into a pairing option must already be
independently verified elsewhere in the question bank as its own `learningObjectiveId` (not
invented fresh for the combination question) — the citation on the combination question should
point to whichever single already-verified excerpt most directly establishes the relationship
being tested (e.g., an excerpt that itself distinguishes multiple levels/categories), and the
explanation should note which existing facts the combination draws on. Do not force a combination
question where the source facts aren't already this cleanly established elsewhere - see the first
example, `gov-levels-of-government-matching`, for the pattern this follows in practice.

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

### Importing from the reference 511-question bank

Some questions start from a fact identified in the external 511-question reference bank (see `docs/question-bank-comparison-report.md`) rather than from scratch. That bank is a *pointer to what to test*, not a source of ready-to-ship content — every step of the workflow above still applies in full, in particular steps 2-5 (the reference bank's own citations are PDF page numbers, which do not satisfy this project's citation bar). Additionally:

- Map `question_type` (`multiple_choice`/`true_false`) to this project's `type`, and `difficulty` (`easy`/`medium`/`hard`) to this project's `1`/`2`/`3`.
- `topic`/`subtopic` may be carried over as-is into the optional `Question.topic`/`subtopic` fields (see `src/types/index.ts`) - they're informal category labels, not citations, so they don't need re-verification.
- Per-option `annotation.relevance` may be carried over into `optionAnnotations`, but never copy `annotation.explanation` text verbatim if it says "Not provided" or is a bare page citation (e.g. `"Page 8: '...'"`, ) - write a real, natural-language explanation, same bar as the main `explanation` field.
- Before shipping, re-check every option's `relevance` against `correctIndex`: the reference bank has a confirmed bug (see `docs/question-bank-comparison-report.md` §5) where the *wrong* option's relevance is sometimes mislabeled `CORRECT_ANSWER`. `questionBankGovernance.test.ts`'s "option annotation integrity" check catches this, but verify by hand too.
- A reference-bank distractor that isn't realistic exam-style (e.g. clearly a placeholder rather than something a real test might use) should be replaced, not preserved for fidelity's sake — see `applying-for-citizenship.json`'s `q-ac-001` for an example (the source bank's "Your favorite hockey team" distractor was swapped out).
- `tags` should still be populated even when the reference bank left them empty for a question - the humanized `subtopic` value is normally a good tag on its own.

## Release rule

Only questions with `reviewStatus: "verified"` may be included in the production question pool used by Practice Mode, Study chapter quizzes, and Simulated Exam Mode.

## Citation display rule

Every question must show its source citation (guide, chapter, section, page reference, and excerpt) after the user answers and during any review screen.

## Time-sensitive facts

Facts about current officeholders, elections, government composition, current electoral district counts, or political-party standings must be flagged for periodic review. If the official guide contains a stale time-sensitive statement, mark it `needs-review` and do not include it in the verified production pool.

**This policy has already been applied and confirmed correct as of the 2026-09 deep-analysis review.** The guide itself is not internally consistent on several time-sensitive points, and the following are deliberately excluded from the verified pool for that reason:

- **Electoral district count.** The guide's own Federal Elections chapter, last touched 2025-08-08, still states "Canada is divided into 308 electoral districts." The real count has been 343 since the 2025 general election. No verified question may state a specific riding count.
- **Current monarch by name.** The guide's body text correctly uses the gender-neutral "Sovereign (Queen or King)" when explaining the constitutional-monarchy structure, but a fill-in-the-blank study section on the same live page still says "the Queen of Canada," and the printed Oath of Citizenship names "Queen Elizabeth the Second" specifically — stale since Her Majesty's death in 2022. No verified question may name a current monarch, only the generic constitutional role.
- **Current party standings.** "There are three major political parties currently represented in the House of Commons: the Conservative Party, the New Democratic Party, and the Liberal Party" is a snapshot of a specific past Parliament, not an evergreen structural fact. No verified question may assert a specific current party lineup.

The underlying rule this generalizes to: **when the guide's own text conflicts with current reality, or contains a fact that is true only as of a specific past date, exclude it from the verified pool rather than "fixing" it to match current reality** — the guide, not current events, remains the single source of truth, and a fact the guide itself doesn't consistently assert isn't one CitizenPass should assert either. This is different from excluding a fact merely because it might change in the future (e.g., "there are 10 provinces" is stable and verified even though it is, in principle, not permanent) — the bar is *demonstrated* staleness or internal inconsistency in the source itself, not hypothetical future change.

## Non-representation rule

Practice questions must never be presented as actual, leaked, official, or guaranteed citizenship-test questions. They are original educational questions based on the official guides.
