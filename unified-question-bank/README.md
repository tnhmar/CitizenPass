# Unified Question Bank (v3 — merge strategy)

**Status:** exploratory branch content, not wired into the app.

## Strategy
Merges both prior question banks into one deduplicated set of **925 unique questions**. 23
confirmed duplicates were removed (9 exact-text, 14 verified same-fact rewordings, 1 internal
duplicate); 11 complementary true/false pairs and 2 coincidental-keyword-overlap pairs were kept
as genuinely distinct after manual verification against the official guide text.

## Schema
Each of the 12 files is one guide chapter:
`{ chapterId, chapterTitle, memoryBox: { en: { title, mnemonic, keyFactsChecklist } }, questionCount, questions }`.
IDs are new sequential `CIT-####` values with no reference to either source bank.

## Known state
- English: 925/925 complete.
- French: 438/925 (47%) — carried over from the source that already had verified French, plus one
  guide-grounded pilot (`CIT-0749`) added here to prove the sourcing method (matched against
  `decouvrir.pdf` full text, not machine-translated).
- Arabic: 438/925 (47%) — frozen at existing coverage, no new machine translation added.
- Review status: ~437 inherited questions are `verified`; the rest are `needs-review`.

## Known data-quality note
Several `pdfPage` citations point to pages that don't exist in the reference `discover.pdf`
(68 pages) — e.g. pages 90-92 cited for content that's really around page 42-43, likely from a
large-print source edition with different pagination. Full-text search (not page lookup) was
used to work around this for the French pilot; the same method is recommended for the remaining
French-sourcing work.

## To commit
1. On branch `Feature/V3`, replace the placeholder content currently in `unified-question-bank/`
   with these 12 chapter JSON files.
2. Add this README.md alongside them.
3. Keep `migration_ledger_v3.csv` out of the committed repo — it's for your own internal audit
   trail only (maps new `CIT-####` IDs back to each source bank's original IDs) and should not
   ship in the app bundle or a public branch, per the "zero legacy references" requirement.

## Not yet done
Full French sourcing (487 questions remaining); no app wiring (`questionLoader.ts`,
`manifest.json`, `src/types/index.ts` untouched); no automated tests for this bank.
