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
- Official PDF: https://www.canada.ca/content/dam/ircc/migration/ircc/francais/pdf/pub/decouvrir.pdf
- Language: fr
- Access verified: 2026-08-17

## Usage notes

- Record `sourceEdition`, `sourceUrl`, `verifiedAt`, chapter, section, and excerpt for every question and study-content record.
- Save both `printedPage` and `pdfPage` when available, since pagination can differ between the printed guide and the PDF file.
- Re-verify this register if IRCC republishes an updated edition of either guide.
- Do not cite a French excerpt that was machine-translated from the English guide; French citations must come from the official French guide.

## Content release log

| Chapter ID | Guide chapter | Questions | Review status | Verified |
|---|---|---|---|---|
| `rights-responsibilities` | Rights and Responsibilities of Citizenship / Les droits et responsabilités liés à la citoyenneté | 8 | verified | 2026-08-17 |
| `who-we-are` | Who We Are / Qui sommes-nous, les Canadiens? | 8 | verified | 2026-08-17 |
| `canadas-history` | Canada's History / L'histoire du Canada | 14 | verified | 2026-08-17 |
| `modern-canada` | Modern Canada / Le Canada moderne | 15 | verified | 2026-08-17 |
| `how-canadians-govern-themselves` | How Canadians Govern Themselves / Les Canadiens et leur système de gouvernement | 12 | verified | 2026-08-17 |
| `federal-elections` | Federal Elections / Les élections fédérales | 10 | verified | 2026-08-17 |
| `justice-system` | The Justice System / Le système de justice | 6 | verified | 2026-08-17 |

Question counts are intentionally not fixed per chapter — see `docs/content-governance.md`, "Question count policy" (critical section). `justice-system` is a short chapter with fewer distinct testable facts, so it correctly received fewer verified questions than the longer chapters.

## Time-sensitive facts excluded from `federal-elections`

Per `docs/content-governance.md`, "Time-sensitive facts," the following facts appear in the live guide page but were deliberately **excluded** from the verified question bank because they are numeric/compositional facts that change over time and the guide's own page has not been kept current:

- **"Canada is divided into 308 electoral districts."** Canada has had 338 federal electoral districts since the 2015 general election (following the 2012 redistribution). The guide's page (fetched 2026-08-17) still says 308, which is outdated.
- **"There are three major political parties currently represented in the House of Commons."** Party standings change with every election.

Notes:
- Chapter content and question citations for all seven chapters were sourced from the official `canada.ca` online HTML guides (English and French), not the attached PDF, because the attached PDF's body-text layer extracted as garbled/unreadable characters. Diagram labels and the Oath of Citizenship extracted correctly from the PDF and were cross-checked where relevant.
- Printed/PDF page numbers are not recorded for these chapters' citations because they could not be reliably verified against the unreadable PDF text layer.
- Edition identifier `Ci1-11/2021E-PDF, ISBN 978-0-660-39273-8` was confirmed against the attached PDF's colophon text (page 2), which extracted correctly.
- `who-we-are` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/who-are-canadians.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/qui-sont-canadiens.html
- `canadas-history` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-history.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/histoire-canada.html
- `modern-canada` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/modern-canada.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/canada-moderne.html
- `how-canadians-govern-themselves` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/how-canadians-govern-themselves.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/canadiens-systeme-gouvernement.html
- `federal-elections` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/federal-elections.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/elections-federales.html
- `justice-system` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/justice-system.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/systeme-justice.html
