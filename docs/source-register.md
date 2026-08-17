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

Notes:
- Chapter content and question citations for `rights-responsibilities` were sourced from the official `canada.ca` online HTML guides (English and French), not the attached PDF, because the attached PDF's body-text layer extracted as garbled/unreadable characters (likely a font-encoding issue in that scan). Diagram labels and the Oath of Citizenship extracted correctly from the PDF and were cross-checked where relevant.
- Printed/PDF page numbers are not recorded for this chapter's citations because they could not be reliably verified against the unreadable PDF text layer. If a clean-text PDF becomes available, backfill `printedPage`/`pdfPage` fields and update `verifiedAt`.
- Edition identifier `Ci1-11/2021E-PDF, ISBN 978-0-660-39273-8` was confirmed against the attached PDF's colophon text (page 2), which extracted correctly.
