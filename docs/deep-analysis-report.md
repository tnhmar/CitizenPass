# CitizenPass — Deep Analysis Report

**Scope:** question-set validation, scaling strategy, UI flow, exam navigation, app icon, statistics.
**Method:** Every factual claim below was checked against the live official guide pages at
canada.ca (both English and French), fetched directly during this analysis, plus the official
English PDF. Per IRCC's own published guidance, the online HTML edition is updated *before* the
PDF, so where the two disagree, this report treats the HTML as authoritative and says so
explicitly. Current-officeholder facts (Prime Minister, Governor General) were independently
verified via web search dated September 2026, for the one section where that distinction matters
(§1.4).

This is an analysis document only. Nothing in the codebase has been changed. Section 7 lists the
specific decisions that need your answer before any implementation starts.

---

## 1. Question-set validation

### 1.1 What's actually in the data

CitizenPass already has a serious sourcing infrastructure — better than most projects this size.
Every question record carries a `source` object (guide, edition, chapter, section, exact excerpt,
source URL, `verifiedAt` date, `reviewStatus`), there's a `docs/source-register.md` and
`docs/content-governance.md` defining the sourcing methodology, and an automated test
(`tests/services/questionBankGovernance.test.ts`) enforces: unique IDs, matching bilingual option
counts, valid correct-answer indexes, official-format compliance (exactly 4 MC options or exactly
`True/False`), a non-empty verified citation on every question in both languages, correct
`variantOf` linkage, and zero exact-duplicate question text. This is already a strong foundation;
the rest of this section is about what's *on top of* that foundation, not a replacement for it.

Current totals:

| Chapter | Questions | Distinct base facts | Avg. variants/fact |
|---|---:|---:|---:|
| `canadas-history` | 55 | 14 | 3.93x |
| `canadas-regions` | 62 | 18 | 3.44x |
| `canadian-symbols` | 57 | 16 | 3.56x |
| `federal-elections` | 40 | 10 | 4.00x |
| `how-canadians-govern-themselves` | 47 | 12 | 3.92x |
| `justice-system` | 25 | 6 | 4.17x |
| `modern-canada` | 59 | 15 | 3.93x |
| `rights-responsibilities` | 34 | 8 | 4.25x |
| `who-we-are` | 32 | 8 | 4.00x |
| **Total** | **411** | **107** | **3.84x** |

### 1.2 Documentation gap found (not a data-quality problem)

`docs/source-register.md`'s release-log table lists only 107 questions (matching the **base
facts** exactly), while the data files contain 411. This looks alarming at first — like 304
questions were added without going through review — but it isn't: every one of the 411 carries
`reviewStatus: "verified"` and the same `verifiedAt: "2026-08-17"` date, and the register's own
"Question count policy" section explains why (variants inherit their base fact's citation rather
than getting a new one). The register's table simply never added a column for variant counts.
**This is a five-minute documentation fix** (add a "variants" column, or a note explaining the
107 vs. 411 distinction), not a re-verification task.

### 1.3 Content-accuracy spot check

I checked every `canadas-history`, `federal-elections`, and `canadas-regions` question's excerpt
and correct answer against the actual guide text I fetched (all three chapters checked in full —
157 of 411 questions), plus targeted checks across the other six chapters. **Zero factual errors
found.** Every excerpt I checked is a genuine, accurate quote from the real guide (not a
paraphrase presented as a quote, not fabricated), and every `correctIndex` matches what the guide
actually says. I also fetched the live French guide chapter for "How Canadians Govern Themselves"
and confirmed the stored French excerpts are exact quotes from the *official French guide* —
not machine translations of the English excerpts, which is exactly what
`docs/content-governance.md` requires ("Do not cite a French excerpt that was machine-translated
from the English guide").

### 1.4 Dynamic-fact risk: checked, and already well-handled

This was my biggest concern going in, so I checked it exhaustively. The official guide itself is
frozen in a lot of places — updated in patches since 2012, not rewritten — and contains real,
verifiable staleness:

- The guide's own page was touched as recently as **2025-08-08** (per its "Page details" footer)
  and *still* says **"Canada is divided into 308 electoral districts."** The real number has been
  343 since the 2025 general election.
- The same page's fill-in-the-blank study section still says **"the Queen of Canada"** even
  though the guide's own body text elsewhere correctly uses the gender-neutral "Sovereign (Queen
  or King)."
- The Oath of Citizenship text in the guide names **"Queen Elizabeth the Second"** by name — Her
  Majesty died in 2022; the actual oath sworn today names King Charles III.
- Current real-world facts, verified independently for this report: the monarch is **King Charles
  III**; the Prime Minister is **Mark Carney**; the Governor General is **Louise Arbour** (installed
  June 8, 2026, the 31st GG, succeeding Mary Simon).

