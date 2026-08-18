import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Card, Divider, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { NavCard } from "../../src/components/NavCard";
import { StatPill } from "../../src/components/StatPill";
import { useProgressStore } from "../../src/store/useProgressStore";
import { getChapterList } from "../../src/data/contentLoader";

type GreetingKey = "home.greetingMorning" | "home.greetingAfternoon" | "home.greetingEvening";

function getGreeting(): { key: GreetingKey; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { key: "home.greetingMorning", emoji: "☀️" };
  if (hour < 18) return { key: "home.greetingAfternoon", emoji: "🌤️" };
  return { key: "home.greetingEvening", emoji: "🌙" };
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const practiceStats = useProgressStore((state) => state.practiceStats);
  const chapterProgress = useProgressStore((state) => state.chapterProgress);
  const bookmarkedQuestionIds = useProgressStore((state) => state.bookmarkedQuestionIds);

  const totalChapters = getChapterList().length;
  const chaptersStartedCount = Object.keys(chapterProgress).length;
  const hasAttempts = practiceStats.totalAttempts > 0;
  const accuracyPercent = hasAttempts
    ? Math.round((practiceStats.totalCorrect / practiceStats.totalAttempts) * 100)
    : 0;
  const greeting = getGreeting();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.brand}>
        🍁 {t("common.appName")}
      </Text>
      <Text variant="titleMedium" style={styles.greeting}>
        {greeting.emoji} {t(greeting.key)}
      </Text>

      <Card mode="elevated" style={[styles.heroCard, { backgroundColor: theme.colors.primaryContainer }]}>
        <Card.Content>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            🎯 {t("home.yourProgress")}
          </Text>
          <Text variant="displaySmall" style={styles.accuracyValue}>
            {hasAttempts ? `${accuracyPercent}%` : "—"}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {hasAttempts ? t("home.practiceAccuracy") : t("home.noAttemptsYet")}
          </Text>

          <View style={styles.statsRow}>
            <StatPill
              icon="pencil-outline"
              label={t("home.practiceAttempts")}
              value={String(practiceStats.totalAttempts)}
            />
            <StatPill
              icon="book-open-page-variant"
              label={t("home.chaptersStarted")}
              value={`${chaptersStartedCount}/${totalChapters}`}
            />
            <StatPill
              icon="bookmark"
              label={t("home.bookmarks")}
              value={String(bookmarkedQuestionIds.length)}
              onPress={() => router.push("/bookmarks")}
            />
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        🚀 {t("home.getStarted")}
      </Text>

      <NavCard
        title={t("home.continueStudying")}
        description={t("home.continueStudyingDescription")}
        icon="book-open-variant"
        emoji="📘"
        color={theme.colors.secondary}
        onPress={() => router.push("/study")}
      />
      <NavCard
        title={t("home.practice")}
        description={t("home.practiceDescription")}
        icon="pencil"
        emoji="✏️"
        color={theme.colors.primary}
        onPress={() => router.push("/practice")}
      />
      <NavCard
        title={t("home.simulatedExam")}
        description={t("home.simulatedExamDescription")}
        icon="timer-outline"
        emoji="⏱️"
        color="#C77F1A"
        onPress={() => router.push("/exam")}
      />
      <NavCard
        title={t("home.progress")}
        description={t("home.progressDescription")}
        icon="chart-donut"
        emoji="📊"
        color="#1E8E5A"
        onPress={() => router.push("/progress")}
      />
      <NavCard
        title={t("home.settings")}
        description={t("home.settingsDescription")}
        icon="cog-outline"
        emoji="⚙️"
        color={theme.colors.onSurfaceVariant}
        onPress={() => router.push("/settings")}
      />

      <Divider style={styles.divider} />

      <Text variant="bodySmall" style={[styles.disclaimer, { color: theme.colors.onSurfaceVariant }]}>
        ℹ️ {t("common.disclaimer")}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  brand: { fontWeight: "700", marginBottom: 4 },
  greeting: { marginBottom: 16 },
  heroCard: { marginBottom: 20 },
  accuracyValue: { marginTop: 4, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  sectionTitle: { marginBottom: 12 },
  divider: { marginVertical: 16 },
  disclaimer: { opacity: 0.8, marginBottom: 8 },
});
