# Theme, Exam Navigation & Responsive Layout Overhaul

_This document accompanies the theme/exam-navigation/responsive PR. It covers four pieces of
work, done in the order requested: (1) theme & color audit, (2) the persistent-question-index
bug, (3) in-exam restart/exit/new-exam controls, (4) responsive/landscape support layered on
top of 1–3._

## 1. Theme & color audit

### What was actually wrong

The previous palette (`src/theme/tokens.ts` + `src/theme/paperThemes.ts`) built its light/dark
themes by spreading React Native Paper's MD3 base theme and overriding a handful of roles
(`primary`, `secondary`, `tertiary`, `error`, `errorContainer`). That left several roles on
Paper's own un-audited defaults, and — more importantly — it let one color get reused for two
unrelated meanings:

- **`OptionButton`** (`src/components/OptionButton.tsx`) defaulted its "outlined" (i.e.
  unanswered) text color to `theme.colors.primary` — brand red. Every option on every question,
  answered or not, started out in the same red used for "incorrect."
- **Exam mode** (`app/exam/index.tsx`) rendered the user's *current, ungraded* selection with
  `mode="contained"`, whose default background is also `theme.colors.primary`. So the one
  option you'd actually picked — before any grading happens, since the exam gives no feedback
  until submission — turned solid brand-red. In practice this looked exactly like a verdict of
  "wrong," on every single question, every time.
- **`app/bookmarks.tsx`** colored a ✅-prefixed "correct answer" line with `theme.colors.primary`
  — a green checkmark paired with red text.
- Dark mode overrode `error` to a lighter salmon (`#FF6B6B`) but never overrode `onError`, so the
  incorrect-answer button in dark mode paired that salmon background with Paper's own default
  dark-maroon `onError` — a combination nobody had checked for contrast.
- Several screens hard-coded raw hex values (`#1E8E5A`, `#C77F1A`, `#E5B94E`) instead of theme
  tokens, so they wouldn't track a theme change at all (see §1.4).

None of this was a simple "make the red darker" fix — the core problem was **using the brand
primary color as a stand-in for "no state yet,"** which collides with red's other job as the
error/incorrect color. The fix is structural: unanswered/neutral states now use plain on-surface
text, and a new **"selected" state** (secondary-tinted, not primary or error) exists specifically
for "you picked this, it hasn't been graded."

### 1.1 New palette structure (`src/theme/tokens.ts`)

Every color role this app actually uses is now defined explicitly, for light and dark, rather
than partially inherited from Paper's base theme:

- **Neutrals** (`background`, `surface`, `surfaceVariant`, `onSurface`, `onSurfaceVariant`,
  `outline`) and **semantic colors** (`error`/`success` families) are shared across every accent
  scheme, so "correct"/"incorrect" stay recognizable no matter which accent a user picks.
- **Accent** (`primary`, `secondary`, `tertiary` + their `on*`/`*Container` pairs) varies per
  color scheme — see §1.2.

Every text-on-background and icon-on-background pairing actually used in the app was checked
against WCAG AA (4.5:1 for normal text, 3:1 for large text/icons) with a small contrast-ratio
script (standard relative-luminance formula); all pairs pass, most comfortably (5:1–13:1). A
representative sample:

| Pairing                                      | Ratio | Threshold |
|-----------------------------------------------|------:|----------:|
| Light onError (`#FFFFFF`) / error (`#B3261E`) |  6.54 | 4.5       |
| Dark onError (`#601410`) / error (`#F2B8B5`)  |  7.66 | 4.5       |
| Light success text / white surface            |  5.35 | 4.5       |
| Classic Red onPrimary / primary (light)       |  6.90 | 4.5       |
| Ocean Blue onPrimary / primary (light)        |  7.10 | 4.5       |
| Twilight Indigo onPrimary / primary (light)   |  7.20 | 4.5       |
| Outline vs. surface (light, large/UI use)     |  4.30 | 3.0       |

