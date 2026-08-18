import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Card, ProgressBar, Chip, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useProgressStore } from "../../src/store/useProgressStore";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { getChapterList, getChapterTitle } from "../../src/data/contentLoader";
import { getChapterVisual } from "../../src/constants/chapterIcons";
import { StatPill } from "../../src/components/StatPill";
import type { ManifestChapterEntry } from "../../src/types/content";

export default function ProgressScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const language = useSettingsStore((state) => state.language);
  const practiceStats = useProgressStore((state) => state.practiceStats);
  const chapterProgress = useProgressStore((state) => state.chapterProgress);
  const bookmarkedQuestionIds = useProgressStore((state) => state.bookmarkedQuestionIds);
  const examHistory = useProgressStore((state) => state.examHistory);

  const chapters = getChapterList();
  const chaptersStartedCount = Object.keys(chapterProgress).length;
  const hasAttempts = practiceStats.totalAttempts > 0;
  const accuracyPercent = hasAttempts
    ? Math.round((practiceStats.totalCorrect / practiceStats.totalAttempts) * 100)
    : 0;

  const sortedExamHistory = [...examHistory].sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1));

  const renderChapter = ({ item }: { item: ManifestChapterEntry }) => {
    const visual = getChapterVisual(item.id);
    const title = getChapterTitle(item, language);
    const completionPercent = chapterProgress[item.id]?.completionPercent ?? 0;

    return (
      <Card mode="outlined" style={styles.chapterCard} onPress={() => router.push(`/study/${item.id}`)}>
        <Card.Content style={styles.chapterCardContent}>
          <View style={[styles.chapterIconCircle, { backgroundColor: `${visual.color}1A` }]}>
            <MaterialCommunityIcons name={visual.icon as any} size={20} color={visual.color} />
          </View>
          <View style={styles.chapterTextBlock}>
            <Text variant="bodyMedium">
              {visual.emoji} {title}
            </Text>
            <ProgressBar progress={completionPercent / 100} color={visual.color} style={styles.progressBar} />
          </View>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {Math.round(completionPercent)}%
          </Text>
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
      renderItem={renderChapter}
      ListHeaderComponent={
        <View>
          <Text variant="headlineSmall" style={styles.header}>
            📊 {t("progress.title")}
          </Text>

          <View style={styles.statsRow}>
            <StatPill
              icon="target"
              label={t("progress.accuracyLabel")}
              value={hasAttempts ? `${accuracyPercent}%` : "—"}
              color={theme.colors.primary}
            />
            <StatPill
              icon="pencil-outline"
              label={t("progress.attemptsLabel")}
              value={String(practiceStats.totalAttempts)}
              color={theme.colors.secondary}
            />
          </View>
          <View style={styles.statsRow}>
            <StatPill
              icon="book-open-page-variant"
              label={t("progress.chaptersLabel")}
              value={`${chaptersStartedCount}/${chapters.length}`}
              color="#1E8E5A"
            />
            <StatPill
              icon="bookmark"
              label={t("progress.bookmarksLabel")}
              value={String(bookmarkedQuestionIds.length)}
              color="#C77F1A"
              onPress={() => router.push("/bookmarks")}
            />
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            📘 {t("progress.chapterProgressTitle")}
          </Text>
        </View>
      }
      ListFooterComponent={
        <View>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            🕐 {t("progress.examHistory")}
          </Text>
          {sortedExamHistory.length === 0 ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 32 }}>
              {t("progress.noExamHistory")}
            </Text>
          ) : (
            sortedExamHistory.slice(0, 10).map((attempt, index) => (
              <Card key={`${attempt.dateIso}-${index}`} mode="outlined" style={styles.examCard}>
                <Card.Content style={styles.examCardContent}>
                  <MaterialCommunityIcons
                    name={attempt.passed ? "trophy" : "close-circle-outline"}
                    size={22}
                    color={attempt.passed ? "#E5B94E" : theme.colors.error}
                  />
                  <View style={styles.examTextBlock}>
                    <Text variant="bodyMedium">
                      {attempt.score} / {attempt.total}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {new Date(attempt.dateIso).toLocaleDateString()}
                    </Text>
                  </View>
                  <Chip
                    compact
                    style={{ backgroundColor: attempt.passed ? theme.colors.primaryContainer : theme.colors.errorContainer }}
                    textStyle={{ color: attempt.passed ? theme.colors.primary : theme.colors.error }}
                  >
                    {attempt.passed ? `🎉 ${t("progress.examPassed")}` : `📚 ${t("progress.examFailed")}`}
                  </Chip>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  sectionTitle: { marginBottom: 12, marginTop: 16 },
  chapterCard: { marginBottom: 10 },
  chapterCardContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  chapterIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  chapterTextBlock: { flex: 1, gap: 6 },
  progressBar: { height: 6, borderRadius: 3 },
  examCard: { marginBottom: 10 },
  examCardContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  examTextBlock: { flex: 1 },
});
