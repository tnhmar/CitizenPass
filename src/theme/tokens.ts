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
 * Brand palette inspired by Canadian visual identity (flag red, navy,
 * gold accent) plus semantic colors for success/error states. Used to
 * build the light/dark React Native Paper themes in `paperThemes.ts`.
 */
export const brandColors = {
  canadaRed: "#D80621",
  canadaRedDark: "#A30417",
  canadaRedSoft: "#FBE7E9",
  navy: "#13284B",
  navyLight: "#22437B",
  gold: "#E5B94E",
  success: "#1E8E5A",
  successSoft: "#E3F5EC",
  danger: "#C62828",
  dangerSoft: "#FBE9E7",
  cream: "#FFF9F2",
} as const;
