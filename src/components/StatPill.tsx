import { Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type StatPillProps = {
  icon: string;
  label: string;
  value: string;
  color?: string;
  onPress?: () => void;
};

/**
 * Compact stat display (icon + value + label) used in a row on Home
 * and Progress screens to summarize practice/exam/bookmark counts.
 * Optionally tappable (e.g. the "Saved" pill navigates to /bookmarks).
 */
export function StatPill({ icon, label, value, color, onPress }: StatPillProps) {
  const theme = useTheme();
  const tint = color ?? theme.colors.primary;

  return (
    <Pressable
      style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={label}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${tint}1A` }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={tint} />
      </View>
      <Text variant="titleMedium">{value}</Text>
      <Text variant="bodySmall" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  label: {
    textAlign: "center",
  },
});
