import { useEffect, useMemo, useState } from "react";
import { AppState, Alert, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Button, Card, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import {
  useExamStore,
  getRemainingMs,
  formatRemainingTime,
  EXAM_QUESTION_COUNT,
} from "../../src/store/useExamStore";

export default function ExamIndexScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const language = useSettingsStore((state) => state.language);
  const recordExamAttempt = useProgressStore((state) => state.recordExamAttempt);

  const status = useExamStore((state) => state.status);
  const questions = useExamStore((state) => state.questions);
  const answers = useExamStore((state) => state.answers);
  const startExam = useExamStore((state) => state.startExam);
  const selectAnswer = useExamStore((state) => state.selectAnswer);
  const pauseExam = useExamStore((state) => state.pause);
  const resumeExam = useExamStore((state) => state.resume);
  const submitExam = useExamStore((state) => state.submitExam);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [now, setNow] = useState(Date.now());

  // Tick every second while the exam is in progress, purely to force a
  // re-render for the countdown display; the actual remaining time is
  // always recomputed from timestamps, never from a naive decrementing
  // counter, so it stays correct across backgrounding.
  useEffect(() => {
    if (status !== "in-progress") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Pause the timer while the app is backgrounded and resume it when the
  // app returns to the foreground, per the exam rules.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        pauseExam();
      } else if (nextState === "active") {
        resumeExam();
      }
    });
    return () => subscription.remove();
  }, [pauseExam, resumeExam]);

  const examState = useExamStore((state) => ({
    startTimeMs: state.startTimeMs,
    pausedMs: state.pausedMs,
    pausedAt: state.pausedAt,
  }));
  const remainingMs = useMemo(() => getRemainingMs(examState), [examState, now]);

  const finishExam = () => {
    const result = submitExam();
    void recordExamAttempt({
      dateIso: new Date().toISOString(),
      score: result.correct,
      total: result.total,
      passed: result.passed,
    });
    router.push("/exam/results");
  };

  useEffect(() => {
    if (status === "in-progress" && remainingMs <= 0) {
      finishExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, status]);

  if (status === "idle") {
    return (
      <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          {t("exam.title")}
        </Text>
        <Card mode="outlined" style={styles.introCard}>
          <Card.Content>
            <Text variant="bodyMedium">
              {EXAM_QUESTION_COUNT} questions, 45 minutes, pass at 15/20 (75%). Once started, questions are
              presented one at a time without immediate feedback; you will see your full results and every
              correct answer with its official source after you submit.
            </Text>
          </Card.Content>
        </Card>
        <Button mode="contained" onPress={startExam} style={styles.startButton}>
          Start Exam
        </Button>
      </ScrollView>
    );
  }

  const current = questions[currentIndex];
  const localized = current ? current[language] : null;
  const isLastQuestion = currentIndex === questions.length - 1;

  if (!current || !localized) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium">{t("exam.title")}</Text>
      </View>
    );
  }

  const selectedIndex = answers[current.id];

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium">
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <Text variant="titleMedium" style={{ color: remainingMs < 5 * 60 * 1000 ? theme.colors.error : undefined }}>
          {formatRemainingTime(remainingMs)}
        </Text>
      </View>

      <Card mode="elevated" style={styles.questionCard}>
        <Card.Content>
          <Text variant="titleMedium">{localized.question}</Text>
        </Card.Content>
      </Card>

      {localized.options.map((option, index) => (
        <Button
          key={index}
          mode={selectedIndex === index ? "contained" : "outlined"}
          onPress={() => selectAnswer(current.id, index)}
          style={styles.optionButton}
          contentStyle={styles.optionButtonContent}
        >
          {option}
        </Button>
      ))}

      <View style={styles.navRow}>
        <Button disabled={currentIndex === 0} onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}>
          Previous
        </Button>
        {isLastQuestion ? (
          <Button
            mode="contained"
            onPress={() =>
              Alert.alert("Submit exam?", "You will not be able to change your answers after submitting.", [
                { text: "Cancel", style: "cancel" },
                { text: "Submit", style: "destructive", onPress: finishExam },
              ])
            }
          >
            Submit Exam
          </Button>
        ) : (
          <Button onPress={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}>Next</Button>
        )}
      </View>
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
  title: {
    marginBottom: 16,
  },
  introCard: {
    marginBottom: 24,
  },
  startButton: {
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  questionCard: {
    marginBottom: 16,
  },
  optionButton: {
    marginBottom: 10,
  },
  optionButtonContent: {
    justifyContent: "flex-start",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 32,
  },
});
