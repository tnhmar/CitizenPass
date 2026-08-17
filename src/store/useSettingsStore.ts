import { create } from "zustand";
import i18n from "../i18n";
import type { AppLanguage, AppTheme } from "../types";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  clearSettings,
  type PersistedSettings,
} from "../services/persistence/settingsRepository";

type SettingsState = {
  language: AppLanguage;
  theme: AppTheme;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
  resetSettings: () => Promise<void>;
};

function persist(state: Pick<SettingsState, "language" | "theme">): PersistedSettings {
  return {
    schemaVersion: 1,
    language: state.language,
    theme: state.theme,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: DEFAULT_SETTINGS.language,
  theme: DEFAULT_SETTINGS.theme,
  hydrated: false,

  hydrate: async () => {
    const stored = await loadSettings();
    set({ language: stored.language, theme: stored.theme, hydrated: true });
    await i18n.changeLanguage(stored.language);
  },

  setLanguage: async (language) => {
    set({ language });
    await i18n.changeLanguage(language);
    await saveSettings(persist({ language, theme: get().theme }));
  },

  setTheme: async (theme) => {
    set({ theme });
    await saveSettings(persist({ language: get().language, theme }));
  },

  resetSettings: async () => {
    await clearSettings();
    set({ language: DEFAULT_SETTINGS.language, theme: DEFAULT_SETTINGS.theme });
    await i18n.changeLanguage(DEFAULT_SETTINGS.language);
  },
}));
