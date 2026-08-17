import { useRouter } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { Text, Card, Button, useTheme } from "react-native-paper";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useExamStore } from "../../src/store/useExamStore";
import { SourceCitationCard } from "../../src/components/SourceCitationCard";
import type { Question } from "../../src/types";

export default function ExamResultsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const language = useSettingsStore((state) => state.language);
  const status = useExamStore((state) => state.status);
  const questions = useExamStore((state) => state.questions);
  const answers = useExamStore((state) => state.answers);
  const result = useExamStore((state) => state.result);
  const resetExam = useExamStore((state) => state.resetExam);

  if (status !== "submitted" || !result) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium">No exam results to show yet.</Text>
        <Button mode="contained" onPress={() => router.replace("/exam")} style={styles.backButton}>
          Go to Simulated Exam
        </Button>
      </View>
    );
  }

  const handleDone = () => {
    resetExam();
    router.replace("/");
  };

  const renderItem = ({ item, index }: { item: Question; index: number }) => {
    const localized = item[language];
    const selectedIndex = answers[item.id];
    const wasAnswered = selectedIndex !== undefined;
    const wasCorrect = selectedIndex === localized.correctIndex;

    return (
      <Card mode="outlined" style={styles.reviewCard}>
        <Card.Content>
          <Text variant="titleSmall">
            Question {index + 1} — {wasCorrect ? "Correct" : wasAnswered ? "Incorrect" : "Not answered"}
          </Text>
          <Text variant="bodyMedium" style={styles.reviewQuestion}>
            {localized.question}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Your answer: {wasAnswered ? localized.options[selectedIndex] : "—"}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
            Correct answer: {localized.options[localized.correctIndex]}
          </Text>
          <Text variant="bodyMedium" style={styles.reviewExplanation}>
            {localized.explanation}
          </Text>
          <SourceCitationCard source={localized.source} />
        </Card.Content>
      </Card>
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
        <Card mode="elevated" style={[styles.scoreCard, { backgroundColor: result.passed ? undefined : undefined }]}>
          <Card.Content>
            <Text variant="headlineMedium">
              {result.correct} / {result.total}
            </Text>
            <Text
              variant="titleLarge"
              style={{ color: result.passed ? theme.colors.primary : theme.colors.error }}
            >
              {result.passed ? "PASSED" : "NOT PASSED"}
            </Text>
          </Card.Content>
        </Card>
      }
      ListFooterComponent={
        <Button mode="contained" onPress={handleDone} style={styles.doneButton}>
          Done
        </Button>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 16,
  },
  backButton: {
    marginTop: 8,
  },
  scoreCard: {
    marginBottom: 16,
  },
  reviewCard: {
    marginBottom: 12,
  },
  reviewQuestion: {
    marginTop: 8,
    marginBottom: 8,
  },
  reviewExplanation: {
    marginTop: 8,
  },
  doneButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});