I checked **all 411 questions** for any of: current officeholder names, "currently represented"
party-standing language, riding-count numbers, and population figures. **Zero hits** that risk
going stale. `docs/content-governance.md`'s "Time-sensitive facts" rule (flag stale
officeholder/riding/party facts and exclude them from the verified pool) has clearly already been
applied — `docs/source-register.md` explicitly documents excluding the riding-count fact, the
"three parties" fact, and any current-monarch question from `canadian-symbols`, for exactly the
reasons above. **This is the right call and I'd recommend keeping this policy exactly as-is** —
see the one open question about it in §7.

### 1.5 Minor loose end

The source register lists a French PDF link
(`.../francais/pdf/pub/decouvrir.pdf`) that returned a broken-link page when I checked it just
now. Not urgent (the French content was correctly sourced from the live French HTML pages, not
the PDF, per the register's own notes) — but the register's citation should be corrected or
removed so it doesn't mislead someone later.

---

## 2. Scaling the question set without duplication

### 2.1 This is largely already built

`docs/content-governance.md` already defines exactly the mechanism you're asking about: an
optional `variantOf` field links an additional framing of a verified fact back to its base
`learningObjectiveId`, and the standard practice already applied is **3 variants per base fact**:

1. **v2 — reverse lookup** (e.g., base asks "what word means 'village'?", v2 asks "what does the
   word 'kanata' mean?")
2. **v3 — restated / negative-elimination** (a differently-worded direct question, or a "which of
   these is NOT..." elimination question)
3. **v4 — true/false** (the same fact as a True/False statement)

This is why `federal-elections` (40 questions / 10 facts = exactly 4.00x) and `who-we-are` (32/8 =
exactly 4.00x) come out so evenly, and why the register's "107 verified" and the data's "411
total" are both correct simultaneously.

### 2.2 Concrete, low-risk scaling opportunities

**A. Complete the under-varianted facts (fastest win, zero new fact-finding).** 20 base facts
currently have only 2 variants instead of 3 — they're each missing exactly one of the three
standard angles. Examples: `ch-cpr-last-spike` (canadas-history), `cr-canada-size-rank`,
`cr-five-regions`, `cr-nb-founded-loyalists` (canadas-regions), `cs-new-flag-1965`,
`cs-maple-leaf-symbol` (canadian-symbols), `gov-commonwealth-nations` (how-canadians-govern),
`mc-standard-time-zones-fleming` (modern-canada), and others. Bringing all 20 up to 3 variants
adds **~20 questions** using facts and citations that are already verified — no new research
needed, just filling in the missing angle for each.

**B. A genuine 4th angle already exists in embryonic form — worth formalizing.** Three facts
(`js-presumption-of-innocence`, `rr-sources-of-law`, `rr-magna-carta-year`) already have a 4th
multiple-choice variant beyond the standard three. Looking at what it actually tests
(`js-presumption-of-innocence-v4` asks *which domain* the principle applies to — criminal vs.
civil vs. immigration matters — rather than restating the principle itself), it's a distinct,
useful angle: **scope/applicability** ("does this apply here or not?"), as opposed to recall,
reverse-lookup, or true/false. I'd recommend formalizing this as an official 4th standard angle
in `docs/content-governance.md` and applying it to base facts where a genuine scope question makes
sense (not all of them will support one honestly — that's fine, per the existing "don't pad"
policy).

**C. A new angle not yet tried: matching/combination questions.** A question like "Which pair is
correctly matched?" with options combining two related facts (e.g., pairing provinces with their
correct capital, or events with their correct year, where three pairings are right and one
distractor swaps two correct facts against each other) tests *retention of multiple related
facts at once* rather than one fact in isolation — genuinely different from all four angles above,
and well-suited to the guide's many list-like sections (provincial capitals, national holidays,
Fathers of Confederation, Vice Cross recipients).

**D. New base facts — the guide supports meaningfully more than 107.** The guide is dense; 107
distinct facts is a reasonable first pass but leaves real material untouched. Concrete examples of
guide-supported facts I did **not** find as a base learning objective anywhere in the current 107:
Alexander Graham Bell and the telephone; Sir Sandford Fleming and standard time zones (this one
*is* covered — `mc-standard-time-zones-fleming` — but as a single fact with only 2 variants, see
2.2.A); James Naismith inventing basketball; the Order of Canada's founding in 1967; specific
Victoria Cross recipients (Filip Konowal, Billy Bishop, Paul Triquet); the GATT/WTO reference in
Canada's Economy; NAFTA's 1994 expansion to include Mexico; Terry Fox's Marathon of Hope; the
three branches of government (Executive/Legislative/Judicial) as their own explicit fact rather
than only implicit in the system-of-government diagram; the specific wording/history of "Peace,
Order and Good Government." Chapter-by-chapter, `justice-system` (6 base facts) and
`canadas-economy` (**this chapter currently has zero questions at all** — it's the "Canada's
Economy" chapter from the guide, and I did not find a `canadas-economy.json` in
`src/data/questions/` at all) look the most under-covered relative to how much guide content
exists.

### 2.3 One structural gap: `canadas-economy` has no question file

Worth flagging on its own: `src/data/content/` has no `canadas-economy.en/fr.json` files either
— the Economy chapter appears to have no study content *or* questions at all yet, even though it's
one of the guide's chapters and (per `docs/content-governance.md`'s own logic) should get however
many verified questions its content actually supports.

