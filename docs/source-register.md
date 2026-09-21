# Source Register — CitizenPass

This register tracks the official source documents used as the factual authority for CitizenPass study content and questions.

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

- Record `sourceEdition`, `sourceUrl`, `verifiedAt`, chapter, section, and excerpt for every question and study-content record.
- Save both `printedPage` and `pdfPage` when available, since pagination can differ between the printed guide and the PDF file.
- Re-verify this register if IRCC republishes an updated edition of either guide.
- Do not cite a French excerpt that was machine-translated from the English guide; French citations must come from the official French guide.

## Content release log

**"Questions" below counts distinct verified base facts (`learningObjectiveId`s with no `variantOf`), not the total question pool.** Each base fact normally yields 3-4 total questions once its angle variants (`-v2`, `-v3`, etc. — see `docs/content-governance.md`, "Variant question rules") are included, since variants inherit their base fact's citation rather than getting a new register entry. As of 2026-09-20 the actual total pool is 450 questions across 128 base facts (see `docs/deep-analysis-report.md` §1.1 for a snapshot of the per-chapter base/variant/total breakdown as of that report's date — the total here supersedes it by a wide margin) — this table intentionally still tracks base facts only, since that is the unit citation review actually happens at. One of the 115 (`gov-levels-of-government-matching`) is a matching/combination question rather than a single-fact base objective — see `docs/content-governance.md`, "Matching/combination questions" — it has no variants of its own.

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

Question counts are intentionally not fixed per chapter — see `docs/content-governance.md`, "Question count policy" (critical section). `canadas-regions` remains the richest chapter to date. `canadas-economy` has no release yet — see `docs/deep-analysis-report.md` §2.3.

`rights-responsibilities` was expanded on 2026-09-20 from 8 to 16 base facts (`q-rr-036` through `q-rr-043`), closing a real coverage gap: the chapter's own Study content already cited the four fundamental freedoms, three of the Charter's four additional rights (Aboriginal Peoples' Rights, Official Language Rights, Multiculturalism — Mobility Rights was already tested), the Equality of Women and Men section, and three of six citizenship responsibilities (obeying the law, protecting heritage/environment, helping others — jury duty, voting and military service were already tested), none of which had a question testing them. All eight new facts cite the same already-verified `rights-resonsibilities-citizenship.html` / `droits-responsabilites-citoyennete.html` pages (re-fetched live to confirm current wording), so no new source pages were added to this register.

## Time-sensitive facts excluded from `canadas-regions`

Per `docs/content-governance.md`, "Time-sensitive facts," the live guide page states Canada's population as "about 34 million" and gives similarly dated provincial population figures. Canada's actual population now exceeds 41 million. **No question in this chapter's release tests any population statistic.** All 18 questions instead test stable geographic, historical, and structural facts.

## Time-sensitive facts excluded from `canadian-symbols`

The live guide page contains an internally inconsistent, outdated reference to the reigning monarch: the body text correctly uses the generic "Sovereign (Queen or King)," but a fill-in-the-blank study section on the same page still says "the Queen of Canada," and the printed Oath of Citizenship names "Queen Elizabeth the Second" specifically — stale since 2022. No question about the identity of the current monarch was created; see `docs/content-governance.md`, "Time-sensitive facts," for the full policy this follows.

## Time-sensitive facts excluded from `federal-elections`

- **"Canada is divided into 308 electoral districts."** The guide page itself was still live with this figure as of 2025-08-08. The real count was 338 from 2015 to the 2025 general election, and has been 343 since — the guide has not caught up with either change. No verified question states a specific riding count.
- **"Three major political parties currently represented in the House of Commons."** Party standings change with every election.

## `applying-for-citizenship` upgraded from the reference 511-question bank

On 2026-09-21, all 5 `applying-for-citizenship` questions except `q-ac-004` (age exemption, which the reference bank doesn't cover) were rewritten in place using the reference 511-question bank's `Q358`/`Q359`/`Q360`/`Q485` as the starting point for which facts and distractors to test — see `docs/content-governance.md`, "Importing from the reference 511-question bank" for the workflow this followed. IDs, `learningObjectiveId`s, and question count are unchanged; citations were independently re-verified against the same two pages already on file for this chapter (English/French URLs below), not carried over from the reference bank's page-number citations. Each question now also carries `topic`/`subtopic` and per-option `optionAnnotations`, checked against `questionBankGovernance.test.ts`'s annotation-integrity rule.

## Time-sensitive nuance handled differently in `applying-for-citizenship`

Unlike the exclusions above, this one wasn't silently dropped, because the guide's own live page already surfaces the correction rather than leaving it stale. The "About the Citizenship Test" section still says you're tested on "two basic requirements," including "adequate knowledge of English or French" — but the same live page carries a dated note (effective 2017-10-11) stating the citizenship *knowledge* test itself is **not** used to assess language ability; language is demonstrated separately. Both the original text and the update note are included in the Study content (as a leading "Note" section, matching the source page's own layout), and no verified question's correct answer asserts that the knowledge test evaluates language — see `q-ac-003`, which is grounded in the update note specifically.

Notes:
- `applying-for-citizenship` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/applying-citizenship.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/demander-citoyennete.html
- Chapter content and question citations for all nine chapters were sourced from the official `canada.ca` online HTML guides (English and French), not the attached PDF, because the attached PDF's body-text layer extracted as garbled/unreadable characters.
- Printed/PDF page numbers are not recorded for these chapters' citations because they could not be reliably verified against the unreadable PDF text layer.
- Edition identifier `Ci1-11/2021E-PDF, ISBN 978-0-660-39273-8` was confirmed against the attached PDF's colophon text (page 2), which extracted correctly.
- `who-we-are` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/who-are-canadians.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/qui-sont-canadiens.html
- `canadas-history` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-history.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/histoire-canada.html
- `modern-canada` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/modern-canada.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/canada-moderne.html
- `how-canadians-govern-themselves` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/how-canadians-govern-themselves.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/canadiens-systeme-gouvernement.html
- `federal-elections` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/federal-elections.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/elections-federales.html
- `justice-system` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/justice-system.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/systeme-justice.html
- `canadian-symbols` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadian-symbols.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/symboles-canadiens.html
- `canadas-regions` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-regions.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/regions-canada.html
