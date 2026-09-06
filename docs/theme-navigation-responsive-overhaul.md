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

---

## 5. Follow-up fixes (post-QA round)

Seven issues surfaced from actually running the app; each is a distinct root cause, not a
re-litigation of §1–4 above.

### 5.1 Home screen title had no top margin

Every screen renders its own content with no header (`headerShown: false` throughout, see
`app/(tabs)/_layout.tsx`), and `react-native-safe-area-context` was already a dependency but was
never actually wired up anywhere in the app — every screen's content started flush at `y = 0`,
under the status bar/notch/Dynamic Island on real devices. Fixed by wrapping the app in
`SafeAreaProvider` (`app/_layout.tsx`) and having each screen add `useSafeAreaInsets().top` to its
own top padding. Applied to Home and Settings (as asked) and, for consistency, to all three exam
screens (idle, in-progress, review, and results), since those were already being touched this
branch and leaving them still flush-at-top would have been an inconsistent partial fix. Practice,
Study, Progress, and Bookmarks were left alone, matching the same scope discipline as §4.

### 5.2 App defaulted to French instead of English

Root cause, in `src/i18n/index.ts`: the i18next instance's *initial* boot language was derived
from the device's OS locale (`expo-localization`), independently of `DEFAULT_SETTINGS.language`
("en") in `settingsRepository.ts`. A device/simulator set to French booted the app in French every
time — the two "defaults" simply disagreed with each other. Fixed by removing the device-locale
detection entirely; `"en"` is now the one hardcoded initial value, matching `DEFAULT_SETTINGS`.
French is unaffected as a user choice — picking it in Settings still persists and is honored on
every future launch via `useSettingsStore.hydrate()`.

### 5.3 Only three color themes

Not a bug, but a fair ask for more variety. Added three more WCAG-AA-verified schemes to
`src/theme/tokens.ts` (contrast-checked the same way as the original three — see §1.1): **Terracotta**
(burnt orange / deep plum), **Slate Charcoal** (cool blue-grey / muted slate), and **Plum Magenta**
(deep magenta / muted indigo-grey) — six total. None of the three uses green (reserved for
"success") and Slate Charcoal's secondary was deliberately kept grey-purple rather than
grey-green, for the same reason as §1: a scheme's `secondaryContainer`-tinted "selected" state
(see `OptionButton`) must never accidentally read as an implicit "correct."

### 5.4 Arabic-help description overflowed its card

Same root cause as an RN/Yoga gotcha found again in §5.5 below: a `Text` with `flex: 1` sitting
next to a fixed-size sibling (the `Switch`) can overflow instead of wrapping unless it also has
`flexShrink: 1` and `minWidth: 0`. Fixed the style in `app/(tabs)/settings.tsx`, and — as asked —
shortened the copy itself in both `en.json`/`fr.json` (three sentences down to one, keeping the
"for understanding only, not available in the exam" meaning).

### 5.5 Practice screen: long option text got cut off

Exact same layout bug as §5.4, in the shared `OptionButton` component. It only showed up once an
option had a leading icon (Practice mode's correct/incorrect reveal adds one; an unanswered
option has no icon and no sibling to compete with, so it happened to wrap fine on its own).
Fixed by adding `flexShrink: 1, minWidth: 0` to the label style in `src/components/OptionButton.tsx`
— this fixes it for Practice and Exam alike, since both share the component.

### 5.6 Exiting the exam and coming back reset the timer instead of continuing

The explicit "Exit Exam" action (✕ button / menu item) already correctly paused the clock before
navigating away. The gap was every *other* way of leaving the screen — the OS back gesture,
Android's hardware back button, or any other unmount not funneled through that one handler — none
of which called `pause()`, so the clock kept running unseen in the background. Fixed by adding
`src/hooks/useExamSessionLifecycle.ts`: a mount/unmount effect (not tied to any specific button)
that resumes on mount and pauses on unmount whenever the exam is in progress. Moving between the
question screen and the new review screen (§5.7) unmounts one and mounts the other in the same
tick, so that pause+resume pair nets out to ~0ms — the clock keeps running while the user stays
anywhere in the exam flow, and only actually stops when they leave the flow entirely, by whatever
means. This is layered on top of (not a replacement for) the existing `AppState`-based pause/resume
in each screen, which handles the separate case of the OS backgrounding the app while a screen
stays mounted (e.g. a phone call).

Also made the always-visible "cancel the exam" affordance more discoverable per the earlier
report: a dedicated "✕" `IconButton` now sits directly in the exam header (`app/exam/index.tsx`),
in addition to "Exit Exam" staying in the "⋮" options menu.

### 5.7 No way to review/change answers before submitting

