import { useEffect, useMemo, useState } from "react";
import { AppState, Alert, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Button, Card, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import {
  useExamStore,
  getRemainingMs,
  formatRemainingTime,
  EXAM_QUESTION_COUNT,
} from "../../src/store/useExamStore";

const OPTION_LETTERS = ["A", "B", "C", "D"];

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
  // The tick value itself is intentionally unused: each tick causes this
  // component to re-render and `examState` below to be recomputed with a
  // new object reference, which is what actually triggers getRemainingMs
  // to re-run via the useMemo dependency.
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    if (status !== "in-progress") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status]);

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
  const remainingMs = useMemo(() => getRemainingMs(examState), [examState]);

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
        <Text variant="headlineSmall" style={styles.title}>
          ⏱️ {t("exam.title")}
        </Text>
        <Card mode="elevated" style={[styles.introCard, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Card.Content style={{ gap: 12 }}>
            <View style={styles.ruleRow}>
              <MaterialCommunityIcons name="help-circle-outline" size={20} color={theme.colors.secondary} />
              <Text variant="bodyMedium" style={styles.ruleText}>
                {EXAM_QUESTION_COUNT} {t("exam.questionsLabel")}
              </Text>
            </View>
            <View style={styles.ruleRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.secondary} />
              <Text variant="bodyMedium" style={styles.ruleText}>
                {t("exam.durationLabel")}
              </Text>
            </View>
            <View style={styles.ruleRow}>
              <MaterialCommunityIcons name="trophy-outline" size={20} color={theme.colors.secondary} />
              <Text variant="bodyMedium" style={styles.ruleText}>
                {t("exam.passLabel")}
              </Text>
            </View>
            <View style={styles.ruleRow}>
              <MaterialCommunityIcons name="eye-off-outline" size={20} color={theme.colors.secondary} />
              <Text variant="bodyMedium" style={styles.ruleText}>
                {t("exam.noFeedbackLabel")}
              </Text>
            </View>
          </Card.Content>
        </Card>
        <Button mode="contained" icon="play-circle" onPress={startExam} style={styles.startButton}>
          {t("exam.startExam")}
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
  const answeredCount = Object.keys(answers).length;
  const isLowTime = remainingMs < 5 * 60 * 1000;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium">{t("exam.questionOf", { current: currentIndex + 1, total: questions.length })}</Text>
        <View
          style={[
            styles.timerBadge,
            { backgroundColor: isLowTime ? theme.colors.errorContainer : theme.colors.secondaryContainer },
          ]}
        >
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={isLowTime ? theme.colors.error : theme.colors.secondary}
          />
          <Text variant="titleSmall" style={{ color: isLowTime ? theme.colors.error : theme.colors.secondary }}>
            {formatRemainingTime(remainingMs)}
          </Text>
        </View>
      </View>

      <View style={styles.progressDots}>
        {questions.map((q, index) => (
          <View
            key={q.id}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex
                    ? theme.colors.primary
                    : answers[q.id] !== undefined
                      ? theme.colors.secondary
                      : theme.colors.surfaceVariant,
              },
            ]}
          />
        ))}
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
          {OPTION_LETTERS[index]}. {option}
        </Button>
      ))}

      <View style={styles.navRow}>
        <Button
          icon="chevron-left"
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        >
          {t("exam.previous")}
        </Button>
        {isLastQuestion ? (
          <Button
            mode="contained"
            icon="check-circle"
            onPress={() =>
              Alert.alert(t("exam.submitConfirmTitle"), t("exam.submitConfirmBody"), [
                { text: t("exam.cancelLabel"), style: "cancel" },
                { text: t("exam.submitLabel"), style: "destructive", onPress: finishExam },
              ])
            }
          >
            {t("exam.submitExam")}
          </Button>
        ) : (
          <Button
            icon="chevron-right"
            contentStyle={{ flexDirection: "row-reverse" }}
            onPress={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          >
            {t("exam.next")}
          </Button>
        )}
      </View>

      <Text variant="bodySmall" style={[styles.answeredCount, { color: theme.colors.onSurfaceVariant }]}>
        📝 {answeredCount}/{questions.length} {t("exam.answeredLabel")}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { marginBottom: 16 },
  introCard: { marginBottom: 24 },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ruleText: { flex: 1 },
  startButton: { marginBottom: 32 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressDots: { flexDirection: "row", gap: 4, marginBottom: 16, flexWrap: "wrap" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  questionCard: { marginBottom: 16 },
  optionButton: { marginBottom: 10 },
  optionButtonContent: { justifyContent: "flex-start" },
  navRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  answeredCount: { textAlign: "center", marginTop: 16, marginBottom: 32 },
});
