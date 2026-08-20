# Question Bank Scaling — Variant Strategy

## Why the bank was ~107 questions

Prior to this change, CitizenPass followed a strict 1-question-per-learning-objective model:
each verified fact in *Discover Canada* produced exactly one multiple-choice question. That is
correct per `docs/content-governance.md`'s workflow, but it caps total volume at roughly the
number of independently testable facts each chapter's guide text supports — about 107 across
9 chapters.

Competing citizenship-test apps market 500–980+ questions from the *same* official guide. They
reach that volume primarily by asking each verified fact from multiple angles (direct recall,
reverse/name lookup, negative/elimination, application), not by finding hundreds of additional
facts the guide doesn't contain.

## The `variantOf` field

`src/types/index.ts` now has an optional `variantOf?: string` field on `Question`. A variant:

- Shares its base learning objective's already-verified `SourceCitation` (same excerpt, same
  guide URL, same `verifiedAt` date) — **no new source-finding or verification work required**.
- Gets its own unique `learningObjectiveId` (suffixed `-v2`, `-v3`, ...) so it is still tracked
  as a distinct, addressable item, but `variantOf` records which base objective it re-tests.
- Must test the *same underlying fact* from a genuinely different angle — not just reworded
  distractors on an identical question stem. Acceptable angles used so far: direct recall,
  "which document/place/person" framing, negative/elimination ("which is NOT..."), and
  restated-context framing.
- Is still subject to every other rule in `docs/content-governance.md`'s production workflow:
  exactly one correct answer, plausible distractors, bilingual equivalence, no fabricated facts.

## Proof of concept: Rights and Responsibilities chapter

`src/data/questions/rights-responsibilities.json` was expanded from 8 to 26 multiple-choice
questions (18 new variants across the same 8 already-verified learning objectives: sources of
law, Magna Carta, Charter entrenchment year, Mobility Rights, habeas corpus, jury duty, voting,
and military service). Every new variant reuses one of these 8 verified `SourceCitation` records
— same excerpt, same URL, same `verifiedAt: "2026-08-17"` — so no re-verification against the
official guide was needed for this batch.

The chapter was then used a second time as the proof of concept for `type: "true-false"`
coverage (see "Official exam format" and "True/false rules" in `docs/content-governance.md`):
one true/false variant per base objective (8 total, split 4 true-correct / 4 false-correct so
the format can't be gamed by always answering the same way), again reusing each objective's
already-verified `SourceCitation`. That brings this chapter to **34 questions** (26 multiple-
choice + 8 true/false) and gives the bank its first questions in the second official exam
format.

The same per-objective true/false pattern has since been repeated for `who-we-are` (8 T/F,
4 true-correct / 4 false-correct), `federal-elections` (10 T/F, 5/5), and `justice-system`
(6 T/F, 3/3) — each reusing its own objectives' already-verified citations, no new source work.
Their multiple-choice variant counts (24, 30, and 19 respectively) were already at or near the
3–4-per-objective target before this true/false pass; that earlier multiple-choice growth
predates this document's tracked process, so its exact history isn't recorded here, but the
true/false additions are: one per base objective in each of these three chapters, generated and
verified together in the same pass.

`tests/services/questionLoader.test.ts` now also verifies that every `variantOf` reference
resolves to a `learningObjectiveId` that actually exists in the same chapter, guarding against
a variant accidentally pointing at a stale or renamed objective.

## Rollout complete

The pattern below was repeated per chapter until all 9 were done:

| Chapter | Current | Objectives | Target w/ 3–4 variants each |
|---|---|---|---|
| Rights and Responsibilities | 34 (26 MC done + 8 T/F pilot) | 8 | 26 (MC target reached; T/F pilot exceeds it) |
| Who We Are | 32 (24 MC done + 8 T/F) | 8 | 30 (reached; T/F pass exceeds it) |
| Federal Elections | 40 (30 MC done + 10 T/F) | 10 | 40 (reached, MC + T/F both complete) |
| Justice System | 25 (19 MC done + 6 T/F) | 6 | 25 (reached, MC + T/F both complete) |
| Canada's History | 55 (41 MC done + 14 T/F) | 14 | ~55 (reached, MC + T/F both complete) |
| Modern Canada | 59 (44 MC done + 15 T/F) | 15 | ~55 (reached, MC + T/F both complete) |
| How Canadians Govern Themselves | 47 (35 MC done + 12 T/F) | 12 | ~45 (reached, MC + T/F both complete) |
| Canadian Symbols | 57 (41 MC done + 16 T/F) | 16 | ~60 (reached, MC + T/F both complete) |
| Canada's Regions | 62 (44 MC done + 18 T/F) | 18 | ~70 (reached, MC + T/F both complete) |
| **Total** | **411** | **107** | **~406** |

All 9 chapters now have both a full multiple-choice variant pass (every objective at 3–4 MC
questions total, except a number of single-fact objectives across several chapters that
support only 2 — a third angle would just restate an existing one) and a full true/false pass
(exactly one true/false variant per base objective, split as close to 50/50 true-correct vs.
false-correct as the objective count allows, so the format can't be gamed by always answering
the same way). Every new question reuses its objective's already-verified `SourceCitation` —
no new source-guide verification work was needed for any of this. "Target" above only models
multiple-choice scaling and was written before the true/false format existed in this bank; the
final total (411) comes from MC + T/F together, not from the MC-only target column, which is
why the total exceeds the sum of the target column.

Reaching a genuinely higher total than 411 — as opposed to more variants of the same 107
objectives — would mean a second content pass to find learning objectives the original review
missed. That requires fresh verification against the official guide text (new excerpts, new
citations) and should follow the full workflow in `docs/content-governance.md`, not the variant
shortcut described here.

## Non-negotiables preserved

- No fabricated facts: every variant's explanation is grounded in the same real, previously
  verified excerpt.
- Bilingual equivalence: each variant's English and French versions test the identical fact
  and use the shared citation (already validated as non-machine-translated).
- No release without citation: `SourceCitation.reviewStatus` remains `"verified"` for every
  variant, since it's inherited from an already-verified base fact.
