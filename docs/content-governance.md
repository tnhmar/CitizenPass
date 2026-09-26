# Content Governance — CitizenPass

## Purpose

This document defines how study content and practice questions are sourced, cited, reviewed, and released in CitizenPass.

## Current state (as of 2026-09-21)

As of this date, the practice/exam question pool is the reference 511-question bank, adapted programmatically (see `src/data/questionLoader.ts`) rather than hand-authored chapter by chapter. This is a deliberate, explicit decision — not a lapse of the policy below — made in three phases:

1. **Done:** integrate the reference bank as-is, English only, code adjusted to run on it (optional French, citation shape that accepts a PDF page reference instead of a live URL, `reviewStatus: "needs-review"` by default). A small number of facts (13 questions across 4 base facts) were preserved from this project's previous hand-verified bank because the reference bank doesn't cover them at all — see "Reference-bank gap facts" below.
2. **In progress, chapter by chapter:** French, sourced independently from the live French guide (never a machine translation of the English text) — the same bar this document always held EN/FR to. This is what upgrades a question from `needs-review` to `verified` (see the updated Release rule below). **3 of 11 chapters done** (`applying-for-citizenship`, `canadas-economy`, `justice-system` — 42 questions verified, as of 2026-09-23) — see "Verified-upgrade chapters" below for progress and how to do the next one.
3. **Last:** Arabic, machine-translated - the comprehension-aid bar this project has always used for Arabic (see `ArabicTranslation` in `src/types/index.ts`), unchanged by any of this.

Most of the sections below (question style, the official exam format, the variant/matching-question rules, the time-sensitive-facts policy) describe standards that still apply in full once a question is upgraded to `verified` - they describe the bar content is written *to*, not a claim that every question already meets it today. The "Question production workflow" and "Importing from the reference 511-question bank" sections describe how a question gets upgraded.

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

### Importing from the reference 511-question bank (mechanical adapter, in place today)

The 511-question bank is adapted into the app's `Question` shape at load time by `src/data/questionLoader.ts`, not hand-authored per question. This is a mechanical, deterministic transform only — it does not verify citations, source real French, or rewrite content, all of which stay future work (see "Current state" above):

- `question_type`/`difficulty` are mapped to this project's `type`/`1|2|3`; `source_chapter`/`topic`/`subtopic` classify the question into one of this app's 11 chapters (a static lookup table, with "How Canadians Govern Themselves" split into itself vs. `federal-elections` by subtopic keyword, since the reference bank doesn't pre-split that one).
- `topic`/`subtopic` carry straight into the optional `Question.topic`/`subtopic` fields; `subtopic` (underscores to hyphens) becomes the question's `tags` entry.
- `source_page` carries into `SourceCitation.pdfPage`; there is no `sourceUrl`/`excerpt`/`verifiedAt` yet, and `reviewStatus` is set to `needs-review` accordingly.
- Per-option `annotation.relevance` carries into `optionAnnotations`, with one deterministic fix applied uniformly: the reference bank has a confirmed bug (`docs/question-bank-comparison-report.md` §5) where a non-correct option's relevance is sometimes mislabeled `CORRECT_ANSWER`. The adapter forces the correct option's relevance to `CORRECT_ANSWER` and demotes any other option carrying that label to `RELATED_FACT`. `questionBankGovernance.test.ts`'s "option annotation integrity" check enforces this holds for every question, permanently.
- An `annotation.explanation` (or the correct option's, used as the question's top-level `explanation`) that is empty or literally "Not provided" is replaced with a minimal generated fallback (`"The correct answer is: <option text>"`) rather than shipping the placeholder text - this hit exactly 1 of 511 questions at last count.
- Exact duplicate question text within the same chapter (the reference bank has one such pair, `Q100`/`Q348`) is deduplicated, keeping the first occurrence.
- One record (`Q494`, `source_chapter: "Authorities"`) doesn't map to any of this app's 11 chapters and is dropped rather than guessed at.

**Upgrading a question to `verified`** is the separate, still-manual workflow this document's other sections describe in full (locate the live canada.ca excerpt in both languages, record a real citation, replace placeholder distractors that aren't realistic exam-style, etc.) - the adapter step above does not do this, by design, so that integrating the bank's structure and this project's own citation-verification bar remain two separable pieces of work.

### Verified-upgrade chapters (French-sourcing progress)

A verified question lives in its own file under `src/data/questions/verified/<chapterId>.json` (full `Question` objects, both `en` and `fr` populated with real, independently-sourced citations), imported explicitly in `src/data/questionLoader.ts` and added to that file's `VERIFIED_UPGRADES` array. The loader excludes each verified question's id from the raw reference-bank adapter pass, so a verified question fully replaces its `needs-review` counterpart rather than existing alongside it. When verifying French for a chapter, do **not** rewrite the English question/options that were already adapted from the reference bank (that's out of scope for this pass — see "Current state") — only add the real citations and the real `fr` block. Note any distractor quality issue you notice in passing (e.g. `Q358`'s "favorite hockey team") rather than silently fixing it, so it can be addressed deliberately later if wanted.

Progress:

| Chapter | Status |
|---|---|
| `applying-for-citizenship` | ✅ Done (2026-09-22) — 5/5 verified |
| `canadas-economy` | ✅ Done (2026-09-23) — 15/15 verified |
| `justice-system` | ✅ Done (2026-09-23) — 22/22 verified |
| all other 8 chapters | Not started — still 100% `needs-review` |

### Reference-bank gap facts

Four base facts (13 questions with variants) from this project's previous bank have no equivalent anywhere in the 511-question reference bank and were kept as-is (already `verified`, with real EN/FR/AR content) rather than deleted along with the rest of that bank: `ac-age-exemption` (Applying for Citizenship - the 55+ knowledge-test exemption), and three Modern Canada facts - `mc-oil-discovery-alberta` (Leduc No. 1, 1947), `mc-basketball-naismith` (James Naismith), and `mc-cardiac-pacemaker-hopps` (John Hopps). They live in `src/data/questions/preserved-legacy-facts.json`, loaded alongside the adapted reference bank in `questionLoader.ts`.

## Release rule

Practice Mode, Study chapter quizzes, and Simulated Exam Mode currently draw from every loaded question regardless of `reviewStatus`, not only `verified` ones - see "Current state" above for why. `SourceCitationCard` renders a `needs-review` question's citation visibly differently (muted color, no clickable URL, an explicit "not yet independently verified" line - see `src/components/SourceCitationCard.tsx`) rather than presenting it as equivalent to a `verified` one. Once French sourcing upgrades a question to `verified`, it should meet the full citation bar described elsewhere in this document (a live canada.ca URL, a verbatim excerpt, a verification date) with no visible difference from this project's original 450-question bank.

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
