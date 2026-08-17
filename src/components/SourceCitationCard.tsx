import { StyleSheet } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import type { SourceCitation } from "../types";

type SourceCitationCardProps = {
  source: SourceCitation;
};

/**
 * Displays the official source citation for a question: guide, chapter,
 * section, the exact excerpt, and the source URL. Shown only after the
 * user answers or during review — never embedded in the question stem.
 */
export function SourceCitationCard({ source }: SourceCitationCardProps) {
  const theme = useTheme();

  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          {source.guide} — {source.chapter}
        </Text>
        <Text variant="bodySmall" style={styles.section}>
          {source.section}
        </Text>
        <Text variant="bodyMedium" style={styles.excerpt}>
          “{source.excerpt}”
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {source.sourceUrl}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
  },
  section: {
    marginTop: 2,
    marginBottom: 8,
  },
  excerpt: {
    fontStyle: "italic",
    marginBottom: 8,
  },
});
