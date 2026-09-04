import type { AppColorScheme } from "../types";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/**
 * Below this shorter-side width (dp), the device is treated as a phone;
 * at or above it, as a tablet. 600dp matches Android's own "sw600dp"
 * tablet resource-qualifier convention, so it lines up with how the OS
 * itself distinguishes the two form factors.
 */
export const TABLET_BREAKPOINT = 600;

/**
 * Full palette audit, see docs/theme-navigation-responsive-overhaul.md.
 *
 * The previous palette (still visible in git history) built its themes by
 * spreading React Native Paper's MD3 base theme and overriding only a
 * handful of color roles. That left several roles - most importantly
 * `onError` in dark mode - on Paper's own defaults, which were never
 * checked against *this* app's overridden `error`/`primary` colors. It
 * also meant every unanswered, "outlined" option button and every
 * in-progress (not-yet-graded) exam selection fell back to
 * `theme.colors.primary`, i.e. brand red - so *every* option on every
 * question rendered in the same red used for "incorrect", regardless of
 * whether it had ever been answered.
 *
 * This file now defines every color role this app actually uses,
 * explicitly, for both light and dark mode, and for six selectable
 * accent families. Every text-on-background and icon-on-background pairing
 * listed below has been verified to meet WCAG AA (4.5:1 for text, 3:1 for
 * large text/icons) - see the contrast check referenced in the overhaul
 * doc. Neutral surfaces and the success/error semantic colors are shared
 * across all schemes (only the brand accent hues change), which
 * keeps "correct"/"incorrect" reliably recognizable no matter which accent
 * a user has picked, and keeps the neutral checker script small since it
 * only has to verify each accent against a fixed set of neutrals.
 */

export type NeutralPalette = {
  background: string;
  surface: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
};

export const NEUTRAL_COLORS: Record<"light" | "dark", NeutralPalette> = {
  light: {
    background: "#FAFAFC",
    surface: "#FFFFFF",
    surfaceVariant: "#EEF0F4",
    onSurface: "#1B1C1E",
    onSurfaceVariant: "#44474A",
    outline: "#787A7E",
  },
  dark: {
    background: "#101216",
    surface: "#1A1C20",
    surfaceVariant: "#2B2E33",
    onSurface: "#E7E8EA",
    onSurfaceVariant: "#C4C6CA",
    outline: "#8C8F94",
  },
};

export type SemanticPalette = {
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  success: string;
  onSuccess: string;
  successContainer: string;
  onSuccessContainer: string;
};

export const SEMANTIC_COLORS: Record<"light" | "dark", SemanticPalette> = {
  light: {
    error: "#B3261E",
    onError: "#FFFFFF",
    errorContainer: "#F9DEDC",
    onErrorContainer: "#410E0B",
    success: "#1E7A46",
    onSuccess: "#FFFFFF",
    successContainer: "#DCF3E4",
    onSuccessContainer: "#0B3D20",
  },
  dark: {
    error: "#F2B8B5",
    onError: "#601410",
    errorContainer: "#8C1D18",
    onErrorContainer: "#F9DEDC",
    success: "#8FD9AE",
    onSuccess: "#0B3D20",
    successContainer: "#1B4B30",
    onSuccessContainer: "#DCF3E4",
  },
};

export type AccentPalette = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
};

export type ColorSchemeDefinition = {
  id: AppColorScheme;
  /** i18n key for the picker label in Settings. */
  labelKey: string;
  /** Swatch color shown in the Settings picker (the scheme's light-mode primary). */
  swatch: string;
  light: AccentPalette;
  dark: AccentPalette;
};

