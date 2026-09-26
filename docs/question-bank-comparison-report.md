# CitizenPass — Question Bank Comparison Report

**Scope:** compare the app's current bilingual question bank (`src/data/questions/*.json`,
437 questions) against the new English-only candidate bank supplied for review
(`question_bank.json`, 511 questions), against the sole source of truth: the official
*Discover Canada* guide (English and French, IRCC/canada.ca).

**Method:** structural/statistical analysis of both JSON banks (schema, counts, internal
consistency, governance-rule compliance); the candidate bank's own `official_study_questions_coverage.md`
audit against IRCC's official sample questions; and direct spot-verification of a sample of
candidate-bank facts against the live `canada.ca` guide pages and the guide's publication
record. This is not an exhaustive 511-question fact audit — see §6 for what a full audit
would still require.

This is an analysis document only. Nothing in the codebase has been changed.

---

## 1. Verdict, up front

The candidate bank (511 questions) is **broader in coverage, more rigorously
cross-checked against IRCC's own official sample questions, and richer in per-answer
pedagogy** than the current bank (437 questions). Every fact I spot-checked against the
live official guide was accurate. It is **not, however, a drop-in replacement**: it is
English-only, cites PDF page numbers instead of the `canada.ca` excerpt+URL citation the
app's own governance tests require, and uses a different schema entirely. Adopting it means
a **migration project** (schema conversion + citation backfill + French sourcing + Arabic
translation), comparable in scope to the work that built the current 437-question bank —
not a file swap. §7 lays out a phased way to do that without one giant delivery.

---

## 2. Coverage comparison

| Guide chapter | Current app | Candidate bank |
|---|---:|---:|
| Applying for Citizenship | **0 — no chapter at all** | 4 |
| Rights and Responsibilities of Citizenship | 35 | 37 |
| Who We Are | 32 | 28 |
| Canada's History | 56 | 135 |
| Modern Canada | 59 | 45 |
| How Canadians Govern Themselves *(incl. Federal Elections)* | 91 *(50 + 41, split)* | 77 *(not pre-split)* |
| The Justice System | 26 | 22 |
| Canadian Symbols | 59 | 56 |
| Canada's Economy | 15 | 18 |
| Canada's Regions | 64 | 91 |
| **Total** | **437** | **511** |

Two coverage findings stand out:

- **"Applying for Citizenship" is a real gap in the current app** — it's one of the guide's
  chapters (pp. 6–10 in the standard edition; the candidate bank's PDF page references it as
  pp. 8–10) and the current app has no chapter, content, or questions for it at all. The
  candidate bank's 4 questions here (officials' application checks, free language classes
  vs. the "free flights" distractor, the ceremony, the test's purpose) all checked out
  against the live guide page.
- **Canada's History is far deeper in the candidate bank** (135 vs. 56) — partly genuine
  additional facts, partly because a "Modern Canada"-sourced historical figure occasionally
  gets filed under the `history` topic rather than `modern`. Either way it's a real net gain
  in unique facts tested, not just re-phrasings (see §4 for the duplicate-rate check).
- **Federal Elections isn't pre-split** in the candidate bank — it's folded into "How
  Canadians Govern Themselves" (77 total). About 30 of those 77 are identifiably
  election-related by subtopic/text, close to the current app's 41, so the current app's
  chapter split is preservable, but it's a mapping decision made during migration, not
  something the candidate bank hands you for free.

## 3. Official-sample-question coverage — a real methodology gap in the current bank

The candidate bank ships `official_study_questions_coverage.md`: a **1-to-1 audit of all 28
official "Other Study Questions"** IRCC prints on guide pp. 108–110 against its own question
IDs. It found 18/28 covered, drafted the other 10, and — I confirmed by searching the bank's
own question text — **all 10 drafts are already merged in** (`Q501`–`Q512`), so the candidate
bank's traceable coverage of IRCC's own sample questions is effectively complete.

The current app has **no equivalent audit**. `docs/content-governance.md` treats the
official Study Questions section only as "the writing-quality reference for direct,
self-contained question stems" — a style guide, not a coverage checklist. There's no
register mapping the current 437 questions back to IRCC's 28 official samples. This is worth
closing regardless of the bank decision below — see §7.

## 4. Content-quality comparison