`app/exam/index.tsx` intentionally still allows moving past a question without answering it (like
the real exam this simulates) — that's not the bug; the missing safety net for it was. Added a new
screen, `app/exam/review.tsx`: every question, answered or not, in one tappable list; tapping any
row jumps back to that exact question (`setCurrentIndex` + `router.back()`); a single confirmed
"Submit Exam" at the bottom (with a stronger warning if questions are still unanswered). Reached
either from the last question's new "Review & Submit" button, or from "Review Answers" in the
options menu at any point during the exam. The countdown and the actual submit logic were
extracted into shared hooks (`useExamCountdown`, `useFinishExam`) so the question screen and the
review screen share one definition of each rather than two copies that could drift — notably,
timing out still auto-submits immediately from either screen (no review step on timeout), since
letting review always be reachable would make the 45-minute limit meaningless.

---

## 6. Second follow-up round (screenshots from a live test pass)

Seven more issues, found by actually running the app on a device. Two of these change how the
exam flow behaves rather than just fixing a rendering bug, so they're called out as design
decisions, not just patches.

### 6.1 Practice: chapter names truncated in the picker

Paper's `Menu.Item` renders its `title` on a single line with an ellipsis, no way around it via
props. Replaced the chapter list in `app/(tabs)/practice.tsx` with plain `TouchableRipple` rows
(the same primitive `OptionButton` is built on) instead of `Menu.Item` - full control, no line
limit, wraps to as many lines as a chapter name needs. `Menu` itself doesn't require `Menu.Item`
children; any content works.

### 6.2 Practice: question icon sat above the question text instead of beside it

`Card.Content`'s default flex direction is column, so the icon and the question `Text` stacked
vertically with nothing telling them to sit in a row. Changed `questionContent` to
`flexDirection: "row"` with the icon nudged down 3px to align with the text's first line rather
than its very top.

### 6.3 Exam: "Next" was enabled with no answer selected - added Mark for Review

Not a rendering bug - Next intentionally allows skipping a question (see §5.7), which is realistic
exam behavior, but it had no gate at all, so tapping through all 20 questions without ever
answering was silently possible. The fix isn't to block skipping - that would undo the whole point
of the review screen - it's to require a *deliberate* choice before moving on: Next is now disabled
unless the current question is either answered or explicitly flagged "Mark for Review" (new flag
icon between Previous and Next in `app/exam/index.tsx`, `toggleMarkedForReview` in
`useExamStore.ts`). An inline hint explains why Next is disabled when it is. The review screen
(`app/exam/review.tsx`) now surfaces marked questions too, alongside answered/unanswered, so
"I'm not sure about this one, I'll flag it and decide later" has an actual place to land. The
progress dots gained a second, independent visual channel for this: fill still reflects
answered/unanswered, while the border color turns tertiary specifically for a marked question, so
a dot can show "answered but marked" and "unanswered and marked" as distinct states. Reaching the
review list from the last question's button is deliberately *not* gated the same way - that list
exists specifically to resolve stragglers, so it has to stay reachable regardless of the last
question's own state.

### 6.4 Settings: Arabic-help description still crowded its card border

The §5.4 fix (flexShrink/minWidth) addressed the text overflowing *past* the card, but the
fixed-width `Switch` sitting in the same row still visually crowded the left/right edges on some
screens. Removed the row entirely: the description now sits on its own full-width line, with the
`Switch` on a second line below, right-aligned. No sibling means no competition for width, which
is a stronger guarantee than tuning flex properties on a shared row.

### 6.5 Exam: added a 5-minutes-remaining notification

The countdown badge already turned red under 5 minutes, but that's passive - easy to miss if the
user isn't looking at the header. Added `src/hooks/useLowTimeWarning.ts`: fires a one-time
`Alert` the instant the countdown first crosses the threshold. The "already warned" flag
(`lowTimeWarningShown`) lives in the store, not in the hook's local state, specifically so it
doesn't re-fire when navigating between the question screen and the review screen, or after
exiting and coming back - only a fresh `startExam`/`restartExam` resets it.

### 6.6 Revisited: "exit exam, come back later" and the timer

