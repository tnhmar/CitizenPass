import { useEffect, useState } from "react";
import { AppState, Alert, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Button, Card, Divider, IconButton, Menu, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useResponsive } from "../../src/hooks/useResponsive";
import { useExamCountdown } from "../../src/hooks/useExamCountdown";
import { useFinishExam } from "../../src/hooks/useFinishExam";
import { useExamSessionLifecycle } from "../../src/hooks/useExamSessionLifecycle";
import { useLowTimeWarning } from "../../src/hooks/useLowTimeWarning";
import { OptionButton } from "../../src/components/OptionButton";
import { useExamStore, formatRemainingTime, EXAM_QUESTION_COUNT } from "../../src/store/useExamStore";

const OPTION_LETTERS = ["A", "B", "C", "D"];

// MD3 type-scale base sizes, used to scale text on tablets - see
// useResponsive() and docs/theme-navigation-responsive-overhaul.md.
const MD3_SIZE = { headlineSmall: 24, titleMedium: 16, titleSmall: 14, bodyMedium: 14, bodySmall: 12 } as const;

// Intentionally no ArabicFlipCard here. The simulated exam is meant to
// replicate the real test: no translation help, no flipping, no
// arabicHelpEnabled check at all — even if a user has the setting on
// elsewhere, this screen never reads it. Arabic help lives in Practice
// (app/(tabs)/practice.tsx) and in the post-exam review (app/exam/results.tsx).

