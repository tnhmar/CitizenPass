import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Card, ProgressBar, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import { getChapterList, getChapterTitle } from "../../src/data/contentLoader";
import { getChapterVisual } from "../../src/constants/chapterIcons";
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
    const visual = getChapterVisual(item.id);
    const isComplete = completionPercent >= 100;

    return (
      <Card
        mode="elevated"
        style={styles.card}
        onPress={() => router.push(`/study/${item.id}`)}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <Card.Content style={styles.cardContent}>
          <View style={[styles.iconCircle, { backgroundColor: `${visual.color}1A` }]}>
            <MaterialCommunityIcons name={visual.icon as any} size={24} color={visual.color} />
          </View>
          <View style={styles.textBlock}>
            <Text variant="titleMedium">
              {visual.emoji} {title}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.questionCount} {t("study.chapters")}
            </Text>
            <View style={styles.progressRow}>
              <ProgressBar progress={completionPercent / 100} color={visual.color} style={styles.progressBar} />
              <Text variant="bodySmall">{Math.round(completionPercent)}%</Text>
            </View>
          </View>
          {isComplete ? (
            <MaterialCommunityIcons name="check-circle" size={22} color="#1E8E5A" />
          ) : (
            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
          )}
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
        <Text variant="headlineSmall" style={styles.header}>
          📘 {t("study.title")}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  card: { marginBottom: 12 },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  textBlock: { flex: 1, gap: 6 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  progressBar: { flex: 1, height: 6, borderRadius: 3 },
});
