import { useState } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Searchbar, Card, Button, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { searchContent, type SearchResult } from "../src/data/contentSearch";
import { getChapterVisual } from "../src/constants/chapterIcons";

const MIN_QUERY_LENGTH = 2;

type ResultSection = {
  key: "study" | "practice";
  title: string;
  data: SearchResult[];
};

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const language = useSettingsStore((state) => state.language);
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();
  const results = searchContent(trimmedQuery, language);

  const allSections: ResultSection[] = [
    { key: "study", title: t("search.studySectionTitle"), data: results.filter((r) => r.type === "study") },
    { key: "practice", title: t("search.practiceSectionTitle"), data: results.filter((r) => r.type === "practice") },
  ];
  const sections = allSections.filter((section) => section.data.length > 0);

  const handlePressResult = (result: SearchResult) => {
    if (result.type === "study") {
      router.push(`/study/${result.chapterId}`);
    } else {
      // Search finds the matching question, but Practice draws randomly
      // from a chapter rather than opening one exact question - this
      // starts a session on that question's chapter, the closest
      // existing capability, rather than adding a "jump to this exact
      // question" flow.
      router.push({ pathname: "/practice", params: { chapterId: result.chapterId } });
    }
  };

  const renderSectionHeader = ({ section }: { section: ResultSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
      <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
        {section.key === "study" ? "📘" : "✏️"} {section.title} ({section.data.length})
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: SearchResult }) => {
    const visual = getChapterVisual(item.chapterId);
    return (
      <Card mode="outlined" style={styles.resultCard} onPress={() => handlePressResult(item)}>
        <Card.Content style={styles.resultCardContent}>
          <MaterialCommunityIcons name={visual.icon as any} size={20} color={visual.color} />
          <View style={styles.resultTextBlock}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.chapterTitle}
            </Text>
            <Text variant="bodyMedium" numberOfLines={2}>
              {item.snippet}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.headerBlock, { paddingTop: 16 + insets.top }]}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          🔍 {t("search.title")}
        </Text>
        <Button mode="text" icon="arrow-left" onPress={() => router.back()} compact>
          {t("search.back")}
        </Button>
      </View>

      <Searchbar
        placeholder={t("search.placeholder")}
        value={query}
        onChangeText={setQuery}
        autoFocus
        style={styles.searchbar}
      />

      <SectionList
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        sections={sections}
        keyExtractor={(item, index) => `${item.type}-${item.chapterId}-${index}`}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {trimmedQuery.length < MIN_QUERY_LENGTH ? t("search.promptShort") : t("search.noResults", { query: trimmedQuery })}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBlock: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  headerTitle: { flex: 1 },
  searchbar: { marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  listContent: { padding: 16, paddingBottom: 32 },
  sectionHeader: { paddingVertical: 8 },
  resultCard: { marginBottom: 10 },
  resultCardContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  resultTextBlock: { flex: 1, gap: 2 },
  emptyState: { padding: 32, alignItems: "center" },
});