---

## 3. UI flow analysis

Reviewing the full flow (Home → Practice / Study / Simulated Exam / Progress / Settings /
Bookmarks) end to end:

**What's working well:** bilingual EN/FR throughout with a real (not machine-translated) French
content pipeline; an Arabic understanding-aid on practice questions; bookmarking with a dedicated
review screen; six WCAG-AA-verified color themes; full tablet/landscape/safe-area handling on
every screen; a citation shown after every answer (satisfying the governance doc's "Citation
display rule"); exam resume-after-restart correctness; and — since the last round — an exam flow
that matches the real IRCC test's actual documented behavior (non-pausing timer, ungated
navigation, answer-gated review-flagging, Grid/List navigator).

**Enhancement opportunities, roughly in priority order:**

1. **No "smart" practice mode.** `incorrectQuestionIds` is already tracked but nothing in the UI
   lets a user practice *only* their past-incorrect questions, or *only* a specific tag (question
   data already has a `tags` array per question — e.g., `government-structure`, `constitution` —
   that nothing in the UI currently uses at all). This is a natural, low-effort feature given data
   that already exists.
2. **No first-run guidance.** A brand-new user lands on Home with no orientation to the
   Study → Practice → Simulated Exam progression, or to what passing actually requires (20
   questions, 45 minutes, 15 correct). A one-time, dismissible intro would help, especially since
   this exact information is already shown *inside* the exam's idle screen — surfacing a
   condensed version earlier (Home, or first Settings visit) would help newcomers orient faster.
3. **No exam-readiness signal.** Given exam history and per-chapter practice accuracy both exist
   (or could, per §6), there's no "you're likely ready" / "focus more on X before testing"
   guidance tying the two together on the Progress screen.
4. **Bookmarks has no organization.** As bookmark count grows, a flat list becomes hard to
   navigate — grouping by chapter (data already has `chapterId`) would help.
5. **No search.** Study content and Practice have no text search; for someone re-checking a
   specific fact ("what year was the Quebec Act?") this means browsing chapter-by-chapter rather
   than searching directly.

None of these are urgent — the core flow is solid — but they're the natural next layer, and all
of them are enabled by data the app already collects.

---

## 4. Exam screen: review ⇄ question navigation

**Current behavior:** from any question, reaching the Grid/List navigator requires opening the
"⋮" overflow menu and tapping "Review Answers" (or, on the last question specifically, a dedicated
button). From the navigator, tapping any tile jumps straight back to that question — that
half of the round-trip is already one tap. The asymmetry you noticed is real: **leaving** the
question screen for the navigator takes two taps (menu, then item); **returning** from the
navigator takes one.

**Assessment: this is a real inconsistency worth fixing, not a matter of taste.** The Grid/List
navigator is a *core, frequently used* action during a 45-minute, 20-question exam — checking
your overall progress is something a test-taker does repeatedly, not rarely. By contrast,
Restart/New Exam/Exit are *rare, high-consequence* actions appropriate for an overflow menu. Right
now both are treated the same way (buried one tap deep), which under-serves the frequent action
to protect against a mistake that Restart/Exit already guard against with their own confirmation
dialogs.

**Recommendation:** promote the Grid/List navigator to its own always-visible icon in the header
(next to the timer badge, mirroring how the exit "✕" is already a dedicated icon rather than
menu-only) and leave Restart/New Exam/Exit in the "⋮" menu. This makes the round-trip symmetric —
one tap each way — matching the fact that reviewing progress is something a test-taker does
constantly and canceling the exam is something they do essentially never.

---

## 5. App icon

**Current design** (`assets/icon-source.svg`): a navy rounded-square background, a red
"passport-stamp" circle, a white maple-leaf silhouette *inside* that circle, and a separate white
circular badge with a green checkmark below it. Four distinct visual elements competing for
attention at icon size (which, on a phone home screen, renders at roughly 60×60dp — most of that
detail is illegible).

