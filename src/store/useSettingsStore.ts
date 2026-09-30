import { create } from "zustand";
import i18n from "../i18n";
import type { AppColorScheme, AppLanguage, AppTheme } from "../types";
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
  colorScheme: AppColorScheme;
  arabicHelpEnabled: boolean;
  hasSeenOnboarding: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
  setColorScheme: (colorScheme: AppColorScheme) => Promise<void>;
  setArabicHelpEnabled: (enabled: boolean) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetSettings: () => Promise<void>;
};

function persist(
  state: Pick<SettingsState, "language" | "theme" | "colorScheme" | "arabicHelpEnabled" | "hasSeenOnboarding">
): PersistedSettings {
  return {
    schemaVersion: 1,
    language: state.language,
    theme: state.theme,
    colorScheme: state.colorScheme,
    arabicHelpEnabled: state.arabicHelpEnabled,
    hasSeenOnboarding: state.hasSeenOnboarding,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: DEFAULT_SETTINGS.language,
  theme: DEFAULT_SETTINGS.theme,
  colorScheme: DEFAULT_SETTINGS.colorScheme,
  arabicHelpEnabled: DEFAULT_SETTINGS.arabicHelpEnabled,
  hasSeenOnboarding: DEFAULT_SETTINGS.hasSeenOnboarding,
  hydrated: false,

  hydrate: async () => {
    const stored = await loadSettings();
    set({
      language: stored.language,
      theme: stored.theme,
      colorScheme: stored.colorScheme,
      arabicHelpEnabled: stored.arabicHelpEnabled,
      hasSeenOnboarding: stored.hasSeenOnboarding,
      hydrated: true,
    });
    await i18n.changeLanguage(stored.language);
  },

  setLanguage: async (language) => {
    set({ language });
    await i18n.changeLanguage(language);
    await saveSettings(
      persist({ language, theme: get().theme, colorScheme: get().colorScheme, arabicHelpEnabled: get().arabicHelpEnabled, hasSeenOnboarding: get().hasSeenOnboarding })
    );
  },

  setTheme: async (theme) => {
    set({ theme });
    await saveSettings(
      persist({ language: get().language, theme, colorScheme: get().colorScheme, arabicHelpEnabled: get().arabicHelpEnabled, hasSeenOnboarding: get().hasSeenOnboarding })
    );
  },

  setColorScheme: async (colorScheme) => {
    set({ colorScheme });
    await saveSettings(
      persist({ language: get().language, theme: get().theme, colorScheme, arabicHelpEnabled: get().arabicHelpEnabled, hasSeenOnboarding: get().hasSeenOnboarding })
    );
  },

  setArabicHelpEnabled: async (arabicHelpEnabled) => {
    set({ arabicHelpEnabled });
    await saveSettings(
      persist({ language: get().language, theme: get().theme, colorScheme: get().colorScheme, arabicHelpEnabled, hasSeenOnboarding: get().hasSeenOnboarding })
    );
  },

  completeOnboarding: async () => {
    set({ hasSeenOnboarding: true });
    await saveSettings(
      persist({
        language: get().language,
        theme: get().theme,
        colorScheme: get().colorScheme,
        arabicHelpEnabled: get().arabicHelpEnabled,
        hasSeenOnboarding: true,
      })
    );
  },

  resetSettings: async () => {
    await clearSettings();
    set({
      language: DEFAULT_SETTINGS.language,
      theme: DEFAULT_SETTINGS.theme,
      colorScheme: DEFAULT_SETTINGS.colorScheme,
      arabicHelpEnabled: DEFAULT_SETTINGS.arabicHelpEnabled,
      hasSeenOnboarding: DEFAULT_SETTINGS.hasSeenOnboarding,
    });
    await i18n.changeLanguage(DEFAULT_SETTINGS.language);
  },
}));
