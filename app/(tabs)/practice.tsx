import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Button, Card, IconButton, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import { drawRandomQuestions } from "../../src/data/questionLoader";
import { SourceCitationCard } from "../../src/components/SourceCitationCard";
import type { Question } from "../../src/types";

export default function PracticeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const language = useSettingsStore((state) => state.language);
  const bookmarkedQuestionIds = useProgressStore((state) => state.bookmarkedQuestionIds);
  const toggleBookmark = useProgressStore((state) => state.toggleBookmark);
  const recordPracticeAnswer = useProgressStore((state) => state.recordPracticeAnswer);

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

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {t("practice.title")}
        </Text>
        <IconButton
          icon={isBookmarked ? "bookmark" : "bookmark-outline"}
          onPress={() => toggleBookmark(current.id)}
          accessibilityLabel="Toggle bookmark"
        />
      </View>

      <Card mode="elevated" style={styles.questionCard}>
        <Card.Content>
          <Text variant="titleMedium">{localized.question}</Text>
        </Card.Content>
      </Card>

      {localized.options.map((option, index) => {
        const isCorrectOption = index === localized.correctIndex;
        const isSelected = index === selectedIndex;
        let mode: "contained" | "outlined" = "outlined";
        let buttonColor: string | undefined;

        if (hasAnswered) {
          if (isCorrectOption) {
            mode = "contained";
            buttonColor = theme.colors.primary;
          } else if (isSelected) {
            mode = "contained";
            buttonColor = theme.colors.error;
          }
        }

        return (
          <Button
            key={index}
            mode={mode}
            buttonColor={buttonColor}
            onPress={() => handleSelect(index)}
            disabled={hasAnswered}
            style={styles.optionButton}
            contentStyle={styles.optionButtonContent}
          >
            {option}
          </Button>
        );
      })}

      {hasAnswered ? (
        <>
          <Text
            variant="titleMedium"
            style={[
              styles.feedback,
              { color: selectedIndex === localized.correctIndex ? theme.colors.primary : theme.colors.error },
            ]}
          >
            {selectedIndex === localized.correctIndex ? "Correct" : "Incorrect"}
          </Text>
          <Text variant="bodyMedium" style={styles.explanation}>
            {localized.explanation}
          </Text>
          <SourceCitationCard source={localized.source} />
          <Button mode="contained" onPress={drawNext} style={styles.nextButton}>
            Next question
          </Button>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
  },
  questionCard: {
    marginVertical: 16,
  },
  optionButton: {
    marginBottom: 10,
  },
  optionButtonContent: {
    justifyContent: "flex-start",
  },
  feedback: {
    marginTop: 16,
  },
  explanation: {
    marginTop: 8,
    marginBottom: 4,
  },
  nextButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
