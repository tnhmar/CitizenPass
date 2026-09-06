import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Card, IconButton, Button, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useProgressStore } from "../src/store/useProgressStore";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { useSemanticColors } from "../src/theme/useSemanticColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getQuestionById } from "../src/data/questionLoader";
import { SourceCitationCard } from "../src/components/SourceCitationCard";
import type { Question } from "../src/types";

export default function BookmarksScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { success } = useSemanticColors();
  const insets = useSafeAreaInsets();
  const language = useSettingsStore((state) => state.language);
  const bookmarkedQuestionIds = useProgressStore((state) => state.bookmarkedQuestionIds);
  const toggleBookmark = useProgressStore((state) => state.toggleBookmark);

  const bookmarkedQuestions = bookmarkedQuestionIds
    .map((id) => getQuestionById(id))
    .filter((q): q is Question => q !== null);

  const renderItem = ({ item }: { item: Question }) => {
    const localized = item[language];
    return (
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="titleSmall" style={styles.questionText}>
              {localized.question}
            </Text>
            <IconButton
              icon="bookmark-off-outline"
              size={20}
              onPress={() => toggleBookmark(item.id)}
              accessibilityLabel={t("bookmarks.remove")}
            />
          </View>
          {/* Theme audit: this used theme.colors.primary (brand red) for a
              correct-answer confirmation, pairing a green checkmark emoji
              with red text - now uses the shared success color instead,
              see docs/theme-navigation-responsive-overhaul.md. */}
          <Text variant="bodySmall" style={{ color: success }}>
            ✅ {localized.options[localized.correctIndex]}
          </Text>
          <Text variant="bodyMedium" style={styles.explanation}>
            💡 {localized.explanation}
          </Text>
          <SourceCitationCard source={localized.source} />
        </Card.Content>
      </Card>
    );
  };

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.listContent, { paddingTop: 16 + insets.top }]}
      data={bookmarkedQuestions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <View style={styles.headerBlock}>
          <Text variant="headlineSmall">🔖 {t("bookmarks.title")}</Text>
          <Button mode="text" icon="arrow-left" onPress={() => router.back()} compact>
            {t("bookmarks.back")}
          </Button>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t("bookmarks.empty")}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 32 },
  headerBlock: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  card: { marginBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  questionText: { flex: 1 },
  explanation: { marginTop: 8, marginBottom: 4 },
  emptyState: { padding: 32, alignItems: "center" },
});
