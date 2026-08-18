import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Button, Card, IconButton, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import { drawRandomQuestions } from "../../src/data/questionLoader";
import { SourceCitationCard } from "../../src/components/SourceCitationCard";
import type { Question } from "../../src/types";

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function PracticeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const language = useSettingsStore((state) => state.language);
  const bookmarkedQuestionIds = useProgressStore((state) => state.bookmarkedQuestionIds);
  const toggleBookmark = useProgressStore((state) => state.toggleBookmark);
  const recordPracticeAnswer = useProgressStore((state) => state.recordPracticeAnswer);
  const totalAttempts = useProgressStore((state) => state.practiceStats.totalAttempts);

  const [current, setCurrent] = useState<Question | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const drawNext = () => {
    const [next] = drawRandomQuestions(1, recentIds);
    if (next) {
      setRecentIds((prev) => [...prev, next.id].slice(-20));
    }
    setCurrent(next ?? null);
    setSelectedIndex(null);
  };

  useEffect(() => {
    drawNext();
    // Runs once on mount to draw the first question.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const localized = useMemo(() => (current ? current[language] : null), [current, language]);
  const isBookmarked = current ? bookmarkedQuestionIds.includes(current.id) : false;
  const hasAnswered = selectedIndex !== null;

  const handleSelect = (index: number) => {
    if (hasAnswered || !current || !localized) return;
    setSelectedIndex(index);
    void recordPracticeAnswer(current.id, index === localized.correctIndex);
  };

  if (!current || !localized) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium">{t("practice.title")}</Text>
      </View>
    );
  }

  const isCorrect = selectedIndex === localized.correctIndex;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          ✏️ {t("practice.title")}
        </Text>
        <View style={[styles.countBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
          <MaterialCommunityIcons name="counter" size={14} color={theme.colors.secondary} />
          <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
            {totalAttempts}
          </Text>
        </View>
        <IconButton
          icon={isBookmarked ? "bookmark" : "bookmark-outline"}
          iconColor={isBookmarked ? theme.colors.primary : theme.colors.onSurfaceVariant}
          onPress={() => toggleBookmark(current.id)}
          accessibilityLabel="Toggle bookmark"
        />
      </View>

      <Card mode="elevated" style={styles.questionCard}>
        <Card.Content>
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={20}
            color={theme.colors.primary}
            style={styles.questionIcon}
          />
          <Text variant="titleMedium">{localized.question}</Text>
        </Card.Content>
      </Card>

      {localized.options.map((option, index) => {
        const isCorrectOption = index === localized.correctIndex;
        const isSelected = index === selectedIndex;
        let mode: "contained" | "outlined" = "outlined";
        let buttonColor: string | undefined;
        let icon: string | undefined;

        if (hasAnswered) {
          if (isCorrectOption) {
            mode = "contained";
            buttonColor = theme.colors.primary;
            icon = "check-circle";
          } else if (isSelected) {
            mode = "contained";
            buttonColor = theme.colors.error;
            icon = "close-circle";
          }
        }

        return (
          <Button
            key={index}
            mode={mode}
            buttonColor={buttonColor}
            icon={icon}
            onPress={() => handleSelect(index)}
            disabled={hasAnswered}
            style={styles.optionButton}
            contentStyle={styles.optionButtonContent}
          >
            {OPTION_LETTERS[index]}. {option}
          </Button>
        );
      })}

      {hasAnswered ? (
        <>
          <View
            style={[
              styles.feedbackBanner,
              { backgroundColor: isCorrect ? theme.colors.primaryContainer : theme.colors.errorContainer },
            ]}
          >
            <MaterialCommunityIcons
              name={isCorrect ? "check-circle" : "close-circle"}
              size={20}
              color={isCorrect ? theme.colors.primary : theme.colors.error}
            />
            <Text variant="titleMedium" style={{ color: isCorrect ? theme.colors.primary : theme.colors.error }}>
              {isCorrect ? `✅ ${t("practice.correct")}` : `❌ ${t("practice.incorrect")}`}
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.explanation}>
            💡 {localized.explanation}
          </Text>
          <SourceCitationCard source={localized.source} />
          <Button mode="contained" icon="arrow-right-circle" onPress={drawNext} style={styles.nextButton}>
            {t("practice.nextQuestion")}
          </Button>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { flex: 1 },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  questionCard: { marginVertical: 16 },
  questionIcon: { marginBottom: 8 },
  optionButton: { marginBottom: 10 },
  optionButtonContent: { justifyContent: "flex-start" },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
  },
  explanation: { marginTop: 12, marginBottom: 4 },
  nextButton: { marginTop: 16, marginBottom: 32 },
});
