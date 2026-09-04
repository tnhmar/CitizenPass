import { useEffect, useState } from "react";
import { AppState, Alert, FlatList, StyleSheet, View } from "react-native";
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
import { useExamStore, formatRemainingTime } from "../../src/store/useExamStore";
import type { Question } from "../../src/types";

const OPTION_LETTERS = ["A", "B", "C", "D"];

// MD3 type-scale base sizes, used to scale text on tablets - see
// useResponsive() and docs/theme-navigation-responsive-overhaul.md.
const MD3_SIZE = { titleMedium: 16, titleSmall: 14, bodyMedium: 14, bodySmall: 12 } as const;

/**
 * Pre-submit review list: every question in the current exam, answered or
 * not, tappable to jump back and change/add an answer, with a single
 * confirmed "Submit Exam" at the bottom. This is the answer to "add an
 * option to revise answers when not sure, before submitting" - skipping a
 * question during the exam (app/exam/index.tsx's "Next") is intentionally
 * still allowed, since this screen is the safety net for exactly that.
 *
 * Reached either from the last question's "Review & Submit" button, or
 * from the "Review Answers" item in the exam options menu at any point -
 * both just `router.push` here, so `router.back()` throughout this screen
 * correctly returns to /exam without stacking duplicate entries.
 */
