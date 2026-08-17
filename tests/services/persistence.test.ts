import { DEFAULT_SETTINGS } from "../../src/services/persistence/settingsRepository";
import { DEFAULT_PROGRESS } from "../../src/services/persistence/progressRepository";

describe("persistence defaults", () => {
  it("DEFAULT_SETTINGS has a valid schema version and safe fallback values", () => {
    expect(DEFAULT_SETTINGS.schemaVersion).toBe(1);
    expect(["en", "fr"]).toContain(DEFAULT_SETTINGS.language);
    expect(["light", "dark", "system"]).toContain(DEFAULT_SETTINGS.theme);
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
