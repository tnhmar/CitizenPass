import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_SETTINGS, loadSettings } from "../../src/services/persistence/settingsRepository";
import { DEFAULT_PROGRESS, loadProgress, saveProgress } from "../../src/services/persistence/progressRepository";
import { STORAGE_KEYS } from "../../src/services/persistence/storageKeys";
import { loadExamSession, saveExamSession, clearExamSession } from "../../src/services/persistence/examRepository";

describe("persistence defaults", () => {
  it("DEFAULT_SETTINGS has a valid schema version and safe fallback values", () => {
    expect(DEFAULT_SETTINGS.schemaVersion).toBe(1);
    expect(["en", "fr"]).toContain(DEFAULT_SETTINGS.language);
    expect(["light", "dark", "system"]).toContain(DEFAULT_SETTINGS.theme);
    expect(["classicRed", "oceanBlue", "twilightIndigo", "terracotta", "slateCharcoal", "plumMagenta"]).toContain(
      DEFAULT_SETTINGS.colorScheme
    );
    expect(DEFAULT_SETTINGS.hasSeenOnboarding).toBe(false);
  });

  it("a settings blob saved before onboarding existed still loads, with hasSeenOnboarding defaulting to false", async () => {
    const preOnboardingRecord = {
      schemaVersion: 1,
      language: "fr",
      theme: "dark",
      colorScheme: "oceanBlue",
      arabicHelpEnabled: true,
      // no hasSeenOnboarding field at all - this is what every settings
      // blob saved before this feature existed looks like.
    };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(preOnboardingRecord));

    const loaded = await loadSettings();
    expect(loaded.language).toBe("fr");
    expect(loaded.hasSeenOnboarding).toBe(false);

    await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
  });

  it("DEFAULT_PROGRESS starts empty with no bookmarks, history, or attempt log", () => {
    expect(DEFAULT_PROGRESS.schemaVersion).toBe(2);
    expect(DEFAULT_PROGRESS.bookmarkedQuestionIds).toHaveLength(0);
    expect(DEFAULT_PROGRESS.incorrectQuestionIds).toHaveLength(0);
    expect(DEFAULT_PROGRESS.examHistory).toHaveLength(0);
    expect(DEFAULT_PROGRESS.attemptLog).toHaveLength(0);
    expect(DEFAULT_PROGRESS.practiceStats.totalAttempts).toBe(0);
    expect(DEFAULT_PROGRESS.practiceStats.totalCorrect).toBe(0);
  });
});

describe("progress schema migration (v1 -> v2)", () => {
  afterEach(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS);
  });

  it("upgrades a pre-attempt-log (schemaVersion 1) record, keeping existing data and defaulting attemptLog to empty", async () => {
    const v1Record = {
      schemaVersion: 1,
      chapterProgress: { "justice-system": { completionPercent: 50 } },
      bookmarkedQuestionIds: ["q-1"],
      incorrectQuestionIds: ["q-2"],
      practiceStats: { totalAttempts: 10, totalCorrect: 7 },
      examHistory: [{ dateIso: "2026-01-01T00:00:00.000Z", score: 16, total: 20, passed: true }],
    };
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(v1Record));

    const loaded = await loadProgress();
    expect(loaded.schemaVersion).toBe(2);
    expect(loaded.chapterProgress).toEqual(v1Record.chapterProgress);
    expect(loaded.bookmarkedQuestionIds).toEqual(v1Record.bookmarkedQuestionIds);
    expect(loaded.incorrectQuestionIds).toEqual(v1Record.incorrectQuestionIds);
    expect(loaded.practiceStats).toEqual(v1Record.practiceStats);
    expect(loaded.examHistory).toEqual(v1Record.examHistory);
    expect(loaded.attemptLog).toEqual([]);
  });

  it("round-trips a schemaVersion 2 record (with an attempt log) unchanged", async () => {
    const progress = {
      ...DEFAULT_PROGRESS,
      attemptLog: [
        {
          dateIso: "2026-01-01T00:00:00.000Z",
          questionId: "q-1",
          chapterId: "justice-system",
          tags: ["courts"],
          correct: true,
          mode: "practice" as const,
        },
      ],
    };
    await saveProgress(progress);
    expect(await loadProgress()).toEqual(progress);
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
      markedForReview: { "q-1": true },
      startTimeMs: 1000,
    };
    await saveExamSession(session);
    expect(await loadExamSession()).toEqual(session);

    await clearExamSession();
    expect(await loadExamSession()).toBeNull();
  });
});
