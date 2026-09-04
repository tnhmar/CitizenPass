import { useRouter } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { Text, Card, Button, Chip, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useExamStore } from "../../src/store/useExamStore";
import { useSemanticColors } from "../../src/theme/useSemanticColors";
import { useResponsive } from "../../src/hooks/useResponsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SourceCitationCard } from "../../src/components/SourceCitationCard";
import { ArabicFlipCard } from "../../src/components/ArabicFlipCard";
import type { Question } from "../../src/types";

// MD3 type-scale base sizes, used to scale text on tablets - see
// useResponsive() and docs/theme-navigation-responsive-overhaul.md.
const MD3_SIZE = { titleSmall: 14, bodyMedium: 14, bodySmall: 12, headlineMedium: 28, displaySmall: 36 } as const;

export default function ExamResultsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { success, successContainer } = useSemanticColors();
  const { scale, contentMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const language = useSettingsStore((state) => state.language);
  const arabicHelpEnabled = useSettingsStore((state) => state.arabicHelpEnabled);
  const status = useExamStore((state) => state.status);
  const questions = useExamStore((state) => state.questions);
  const answers = useExamStore((state) => state.answers);
  const result = useExamStore((state) => state.result);
  const resetExam = useExamStore((state) => state.resetExam);

  const wideItemStyle = contentMaxWidth
    ? { maxWidth: contentMaxWidth, alignSelf: "center" as const, width: "100%" as const }
    : null;

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
          <Card mode="outlined" style={[styles.reviewCard, wideItemStyle]}>
            <Card.Content>
              <View style={styles.reviewHeaderRow}>
                <MaterialCommunityIcons
                  name={wasCorrect ? "check-circle" : wasAnswered ? "close-circle" : "minus-circle-outline"}
                  size={18 * scale}
                  color={wasCorrect ? success : wasAnswered ? theme.colors.error : theme.colors.onSurfaceVariant}
                />
                <Text variant="titleSmall" style={{ fontSize: MD3_SIZE.titleSmall * scale, flex: 1 }}>
                  {t("exam.questionOf", { current: index + 1, total: questions.length })} —{" "}
                  {wasCorrect ? t("exam.correct") : wasAnswered ? t("exam.incorrect") : t("exam.notAnswered")}
                </Text>
              </View>
              <Text
                variant="bodyMedium"
                style={[styles.reviewQuestion, { fontSize: MD3_SIZE.bodyMedium * scale, lineHeight: 20 * scale }]}
              >
                {localized.question}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, fontSize: MD3_SIZE.bodySmall * scale }}
              >
                {t("exam.yourAnswer")}: {wasAnswered ? localized.options[selectedIndex] : "—"}
              </Text>
              <Text variant="bodySmall" style={{ color: success, fontSize: MD3_SIZE.bodySmall * scale }}>
                {t("exam.correctAnswer")}: {localized.options[localized.correctIndex]}
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.reviewExplanation, { fontSize: MD3_SIZE.bodyMedium * scale, lineHeight: 20 * scale }]}
              >
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
      contentContainerStyle={[styles.listContent, { paddingTop: 16 + insets.top }]}
      data={questions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <Card
          mode="elevated"
          style={[
            styles.scoreCard,
            { backgroundColor: result.passed ? successContainer : theme.colors.errorContainer },
            wideItemStyle,
          ]}
        >
          <Card.Content style={styles.scoreContent}>
            <Text variant="displaySmall" style={{ fontSize: MD3_SIZE.displaySmall * scale }}>
              {result.passed ? "🎉" : "📚"}
            </Text>
            <Text variant="headlineMedium" style={{ fontSize: MD3_SIZE.headlineMedium * scale }}>
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
        <Button
          mode="contained"
          icon="home"
          onPress={handleDone}
          style={[styles.doneButton, wideItemStyle]}
          contentStyle={{ paddingVertical: scale > 1 ? 6 : 2 }}
          labelStyle={{ fontSize: MD3_SIZE.bodyMedium * scale }}
        >
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
