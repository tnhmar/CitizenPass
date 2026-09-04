import { DEFAULT_SETTINGS } from "../../src/services/persistence/settingsRepository";
import { DEFAULT_PROGRESS } from "../../src/services/persistence/progressRepository";
import { loadExamSession, saveExamSession, clearExamSession } from "../../src/services/persistence/examRepository";

describe("persistence defaults", () => {
  it("DEFAULT_SETTINGS has a valid schema version and safe fallback values", () => {
    expect(DEFAULT_SETTINGS.schemaVersion).toBe(1);
    expect(["en", "fr"]).toContain(DEFAULT_SETTINGS.language);
    expect(["light", "dark", "system"]).toContain(DEFAULT_SETTINGS.theme);
    expect(["classicRed", "oceanBlue", "twilightIndigo", "terracotta", "slateCharcoal", "plumMagenta"]).toContain(
      DEFAULT_SETTINGS.colorScheme
    );
  });

  it("DEFAULT_PROGRESS starts empty with no bookmarks or history", () => {
    expect(DEFAULT_PROGRESS.schemaVersion).toBe(1);
    expect(DEFAULT_PROGRESS.bookmarkedQuestionIds).toHaveLength(0);
    expect(DEFAULT_PROGRESS.incorrectQuestionIds).toHaveLength(0);
    expect(DEFAULT_PROGRESS.examHistory).toHaveLength(0);
    expect(DEFAULT_PROGRESS.practiceStats.totalAttempts).toBe(0);
    expect(DEFAULT_PROGRESS.practiceStats.totalCorrect).toBe(0);
  });
});

describe("exam session persistence", () => {
  it("loadExamSession returns null when nothing has been saved", async () => {
    await clearExamSession();
    expect(await loadExamSession()).toBeNull();
  });

  it("round-trips a saved session and clearExamSession removes it", async () => {
    const session = {
      schemaVersion: 1 as const,
      questions: [],
      answers: { "q-1": 2 },
      optionOrder: { "q-1": [0, 1, 2, 3] },
      currentIndex: 3,
      startTimeMs: 1000,
      pausedMs: 0,
      pausedAt: null,
    };
    await saveExamSession(session);
    expect(await loadExamSession()).toEqual(session);

    await clearExamSession();
    expect(await loadExamSession()).toBeNull();
  });
});
