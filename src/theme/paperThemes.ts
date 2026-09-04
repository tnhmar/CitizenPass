import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import type { AppColorScheme } from "../types";
import { COLOR_SCHEMES, NEUTRAL_COLORS, SEMANTIC_COLORS } from "./tokens";

/**
 * Builds a full Paper MD3 theme for the given accent scheme + light/dark
 * mode. Every color role this app reads (directly or via
 * `useSemanticColors`) is set explicitly from the audited palette in
 * `tokens.ts`; we only fall back to Paper's own MD3 base theme for the
 * handful of roles this app never touches (elevation overlays, `scrim`,
 * `inverseSurface`, etc.), so those stay sensible without needing their
 * own audit.
 */
export function getPaperTheme(scheme: AppColorScheme, mode: "light" | "dark") {
  const base = mode === "dark" ? MD3DarkTheme : MD3LightTheme;
  const accent = COLOR_SCHEMES[scheme][mode];
  const neutral = NEUTRAL_COLORS[mode];
  const semantic = SEMANTIC_COLORS[mode];

  return {
    ...base,
    roundness: 16,
    colors: {
      ...base.colors,
      primary: accent.primary,
      onPrimary: accent.onPrimary,
      primaryContainer: accent.primaryContainer,
      onPrimaryContainer: accent.onPrimaryContainer,
      secondary: accent.secondary,
      onSecondary: accent.onSecondary,
      secondaryContainer: accent.secondaryContainer,
      onSecondaryContainer: accent.onSecondaryContainer,
      tertiary: accent.tertiary,
      onTertiary: accent.onTertiary,
      error: semantic.error,
      onError: semantic.onError,
      errorContainer: semantic.errorContainer,
      onErrorContainer: semantic.onErrorContainer,
      background: neutral.background,
      onBackground: neutral.onSurface,
      surface: neutral.surface,
      onSurface: neutral.onSurface,
      surfaceVariant: neutral.surfaceVariant,
      onSurfaceVariant: neutral.onSurfaceVariant,
      outline: neutral.outline,
    },
  };
}
