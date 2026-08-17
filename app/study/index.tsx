import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Card, ProgressBar, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import { getChapterList, getChapterTitle } from "../../src/data/contentLoader";
import type { ManifestChapterEntry } from "../../src/types/content";

export default function StudyIndexScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const language = useSettingsStore((state) => state.language);
  const chapterProgress = useProgressStore((state) => state.chapterProgress);

  const chapters = getChapterList();

  const renderItem = ({ item }: { item: ManifestChapterEntry }) => {
    const title = getChapterTitle(item, language);
    const completionPercent = chapterProgress[item.id]?.completionPercent ?? 0;

    return (
      <Card
        mode="elevated"
        style={styles.card}
        onPress={() => router.push(`/study/${item.id}`)}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <Card.Content>
          <Text variant="titleMedium">{title}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {item.questionCount} {t("study.chapters")}
          </Text>
          <View style={styles.progressRow}>
            <ProgressBar progress={completionPercent / 100} style={styles.progressBar} />
            <Text variant="bodySmall">{Math.round(completionPercent)}%</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.listContent}
      data={chapters}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <Text variant="headlineMedium" style={styles.header}>
          {t("study.title")}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
  },
});
