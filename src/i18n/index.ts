import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./en.json";
import fr from "./fr.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "en";
const initialLanguage = deviceLanguage === "fr" ? "fr" : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
