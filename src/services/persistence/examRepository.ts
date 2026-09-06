import type { Question } from "../../types";
import { STORAGE_KEYS } from "./storageKeys";
import { readJson, writeJson, removeKey } from "./genericStorage";

/**
 * Snapshot of an in-progress simulated exam, persisted so quitting the
 * app (not just navigating away within it) and coming back resumes at
 * the same question with the same answers and the same timer state -
 * see docs/theme-navigation-responsive-overhaul.md for the bug this
 * fixes. Only ever written while `status === "in-progress"`; an idle or
 * already-submitted exam has nothing worth resuming, so those states
 * clear this key instead of writing it (see useExamStore.ts).
 */
export type PersistedExamSession = {
  schemaVersion: 1;
  questions: Question[];
  answers: Record<string, number>;
  optionOrder: Record<string, number[]>;
  currentIndex: number;
  // Optional: sessions persisted before this field existed won't have it
  // on disk even though this app always writes it now -
  // useExamStore.hydrate() falls back to {} if absent, so an older cached
  // session still loads instead of being treated as corrupt.
  markedForReview?: Record<string, boolean>;
  startTimeMs: number;
};

/**
 * Loads the persisted in-progress exam session, if any. Returns null if
 * nothing is stored, the schema version is incompatible, or the stored
 * blob is otherwise malformed - callers should treat that identically to
 * "no exam in progress" rather than throwing, since a corrupted or
 * outdated session is not worth trying to partially recover.
 */
export async function loadExamSession(): Promise<PersistedExamSession | null> {
  const stored = await readJson<PersistedExamSession>(STORAGE_KEYS.EXAM_SESSION);
  if (!stored || stored.schemaVersion !== 1) {
    return null;
  }
  return stored;
}

export async function saveExamSession(session: PersistedExamSession): Promise<void> {
  await writeJson(STORAGE_KEYS.EXAM_SESSION, session);
}

export async function clearExamSession(): Promise<void> {
  await removeKey(STORAGE_KEYS.EXAM_SESSION);
}
