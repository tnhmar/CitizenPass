import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type OptionButtonProps = {
  /** Full option label, e.g. "A. Roman law and Napoleonic decrees". */
  label: string;
  mode: "outlined" | "contained";
  onPress: () => void;
  disabled?: boolean;
  /** Name of a MaterialCommunityIcons glyph, e.g. "check-circle". */
  icon?: string;
  /** Background color when mode="contained". Defaults to theme.colors.primary. */
  containedColor?: string;
  /** Text/icon color. Defaults to theme.colors.onPrimary (contained) or theme.colors.primary (outlined). */
  contentColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Answer-option control for Practice and Exam mode.
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
 * single-line Button — a stadium shape looks wrong once a button grows
 * tall from wrapped text. Adjust `styles.wrapper.borderRadius` if you'd
 * rather it track the theme.
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
  const backgroundColor = mode === "contained" ? (containedColor ?? theme.colors.primary) : "transparent";
  const textColor = contentColor ?? (mode === "contained" ? theme.colors.onPrimary : theme.colors.primary);

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor,
          borderColor: mode === "outlined" ? theme.colors.outline : "transparent",
          borderWidth: mode === "outlined" ? 1 : 0,
        },
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <TouchableRipple
        onPress={onPress}
        disabled={disabled}
        style={styles.touchable}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
      >
        <View style={styles.content}>
          {icon ? (
            <MaterialCommunityIcons name={icon as any} size={18} color={textColor} style={styles.icon} />
          ) : null}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
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