**Recommendation, matching "the most popular symbol of Canada, nothing else":** the guide itself
states this plainly — *"The maple leaf is Canada's best-known symbol"* — so the redesign is a
single, bold, solid maple leaf silhouette, full-bleed within the icon's safe area, nothing else
composited on top of it (no checkmark, no badge, no stamp circle, no separate background shape
competing with the leaf itself). Two concrete open decisions on exact color/background are in §7.

---

## 6. Statistics: what to capture and how to present it

### 6.1 What's captured today

Looking at `useProgressStore`/`progressRepository.ts`: a single **global** `{totalAttempts,
totalCorrect}` pair for all practice ever done; a flat `incorrectQuestionIds` list (in or out, no
count, no date, no history — a question you got wrong once then right is indistinguishable from
one you've never missed); per-chapter *study-content* completion percentage (has nothing to do
with quiz accuracy); and a raw list of exam attempts (date, score, pass/fail).

### 6.2 The gap

Every question already carries a `chapterId`, `tags[]`, and `difficulty` — **none of that
structure is used anywhere in the stats**. The result is a single number ("you've gotten 73% of
practice questions right, ever") with no way to answer the much more useful question, "right on
*what*, and am I actually ready?"

### 6.3 What I'd recommend capturing

- **Per-chapter accuracy** (correct/attempted per `chapterId`) — cheap, since `chapterId` is
  already on every question; this is the single highest-value addition and directly enables a
  "weak chapters" view.
- **Per-tag accuracy** — same mechanism, keyed by `tags[]` instead of chapter; surfaces
  cross-chapter weak *topics* (e.g., consistently missing "dates" questions regardless of chapter).
- **A timestamped attempt log**, even a lightweight one (`questionId`, `correct`, `dateIso`) rather
  than the current in/out set — this is what actually enables "have I improved," streaks, and
  "questions you keep missing" (distinct from "questions you've ever missed once").
- **Exam score trend**, not just a list — the data (`examHistory`) already supports this; it's a
  presentation gap, not a capture gap.

### 6.4 How to present it

- A **per-chapter accuracy breakdown** (simple horizontal bars or a table, one row per chapter,
  no new dependency needed) is the highest-value, lowest-effort addition.
- A **"focus areas" list** — the 3-5 tags/chapters with the lowest accuracy among chapters you've
  actually attempted (avoids penalizing untouched chapters) — turns raw numbers into an actual
  recommendation.
- An **exam score trend** (line or bar per attempt) needs a charting approach decision — see §7.
- A **practice streak / activity indicator** (needs the timestamped log from 6.3) is a common,
  low-effort motivational device (e.g., "days practiced this week") that doesn't need a chart at
  all — a row of filled/unfilled dots is enough, in keeping with the app's existing minimal style.

---

## 7. Decisions needed before implementation

I'm not assuming any of these — please tell me your preference for each.

**7.1 — Time-sensitive facts policy.** The existing policy (exclude riding-count, current-party-
standing, and current-monarch-name questions from the verified pool, per §1.4) is, in my
assessment, correct and should stay as-is: it keeps the app aligned with "the guide is the sole
source of truth" without teaching something that contradicts current reality. I'd recommend
formally confirming this in `docs/content-governance.md` rather than leaving it as an inference
from the register's notes. Confirm keeping this policy?

**7.2 — Scaling priority.** Four independent opportunities were identified in §2.2 (A: complete
20 under-varianted facts to 3x each; B: formalize a "scope/applicability" 4th angle; C: add a
"matching/combination" question type; D: new base facts, including the `canadas-economy` gap).
These don't have to happen together. Which should happen, and in what order?

**7.3 — Exam review-navigation.** Implement the §4 recommendation (a persistent, always-visible
Grid/List icon in the exam header, alongside the existing "⋮" menu) so leaving for the navigator
and returning from it are both one tap?

**7.4 — Icon color and background.** Two independent choices: (a) exact leaf color — Canada
flag red (`#FF0000`) for maximum symbol-accuracy, or CitizenPass's existing brand red (`#D80621`,
the "Classic Red" theme primary) for brand consistency; (b) background — plain white, transparent,
or a solid color fill (and if so, which).

**7.5 — Statistics: charts vs. no new dependency.** §6.4's per-chapter breakdown and focus-areas
list need no new library (plain bars/rows, consistent with the app's current minimal style). An
exam-score **trend chart** would need a charting approach — either add a charting library (e.g.
`react-native-svg`-based charting, a real new dependency) or represent the trend with something
simpler (a numeric list of past scores, sparkline-style text, or a simple bar row) that needs
nothing new. Which do you want?

