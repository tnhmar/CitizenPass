import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Button, Divider, IconButton, Menu, SegmentedButtons, TouchableRipple, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "../../src/hooks/useResponsive";
import { useExamCountdown } from "../../src/hooks/useExamCountdown";
import { useFinishExam } from "../../src/hooks/useFinishExam";
import {
  useExamStore,
  formatRemainingTime,
  LOW_TIME_THRESHOLD_MS,
} from "../../src/store/useExamStore";

type QuestionStatus = "answered" | "notAnswered" | "toBeReviewed";
type ViewMode = "grid" | "list";

// MD3 type-scale base sizes, used to scale text on tablets - see
// useResponsive() and docs/theme-navigation-responsive-overhaul.md.
const MD3_SIZE = { titleMedium: 16, titleSmall: 14, bodyMedium: 14, bodySmall: 13, labelSmall: 11 } as const;

/**
 * The exam's question navigator - a Grid view (numbered tiles) and a List
 * view (same questions grouped by status), matching the official IRCC
 * online citizenship test's own "grid view"/"list view" almost exactly
 * (canada.ca's own description of their test interface - see
 * docs/theme-navigation-responsive-overhaul.md section 7). Deliberately
 * does NOT show question text or chosen answers here, unlike an earlier
 * version of this screen - the official test's navigator is status-only
 * (answered / not answered / to be reviewed) with no content preview, and
 * that's what this now matches.
 *
 * Reached either from the last question's button, or from "Review
 * Answers" in the exam options menu at any point - both just
 * `router.push` here, so `router.back()` throughout this screen correctly
 * returns to /exam without stacking duplicate entries.
 */