export default function ExamIndexScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { isTablet, isLandscape, scale, contentMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const language = useSettingsStore((state) => state.language);

  const status = useExamStore((state) => state.status);
  const questions = useExamStore((state) => state.questions);
  const answers = useExamStore((state) => state.answers);
  const optionOrder = useExamStore((state) => state.optionOrder);
  const currentIndex = useExamStore((state) => state.currentIndex);
  const setCurrentIndex = useExamStore((state) => state.setCurrentIndex);
  const markedForReview = useExamStore((state) => state.markedForReview);
  const toggleMarkedForReview = useExamStore((state) => state.toggleMarkedForReview);
  const startExam = useExamStore((state) => state.startExam);
  const restartExam = useExamStore((state) => state.restartExam);
  const selectAnswer = useExamStore((state) => state.selectAnswer);
  const pauseExam = useExamStore((state) => state.pause);
  const resumeExam = useExamStore((state) => state.resume);

  const [menuVisible, setMenuVisible] = useState(false);
  const remainingMs = useExamCountdown();
  const finishExam = useFinishExam();
  useExamSessionLifecycle();
  useLowTimeWarning(remainingMs);

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

  useEffect(() => {
    // Time running out auto-submits immediately - unlike the user's own
    // "Review & Submit"/"Review Answers" paths, there is no review step
    // here on purpose: the 45-minute limit would otherwise be
    // meaningless if reaching it just opened unlimited extra review time.
    if (status === "in-progress" && remainingMs <= 0) {
      finishExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, status]);

  const handleRestartExam = () => {
    setMenuVisible(false);
    Alert.alert(t("exam.restartConfirmTitle"), t("exam.restartConfirmBody"), [
      { text: t("exam.cancelLabel"), style: "cancel" },
      { text: t("exam.restartExam"), style: "destructive", onPress: restartExam },
    ]);
  };

  const handleNewExam = () => {
    setMenuVisible(false);
    Alert.alert(t("exam.newExamConfirmTitle"), t("exam.newExamConfirmBody"), [
      { text: t("exam.cancelLabel"), style: "cancel" },
      { text: t("exam.newExam"), style: "destructive", onPress: startExam },
    ]);
  };

  const handleExitExam = () => {
    setMenuVisible(false);
    // Pausing (rather than resetting) is what makes this resumable: the
    // in-progress session - answers, question index, and now-paused timer
    // - stays intact in the store (and persisted to disk, see
    // useExamStore.ts) until the user comes back to /exam, at which point
    // the mount effect above calls resume().
    pauseExam();
    router.replace("/");
  };

  const contentWrapperStyle = contentMaxWidth
    ? { maxWidth: contentMaxWidth, alignSelf: "center" as const, width: "100%" as const }
    : null;

  if (status === "idle") {
    return (
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: 16 + insets.top }]}
      >
        <View style={contentWrapperStyle}>
          <Text
            variant="headlineSmall"
            style={[styles.title, { fontSize: MD3_SIZE.headlineSmall * scale }]}
          >
            ⏱️ {t("exam.title")}
          </Text>
          <Card mode="elevated" style={[styles.introCard, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Card.Content style={{ gap: 12 * scale }}>
              <View style={styles.ruleRow}>
                <MaterialCommunityIcons name="help-circle-outline" size={20 * scale} color={theme.colors.secondary} />
                <Text variant="bodyMedium" style={[styles.ruleText, { fontSize: MD3_SIZE.bodyMedium * scale }]}>
                  {EXAM_QUESTION_COUNT} {t("exam.questionsLabel")}
                </Text>
              </View>
              <View style={styles.ruleRow}>
                <MaterialCommunityIcons name="clock-outline" size={20 * scale} color={theme.colors.secondary} />
                <Text variant="bodyMedium" style={[styles.ruleText, { fontSize: MD3_SIZE.bodyMedium * scale }]}>
                  {t("exam.durationLabel")}
                </Text>
              </View>
              <View style={styles.ruleRow}>
                <MaterialCommunityIcons name="trophy-outline" size={20 * scale} color={theme.colors.secondary} />
                <Text variant="bodyMedium" style={[styles.ruleText, { fontSize: MD3_SIZE.bodyMedium * scale }]}>
                  {t("exam.passLabel")}
                </Text>
              </View>
              <View style={styles.ruleRow}>
                <MaterialCommunityIcons name="eye-off-outline" size={20 * scale} color={theme.colors.secondary} />
                <Text variant="bodyMedium" style={[styles.ruleText, { fontSize: MD3_SIZE.bodyMedium * scale }]}>
                  {t("exam.noFeedbackLabel")}
                </Text>
              </View>
            </Card.Content>
          </Card>
          <Button
            mode="contained"
            icon="play-circle"
            onPress={startExam}
            style={styles.startButton}
            contentStyle={{ paddingVertical: isTablet ? 6 : 2 }}
            labelStyle={{ fontSize: MD3_SIZE.bodyMedium * scale }}
          >
            {t("exam.startExam")}
          </Button>
        </View>
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

  // `order[displayPosition]` gives the canonical option index shown at
  // that position, so the correct answer is not always option A.
  // Answers are stored/scored using the canonical index (see
  // useExamStore.submitExam), so we map canonical <-> display position
  // here purely for rendering and selection.
  const order = optionOrder[current.id] ?? current.en.options.map((_, i) => i);
  const displayedOptions = order.map((canonicalIndex) => localized.options[canonicalIndex]);
  const selectedCanonicalIndex = answers[current.id];
  const selectedDisplayPosition =
    selectedCanonicalIndex !== undefined ? order.indexOf(selectedCanonicalIndex) : undefined;
  const hasAnswered = selectedCanonicalIndex !== undefined;
  const isMarkedForReview = markedForReview[current.id] === true;
  const answeredCount = Object.keys(answers).length;
  const isLowTime = remainingMs < 5 * 60 * 1000;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: 12 + insets.top }]}
    >
      <View style={contentWrapperStyle}>
        <View style={styles.headerRow}>
          {/* Dedicated, always-visible exit affordance (issue: "where is
              the option to cancel the exam" - the overflow menu below
              also has it, but a single tap here is the more discoverable
              path for the single most commonly needed action). */}
          <IconButton
            icon="close"
            size={22 * scale}
            onPress={handleExitExam}
            accessibilityLabel={t("exam.exitExam")}
            style={styles.exitButton}
          />
          <Text
            variant="titleMedium"
            style={[styles.headerTitle, { fontSize: MD3_SIZE.titleMedium * scale }]}
          >
            {t("exam.questionOf", { current: currentIndex + 1, total: questions.length })}
          </Text>
          <View style={styles.headerRight}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={22 * scale}
                  onPress={() => setMenuVisible(true)}
                  accessibilityLabel={t("exam.examOptions")}
                />
              }
            >
              <Menu.Item
                leadingIcon="format-list-checks"
                onPress={() => {
                  setMenuVisible(false);
                  router.push("/exam/review");
                }}
                title={t("exam.reviewAnswers")}
              />
              <Divider />
              <Menu.Item leadingIcon="restart" onPress={handleRestartExam} title={t("exam.restartExam")} />
              <Menu.Item leadingIcon="shuffle-variant" onPress={handleNewExam} title={t("exam.newExam")} />
              <Divider />
              <Menu.Item leadingIcon="exit-to-app" onPress={handleExitExam} title={t("exam.exitExam")} />
            </Menu>
            <View
              style={[
                styles.timerBadge,
                { backgroundColor: isLowTime ? theme.colors.errorContainer : theme.colors.secondaryContainer },
              ]}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={16 * scale}
                color={isLowTime ? theme.colors.error : theme.colors.secondary}
              />
              <Text
                variant="titleSmall"
                style={{
                  color: isLowTime ? theme.colors.error : theme.colors.secondary,
                  fontSize: MD3_SIZE.titleSmall * scale,
                }}
              >
                {formatRemainingTime(remainingMs)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressDots}>
          {questions.map((q, index) => {
            const isCurrent = index === currentIndex;
            const isAnswered = answers[q.id] !== undefined;
            const isMarked = markedForReview[q.id] === true;
            const dotSize = 8 * scale;
            return (
              <View
                key={q.id}
                style={[
                  styles.dot,
                  { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
                  isCurrent
                    ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                    : {
                        // Fill reflects answered status; border adds marked-
                        // for-review as independent information, so a dot
                        // can show both at once (e.g. answered-but-marked).
                        backgroundColor: isAnswered ? theme.colors.secondary : "transparent",
                        borderColor: isMarked
                          ? theme.colors.tertiary
                          : isAnswered
                            ? theme.colors.secondary
                            : theme.colors.outline,
                      },
                ]}
              />
            );
          })}
        </View>

        <Card mode="elevated" style={styles.questionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontSize: MD3_SIZE.titleMedium * scale, lineHeight: 22 * scale }}>
              {localized.question}
            </Text>
          </Card.Content>
        </Card>

        {displayedOptions.map((option, displayPosition) => (
          <OptionButton
            key={displayPosition}
            label={`${OPTION_LETTERS[displayPosition]}. ${option}`}
            mode={selectedDisplayPosition === displayPosition ? "selected" : "outlined"}
            onPress={() => selectAnswer(current.id, order[displayPosition])}
            style={styles.optionButton}
          />
        ))}

        <View style={[styles.navRow, isLandscape && !isTablet ? styles.navRowCompact : null]}>
          <Button
            icon="chevron-left"
            disabled={currentIndex === 0}
            onPress={() => setCurrentIndex(currentIndex - 1)}
            labelStyle={{ fontSize: MD3_SIZE.bodyMedium * scale }}
          >
            {t("exam.previous")}
          </Button>
          <IconButton
            icon={isMarkedForReview ? "flag" : "flag-outline"}
            mode={isMarkedForReview ? "contained-tonal" : "outlined"}
            size={20 * scale}
            onPress={() => toggleMarkedForReview(current.id)}
            accessibilityLabel={t("exam.markForReview")}
            accessibilityState={{ selected: isMarkedForReview }}
          />
          {isLastQuestion ? (
            // Skipping a question is allowed on purpose (see "Next"
            // below) - the real exam this simulates lets you move on and
            // come back. Unlike "Next", reaching the review list from the
            // last question is never gated on answering it: that list is
            // exactly the place stragglers - answered, marked, or neither
            // - get resolved, so it must stay reachable regardless.
            <Button
              mode="contained"
              icon="format-list-checks"
              labelStyle={{ fontSize: MD3_SIZE.bodyMedium * scale }}
              onPress={() => router.push("/exam/review")}
            >
              {t("exam.reviewAndSubmit")}
            </Button>
          ) : (
            <Button
              icon="chevron-right"
              contentStyle={{ flexDirection: "row-reverse" }}
              labelStyle={{ fontSize: MD3_SIZE.bodyMedium * scale }}
              // Bug fix: this used to have no disabled condition at all,
              // so tapping through 20 questions without ever picking an
              // answer was silently possible. Requiring either an answer
              // or an explicit "mark for review" flag means moving on is
              // always a deliberate choice - answer it, or consciously
              // flag it to revisit - never an unnoticed accidental skip.
              disabled={!hasAnswered && !isMarkedForReview}
              onPress={() => setCurrentIndex(currentIndex + 1)}
            >
              {t("exam.next")}
            </Button>
          )}
        </View>

        {!isLastQuestion && !hasAnswered && !isMarkedForReview ? (
          <Text
            variant="bodySmall"
            style={[styles.nextHint, { color: theme.colors.onSurfaceVariant, fontSize: MD3_SIZE.bodySmall * scale }]}
          >
            {t("exam.answerOrMarkHint")}
          </Text>
        ) : null}

        <Text
          variant="bodySmall"
          style={[
            styles.answeredCount,
            { color: theme.colors.onSurfaceVariant, fontSize: MD3_SIZE.bodySmall * scale },
          ]}
        >
          📝 {answeredCount}/{questions.length} {t("exam.answeredLabel")}
        </Text>
      </View>
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
  exitButton: { marginLeft: -8 },
  headerTitle: { flex: 1, textAlign: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 2 },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressDots: { flexDirection: "row", gap: 4, marginBottom: 16, flexWrap: "wrap" },
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  questionCard: { marginBottom: 16 },
  optionButton: { marginBottom: 10 },
  navRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  navRowCompact: { marginTop: 8 },
  nextHint: { textAlign: "center", marginTop: 8 },
  answeredCount: { textAlign: "center", marginTop: 16, marginBottom: 32 },
});
