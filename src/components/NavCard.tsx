import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type NavCardProps = {
  title: string;
  description: string;
  icon: string;
  emoji: string;
  color: string;
  onPress: () => void;
};

/**
 * A tappable navigation card used on the Home screen. Shows a colored
 * icon avatar, an emoji-prefixed title, a short description, and a
 * trailing chevron so it reads clearly as a navigation affordance.
 */
export function NavCard({ title, description, icon, emoji, color, onPress }: NavCardProps) {
  const theme = useTheme();

  return (
    <Card mode="elevated" onPress={onPress} style={styles.card} accessibilityRole="button" accessibilityLabel={title}>
      <Card.Content style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: `${color}1A` }]}>
          <MaterialCommunityIcons name={icon as any} size={26} color={color} />
        </View>
        <View style={styles.textBlock}>
          <Text variant="titleMedium">
            {emoji} {title}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {description}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
});
