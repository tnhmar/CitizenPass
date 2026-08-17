import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Card, Divider, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { NavCard } from "../../src/components/NavCard";
import { useProgressStore } from "../../src/store/useProgressStore";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const practiceStats = useProgressStore((state) => state.practiceStats);
  const chapterProgress = useProgressStore((state) => state.chapterProgress);
  const bookmarkedQuestionIds = useProgressStore((state) => state.bookmarkedQuestionIds);

  const chaptersStartedCount = Object.keys(chapterProgress).length;
  const hasAttempts = practiceStats.totalAttempts > 0;
  const accuracyPercent = hasAttempts
    ? Math.round((practiceStats.totalCorrect / practiceStats.totalAttempts) * 100)
    : null;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.appTitle}>
        {t("common.appName")}
      </Text>

      <NavCard
        title={t("home.continueStudying")}
        description={t("home.continueStudyingDescription")}
        onPress={() => router.push("/study")}
      />
      <NavCard
        title={t("home.practice")}
        description={t("home.practiceDescription")}
        onPress={() => router.push("/practice")}
      />
      <NavCard
        title={t("home.simulatedExam")}
        description={t("home.simulatedExamDescription")}
        onPress={() => router.push("/exam")}
      />
      <NavCard
        title={t("home.progress")}
        description={t("home.progressDescription")}
        onPress={() => router.push("/progress")}
      />
      <NavCard
        title={t("home.settings")}
        description={t("home.settingsDescription")}
        onPress={() => router.push("/settings")}
      />

      <Divider style={styles.divider} />

      <Card mode="outlined">
        <Card.Content>
          <Text variant="titleMedium" style={styles.progressTitle}>
            {t("home.yourProgress")}
          </Text>

          {hasAttempts ? (
            <View style={styles.statRow}>
              <Text variant="bodyMedium">{t("home.practiceAccuracy")}</Text>
              <Text variant="bodyMedium">{accuracyPercent}%</Text>
            </View>
          ) : (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t("home.noAttemptsYet")}
            </Text>
          )}

          <View style={styles.statRow}>
            <Text variant="bodyMedium">{t("home.practiceAttempts")}</Text>
            <Text variant="bodyMedium">{practiceStats.totalAttempts}</Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyMedium">{t("home.chaptersStarted")}</Text>
            <Text variant="bodyMedium">{chaptersStartedCount}</Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyMedium">{t("home.bookmarks")}</Text>
            <Text variant="bodyMedium">{bookmarkedQuestionIds.length}</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  appTitle: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  progressTitle: {
    marginBottom: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
});
