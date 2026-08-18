# UI Redesign Notes — Modern, Icon-Driven CitizenPass

_This document accompanies the `feature/modern-ui-redesign` branch/PR._

## 1. Analysis of the existing app (before this PR)

The app was functionally complete (Home, Study, Practice, Simulated Exam, Progress, Settings)
but visually minimal:

- **Home** (`app/(tabs)/index.tsx`): plain `NavCard` list (title + description, no icons/color),
  a stats card with text-only rows, no visual hierarchy beyond `Text` variants.
- **Navigation** (`app/(tabs)/_layout.tsx`): default Expo Router `Tabs` with text-only labels,
  no icons, default header bar shown on every screen.
- **Practice** (`app/(tabs)/practice.tsx`): functional MCQ flow with color-coded buttons after
  answering, but no icons, hard-coded English "Correct"/"Incorrect"/"Next question" strings
  (not localized despite the app being bilingual).
- **Progress** (`app/(tabs)/progress.tsx`): still the original scaffold placeholder — never
  wired up to the already-existing `useProgressStore` data (chapter completion, exam history,
  bookmarks, practice stats all tracked but never surfaced).
- **Settings** (`app/(tabs)/settings.tsx`): `RadioButton` rows for language/theme — usable but
  visually flat, no icons, no section separation beyond `Divider`.
- **Study** (`app/study/index.tsx`, `app/study/[chapterId].tsx`): plain `Card`/`Text` list,
  no chapter identity (every chapter looked the same).
- **Exam** (`app/exam/index.tsx`, `app/exam/results.tsx`): functional timer/scoring logic
  (kept 100% unchanged), but the UI had no progress indication beyond "Question X of Y" text,
  no icons, and a plain score card.
- Theme (`src/theme/paperThemes.ts`): a reasonable red/navy palette already existed but was
  used minimally — mostly default MD3 surfaces.

Existing solutions reviewed for inspiration (Duolingo, Google's own "Citizenship Test" style
apps, and Material Design 3 patterns): icon-led navigation cards, colored icon "avatars" per
category, segmented controls for binary/ternary settings, progress bars with rounded corners,
and emoji-accented headers for a friendlier, less bureaucratic feel appropriate for a study app.

## 2. What changed in this PR

- **Design tokens** (`src/theme/tokens.ts`) and an expanded **Paper theme**
  (`src/theme/paperThemes.ts`): richer light/dark palettes (Canada red, navy, gold accent,
  semantic success/error), `roundness: 16` for consistently rounded cards/buttons.
- **New shared components**: `NavCard` (icon avatar + emoji + chevron), `StatPill` (icon +
  value + label, used on Home and Progress), enhanced `SourceCitationCard` (book icon).
- **Chapter visual identity** (`src/constants/chapterIcons.ts`): maps each of the 9 chapters to
  an icon, emoji, and accent color, reused consistently on Home, Study, and Progress.
- **Tab navigation**: Material Community Icons for all four tabs (filled when active, outline
  when inactive), themed colors, default headers hidden in favor of per-screen emoji headers.
- **Home**: time-of-day greeting, hero progress card with three `StatPill`s, icon-led nav cards.
- **Practice**: bookmark + session counter in the header, lettered options (A–D), icon feedback
  banner, now-localized correct/incorrect/next-question strings.
- **Progress**: fully built out (previously a placeholder) — accuracy/answered/chapters/bookmarks
  stat grid, per-chapter progress bars with chapter icons, and an exam history list with
  pass/fail chips.
- **Settings**: `SegmentedButtons` for language and theme (icons instead of radio dots), icon
  section headers, disclaimer in an outlined info card.
- **Study**: chapter list and detail screens now show the chapter's icon/emoji/color, bulleted
  facts use a small icon marker instead of a plain "•".
- **Simulated Exam**: rules intro card with icons, a row of progress dots showing answered vs.
  unanswered vs. current question, a timer badge that turns red under 5 minutes, and an
  emoji-based results header (🎉 pass / 📚 not passed) with review-item status icons.
- **i18n**: `en.json`/`fr.json` expanded with every new UI string (including strings that were
  previously hard-coded in English only, e.g. Practice's "Correct"/"Incorrect").
- **Dependency**: added `@expo/vector-icons` (already bundled transitively via `expo`, now
  declared explicitly since screens import `MaterialCommunityIcons` directly).

No business logic, store shape, persistence, exam timer/scoring behavior, or question-bank
loading was changed — this PR is UI/presentation-layer only.

## 3. App icon

A production app icon requires binary PNG assets (`assets/icon.png`, `assets/adaptive-icon.png`,
`assets/splash.png`) referenced from `app.json`. This automated PR environment can only commit
UTF-8 text files through the GitHub API, so it cannot safely generate/commit binary image files
(any attempt would silently corrupt the PNG bytes).

Instead, this PR includes `assets/icon-source.svg` — a scalable concept for the app icon: a
navy rounded-square badge, a red passport-stamp circle, a white maple leaf, and a green
checkmark badge (studying → passing). To finish wiring up the real icon:

1. Rasterize `assets/icon-source.svg` to PNG, e.g.:
   ```bash
   npx sharp-cli -i assets/icon-source.svg -o assets/icon.png resize 1024 1024
   npx sharp-cli -i assets/icon-source.svg -o assets/adaptive-icon.png resize 1024 1024
   ```
   (or open it in any vector tool — Figma, Inkscape, etc. — and export at 1024×1024.)
2. Add to `app.json`:
   ```json
   "icon": "./assets/icon.png",
   "android": { "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#13284B" } }
   ```
3. Commit the generated PNGs alongside that `app.json` change.

## 4. Follow-ups intentionally left out of scope

- Full i18n coverage of every remaining hard-coded string in Exam screens beyond what was
  added here (kept scope to strings this PR's changes touch or that were clearly missing).
- Actual rasterized app icon files (see above).
- Dark-mode visual QA pass (theme values were extended but not visually verified on-device).