Re-verified the §5.6 fix (`useExamSessionLifecycle`) end to end: added a fake-timer test that
starts an exam, runs it 2 minutes in, pauses, advances the clock a full hour while paused, resumes,
runs 1 more active minute, and asserts only those 3 active minutes counted against the 45-minute
limit - see `pause/resume timer math` in `tests/services/examStore.test.ts`. That test passes
against the current pause/resume/getRemainingMs logic, which hasn't changed since §5.6. If this is
still visibly wrong after this update, the most useful next report would be the *exact* sequence
used to "exit" (the ✕ button, the menu's "Exit Exam", the OS back gesture, or the home button) and
roughly how long the app was left closed for, since those exercise different code paths
(`handleExitExam` vs. the unmount cleanup in `useExamSessionLifecycle` vs. the `AppState` listener)
and narrowing which one is involved would make the next fix precise instead of another broad pass.

### 6.7 (Not a bug) Confirmed working: long option text wraps in Practice

The screenshots showed multi-clause options wrapping correctly across two lines - confirms the
`OptionButton` label fix in §5.5 is doing its job for Practice as well as Exam.

---

## 7. IRCC-parity refactor: matching the real exam interface

The exam flow up to this point had accumulated several rounds of incremental fixes (§2, §3, §5.6,
§5.7, §6.3, §6.5, §6.6), but the underlying design was never checked against what the actual,
official test looks and behaves like. This section replaces several of those earlier decisions
outright, based on direct research into canada.ca's own published description of their test
interface, followed by an approval step before any code changed.

### Research: what canada.ca actually documents

Per "Online citizenship test: the test page" (canada.ca), the real IRCC computer-based test:

- Runs a 45-minute timer that **cannot be paused once started**, for any reason.
- Shows a persistent **red "Time is almost up"** label above the timer once under 5 minutes remain
  - not a popup.
- Auto-saves and auto-submits the instant the timer hits zero, with a dedicated "you've run out of
  time" screen.
- Uses plain "Previous question" / "Next question" buttons with **no gating** - skipping a question
  is normal, expected behavior.
- Offers an "I want to review this answer later" checkbox that is **only selectable after an
  answer has been chosen** - you can flag "I answered this but I'm not sure," not "I'm skipping
  this and flagging it."
- Provides question-level navigation via a **Grid view** (20 numbered tiles, tap to jump) with live
  counts underneath - "To be reviewed" / "Not answered" / "Answered" - and an alternate **List
  view** toggle that groups the same 20 questions under four headers: Current question / To be
  reviewed / Not answered / Answered. Neither view shows question text or chosen answers - it's
  status-only navigation.
- Submission is a "Confirm submission" action.

### Decisions approved before implementation

Presented as a requirements document first, per the request; three of four questions came back
"match the official test exactly" (never pause; replace the review list with Grid/List), and
in-exam language switching was declined (stays Settings-only). The fourth (Next-button gating) had
no explicit answer, so it defaulted to matching official behavior too, consistent with the other
three decisions, rather than assuming the opposite.

### What changed

**Timer (`src/store/useExamStore.ts`, `src/hooks/useExamCountdown.ts`)** - `pausedMs`/`pausedAt`
and the `pause()`/`resume()` actions from §2/§5.6/§6.6 are gone entirely, not just unused:
`getRemainingMs` is now a pure `duration - (now - startTime)` calculation with no paused-time
bookkeeping to get wrong. `src/hooks/useExamSessionLifecycle.ts` (the mount/unmount pause hook from
§5.6) and the `AppState` background/foreground listener are both deleted - there is nothing left
for either to do. Exiting the exam (✕ button or the options menu) now shows a confirmation
explicitly warning "your timer will keep running even after you leave this screen," so the change
in behavior is never a silent surprise.

**5-minute warning (`app/exam/index.tsx`, `app/exam/review.tsx`)** - The one-time popup `Alert` from
§6.5 (and its `lowTimeWarningShown` store flag, `src/hooks/useLowTimeWarning.ts`) is retired.
Since a persistent banner is naturally derived from "is remaining time under the threshold right
now" with no one-time-fire logic needed, this is simpler than what it replaces, not just
different: a `{isLowTime && <Text>...}` line above the timer badge, matching the official wording
and placement exactly.

**Mark for Review (`useExamStore.toggleMarkedForReview`)** - Now a no-op unless the question
already has an answer, matching the official checkbox's own rule precisely. The flag button in
`app/exam/index.tsx` reflects this via its own `disabled={!hasAnswered}`.

**Next button (`app/exam/index.tsx`)** - The answered-or-marked gating added in §6.3 is removed.
Next is unconditionally enabled, matching the official test's own lack of any such restriction -
skipping and returning later (via Previous or the navigator) is normal.

**No persistent progress indicator on the question screen** - The progress-dots row is gone.
Progress/status live exclusively in the navigator now, matching the official design, where the
per-question screen shows no running tally at all.

**Grid/List navigator (`app/exam/review.tsx`, full rewrite)** - Replaces the full-detail review
list from §5.7 (question text + chosen answer, tap to jump) with the lighter, official-matching
model: a **Grid view** of 20 numbered tiles (color/border-coded: grey outline = not answered, blue
= answered, blue fill with a tertiary border and a small flag icon = to be reviewed, thicker
primary border = current question) and a **List view** toggle that groups the same 20 questions
under four headers - Current question / To be reviewed / Not answered / Answered - each just a
tappable number, no question text. A live three-part count ("To be reviewed: X · Not answered: Y ·
Answered: Z", always summing to 20) sits above both views. The footer button is now labeled
"Confirm submission," matching official wording, in place of "Submit Exam."

**Deliberately unchanged**: `currentIndex` living in the store and persisting across app
restarts (§2) - that fix's value has nothing to do with pausing and stays exactly as it was; the
restart/new-exam/exit options menu (§3); and the answer-locking-in-place behavior (once submitted,
answers can't change).



