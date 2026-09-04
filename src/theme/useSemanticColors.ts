import { useSettingsStore } from "../store/useSettingsStore";
import { useResolvedTheme } from "./useResolvedTheme";
import { SEMANTIC_COLORS } from "./tokens";

/**
 * "Success" (correct answer, passed exam) isn't one of react-native-paper's
 * MD3Theme color slots. It's shared across every color scheme (see
 * tokens.ts) so "correct" stays recognizably green regardless of which
 * accent the user has picked in Settings - resolved here for whichever
 * mode (light/dark) is currently active.
 */
export function useSemanticColors() {
  const themePreference = useSettingsStore((state) => state.theme);
  const resolvedScheme = useResolvedTheme(themePreference);
  const { success, onSuccess, successContainer, onSuccessContainer } = SEMANTIC_COLORS[resolvedScheme];
  return { success, onSuccess, successContainer, onSuccessContainer };
}
