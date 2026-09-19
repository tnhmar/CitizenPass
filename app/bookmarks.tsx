import { SectionList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Card, IconButton, Button, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useProgressStore } from "../src/store/useProgressStore";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { useSemanticColors } from "../src/theme/useSemanticColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getQuestionById } from "../src/data/questionLoader";
import { getChapterList, getChapterTitle } from "../src/data/contentLoader";
import { getChapterVisual } from "../src/constants/chapterIcons";
import { SourceCitationCard } from "../src/components/SourceCitationCard";
import type { Question } from "../src/types";

type BookmarkSection = {
  chapterId: string;
  title: string;
  data: Question[];
};

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

  // Grouped in the same chapter order used everywhere else (Study,
  // Progress) rather than raw bookmark order, so a chapter with several
  // saved questions doesn't get scattered across the list. Chapters with
  // no bookmarks are simply left out rather than shown as empty sections.
  const sections: BookmarkSection[] = getChapterList()
    .map((chapter) => ({
      chapterId: chapter.id,
      title: getChapterTitle(chapter, language),
      data: bookmarkedQuestions.filter((question) => question.chapterId === chapter.id),
    }))
    .filter((section) => section.data.length > 0);

  const renderSectionHeader = ({ section }: { section: BookmarkSection }) => {
    const visual = getChapterVisual(section.chapterId);
    return (
      <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name={visual.icon as any} size={16} color={visual.color} />
        <Text variant="labelLarge" style={{ color: visual.color }}>
          {visual.emoji} {section.title} ({section.data.length})
        </Text>
      </View>
    );
  };

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
    <SectionList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.listContent, { paddingTop: 16 + insets.top }]}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled
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
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, marginTop: 8 },
  card: { marginBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  questionText: { flex: 1 },
  explanation: { marginTop: 8, marginBottom: 4 },
  emptyState: { padding: 32, alignItems: "center" },
});
