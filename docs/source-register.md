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

Question counts are intentionally not fixed per chapter — see `docs/content-governance.md`, "Question count policy" (critical section). `modern-canada` and `canadas-history` have more testable, distinct facts than the shorter `rights-responsibilities` and `who-we-are` chapters, so they received more verified questions.

Notes:
- Chapter content and question citations for `rights-responsibilities`, `who-we-are`, `canadas-history`, and `modern-canada` were sourced from the official `canada.ca` online HTML guides (English and French), not the attached PDF, because the attached PDF's body-text layer extracted as garbled/unreadable characters. Diagram labels and the Oath of Citizenship extracted correctly from the PDF and were cross-checked where relevant.
- Printed/PDF page numbers are not recorded for these chapters' citations because they could not be reliably verified against the unreadable PDF text layer.
- Edition identifier `Ci1-11/2021E-PDF, ISBN 978-0-660-39273-8` was confirmed against the attached PDF's colophon text (page 2), which extracted correctly.
- `who-we-are` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/who-are-canadians.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/qui-sont-canadiens.html
- `canadas-history` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-history.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/histoire-canada.html
- `modern-canada` source pages: English — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/modern-canada.html ; French — https://www.canada.ca/fr/immigration-refugies-citoyennete/organisation/publications-guides/decouvrir-canada/lisez-ligne/canada-moderne.html
