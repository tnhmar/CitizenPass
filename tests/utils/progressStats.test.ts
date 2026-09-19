import {
  computeChapterAccuracy,
  computeTagAccuracy,
  getFocusAreas,
  humanizeTag,
  getActivityDateKeys,
  computeCurrentStreak,
  getRecentActivity,
} from "../../src/utils/progressStats";
import type { AttemptLogEntry } from "../../src/services/persistence/progressRepository";

function entry(overrides: Partial<AttemptLogEntry>): AttemptLogEntry {
  return {
    dateIso: "2026-01-01T00:00:00.000Z",
    questionId: "q-1",
    chapterId: "justice-system",
    tags: [],
    correct: true,
    mode: "practice",
    ...overrides,
  };
}

describe("computeChapterAccuracy", () => {
  it("returns an empty object for an empty log", () => {
    expect(computeChapterAccuracy([])).toEqual({});
  });

  it("aggregates attempts and correctness per chapter, across practice and exam entries", () => {
    const log: AttemptLogEntry[] = [
      entry({ chapterId: "justice-system", correct: true, mode: "practice" }),
      entry({ chapterId: "justice-system", correct: false, mode: "exam" }),
      entry({ chapterId: "justice-system", correct: true, mode: "exam" }),
      entry({ chapterId: "canadas-history", correct: false, mode: "practice" }),
    ];

    const result = computeChapterAccuracy(log);

    expect(result["justice-system"]).toEqual({ attempts: 3, correct: 2, accuracyPercent: 67 });
    expect(result["canadas-history"]).toEqual({ attempts: 1, correct: 0, accuracyPercent: 0 });
  });

  it("does not include a chapter that has no attempts at all", () => {
    const result = computeChapterAccuracy([entry({ chapterId: "justice-system" })]);
    expect(result["canadas-regions"]).toBeUndefined();
  });
});

describe("computeTagAccuracy", () => {
  it("credits every tag on a question, not just the first", () => {
    const log: AttemptLogEntry[] = [
      entry({ tags: ["charter", "rights"], correct: true }),
      entry({ tags: ["charter"], correct: false }),
    ];

    const result = computeTagAccuracy(log);

    expect(result.charter).toEqual({ attempts: 2, correct: 1, accuracyPercent: 50 });
    expect(result.rights).toEqual({ attempts: 1, correct: 1, accuracyPercent: 100 });
  });
});

describe("getFocusAreas", () => {
  it("excludes tags below the minimum attempt threshold", () => {
    const log: AttemptLogEntry[] = [
      entry({ tags: ["rare-tag"], correct: false }),
      entry({ tags: ["rare-tag"], correct: false }),
      // Only 2 attempts on "rare-tag" - below the default minimum of 3.
      entry({ tags: ["common-tag"], correct: false }),
      entry({ tags: ["common-tag"], correct: false }),
      entry({ tags: ["common-tag"], correct: true }),
    ];

    const focusAreas = getFocusAreas(log);

    expect(focusAreas.map((area) => area.tag)).toEqual(["common-tag"]);
  });

  it("sorts weakest first, breaking ties toward more attempts", () => {
    const log: AttemptLogEntry[] = [
      // "shaky" - 1/3 correct (33%)
      entry({ tags: ["shaky"], correct: true }),
      entry({ tags: ["shaky"], correct: false }),
      entry({ tags: ["shaky"], correct: false }),
      // "weak-small" - 0/3 correct (0%), fewer attempts
      entry({ tags: ["weak-small"], correct: false }),
      entry({ tags: ["weak-small"], correct: false }),
      entry({ tags: ["weak-small"], correct: false }),
      // "weak-big" - 0/4 correct (0%), more attempts - should rank above weak-small
      entry({ tags: ["weak-big"], correct: false }),
      entry({ tags: ["weak-big"], correct: false }),
      entry({ tags: ["weak-big"], correct: false }),
      entry({ tags: ["weak-big"], correct: false }),
    ];

    const focusAreas = getFocusAreas(log, { limit: 10 });

    expect(focusAreas.map((area) => area.tag)).toEqual(["weak-big", "weak-small", "shaky"]);
  });

  it("respects a custom limit and minAttempts", () => {
    const log: AttemptLogEntry[] = [
      entry({ tags: ["a"], correct: false }),
      entry({ tags: ["b"], correct: false }),
    ];

    expect(getFocusAreas(log, { minAttempts: 1, limit: 1 })).toHaveLength(1);
    expect(getFocusAreas(log, { minAttempts: 2 })).toHaveLength(0);
  });
});

