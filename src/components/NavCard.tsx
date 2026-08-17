import { StyleSheet } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";

type NavCardProps = {
  title: string;
  description: string;
  onPress: () => void;
};

/**
 * A tappable navigation card used on the Home screen. Deliberately
 * icon-free to avoid depending on a vector-icon font being configured;
 * relies only on react-native-paper primitives already in the project.
 */
export function NavCard({ title, description, onPress }: NavCardProps) {
  const theme = useTheme();

  return (
    <Card mode="elevated" onPress={onPress} style={styles.card} accessibilityRole="button" accessibilityLabel={title}>
      <Card.Content>
        <Text variant="titleMedium">{title}</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {description}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
});
