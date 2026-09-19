import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Card, ProgressBar, Chip, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useProgressStore } from "../../src/store/useProgressStore";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useSemanticColors } from "../../src/theme/useSemanticColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getChapterList, getChapterTitle } from "../../src/data/contentLoader";
import { getChapterVisual } from "../../src/constants/chapterIcons";
import { StatPill } from "../../src/components/StatPill";
import { computeChapterAccuracy, computeCurrentStreak, getFocusAreas, getRecentActivity, humanizeTag } from "../../src/utils/progressStats";
import { ExamTrendChart } from "../../src/components/ExamTrendChart";
import { EXAM_PASS_THRESHOLD } from "../../src/store/useExamStore";
import type { ManifestChapterEntry } from "../../src/types/content";

export default function ProgressScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { success, successContainer } = useSemanticColors();
  const insets = useSafeAreaInsets();
  const language = useSettingsStore((state) => state.language);
  const practiceStats = useProgressStore((state) => state.practiceStats);
  const chapterProgress = useProgressStore((state) => state.chapterProgress);
  const bookmarkedQuestionIds = useProgressStore((state) => state.bookmarkedQuestionIds);
  const examHistory = useProgressStore((state) => state.examHistory);
  const attemptLog = useProgressStore((state) => state.attemptLog);

  const chapters = getChapterList();
  const chaptersStartedCount = Object.keys(chapterProgress).length;
  const hasAttempts = practiceStats.totalAttempts > 0;
  const accuracyPercent = hasAttempts
    ? Math.round((practiceStats.totalCorrect / practiceStats.totalAttempts) * 100)
    : 0;

  const hasLoggedAttempts = attemptLog.length > 0;
  const chapterAccuracy = computeChapterAccuracy(attemptLog);
  const focusAreas = getFocusAreas(attemptLog);
  const currentStreak = computeCurrentStreak(attemptLog);
  const recentActivity = getRecentActivity(attemptLog);

  const sortedExamHistory = [...examHistory].sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1));
  // Chart wants oldest-first, and only the same recent slice the list
  // below shows, so the two stay in sync.
  const trendAttempts = [...sortedExamHistory.slice(0, 10)].reverse();

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
      contentContainerStyle={[styles.listContent, { paddingTop: 16 + insets.top }]}
      data={chapters}
      keyExtractor={(item) => item.id}
      renderItem={renderChapter}
      ListHeaderComponent={
        <View>
          <Text variant="headlineSmall" style={styles.header}>
            📊 {t("progress.title")}
          </Text>

          <Card mode="outlined" style={styles.streakCard}>
            <Card.Content style={styles.streakCardContent}>
              <MaterialCommunityIcons
                name="fire"
                size={28}
                color={currentStreak > 0 ? theme.colors.tertiary : theme.colors.onSurfaceVariant}
              />
              <View style={styles.streakTextBlock}>
                <Text variant="titleMedium">
                  {currentStreak > 0 ? t("progress.streakDays", { count: currentStreak }) : t("progress.streakZero")}
                </Text>
                <View style={styles.streakDaysRow}>
                  {recentActivity.map((active, index) => (
                    <View
                      key={index}
                      style={[
                        styles.streakDot,
                        { backgroundColor: active ? theme.colors.tertiary : theme.colors.surfaceVariant },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </Card.Content>
          </Card>

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
              color={success}
            />
            <StatPill
              icon="bookmark"
              label={t("progress.bookmarksLabel")}
              value={String(bookmarkedQuestionIds.length)}
              color={theme.colors.tertiary}
              onPress={() => router.push("/bookmarks")}
            />
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            🎯 {t("progress.accuracyByChapterTitle")}
          </Text>
          {!hasLoggedAttempts ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              {t("progress.accuracyEmpty")}
            </Text>
          ) : (
            chapters.map((chapter) => {
              const visual = getChapterVisual(chapter.id);
              const stat = chapterAccuracy[chapter.id];
              return (
                <Card mode="outlined" style={styles.chapterCard} key={chapter.id}>
                  <Card.Content style={styles.chapterCardContent}>
                    <View style={[styles.chapterIconCircle, { backgroundColor: `${visual.color}1A` }]}>
                      <MaterialCommunityIcons name={visual.icon as any} size={20} color={visual.color} />
                    </View>
                    <View style={styles.chapterTextBlock}>
                      <Text variant="bodyMedium">
                        {visual.emoji} {getChapterTitle(chapter, language)}
                      </Text>
                      {stat ? (
                        <ProgressBar progress={stat.accuracyPercent / 100} color={visual.color} style={styles.progressBar} />
                      ) : (
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {t("progress.notAttemptedYet")}
                        </Text>
                      )}
                    </View>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {stat ? `${stat.accuracyPercent}%` : "—"}
                    </Text>
                  </Card.Content>
                </Card>
              );
            })
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            🔍 {t("progress.focusAreasTitle")}
          </Text>
          {focusAreas.length === 0 ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
              {t("progress.focusAreasEmpty")}
            </Text>
          ) : (
            focusAreas.map((area) => (
              <Card
                key={area.tag}
                mode="outlined"
                style={styles.focusAreaCard}
                onPress={() => router.push({ pathname: "/practice", params: { tag: area.tag } })}
              >
                <Card.Content style={styles.focusAreaCardContent}>
                  <Text variant="bodyMedium" style={styles.focusAreaLabel} numberOfLines={1}>
                    {humanizeTag(area.tag)}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.error }}>
                    {area.accuracyPercent}% · {area.correct}/{area.attempts}
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}

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
            <>
              <ExamTrendChart attempts={trendAttempts} />
              <View style={styles.trendLegendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.colors.tertiary }]} />
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {t("progress.examPassed")}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {t("progress.examFailed")}
                  </Text>
                </View>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t("progress.examTrendPassMark", { percent: Math.round(EXAM_PASS_THRESHOLD * 100) })}
                </Text>
              </View>
              {sortedExamHistory.slice(0, 10).map((attempt, index) => (
                <Card key={`${attempt.dateIso}-${index}`} mode="outlined" style={styles.examCard}>
                  <Card.Content style={styles.examCardContent}>
                    <MaterialCommunityIcons
                      name={attempt.passed ? "trophy" : "close-circle-outline"}
                      size={22}
                      color={attempt.passed ? theme.colors.tertiary : theme.colors.error}
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
                      style={{ backgroundColor: attempt.passed ? successContainer : theme.colors.errorContainer }}
                      textStyle={{ color: attempt.passed ? success : theme.colors.error }}
                    >
                      {attempt.passed ? `🎉 ${t("progress.examPassed")}` : `📚 ${t("progress.examFailed")}`}
                    </Chip>
                  </Card.Content>
                </Card>
              ))}
            </>
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
  focusAreaCard: { marginBottom: 8 },
  focusAreaCardContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  focusAreaLabel: { flex: 1 },
  streakCard: { marginBottom: 16 },
  streakCardContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  streakTextBlock: { flex: 1, gap: 6 },
  streakDaysRow: { flexDirection: "row", gap: 6 },
  streakDot: { width: 10, height: 10, borderRadius: 5 },
  trendLegendRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8, marginBottom: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
});
