import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsive } from "../hooks/useResponsive";

type OptionButtonProps = {
  /** Full option label, e.g. "A. Roman law and Napoleonic decrees". */
  label: string;
  /**
   * "outlined" - not yet answered/selected: neutral text on a bordered,
   *   transparent background. No brand or semantic color, since this
   *   state means nothing yet (see the theme audit note below).
   * "selected" - the user's current pick before grading is available
   *   (Simulated Exam, where there's no feedback until submission).
   *   Neutral-but-tinted using the secondary color, deliberately NOT
   *   primary or error, so a mid-exam selection never looks like a
   *   verdict.
   * "contained" - a graded state (Practice mode's correct/incorrect
   *   reveal); pass `containedColor`/`contentColor` explicitly for those
   *   (success/error), since this mode's own default (brand primary) is
   *   meant for actual primary actions, not answer feedback.
   */
  mode: "outlined" | "selected" | "contained";
  onPress: () => void;
  disabled?: boolean;
  /** Name of a MaterialCommunityIcons glyph, e.g. "check-circle". */
  icon?: string;
  /** Background color when mode="contained" or "selected". Defaults per-mode (see above). */
  containedColor?: string;
  /** Text/icon color. Defaults per-mode (see above). */
  contentColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Answer-option control for Practice and Exam mode.
 *
 * Theme audit note: this component previously defaulted its text color to
 * `theme.colors.primary` (brand red) for every "outlined" (i.e. every
 * un-answered) option, and Exam mode used mode="contained" - brand
 * primary background - for the option the user currently has selected,
 * before any grading has happened. Combined, every option on every
 * question rendered in red at some point, whether or not it was ever
 * "wrong." Unanswered options now use neutral on-surface text, and a
 * mid-exam selection uses a distinct "selected" mode (secondary-tinted)
 * instead of the brand/error-adjacent red. See
 * docs/theme-navigation-responsive-overhaul.md.
 *
 * Deliberately NOT react-native-paper's <Button>: Button's internal label
 * Text is hard-limited to a single line, so any option long enough to wrap
 * gets silently cut off with an ellipsis instead of showing in full. This
 * reuses Paper's own TouchableRipple + Text primitives (so ripple feedback
 * and theming still match the rest of the app) without that line limit, so
 * long option text wraps to as many lines as it needs.
 *
 * Corner radius is a fixed 12 rather than theme.roundness-derived, since
 * this app's roundness (16) is tuned for Paper's normal pill-shaped
 * single-line Button - a stadium shape looks wrong once a button grows
 * tall from wrapped text. Adjust `styles.wrapper.borderRadius` if you'd
 * rather it track the theme.
 *
 * Sizing scales with `useResponsive()` so touch targets and label text
 * grow slightly on tablets, per the responsive pass in
 * docs/theme-navigation-responsive-overhaul.md.
 */
export function OptionButton({
  label,
  mode,
  onPress,
  disabled,
  icon,
  containedColor,
  contentColor,
  style,
}: OptionButtonProps) {
  const theme = useTheme();
  const { scale } = useResponsive();

  let backgroundColor: string;
  let textColor: string;
  let borderColor = "transparent";
  let borderWidth = 0;

  if (mode === "contained") {
    backgroundColor = containedColor ?? theme.colors.primary;
    textColor = contentColor ?? theme.colors.onPrimary;
  } else if (mode === "selected") {
    backgroundColor = containedColor ?? theme.colors.secondaryContainer;
    textColor = contentColor ?? theme.colors.onSecondaryContainer;
  } else {
    backgroundColor = "transparent";
    textColor = contentColor ?? theme.colors.onSurface;
    borderColor = theme.colors.outline;
    borderWidth = 1;
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor,
          borderColor,
          borderWidth,
        },
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <TouchableRipple
        onPress={onPress}
        disabled={disabled}
        style={[styles.touchable, { minHeight: 44 * scale }]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
      >
        <View style={[styles.content, { paddingVertical: 10 * scale, paddingHorizontal: 16 * scale }]}>
          {icon ? (
            <MaterialCommunityIcons
              name={icon as any}
              size={18 * scale}
              color={textColor}
              style={styles.icon}
            />
          ) : null}
          <Text style={[styles.label, { color: textColor, fontSize: 14 * scale, lineHeight: 20 * scale }]}>
            {label}
          </Text>
        </View>
      </TouchableRipple>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 12, overflow: "hidden" },
  touchable: { minHeight: 44 },
  content: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 16 },
  icon: { marginRight: 8 },
  label: { flex: 1, fontSize: 14, lineHeight: 20 },
  disabled: { opacity: 0.6 },
});
