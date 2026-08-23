import { useRouter } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { Text, Card, Button, Chip, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useExamStore } from "../../src/store/useExamStore";
import { useSemanticColors } from "../../src/theme/useSemanticColors";
import { SourceCitationCard } from "../../src/components/SourceCitationCard";
import { ArabicFlipCard } from "../../src/components/ArabicFlipCard";
import type { Question } from "../../src/types";

export default function ExamResultsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { success, successContainer } = useSemanticColors();
  const language = useSettingsStore((state) => state.language);
  const arabicHelpEnabled = useSettingsStore((state) => state.arabicHelpEnabled);
  const status = useExamStore((state) => state.status);
  const questions = useExamStore((state) => state.questions);
  const answers = useExamStore((state) => state.answers);
  const result = useExamStore((state) => state.result);
  const resetExam = useExamStore((state) => state.resetExam);

  if (status !== "submitted" || !result) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium">{t("exam.noResults")}</Text>
        <Button mode="contained" icon="timer-outline" onPress={() => router.replace("/exam")} style={styles.backButton}>
          {t("exam.goToExam")}
        </Button>
      </View>
    );
  }

  const handleDone = () => {
    resetExam();
    router.replace("/");
  };

  const scorePercent = Math.round((result.correct / result.total) * 100);

  const renderItem = ({ item, index }: { item: Question; index: number }) => {
    const localized = item[language];
    const selectedIndex = answers[item.id];
    const wasAnswered = selectedIndex !== undefined;
    const wasCorrect = selectedIndex === localized.correctIndex;

    return (
      <ArabicFlipCard
        enabled={arabicHelpEnabled}
        arabic={item.ar}
        showExplanation
        front={
          <Card mode="outlined" style={styles.reviewCard}>
            <Card.Content>
              <View style={styles.reviewHeaderRow}>
                <MaterialCommunityIcons
                  name={wasCorrect ? "check-circle" : wasAnswered ? "close-circle" : "minus-circle-outline"}
                  size={18}
                  color={wasCorrect ? success : wasAnswered ? theme.colors.error : theme.colors.onSurfaceVariant}
                />
                <Text variant="titleSmall">
                  {t("exam.questionOf", { current: index + 1, total: questions.length })} —{" "}
                  {wasCorrect ? t("exam.correct") : wasAnswered ? t("exam.incorrect") : t("exam.notAnswered")}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.reviewQuestion}>
                {localized.question}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t("exam.yourAnswer")}: {wasAnswered ? localized.options[selectedIndex] : "—"}
              </Text>
              <Text variant="bodySmall" style={{ color: success }}>
                {t("exam.correctAnswer")}: {localized.options[localized.correctIndex]}
              </Text>
              <Text variant="bodyMedium" style={styles.reviewExplanation}>
                💡 {localized.explanation}
              </Text>
              <SourceCitationCard source={localized.source} />
            </Card.Content>
          </Card>
        }
      />
    );
  };

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.listContent}
      data={questions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <Card
          mode="elevated"
          style={[styles.scoreCard, { backgroundColor: result.passed ? successContainer : theme.colors.errorContainer }]}
        >
          <Card.Content style={styles.scoreContent}>
            <Text variant="displaySmall">{result.passed ? "🎉" : "📚"}</Text>
            <Text variant="headlineMedium">
              {result.correct} / {result.total} ({scorePercent}%)
            </Text>
            <Chip
              icon={result.passed ? "trophy" : "refresh"}
              style={{ backgroundColor: "transparent" }}
              textStyle={{ color: result.passed ? success : theme.colors.error, fontWeight: "700" }}
            >
              {result.passed ? t("exam.passed") : t("exam.notPassed")}
            </Chip>
          </Card.Content>
        </Card>
      }
      ListFooterComponent={
        <Button mode="contained" icon="home" onPress={handleDone} style={styles.doneButton}>
          {t("exam.done")}
        </Button>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16, gap: 16 },
  backButton: { marginTop: 8 },
  scoreCard: { marginBottom: 16 },
  scoreContent: { alignItems: "center", gap: 8 },
  reviewCard: { marginBottom: 12 },
  reviewHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  reviewQuestion: { marginTop: 8, marginBottom: 8 },
  reviewExplanation: { marginTop: 8 },
  doneButton: { marginTop: 8, marginBottom: 32 },
});
