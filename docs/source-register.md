# Source Register — CitizenPass

This register tracks the official source documents used as the factual authority for CitizenPass study content and questions.

## Current state (as of 2026-09-21)

The practice/exam question pool is now the reference 511-question bank, adapted programmatically (`src/data/questionLoader.ts`), not the hand-verified 450-question bank this register originally tracked chapter by chapter — see `docs/content-governance.md`, "Current state" for the phased plan (English now, French sourcing next, Arabic last) and "Importing from the reference 511-question bank" for exactly what the adapter does and doesn't do. Almost every question's `reviewStatus` is `needs-review` today: it has a `source_chapter`/`source_section`/PDF page carried over from the reference bank, but no live `canada.ca` URL, excerpt, or verification date yet.

**What's still valid from before and reusable going forward:** the guide metadata and, especially, the per-chapter `canada.ca` source URLs at the bottom of this register. Verifying a question (upgrading it from `needs-review` to `verified`) means finding its fact on the matching chapter's page below and citing the live excerpt — the URLs don't need to be rediscovered chapter by chapter the way they were the first time.

**What's now historical** (describes the deleted 450-question bank, kept for record, not the current pool): the "Content release log" table, the `applying-for-citizenship` upgrade note, and the "Time-sensitive facts excluded from ..." sections below all describe decisions made *within that bank*. The reference-bank-derived pool has not yet been individually checked against the same stale/inconsistent-guide-text pitfalls those sections identify — that check is part of the verification work in phase 2, not something inherited automatically. Re-apply the same scrutiny (each section names exactly what to watch for) when verifying the corresponding chapter.

## English guide

- Title: Discover Canada: The Rights and Responsibilities of Citizenship
- Publisher: Government of Canada / Immigration, Refugees and Citizenship Canada (IRCC)
- Guide landing page: https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada.html
- Online contents: https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online.html
- Language: en
- Access verified: 2026-08-17

## French guide

- Title: Découvrir le Canada : Les droits et responsabilités liés à la citoyenneté
- Publisher: Gouvernement du Canada / Immigration, Réfugiés et Citoyenneté Canada (IRCC)
- Guide landing page: https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada.html
- Online contents: https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne.html
- Official PDF: ~~https://www.canada.ca/content/dam/ircc/migration/ircc/francais/pdf/pub/decouvrir.pdf~~ — **checked 2026-09 and found broken (404).** Use the online contents link above (the live HTML) instead; this is consistent with using HTML as the authoritative source anyway (see Usage notes).
- Language: fr
- Access verified: 2026-08-17

## Usage notes

- Record `sourceEdition`, `sourceUrl`, `verifiedAt`, chapter, section, and excerpt for every question and study-content record being upgraded to `verified`.
- Save both `printedPage` and `pdfPage` when available, since pagination can differ between the printed guide and the PDF file.
- Re-verify this register if IRCC republishes an updated edition of either guide.
- Do not cite a French excerpt that was machine-translated from the English guide; French citations must come from the official French guide.

## Reference-bank gap facts (still verified, still current)

Four base facts (13 questions with variants) from the deleted 450-question bank have no equivalent in the reference 511-question bank and were kept rather than discarded — see `docs/content-governance.md`, "Reference-bank gap facts" for the list and rationale. They live in `src/data/questions/preserved-legacy-facts.json`, remain `reviewStatus: "verified"`, and their citations (Modern Canada and Applying for Citizenship pages, both listed below) are unchanged and still accurate.

## Content release log (historical — describes the deleted 450-question bank)

**"Questions" below counted distinct verified base facts (`learningObjectiveId`s with no `variantOf`), not the total question pool.** As of 2026-09-20 (just before the reference-bank integration) the bank held 450 questions across 128 base facts.

| Chapter ID | Guide chapter | Base facts | Review status | Verified |
|---|---|---|---|---|
| `applying-for-citizenship` | Applying for Citizenship / Demander la citoyenneté | 5 | verified | 2026-09-20 |
| `rights-responsibilities` | Rights and Responsibilities of Citizenship / Les droits et responsabilités liés à la citoyenneté | 16 | verified | 2026-08-17 (+8 facts 2026-09-20) |
| `who-we-are` | Who We Are / Qui sommes-nous, les Canadiens? | 8 | verified | 2026-08-17 |
| `canadas-history` | Canada's History / L'histoire du Canada | 14 | verified | 2026-08-17 |
| `modern-canada` | Modern Canada / Le Canada moderne | 15 | verified | 2026-08-17 |
| `how-canadians-govern-themselves` | How Canadians Govern Themselves / Les Canadiens et leur système de gouvernement | 13 | verified | 2026-08-17 |
| `federal-elections` | Federal Elections / Les élections fédérales | 10 | verified | 2026-08-17 |
| `justice-system` | The Justice System / Le système de justice | 6 | verified | 2026-08-17 |
| `canadian-symbols` | Canadian Symbols / Les symboles canadiens | 16 | verified | 2026-08-17 |
| `canadas-regions` | Canada's Regions / Les régions du Canada | 18 | verified | 2026-08-17 |
| `canadas-economy` | Canada's Economy / L'économie canadienne | 7 | verified | 2026-09-10 |

