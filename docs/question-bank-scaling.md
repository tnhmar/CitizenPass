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

`src/data/questions/rights-responsibilities.json` was expanded from 8 to 26 questions (18 new
variants across the same 8 already-verified learning objectives: sources of law, Magna Carta,
Charter entrenchment year, Mobility Rights, habeas corpus, jury duty, voting, and military
service). Every new variant reuses one of these 8 verified `SourceCitation` records — same
excerpt, same URL, same `verifiedAt: "2026-08-17"` — so no re-verification against the official
guide was needed for this batch.

`tests/services/questionLoader.test.ts` now also verifies that every `variantOf` reference
resolves to a `learningObjectiveId` that actually exists in the same chapter, guarding against
a variant accidentally pointing at a stale or renamed objective.

## Rolling this out to the remaining 8 chapters

To reach ~500 total questions, repeat this pattern per chapter:

| Chapter | Current | Objectives | Target w/ 3–4 variants each |
|---|---|---|---|
| Rights and Responsibilities | 26 (done) | 8 | 26 |
| Who We Are | 8 | 8 | ~30 |
| Canada's History | 14 | 14 | ~55 |
| Modern Canada | 15 | 15 | ~55 |
| How Canadians Govern Themselves | 12 | 12 | ~45 |
| Federal Elections | 10 | 10 | ~40 |
| Justice System | 6 | 6 | ~25 |
| Canadian Symbols | 16 | 16 | ~60 |
| Canada's Regions | 18 | 18 | ~70 |
| **Total** | **125** | **107** | **~406** |

Reaching the full 500+ also requires a second content pass per chapter to identify learning
objectives the original review missed — competitors' "one question per paragraph" density
implies each chapter supports more distinct facts than the first pass captured. That second
pass **does** require fresh source verification (new excerpts, new citations) and should follow
the full workflow in `docs/content-governance.md`, not the variant shortcut described here.

## Non-negotiables preserved

- No fabricated facts: every variant's explanation is grounded in the same real, previously
  verified excerpt.
- Bilingual equivalence: each variant's English and French versions test the identical fact
  and use the shared citation (already validated as non-machine-translated).
- No release without citation: `SourceCitation.reviewStatus` remains `"verified"` for every
  variant, since it's inherited from an already-verified base fact.
