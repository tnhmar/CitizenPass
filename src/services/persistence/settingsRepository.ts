import type { AppLanguage, AppTheme } from "../../types";
import { STORAGE_KEYS } from "./storageKeys";
import { readJson, writeJson, removeKey } from "./genericStorage";

export type PersistedSettings = {
  schemaVersion: 1;
  language: AppLanguage;
  theme: AppTheme;
};

export const DEFAULT_SETTINGS: PersistedSettings = {
  schemaVersion: 1,
  language: "en",
  theme: "system",
};

/**
 * Loads persisted settings. If nothing is stored, or the stored shape is
 * from an incompatible future/older schema version, falls back to
 * defaults rather than throwing — settings are never a hard dependency
 * for the app to function offline.
 */
export async function loadSettings(): Promise<PersistedSettings> {
  const stored = await readJson<PersistedSettings>(STORAGE_KEYS.SETTINGS);
  if (!stored || stored.schemaVersion !== 1) {
    return DEFAULT_SETTINGS;
  }
  return stored;
}

export async function saveSettings(settings: PersistedSettings): Promise<void> {
  await writeJson(STORAGE_KEYS.SETTINGS, settings);
}

export async function clearSettings(): Promise<void> {
  await removeKey(STORAGE_KEYS.SETTINGS);
}
