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
  arabicHelpEnabled: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
  setArabicHelpEnabled: (enabled: boolean) => Promise<void>;
  resetSettings: () => Promise<void>;
};

function persist(state: Pick<SettingsState, "language" | "theme" | "arabicHelpEnabled">): PersistedSettings {
  return {
    schemaVersion: 1,
    language: state.language,
    theme: state.theme,
    arabicHelpEnabled: state.arabicHelpEnabled,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: DEFAULT_SETTINGS.language,
  theme: DEFAULT_SETTINGS.theme,
  arabicHelpEnabled: DEFAULT_SETTINGS.arabicHelpEnabled,
  hydrated: false,

  hydrate: async () => {
    const stored = await loadSettings();
    set({ language: stored.language, theme: stored.theme, arabicHelpEnabled: stored.arabicHelpEnabled, hydrated: true });
    await i18n.changeLanguage(stored.language);
  },

  setLanguage: async (language) => {
    set({ language });
    await i18n.changeLanguage(language);
    await saveSettings(persist({ language, theme: get().theme, arabicHelpEnabled: get().arabicHelpEnabled }));
  },

  setTheme: async (theme) => {
    set({ theme });
    await saveSettings(persist({ language: get().language, theme, arabicHelpEnabled: get().arabicHelpEnabled }));
  },

  setArabicHelpEnabled: async (arabicHelpEnabled) => {
    set({ arabicHelpEnabled });
    await saveSettings(persist({ language: get().language, theme: get().theme, arabicHelpEnabled }));
  },

  resetSettings: async () => {
    await clearSettings();
    set({ language: DEFAULT_SETTINGS.language, theme: DEFAULT_SETTINGS.theme, arabicHelpEnabled: DEFAULT_SETTINGS.arabicHelpEnabled });
    await i18n.changeLanguage(DEFAULT_SETTINGS.language);
  },
}));
