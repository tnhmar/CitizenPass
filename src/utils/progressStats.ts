import type { AttemptLogEntry } from "../services/persistence/progressRepository";

export type AccuracyStat = {
  attempts: number;
  correct: number;
  accuracyPercent: number;
};

export type FocusArea = AccuracyStat & { tag: string };

/** Below this many attempts on a tag, its accuracy is excluded from
 *  focus areas - a single unlucky guess on a rarely-tested topic
 *  shouldn't outrank a genuinely weak, well-evidenced one. */
const MIN_FOCUS_AREA_ATTEMPTS = 3;
const FOCUS_AREA_LIMIT = 5;

function toStat(attempts: number, correct: number): AccuracyStat {
  return {
    attempts,
    correct,
    accuracyPercent: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
  };
}

/**
 * Accuracy per chapter, across both practice and exam attempts (the
 * attempt log doesn't distinguish the two here - see AttemptLogEntry).
 * A chapter with no attempts is simply absent from the result; callers
 * should treat a missing chapterId as "not attempted yet," not as 0%
 * accuracy, which would misrepresent a chapter the learner hasn't
 * touched at all.
 */
export function computeChapterAccuracy(attemptLog: AttemptLogEntry[]): Record<string, AccuracyStat> {
  const totals: Record<string, { attempts: number; correct: number }> = {};
  for (const entry of attemptLog) {
    const bucket = totals[entry.chapterId] ?? { attempts: 0, correct: 0 };
    bucket.attempts += 1;
    if (entry.correct) bucket.correct += 1;
    totals[entry.chapterId] = bucket;
  }
  const result: Record<string, AccuracyStat> = {};
  for (const [chapterId, { attempts, correct }] of Object.entries(totals)) {
    result[chapterId] = toStat(attempts, correct);
  }
  return result;
}

/**
 * Accuracy per tag. A question usually carries more than one tag, so a
 * single attempt counts toward every tag on that question - totals
 * across all tags will not add up to the total attempt count, which is
 * expected (one answer speaks to more than one topic).
 */
export function computeTagAccuracy(attemptLog: AttemptLogEntry[]): Record<string, AccuracyStat> {
  const totals: Record<string, { attempts: number; correct: number }> = {};
  for (const entry of attemptLog) {
    for (const tag of entry.tags) {
      const bucket = totals[tag] ?? { attempts: 0, correct: 0 };
      bucket.attempts += 1;
      if (entry.correct) bucket.correct += 1;
      totals[tag] = bucket;
    }
  }
  const result: Record<string, AccuracyStat> = {};
  for (const [tag, { attempts, correct }] of Object.entries(totals)) {
    result[tag] = toStat(attempts, correct);
  }
  return result;
}

/**
 * The weakest tags worth surfacing as "focus areas": lowest accuracy
 * first, ties broken toward more attempts (a low score backed by more
 * evidence is a more trustworthy weak spot than one from a couple of
 * guesses). Tags below `minAttempts` are excluded so a single unlucky
 * guess on a barely-tested tag can't top the list.
 */
export function getFocusAreas(
  attemptLog: AttemptLogEntry[],
  options: { minAttempts?: number; limit?: number } = {}
): FocusArea[] {
  const minAttempts = options.minAttempts ?? MIN_FOCUS_AREA_ATTEMPTS;
  const limit = options.limit ?? FOCUS_AREA_LIMIT;
  const tagAccuracy = computeTagAccuracy(attemptLog);
  return Object.entries(tagAccuracy)
    .filter(([, stat]) => stat.attempts >= minAttempts)
    .map(([tag, stat]) => ({ tag, ...stat }))
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent || b.attempts - a.attempts)
    .slice(0, limit);
}

/**
 * Local (device time zone) calendar-day key, e.g. "2026-09-19" -
 * streaks are about the learner's own daily rhythm, so this
 * deliberately uses local date parts, not UTC ones.
 */
function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Distinct local calendar days with at least one logged attempt. */
export function getActivityDateKeys(attemptLog: AttemptLogEntry[]): Set<string> {
  const keys = new Set<string>();
  for (const entry of attemptLog) {
    keys.add(toLocalDateKey(new Date(entry.dateIso)));
  }
  return keys;
}

/**
 * Consecutive days, ending today, with at least one attempt. A streak
 * survives a day that hasn't happened yet: if there's no activity yet
 * today but there was yesterday, this still counts up through
 * yesterday rather than reading as already broken - it only resets
 * once a full day passes with no activity at all. `today` is
 * injectable for testing; real callers can omit it.
 */
export function computeCurrentStreak(attemptLog: AttemptLogEntry[], today: Date = new Date()): number {
  const activityDays = getActivityDateKeys(attemptLog);
  if (activityDays.size === 0) return 0;

  const cursor = new Date(today);
  if (!activityDays.has(toLocalDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (activityDays.has(toLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Whether each of the last `days` calendar days had any activity,
 * oldest first, ending today - backs the small activity-dots row next
 * to the streak count.
 */
export function getRecentActivity(attemptLog: AttemptLogEntry[], days = 7, today: Date = new Date()): boolean[] {
  const activityDays = getActivityDateKeys(attemptLog);
  const result: boolean[] = [];
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    result.push(activityDays.has(toLocalDateKey(cursor)));
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

/**
 * Turns a tag id ("aboriginal-peoples") into a display label
 * ("Aboriginal Peoples"). Tag ids are short internal English
 * identifiers (see the question bank's `tags` field), not localized
 * content, so this is the same in both app languages for now - giving
 * every tag a real per-language label is a separate, larger content
 * task (151 tags at last count) left for a future pass.
 */
export function humanizeTag(tag: string): string {
  return tag
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