export default function ExamReviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { scale, contentMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();

  const status = useExamStore((state) => state.status);
  const questions = useExamStore((state) => state.questions);
  const answers = useExamStore((state) => state.answers);
  const currentIndex = useExamStore((state) => state.currentIndex);
  const setCurrentIndex = useExamStore((state) => state.setCurrentIndex);
  const markedForReview = useExamStore((state) => state.markedForReview);
  const startExam = useExamStore((state) => state.startExam);
  const restartExam = useExamStore((state) => state.restartExam);

  const [menuVisible, setMenuVisible] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const remainingMs = useExamCountdown();
  const finishExam = useFinishExam();

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

  const getStatus = (questionId: string): QuestionStatus => {
    if (markedForReview[questionId]) return "toBeReviewed";
    if (answers[questionId] !== undefined) return "answered";
    return "notAnswered";
  };

  let answeredCount = 0;
  let notAnsweredCount = 0;
  let toBeReviewedCount = 0;
  for (const q of questions) {
    const s = getStatus(q.id);
    if (s === "answered") answeredCount += 1;
    else if (s === "notAnswered") notAnsweredCount += 1;
    else toBeReviewedCount += 1;
  }

  const isLowTime = remainingMs < LOW_TIME_THRESHOLD_MS;

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    router.back();
  };

  const handleSubmit = () => {
    const title =
      notAnsweredCount > 0
        ? t("exam.submitConfirmTitleUnanswered", { count: notAnsweredCount })
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
      {
        text: t("exam.restartExam"),
        style: "destructive",
        onPress: () => {
          restartExam();
          router.replace("/exam");
        },
      },
    ]);
  };

  const handleNewExam = () => {
    setMenuVisible(false);
    Alert.alert(t("exam.newExamConfirmTitle"), t("exam.newExamConfirmBody"), [
      { text: t("exam.cancelLabel"), style: "cancel" },
      {
        text: t("exam.newExam"),
        style: "destructive",
        onPress: () => {
          startExam();
          router.replace("/exam");
        },
      },
    ]);
  };

  const handleExitExam = () => {
    setMenuVisible(false);
    Alert.alert(t("exam.exitConfirmTitle"), t("exam.exitConfirmBody"), [
      { text: t("exam.cancelLabel"), style: "cancel" },
      { text: t("exam.exitExam"), style: "destructive", onPress: () => router.replace("/") },
    ]);
  };

  const contentWrapperStyle = contentMaxWidth
    ? { maxWidth: contentMaxWidth, alignSelf: "center" as const, width: "100%" as const }
    : null;

  const tileColors = (s: QuestionStatus) => {
    if (s === "toBeReviewed") {
      return { background: theme.colors.secondaryContainer, border: theme.colors.tertiary, text: theme.colors.onSecondaryContainer };
    }
    if (s === "answered") {
      return { background: theme.colors.secondaryContainer, border: theme.colors.secondary, text: theme.colors.onSecondaryContainer };
    }
    return { background: theme.colors.surfaceVariant, border: theme.colors.outline, text: theme.colors.onSurfaceVariant };
  };

  const renderTile = (index: number, size: number) => {
    const q = questions[index];
    const s = getStatus(q.id);
    const isCurrent = index === currentIndex;
    const colors = tileColors(s);
    return (
      <View key={q.id} style={{ width: size, height: size }}>
        <TouchableRipple
          onPress={() => goToQuestion(index)}
          style={[
            styles.tileTouchable,
            {
              backgroundColor: colors.background,
              borderColor: isCurrent ? theme.colors.primary : colors.border,
              borderWidth: isCurrent ? 3 : 1.5,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${t("exam.questionOf", { current: index + 1, total: questions.length })}`}
        >
          <View style={styles.tileContent}>
            <Text style={[styles.tileText, { color: colors.text, fontSize: MD3_SIZE.bodyMedium * scale }]}>
              {index + 1}
            </Text>
            {s === "toBeReviewed" ? (
              <MaterialCommunityIcons
                name="flag"
                size={11 * scale}
                color={theme.colors.tertiary}
                style={styles.tileFlag}
              />
            ) : null}
          </View>
        </TouchableRipple>
      </View>
    );
  };

  const tileSize = 44 * scale;

  const listGroups: { key: string; titleKey: string; count: number; indices: number[] }[] = (() => {
    const marked: number[] = [];
    const notAnswered: number[] = [];
    const answered: number[] = [];
    questions.forEach((q, index) => {
      if (index === currentIndex) return;
      const s = getStatus(q.id);
      if (s === "toBeReviewed") marked.push(index);
      else if (s === "answered") answered.push(index);
      else notAnswered.push(index);
    });
    return [
      { key: "current", titleKey: "exam.currentQuestion", count: 1, indices: [currentIndex] },
      { key: "marked", titleKey: "exam.toBeReviewed", count: marked.length, indices: marked },
      { key: "notAnswered", titleKey: "exam.notAnswered", count: notAnswered.length, indices: notAnswered },
      { key: "answered", titleKey: "exam.answered", count: answered.length, indices: answered },
    ];
  })();

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
            <Text variant="titleMedium" style={[styles.headerTitle, { fontSize: MD3_SIZE.titleMedium * scale }]}>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            {isLowTime ? (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.error, fontSize: MD3_SIZE.bodySmall * scale }}
              >
                {t("exam.timeAlmostUp")}
              </Text>
            ) : null}
          </View>

          <SegmentedButtons
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
            style={styles.viewToggle}
            buttons={[
              { value: "grid", label: t("exam.gridView"), icon: "view-grid-outline" },
              { value: "list", label: t("exam.listView"), icon: "view-list-outline" },
            ]}
          />

          {/* Matches the official test's own count summary shown under the
              grid - three mutually exclusive buckets that always sum to
              the total question count. */}
          <Text
            variant="bodySmall"
            style={[styles.countsRow, { color: theme.colors.onSurfaceVariant, fontSize: MD3_SIZE.bodySmall * scale }]}
          >
            {t("exam.toBeReviewed")}: {toBeReviewedCount} · {t("exam.notAnswered")}: {notAnsweredCount} ·{" "}
            {t("exam.answered")}: {answeredCount}
          </Text>

          {viewMode === "grid" ? (
            <View style={styles.grid}>{questions.map((_, index) => renderTile(index, tileSize))}</View>
          ) : (
            <View>
              {listGroups.map((group) => (
                <View key={group.key} style={styles.listSection}>
                  <Text
                    variant="labelLarge"
                    style={[styles.listSectionHeader, { fontSize: MD3_SIZE.bodyMedium * scale }]}
                  >
                    {t(group.titleKey)} ({group.count})
                  </Text>
                  {group.indices.length > 0 ? (
                    <View style={styles.grid}>{group.indices.map((index) => renderTile(index, tileSize))}</View>
                  ) : (
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant, fontSize: MD3_SIZE.labelSmall * scale }}
                    >
                      —
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, contentWrapperStyle]}>
        <Button
          mode="outlined"
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.footerButton}
          labelStyle={{ fontSize: MD3_SIZE.bodyMedium * scale }}
        >
          {t("exam.backToExam")}
        </Button>
        <Button
          mode="contained"
          icon="check-circle"
          onPress={handleSubmit}
          style={styles.footerButton}
          labelStyle={{ fontSize: MD3_SIZE.bodyMedium * scale }}
        >
          {t("exam.confirmSubmission")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { paddingHorizontal: 4, paddingBottom: 4 },
  headerInner: { flexDirection: "row", alignItems: "center" },
  backButtonIcon: { marginRight: -4 },
  headerTitle: { flex: 1, textAlign: "center" },
  scrollContent: { padding: 16, paddingBottom: 16 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewToggle: { marginBottom: 12 },
  countsRow: { marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tileTouchable: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  tileContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  tileText: { fontWeight: "600" },
  tileFlag: { position: "absolute", top: 2, right: 2 },
  listSection: { marginBottom: 20 },
  listSectionHeader: { marginBottom: 10, fontWeight: "700" },
  footer: { flexDirection: "row", gap: 12, padding: 16, paddingTop: 8 },
  footerButton: { flex: 1 },
});