### 1.2 Three selectable color schemes, one shared semantic language

- **Classic Red** (default) — the original Canada-red/navy/gold identity, re-tuned for contrast.
- **Ocean Blue** — deep blue / teal / amber.
- **Twilight Indigo** — indigo-violet / slate / amber.

None of the three uses green as an accent (green is reserved for "success," so a green *brand*
color would recreate the same kind of collision this whole audit exists to fix).

### 1.3 Component-level fixes

- **`OptionButton`** now takes `mode: "outlined" | "selected" | "contained"`:
  - `outlined` (not yet answered): neutral `onSurface` text, `outline`-colored border, no tint.
  - `selected` (**new**): the exam's "your current pick, ungraded" state — `secondaryContainer`
    background, `onSecondaryContainer` text. Never primary, never error.
  - `contained`: unchanged contract (explicit `containedColor`/`contentColor`), used by Practice
    mode's actual correct/incorrect reveal (`success`/`error`).
- **`app/exam/index.tsx`**: the selected-option render now uses `mode="selected"` instead of
  `mode="contained"`.
- **`app/bookmarks.tsx`**: the correct-answer line now uses the shared `success` color via
  `useSemanticColors()` instead of `theme.colors.primary`.
- **`app/(tabs)/practice.tsx`** needed **no changes** — it already passes explicit
  `containedColor`/`contentColor` for its graded states, so it inherits the neutral default for
  unanswered options automatically once `OptionButton` itself was fixed.

### 1.4 Hard-coded hex cleanup

`app/(tabs)/index.tsx`, `app/(tabs)/progress.tsx`, and `app/study/index.tsx` each had one or two
raw hex strings (a green checkmark, a gold trophy, an orange nav icon) that wouldn't have
followed a theme/color-scheme change at all. These now reference `theme.colors.tertiary` or the
shared `success` color instead. (`src/constants/chapterIcons.ts` was deliberately left alone —
those are per-chapter *decorative identity* colors, not semantic state, and are a separate
concern from this audit.)

### 1.5 Settings: color theme picker

`app/(tabs)/settings.tsx` gained a "Color theme" section between the existing Light/Dark/Auto
control and the Arabic-help toggle: three tappable swatches (Classic Red / Ocean Blue / Twilight
Indigo), each showing a checkmark when selected. The light/dark **mode** control and the color
**scheme** control are independent — `AppTheme` ("light"/"dark"/"system") and the new
`AppColorScheme` ("classicRed"/"oceanBlue"/"twilightIndigo") are separate persisted settings
(`src/services/persistence/settingsRepository.ts`), combined at render time in `app/_layout.tsx`
via `getPaperTheme(colorScheme, resolvedMode)`.

---

## 2. Exam screen — persistent question index

### Root cause

`app/exam/index.tsx` kept `currentIndex` in local component state
(`useState(0)`), while `answers`/`status` lived in the `useExamStore` Zustand store. The store is
a module-level singleton, so navigating away from `/exam` and back **remounted the component**
(resetting `currentIndex` back to `0`) while the store's `answers` survived untouched — exactly
the reported symptom: "answers are retained, question index is not."

### Fix

- `currentIndex` now lives in `useExamStore` itself, alongside `answers`, with a `setCurrentIndex`
  action (clamped to the question list) that both Previous/Next buttons call.
- The whole in-progress session (`questions`, `answers`, `optionOrder`, `currentIndex`,
  `startTimeMs`, `pausedMs`, `pausedAt`) is now also persisted to `AsyncStorage`
  (`src/services/persistence/examRepository.ts`), mirroring the existing settings/progress
  repository pattern. This closes the same bug one level further out: it now survives not just
  in-app navigation but **fully closing and reopening the app**, which the "ensure the exam state
  persists" wording asked for and the old code never attempted (there was no exam persistence at
  all — only settings and progress were saved to disk).
- `useExamStore.hydrate()` restores a persisted in-progress session on app boot, called
  alongside the existing settings/progress hydration in `app/_layout.tsx`.
