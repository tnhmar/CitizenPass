import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import fr from "./fr.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

// Bug fix: this used to seed the initial language from the device locale
// (expo-localization), so a phone/simulator set to French would boot the
// app in French even though DEFAULT_SETTINGS.language in
// settingsRepository.ts is "en". The two defaults disagreeing was the
// actual bug - not just a brief flash, since a device set to French would
// stay on French every time (nothing ever re-derives the language from
// the device after this initial boot). "en" is now the single, explicit
// default here, matching DEFAULT_SETTINGS. French remains fully available
// and persists once a user picks it in Settings - see
// useSettingsStore.hydrate(), which calls i18n.changeLanguage() with
// whatever was actually saved (or "en" if nothing was).
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
