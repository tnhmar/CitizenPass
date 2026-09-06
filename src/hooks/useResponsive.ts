import { useWindowDimensions } from "react-native";
import { TABLET_BREAKPOINT } from "../theme/tokens";

export type ResponsiveInfo = {
  width: number;
  height: number;
  isLandscape: boolean;
  isTablet: boolean;
  /**
   * Multiplier for font sizes and touch targets. 1 on phones; slightly
   * larger on tablets so text and buttons don't look undersized on a
   * bigger screen with the same viewing distance as a phone.
   */
  scale: number;
  /**
   * Caps how wide the main content column gets on a tablet (in either
   * orientation) or a phone in landscape, so text doesn't stretch into
   * unreadably long lines edge-to-edge. `undefined` on a phone in
   * portrait, where the screen is already narrow enough.
   */
  contentMaxWidth: number | undefined;
};

/**
 * Single source of truth for "does this screen need tablet/landscape
 * treatment," built on React Native's own `useWindowDimensions` so it
 * re-renders automatically on rotation - no extra event listeners needed.
 * Used by the Settings screen, the Exam screens, and OptionButton (see
 * docs/theme-navigation-responsive-overhaul.md).
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= TABLET_BREAKPOINT;
  const scale = isTablet ? 1.15 : 1;
  const contentMaxWidth = isTablet || isLandscape ? 680 : undefined;

  return { width, height, isLandscape, isTablet, scale, contentMaxWidth };
}
