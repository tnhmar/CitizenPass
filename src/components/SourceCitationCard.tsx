import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { SourceCitation } from "../types";

type SourceCitationCardProps = {
  source: SourceCitation;
};

/**
 * Displays the source citation for a question. A "verified" citation
 * (guide, chapter, section, a quoted excerpt, and a live canada.ca URL)
 * renders as before. A "needs-review" citation - every question adapted
 * from the reference 511-question bank right now, see
 * src/data/questionLoader.ts - only has a chapter/section/PDF page
 * number, no excerpt or URL yet, and renders visibly differently (muted
 * color, book-alert icon, an explicit "not yet verified" line) rather
 * than silently looking like a fully verified citation it isn't.
 */
export function SourceCitationCard({ source }: SourceCitationCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isVerified = source.reviewStatus === "verified";
  const accentColor = isVerified ? theme.colors.primary : theme.colors.onSurfaceVariant;
  const page = source.printedPage ?? source.pdfPage;

  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons
            name={isVerified ? "book-open-page-variant-outline" : "book-alert-outline"}
            size={16}
            color={accentColor}
          />
          <Text variant="labelLarge" style={[styles.headerText, { color: accentColor }]}>
            {source.guide}
            {source.chapter ? ` — ${source.chapter}` : ""}
          </Text>
        </View>
        {(source.section || page) && (
          <Text variant="bodySmall" style={styles.section}>
            {source.section}
            {source.section && page ? " · " : ""}
            {page ? `p. ${page}` : ""}
          </Text>
        )}
        {source.excerpt && (
          <Text variant="bodyMedium" style={styles.excerpt}>
            “{source.excerpt}”
          </Text>
        )}
        {source.sourceUrl ? (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {source.sourceUrl}
          </Text>
        ) : (
          <Text variant="bodySmall" style={[styles.needsReview, { color: theme.colors.onSurfaceVariant }]}>
            {t("common.citationNeedsReview")}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerText: {
    flex: 1,
  },
  section: {
    marginTop: 2,
    marginBottom: 8,
  },
  excerpt: {
    fontStyle: "italic",
    marginBottom: 8,
  },
  needsReview: {
    fontStyle: "italic",
  },
});