describe("humanizeTag", () => {
  it("title-cases a hyphenated tag id", () => {
    expect(humanizeTag("aboriginal-peoples")).toBe("Aboriginal Peoples");
  });

  it("handles a single-word tag", () => {
    expect(humanizeTag("economy")).toBe("Economy");
  });

  it("handles tags with several hyphens", () => {
    expect(humanizeTag("second-world-war")).toBe("Second World War");
  });
});

// Fixed reference "today" so streak math is deterministic regardless of
// when the suite actually runs. Noon avoids any midnight/DST edge cases.
const TODAY = new Date(2026, 8, 19, 12, 0, 0); // Saturday, Sept 19, 2026
function isoOnDay(daysBeforeToday: number, hour = 9): string {
  const date = new Date(TODAY);
  date.setDate(date.getDate() - daysBeforeToday);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

describe("getActivityDateKeys", () => {
  it("collapses several attempts on the same day into one key", () => {
    const log: AttemptLogEntry[] = [
      entry({ dateIso: isoOnDay(0, 8) }),
      entry({ dateIso: isoOnDay(0, 20) }),
    ];
    expect(getActivityDateKeys(log).size).toBe(1);
  });

  it("produces a separate key for each distinct day", () => {
    const log: AttemptLogEntry[] = [entry({ dateIso: isoOnDay(0) }), entry({ dateIso: isoOnDay(1) })];
    expect(getActivityDateKeys(log).size).toBe(2);
  });
});

describe("computeCurrentStreak", () => {
  it("is 0 for an empty log", () => {
    expect(computeCurrentStreak([], TODAY)).toBe(0);
  });

  it("counts today alone as a 1-day streak", () => {
    const log: AttemptLogEntry[] = [entry({ dateIso: isoOnDay(0) })];
    expect(computeCurrentStreak(log, TODAY)).toBe(1);
  });

  it("still counts a streak that hasn't been continued yet today, as long as it ran through yesterday", () => {
    const log: AttemptLogEntry[] = [entry({ dateIso: isoOnDay(1) }), entry({ dateIso: isoOnDay(2) })];
    expect(computeCurrentStreak(log, TODAY)).toBe(2);
  });

  it("resets to 0 once a full day has passed with no activity", () => {
    const log: AttemptLogEntry[] = [entry({ dateIso: isoOnDay(2) }), entry({ dateIso: isoOnDay(3) })];
    expect(computeCurrentStreak(log, TODAY)).toBe(0);
  });

  it("counts a run of consecutive days ending today", () => {
    const log: AttemptLogEntry[] = [0, 1, 2, 3, 4].map((daysAgo) => entry({ dateIso: isoOnDay(daysAgo) }));
    expect(computeCurrentStreak(log, TODAY)).toBe(5);
  });

  it("stops counting at the first gap", () => {
    // Activity today, yesterday, and the day before - then a gap at 3
    // days ago, then more activity further back that shouldn't count.
    const log: AttemptLogEntry[] = [0, 1, 2, 4, 5].map((daysAgo) => entry({ dateIso: isoOnDay(daysAgo) }));
    expect(computeCurrentStreak(log, TODAY)).toBe(3);
  });
});

describe("getRecentActivity", () => {
  it("returns `days` entries, oldest first, ending today", () => {
    const log: AttemptLogEntry[] = [entry({ dateIso: isoOnDay(0) }), entry({ dateIso: isoOnDay(2) })];
    const activity = getRecentActivity(log, 7, TODAY);

    expect(activity).toHaveLength(7);
    expect(activity[6]).toBe(true); // today
    expect(activity[4]).toBe(true); // 2 days ago
    expect(activity[5]).toBe(false); // 1 day ago - no activity
    expect(activity[0]).toBe(false); // 6 days ago - no activity
  });
});