- **Per-option pedagogy.** The current schema has one `explanation` string per question (for
  the correct answer). The candidate bank annotates **every option**, categorized
  (`CORRECT_ANSWER`, `RELATED_FACT`, `PARTIALLY_CORRECT`, `PLAUSIBLE_DISTRACTOR`,
  `COMMON_MISCONCEPTION`, `ANACHRONISM`, `WRONG_CATEGORY`) with its own grounded explanation
  — e.g. for "three responsibilities of citizenship," the wrong options are explained as
  "loyalty and service are real, but 'recycling newspapers' overstates a general
  anti-waste principle" rather than left as bare distractors. This is a genuine pedagogical
  upgrade with no current-bank equivalent.
- **`test_tip` and `cross_references`** — a short memorization tip and links to related
  questions on every item. Neither exists in the current schema. Nice-to-have, not
  load-bearing.
- **Duplicate rate.** Across all 511 candidate questions I found exactly **one** exact
  duplicate pair (`Q100`/`Q348`, both asking Ontario+Quebec's share of manufacturing,
  filed under two different topic tags) — negligible, and trivially fixed by dropping one.
- **Structural integrity.** Every one of the 511 questions has exactly one `is_correct: true`
  option (multiple-choice and true/false both checked), all `cross_references` resolve to
  real question IDs, and option counts are exactly 4 (multiple-choice, 307 of 511) or exactly
  2 (true/false, 204 of 511) — matching the current app's own "official-format compliance"
  rule (4 MC options or exactly True/False) already.

## 5. Data-quality issue found: mislabeled annotations on ~half of true/false questions

**This does not affect grading** — flagging it as a fix-before-use item, not a correctness
verdict on the bank. In exactly **102 of 204** true/false questions (50%), the *wrong*
option's `annotation.relevance` field is mislabeled `CORRECT_ANSWER` — e.g. for "The United
States is Canada's largest trading partner" (True, correctly graded `is_correct: true`), the
**False** option's annotation is *also* tagged `relevance: CORRECT_ANSWER`. The bank's own
schema notes explain the likely cause: "FALSE statements are built from an existing
annotated distractor so the grounding is preserved" — i.e., the real fact's explanation text
was correctly copied to both options (both options *should* explain the same underlying
fact), but the categorical `relevance` label wasn't re-derived for the option that's
actually wrong. I verified this is metadata-only: `is_correct` is independently correct on
every single option in every one of the 511 questions (checked exhaustively, not sampled) —
this is what the app would actually grade against. It would need a one-time
relabeling pass before the annotation categories are surfaced in any UI.

## 6. Correctness spot-check against the live official guide

I checked the sample-question-audit doc's own citations (rights/history/government/symbols —
already guide-quoted with page numbers by its author) and independently re-verified a further
sample by fetching the live `canada.ca` guide pages myself:

- **Canada's Economy** (Q075, Q076, Q074): "three main types of industries," "more than 75%
  in service industries," and "the U.S. is Canada's largest trading partner" all match the
  live guide text verbatim.
- **Applying for Citizenship** (Q358, Q359, Q485): the application-check wording, the
  "free official-language classes" fact (correctly distinguished from the false
  "free flights" distractor), and the test's stated purpose all match the live guide page.
  Q485 also correctly avoids re-asserting the guide's now-superseded claim that the
  citizenship test itself assesses language ability — a 2017 regulatory change decoupled
  language assessment from the knowledge test, and a footnote on the guide's own "Message to
  Our Readers" page flags this. The candidate bank's authors appear to have already applied
  the same "don't teach a stale claim" judgment the current app's own governance policy uses
  for electoral-district counts and the monarch's name.
- **Canada's Regions** (Q098, Ontario's population share): "more than one-third" matches
  independent, non-guide sources describing the same guide-sourced fact; I did not pull the
  exact guide paragraph text for this one, so treat it as corroborated rather than
  guide-quote-verified.
- **Edition check:** the candidate bank cites a "large-print edition, last modified
  2024-11-08." I confirmed via the government publications registry that this is the same
  2021 `Discover Canada` text (©2021, ISBN 978-0-660-39274-5, 129 pages — matching the page
  count in the supplied `toc.json` exactly) reformatted for large print, not a content
  revision. Different page numbers than the standard edition, same facts. (Unrelated aside,
  not actionable now: an IRCC planning note from 2024 confirms a *replacement* guide has been
  in development to address Indigenous history and other gaps, with no publication date set
  as of that note — worth a periodic check, not a current blocker.)