export const COLOR_SCHEMES: Record<AppColorScheme, ColorSchemeDefinition> = {
  classicRed: {
    id: "classicRed",
    labelKey: "settings.colorSchemeClassicRed",
    swatch: "#B3132B",
    light: {
      primary: "#B3132B",
      onPrimary: "#FFFFFF",
      primaryContainer: "#F9D9DC",
      onPrimaryContainer: "#410008",
      secondary: "#1D3461",
      onSecondary: "#FFFFFF",
      secondaryContainer: "#DCE3F5",
      onSecondaryContainer: "#0B1B36",
      tertiary: "#8A5A12",
      onTertiary: "#FFFFFF",
    },
    dark: {
      primary: "#FFB3B7",
      onPrimary: "#66000F",
      primaryContainer: "#8C0021",
      onPrimaryContainer: "#FFDAD9",
      secondary: "#B7C6EC",
      onSecondary: "#16294B",
      secondaryContainer: "#2C3F66",
      onSecondaryContainer: "#DCE3F5",
      tertiary: "#E3C077",
      onTertiary: "#402D00",
    },
  },
  oceanBlue: {
    id: "oceanBlue",
    labelKey: "settings.colorSchemeOceanBlue",
    swatch: "#0A5C92",
    light: {
      primary: "#0A5C92",
      onPrimary: "#FFFFFF",
      primaryContainer: "#D3E8F7",
      onPrimaryContainer: "#03293F",
      secondary: "#2E6E62",
      onSecondary: "#FFFFFF",
      secondaryContainer: "#D3ECE5",
      onSecondaryContainer: "#0A2A24",
      tertiary: "#92600A",
      onTertiary: "#FFFFFF",
    },
    dark: {
      primary: "#9ED0F2",
      onPrimary: "#003350",
      primaryContainer: "#004A73",
      onPrimaryContainer: "#CEE8FA",
      secondary: "#9FD6C7",
      onSecondary: "#053930",
      secondaryContainer: "#155245",
      onSecondaryContainer: "#BFF0E1",
      tertiary: "#E3B978",
      onTertiary: "#402C00",
    },
  },
  twilightIndigo: {
    id: "twilightIndigo",
    labelKey: "settings.colorSchemeTwilightIndigo",
    swatch: "#5B4B9A",
    light: {
      primary: "#5B4B9A",
      onPrimary: "#FFFFFF",
      primaryContainer: "#E5DFF7",
      onPrimaryContainer: "#1F1440",
      secondary: "#4A5568",
      onSecondary: "#FFFFFF",
      secondaryContainer: "#DCE1E8",
      onSecondaryContainer: "#161D28",
      tertiary: "#92600A",
      onTertiary: "#FFFFFF",
    },
    dark: {
      primary: "#C8BBF0",
      onPrimary: "#31215C",
      primaryContainer: "#493876",
      onPrimaryContainer: "#E5DFF7",
      secondary: "#B8C2D1",
      onSecondary: "#232C38",
      secondaryContainer: "#39424F",
      onSecondaryContainer: "#DCE1E8",
      tertiary: "#E3B978",
      onTertiary: "#402C00",
    },
  },
  terracotta: {
    id: "terracotta",
    labelKey: "settings.colorSchemeTerracotta",
    swatch: "#A6461A",
    light: {
      primary: "#A6461A",
      onPrimary: "#FFFFFF",
      primaryContainer: "#FBDDCB",
      onPrimaryContainer: "#3D1400",
      secondary: "#6B3A52",
      onSecondary: "#FFFFFF",
      secondaryContainer: "#F5DCE7",
      onSecondaryContainer: "#2B0A19",
      tertiary: "#92600A",
      onTertiary: "#FFFFFF",
    },
    dark: {
      primary: "#FFB68C",
      onPrimary: "#5C1E00",
      primaryContainer: "#7D2E00",
      onPrimaryContainer: "#FFDBC7",
      secondary: "#E8B7CE",
      onSecondary: "#45152F",
      secondaryContainer: "#5E2945",
      onSecondaryContainer: "#FFD8E9",
      tertiary: "#E3B978",
      onTertiary: "#402C00",
    },
  },
  slateCharcoal: {
    id: "slateCharcoal",
    labelKey: "settings.colorSchemeSlateCharcoal",
    swatch: "#3E4A59",
    light: {
      primary: "#3E4A59",
      onPrimary: "#FFFFFF",
      primaryContainer: "#DCE2E9",
      onPrimaryContainer: "#10181F",
      // Deliberately a slate-purple-grey, not slate-green: a greenish
      // secondary here would risk the exact collision this palette audit
      // exists to prevent, since a scheme's "selected" state (see
      // OptionButton's mode="selected") is secondaryContainer-tinted and
      // must never read as an implicit "correct" (success is green).
      secondary: "#5C5B70",
      onSecondary: "#FFFFFF",
      secondaryContainer: "#E3E1EC",
      onSecondaryContainer: "#191825",
      tertiary: "#92600A",
      onTertiary: "#FFFFFF",
    },
    dark: {
      primary: "#B4C7DB",
      onPrimary: "#17293A",
      primaryContainer: "#283B4E",
      onPrimaryContainer: "#D5E3F0",
      secondary: "#C6C4DC",
      onSecondary: "#2D2C40",
      secondaryContainer: "#434258",
      onSecondaryContainer: "#E3E1F5",
      tertiary: "#E3B978",
      onTertiary: "#402C00",
    },
  },
  plumMagenta: {
    id: "plumMagenta",
    labelKey: "settings.colorSchemePlumMagenta",
    swatch: "#8E2A6B",
    light: {
      primary: "#8E2A6B",
      onPrimary: "#FFFFFF",
      primaryContainer: "#F8D9EC",
      onPrimaryContainer: "#390026",
      secondary: "#55536B",
      onSecondary: "#FFFFFF",
      secondaryContainer: "#E1E0F0",
      onSecondaryContainer: "#16152B",
      tertiary: "#92600A",
      onTertiary: "#FFFFFF",
    },
    dark: {
      primary: "#F0B4DC",
      onPrimary: "#55103F",
      primaryContainer: "#6E1D54",
      onPrimaryContainer: "#FFD8ED",
      secondary: "#C0BEDC",
      onSecondary: "#2C2B44",
      secondaryContainer: "#43415C",
      onSecondaryContainer: "#E1E0F7",
      tertiary: "#E3B978",
      onTertiary: "#402C00",
    },
  },
};

export const COLOR_SCHEME_IDS: AppColorScheme[] = [
  "classicRed",
  "oceanBlue",
  "twilightIndigo",
  "terracotta",
  "slateCharcoal",
  "plumMagenta",
];