- Only an `"in-progress"` session is ever persisted; `resetExam`/`submitExam` clear the stored
  session, since an idle or already-submitted exam has nothing worth resuming.

### Known limitation

Resuming correctly accounts for time spent backgrounded/closed **only when the OS had a chance
to fire a "background" event before the app was killed** (the normal case on iOS/Android — the
existing `AppState` listener already calls `pause()` on that transition, and the persisted
`pausedAt` makes the eventual `resume()` count all of that time as paused, not exam time). A
hard crash or force-kill that skips the backgrounding event entirely has no such timestamp to
recover from and will count the real elapsed time against the exam clock on relaunch. Handling
every possible OS-kill path was out of scope; this is called out here rather than silently
glossed over.

---

## 3. Exam screen — restart / exit / new exam controls

### Approach considered

A modal dialog, a set of always-visible buttons, and a compact overflow menu were the three
realistic options. Always-visible buttons would compete for space with the timer badge and
question counter in the header, especially once the responsive pass (§4) has to make that same
header work in a short landscape viewport. A modal is heavier than the action warrants for what
is fundamentally a 3-item picklist. This codebase already has a precedent for exactly this
pattern — `app/(tabs)/practice.tsx` uses a `Menu` anchored to an `IconButton` for its
chapter-filter control — so an overflow menu (`⋮` icon in the header, opening a `Menu` with three
`Menu.Item`s) was the most consistent and least disruptive choice, and matches the instruction to
proceed directly once a best approach is identified.

### The three actions, precisely

- **Restart Exam** — keeps the *same* drawn questions and shuffled option order, clears answers,
  resets the timer, returns to question 1. Confirmed via `Alert` (destructive: clears answers).
- **New Exam** — discards the current question set and draws a fresh one (reuses the existing
  `startExam()` action). Confirmed via `Alert`.
- **Exit Exam** — pauses the timer (same mechanism as backgrounding the app) and navigates home.
  Because the session is now persisted (§2), this is non-destructive and needs no confirmation:
  returning to `/exam` resumes exactly where it left off, with the clock picking back up from the
  same remaining time.

`useExamStore` gained one new action for this: `restartExam()` (same questions, fresh
answers/timer). `resetExam()` (already existed) and `startExam()` (already existed, reused as
"New Exam") covered the other two.

---

## 4. Responsive & landscape support

Applied last, on top of §1–3, to the screens those sections touched: Settings, both Exam screens,
and the shared `OptionButton` (which — being shared — also improves Practice for free).

- **`app.json`**: `orientation` changed from `"portrait"` to `"default"`, actually allowing
  landscape at the native level (this was the hard lock preventing rotation at all).
- **`src/hooks/useResponsive.ts`** (new): a single hook, built on React Native's own
  `useWindowDimensions` (so it re-renders automatically on rotation), exposing `isTablet`
  (shorter side ≥ 600dp — Android's own `sw600dp` convention), `isLandscape`, a `scale` factor
  (1 on phones, 1.15 on tablets) for text/touch-target sizing, and a `contentMaxWidth` (680dp) to
  cap line length on tablets and landscape phones instead of stretching content edge-to-edge.
- **Settings**: color-scheme swatches and section text scale with `scale`; content is centered
  and width-capped on tablet/landscape.
- **Exam (idle + in-progress) and Results**: same width-capping treatment; icons, badges,
  progress dots, and text scale with `scale`; the Previous/Next row tightens its vertical margin
  in phone-landscape, where height is scarce.
- **`OptionButton`**: touch target height and label font size scale with `scale`, so answer
  buttons grow appropriately on tablets without needing every call site to know about it.

Screens outside this set (Home, Practice, Study, Progress, Bookmarks) were intentionally left
alone for the responsive pass — the task scoped step 4 to "all the above changes (theme,
settings, exam screen)," and going further would be unrequested scope creep. Practice still
benefits indirectly through the shared `OptionButton`.