Net: every fact I checked against the live guide was accurate. This is a spot-check across
~15 questions in 3 chapters, not a 511-question audit — a full fact-by-fact re-verification
(matching the rigor the current 437 already went through) is real remaining work regardless
of which path in §7 is chosen.

## 7. What adopting the candidate bank would actually require

The current bank's own governance test
(`tests/services/questionBankGovernance.test.ts`) enforces, per question, per language:
a `canada.ca` source URL, a non-empty verbatim excerpt, a `verifiedAt` date, and
`reviewStatus: "verified"` — plus exactly 4 options (MC) or exactly `["True","False"]` /
`["Vrai","Faux"]` (T/F), matching `en`/`fr` option counts, and a unique `learningObjectiveId`
per fact. The candidate bank has none of this in the app's shape yet. Concretely, adopting it
means:

1. **Schema conversion** (mechanical): `question_text`→`question`, `options[].is_correct`→
   `correctIndex`, `difficulty` (easy/medium/hard) → the app's numeric `1|2|3`, `topic`+
   `source_chapter`→`chapterId` (including the Federal Elections split, and adding a new
   `applying-for-citizenship` chapter to the manifest).
2. **English citation backfill** (real work, not mechanical): every question needs a
   `canada.ca` URL and a verbatim excerpt in the app's `SourceCitation` shape. The candidate
   bank's own "explanation" text already *names* the right guide section, which makes this
   faster than starting from zero, but each of 511 excerpts still needs pulling from the live
   page and verifying, the same way the current 437 were done.
3. **French sourcing from scratch** — the candidate bank has no French at all. Per your
   instruction and the existing `docs/content-governance.md` policy ("do not cite a French
   excerpt that was machine-translated from the English guide"), every question's `fr` block
   needs an independently-sourced excerpt from the live French guide, not a translation of
   the English one.
4. **Arabic via machine translation** — mechanical once English+French are locked, matching
   the `ArabicTranslation` type already in the schema (question/options/explanation only, no
   `correctIndex`, no `source` — exactly the "comprehension aid, not a citation" design the
   current 437 already use, at 100% coverage).
5. **Fix the two data issues from §4–5** (one duplicate pair, the T/F relevance mislabeling)
   during conversion, not after.
6. **De-duplicate against the current 437** where a fact already exists in both banks, to
   avoid double-counting toward totals or creating near-duplicate learning objectives.

This is genuinely comparable in size to the work that produced the current 437-question
bank. I'd suggest **not** doing it as one migration, but chapter-by-chapter, the same
unit the current bank's own source register already tracks review status by — e.g. start
with the one clear pure-gap chapter (Applying for Citizenship, 4 questions, zero current
coverage) as a small proof-of-migration, then proceed chapter by chapter, prioritizing by
where the candidate bank's coverage/quality lead over the current bank is largest
(Canada's History and Canada's Regions, per §2).

---

## 8. Already done since the last analysis report

Two independent checks while reviewing the codebase for this task, unrelated to the
candidate bank:

- **§4 of `docs/deep-analysis-report.md`** (the exam Grid/List navigator should be an
  always-visible header icon, not buried in the "⋮" menu) **is already implemented** —
  `app/exam/index.tsx` has the dedicated icon with a comment citing that section. No action
  needed.
- **§2.3's `canadas-economy` gap is already closed** — the chapter now exists (15 questions,
  7 base facts, `verified` 2026-09-10) and the current-bank total has grown from 411 to 437
  accordingly.

## 9. Open decisions

**9.1 — Bank strategy.** Which of these do you want:
  - **(a) Phased migration**, chapter by chapter, starting with Applying for Citizenship
    (§7's proof-of-migration chapter), in parallel with the UI/statistics deliveries below.
  - **(b) Hold the bank question entirely for now** and ship only the UI/statistics work
    below; revisit the bank once those are done.
  - **(c) Something narrower** — e.g., only backfill the one pure gap (Applying for
    Citizenship) using the candidate bank as a reference, without touching the other 9
    chapters at all.

**9.2 — Official-sample-question audit for the current bank (§3).** Worth doing regardless
of 9.1's answer: build the current 437's own 28-question coverage register, using the
candidate bank's already-completed audit as a cross-check. Small, independent, low-risk.
Include it now, or later?
