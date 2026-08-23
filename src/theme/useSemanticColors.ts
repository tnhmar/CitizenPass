import { useSettingsStore } from "../store/useSettingsStore";
import { useResolvedTheme } from "./useResolvedTheme";
import { brandColors } from "./tokens";

/**
 * "Success" (correct answer, passed exam) isn't one of react-native-paper's
 * MD3Theme color slots, and brand primary (Canada red) is too close to
 * error red to double as a stand-in — a correct-answer button and an
 * incorrect-answer button both ended up rendering as visually similar reds.
 * This gives "correct"/"passed" its own green hue, independent of the
 * brand's red primary, resolved for whichever theme (light/dark) is
 * currently active.
 */
export function useSemanticColors() {
  const themePreference = useSettingsStore((state) => state.theme);
  const resolvedScheme = useResolvedTheme(themePreference);
  const isDark = resolvedScheme === "dark";
  return {
    success: isDark ? brandColors.successDark : brandColors.success,
    onSuccess: "#FFFFFF",
    successContainer: isDark ? brandColors.successContainerDark : brandColors.successSoft,
  };
}