## `applying-for-citizenship` upgrade (current — first chapter verified under the new architecture)

On 2026-09-22, this chapter's 4 reference-bank questions (`Q358`, `Q359`, `Q360`, `Q485`) were upgraded to `reviewStatus: "verified"`: real `canada.ca` EN citations plus independently-sourced French (not translated), living in `src/data/questions/verified/applying-for-citizenship.json`. English question text and options were left exactly as the reference bank wrote them — including `Q358`'s weak "favorite hockey team" distractor — since rewriting English content is out of scope for this pass (see `docs/content-governance.md`, "Verified-upgrade chapters"). Combined with `q-ac-004` (the preserved 55+ exemption fact, already verified), this chapter is now **5/5 verified**, the first chapter fully done under the new architecture.

## Time-sensitive facts excluded from `canadas-regions` (historical — see "Current state" above)

Per `docs/content-governance.md`, "Time-sensitive facts," the live guide page states Canada's population as "about 34 million" and gives similarly dated provincial population figures. Canada's actual population now exceeds 41 million. The deleted bank's 18 `canadas-regions` questions tested no population statistic for this reason. The reference-bank-derived `canadas-regions` questions (90 of them) have not yet been checked against this same pitfall.

## Time-sensitive facts excluded from `canadian-symbols` (historical — see "Current state" above)

The live guide page contains an internally inconsistent, outdated reference to the reigning monarch: the body text correctly uses the generic "Sovereign (Queen or King)," but a fill-in-the-blank study section on the same page still says "the Queen of Canada," and the printed Oath of Citizenship names "Queen Elizabeth the Second" specifically — stale since 2022. The deleted bank had no question about the current monarch's identity for this reason. The reference-bank-derived `canadian-symbols` questions (56 of them) have not yet been checked against this same pitfall.

## Time-sensitive facts excluded from `federal-elections` (historical — see "Current state" above)

- **"Canada is divided into 308 electoral districts."** The guide page itself was still live with this figure as of 2025-08-08. The real count was 338 from 2015 to the 2025 general election, and has been 343 since — the guide has not caught up with either change.
- **"Three major political parties currently represented in the House of Commons."** Party standings change with every election.

The deleted bank's 41 `federal-elections` questions avoided both. The reference-bank-derived `federal-elections` questions (21 of them) have not yet been checked against either pitfall.

## Time-sensitive nuance in `applying-for-citizenship` (applied in the 2026-09-22 verification)

The "About the Citizenship Test" section says you're tested on "two basic requirements," including "adequate knowledge of English or French" — but the same live page carries a dated note (effective 2017-10-11) stating the citizenship *knowledge* test itself is **not** used to assess language ability; language is demonstrated separately. `Q485`'s verified citation and explanation are grounded in the update note, not the older "two basic requirements" framing alone.

## Per-chapter source pages (still valid — use these when verifying reference-bank-derived questions)

- `applying-for-citizenship`: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/applying-citizenship.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/demander-citoyennete.html
- `rights-responsibilities`: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/rights-resonsibilities-citizenship.html (yes, "resonsibilities" — that's canada.ca's own typo, not ours) ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/droits-responsabilites-citoyennete.html
- `who-we-are`: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/who-are-canadians.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/qui-sont-canadiens.html
- `canadas-history`: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-history.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/histoire-canada.html
- `modern-canada`: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/modern-canada.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/canada-moderne.html
- `how-canadians-govern-themselves`: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/how-canadians-govern-themselves.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/canadiens-systeme-gouvernement.html
- `federal-elections`: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/federal-elections.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/elections-federales.html
- `justice-system`: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/justice-system.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/systeme-justice.html
- `canadian-symbols`: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadian-symbols.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/symboles-canadiens.html
- `canadas-regions`: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-regions.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/regions-canada.html
- `canadas-economy`: source pages not yet on file — was added late in the deleted bank's life (2026-09-10) without a note here; re-locate when verifying.

Notes:
- Chapter content (Study reading material, `src/data/content/*.json`) and the preserved legacy facts' citations were sourced from the official `canada.ca` online HTML guides (English and French), not the attached PDF, because the attached PDF's body-text layer extracted as garbled/unreadable characters.
- Edition identifier `Ci1-11/2021E-PDF, ISBN 978-0-660-39273-8` was confirmed against the attached PDF's colophon text (page 2), which extracted correctly.
