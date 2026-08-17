import { useColorScheme } from "react-native";
import type { AppTheme } from "../types";

/**
 * Resolves the user's theme preference ("light" | "dark" | "system")
 * against the device's current colour scheme, purely on-device — no
 * network or remote config involved.
 */
export function useResolvedTheme(preference: AppTheme): "light" | "dark" {
  const systemScheme = useColorScheme();
  if (preference === "system") {
    return systemScheme === "dark" ? "dark" : "light";
  }
  return preference;
}