export default function ExamReviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { isTablet, scale, contentMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const language = useSettingsStore((state) => state.language);

  const status = useExamStore((state) => state.status);
  const questions = useExamStore((state) => state.questions);
  const answers = useExamStore((state) => state.answers);
  const optionOrder = useExamStore((state) => state.optionOrder);
  const setCurrentIndex = useExamStore((state) => state.setCurrentIndex);
  const startExam = useExamStore((state) => state.startExam);
  const restartExam = useExamStore((state) => state.restartExam);
  const pauseExam = useExamStore((state) => state.pause);
  const resumeExam = useExamStore((state) => state.resume);

  const [menuVisible, setMenuVisible] = useState(false);
  const remainingMs = useExamCountdown();
  const finishExam = useFinishExam();
  useExamSessionLifecycle();

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

  // Reachable only from an in-progress exam; if there's nothing to review
  // (deep link, already submitted, or reset), bounce back to /exam. The
  // redirect itself is a side effect (useEffect), not something to do
  // directly in the render body - navigating during render can fire while
  // another component is still rendering and is not a safe pattern.
  const shouldRedirect = status !== "in-progress" || questions.length === 0;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/exam");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRedirect]);

  if (shouldRedirect) {
    return null;
  }

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const isLowTime = remainingMs < 5 * 60 * 1000;

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    router.back();
  };

  const handleSubmit = () => {
    const title =
      unansweredCount > 0
        ? t("exam.submitConfirmTitleUnanswered", { count: unansweredCount })
        : t("exam.submitConfirmTitle");
    Alert.alert(title, t("exam.submitConfirmBody"), [
      { text: t("exam.cancelLabel"), style: "cancel" },
      { text: t("exam.submitLabel"), style: "destructive", onPress: finishExam },
    ]);
  };

  const handleRestartExam = () => {
    setMenuVisible(false);
    Alert.alert(t("exam.restartConfirmTitle"), t("exam.restartConfirmBody"), [
      { text: t("exam.cancelLabel"), style: "cancel" },
      { text: t("exam.restartExam"), style: "destructive", onPress: () => { restartExam(); router.replace("/exam"); } },
    ]);
  };

  const handleNewExam = () => {
    setMenuVisible(false);
    Alert.alert(t("exam.newExamConfirmTitle"), t("exam.newExamConfirmBody"), [
      { text: t("exam.cancelLabel"), style: "cancel" },
      { text: t("exam.newExam"), style: "destructive", onPress: () => { startExam(); router.replace("/exam"); } },
    ]);
  };

  const handleExitExam = () => {
    setMenuVisible(false);
    pauseExam();
    router.replace("/");
  };

  const contentWrapperStyle = contentMaxWidth
    ? { maxWidth: contentMaxWidth, alignSelf: "center" as const, width: "100%" as const }
    : null;

  const renderItem = ({ item, index }: { item: Question; index: number }) => {
    const localized = item[language];
    const selectedCanonicalIndex = answers[item.id];
    const order = optionOrder[item.id] ?? item.en.options.map((_, i) => i);
    const isAnswered = selectedCanonicalIndex !== undefined;
    const selectedDisplayPosition = isAnswered ? order.indexOf(selectedCanonicalIndex) : undefined;

    return (
      <View style={contentWrapperStyle}>
        <Card mode="outlined" style={styles.reviewRow} onPress={() => goToQuestion(index)}>
          <Card.Content style={styles.reviewRowContent}>
            <MaterialCommunityIcons
              name={isAnswered ? "check-circle-outline" : "circle-outline"}
              size={20 * scale}
              color={isAnswered ? theme.colors.secondary : theme.colors.error}
            />
            <View style={styles.reviewRowText}>
              <Text variant="bodyMedium" numberOfLines={2} style={{ fontSize: MD3_SIZE.bodyMedium * scale }}>
                {index + 1}. {localized.question}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, fontSize: MD3_SIZE.bodySmall * scale }}
              >
                {isAnswered
                  ? `${t("exam.yourAnswer")}: ${OPTION_LETTERS[selectedDisplayPosition ?? 0]}`
                  : t("exam.notAnswered")}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20 * scale} color={theme.colors.onSurfaceVariant} />
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.headerRow, { paddingTop: 8 + insets.top }]}>
        <View style={contentWrapperStyle}>
          <View style={styles.headerInner}>
            <IconButton
              icon="arrow-left"
              size={22 * scale}
              onPress={() => router.back()}
              accessibilityLabel={t("exam.backToExam")}
              style={styles.backButtonIcon}
            />
            <Text
              variant="titleMedium"
              style={[styles.headerTitle, { fontSize: MD3_SIZE.titleMedium * scale }]}
            >
              {t("exam.reviewTitle")}
            </Text>
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
              <Menu.Item leadingIcon="restart" onPress={handleRestartExam} title={t("exam.restartExam")} />
              <Menu.Item leadingIcon="shuffle-variant" onPress={handleNewExam} title={t("exam.newExam")} />
              <Divider />
              <Menu.Item leadingIcon="exit-to-app" onPress={handleExitExam} title={t("exam.exitExam")} />
            </Menu>
          </View>
        </View>
      </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={contentWrapperStyle}>
            <View style={styles.summaryRow}>
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
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, fontSize: MD3_SIZE.bodyMedium * scale }}
              >
                {t("exam.reviewSummary", { answered: answeredCount, total: questions.length })}
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={[styles.footer, contentWrapperStyle]}>
            <Button
              mode="outlined"
              icon="arrow-left"
              onPress={() => router.back()}
              style={styles.footerButton}
              contentStyle={{ paddingVertical: isTablet ? 6 : 2 }}
              labelStyle={{ fontSize: MD3_SIZE.bodyMedium * scale }}
            >
              {t("exam.backToExam")}
            </Button>
            <Button
              mode="contained"
              icon="check-circle"
              onPress={handleSubmit}
              style={styles.footerButton}
              contentStyle={{ paddingVertical: isTablet ? 6 : 2 }}
              labelStyle={{ fontSize: MD3_SIZE.bodyMedium * scale }}
            >
              {t("exam.submitExam")}
            </Button>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { paddingHorizontal: 4, paddingBottom: 4 },
  headerInner: { flexDirection: "row", alignItems: "center" },
  backButtonIcon: { marginRight: -4 },
  headerTitle: { flex: 1, textAlign: "center" },
  listContent: { padding: 16, paddingBottom: 32 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reviewRow: { marginBottom: 10 },
  reviewRowContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewRowText: { flex: 1, flexShrink: 1, minWidth: 0 },
  footer: { flexDirection: "row", gap: 12, marginTop: 8 },
  footerButton: { flex: 1 },
});
