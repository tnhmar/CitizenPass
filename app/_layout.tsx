import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import "../src/i18n";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { useProgressStore } from "../src/store/useProgressStore";
import { useExamStore } from "../src/store/useExamStore";
import { useResolvedTheme } from "../src/theme/useResolvedTheme";
import { getPaperTheme } from "../src/theme/paperThemes";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const theme = useSettingsStore((state) => state.theme);
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const hydrateProgress = useProgressStore((state) => state.hydrate);
  const hydrateExam = useExamStore((state) => state.hydrate);
  const resolvedScheme = useResolvedTheme(theme);

  useEffect(() => {
    Promise.all([hydrateSettings(), hydrateProgress(), hydrateExam()]).finally(() => setIsReady(true));
    // Hydration runs once on mount; store actions are stable references from Zustand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isReady) {
    // Keep this minimal and dependency-free: no splash animation libraries,
    // no network calls - just avoid rendering the app before local storage
    // has been read, so settings/progress/exam-in-progress do not flash
    // back to defaults.
    return null;
  }

  const paperTheme = getPaperTheme(colorScheme, resolvedScheme);

  return (
    <PaperProvider theme={paperTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
