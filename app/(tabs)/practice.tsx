import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, Button, Card, Divider, IconButton, Menu, TouchableRipple, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import { useSemanticColors } from "../../src/theme/useSemanticColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { drawRandomQuestions } from "../../src/data/questionLoader";
import { getChapterList, getChapterTitle } from "../../src/data/contentLoader";
import { randomOptionOrder, applyOptionOrder, applyOptionOrderToArabic } from "../../src/utils/questionDisplay";
import { SourceCitationCard } from "../../src/components/SourceCitationCard";
import { OptionButton } from "../../src/components/OptionButton";
import { ArabicFlipCard } from "../../src/components/ArabicFlipCard";
import type { Question } from "../../src/types";

const OPTION_LETTERS = ["A", "B", "C", "D"];

type PracticeHistoryEntry = {
  question: Question;
  optionOrder: number[];
  selectedIndex: number | null;
};

export default function PracticeScreen() {
  const { chapterId: initialChapterId } = useLocalSearchParams<{ chapterId?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { success, onSuccess, successContainer } = useSemanticColors();
  const insets = useSafeAreaInsets();
  const language = useSettingsStore((state) => state.language);
  const arabicHelpEnabled = useSettingsStore((state) => state.arabicHelpEnabled);
  const bookmarkedQuestionIds = useProgressStore((state) => state.bookmarkedQuestionIds);
  const toggleBookmark = useProgressStore((state) => state.toggleBookmark);
  const recordPracticeAnswer = useProgressStore((state) => state.recordPracticeAnswer);

  const chapters = getChapterList();
  const [chapterFilter, setChapterFilter] = useState<string | null>(initialChapterId ?? null);
  const [menuVisible, setMenuVisible] = useState(false);

  // A history stack (not just a single "current question") so Previous can
  // step back to an earlier question with its answer state intact, and
  // Next can step forward through already-seen history before drawing a
  // brand-new question once the frontier is reached.
  const [history, setHistory] = useState<PracticeHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const current = historyIndex >= 0 ? (history[historyIndex]?.question ?? null) : null;
  const optionOrder = historyIndex >= 0 ? (history[historyIndex]?.optionOrder ?? []) : [];
  const selectedIndex = historyIndex >= 0 ? (history[historyIndex]?.selectedIndex ?? null) : null;
  const isAtFrontier = historyIndex === history.length - 1;

  const drawNext = (excludeIds: string[], chapter: string | null) => {
    const [next] = drawRandomQuestions(1, excludeIds, chapter ?? undefined);
    if (!next) {
      setSessionComplete(true);
      return;
    }
    const entry: PracticeHistoryEntry = {
      question: next,
      optionOrder: randomOptionOrder(next.en.options.length),
      selectedIndex: null,
    };
    setHistory((prev) => [...prev, entry]);
    setHistoryIndex((i) => i + 1);
  };

  const startSession = (chapter: string | null) => {
    setChapterFilter(chapter);
    setHistory([]);
    setHistoryIndex(-1);
    setSessionCorrect(0);
    setSessionAnswered(0);
    setSessionComplete(false);
    drawNext([], chapter);
  };

  useEffect(() => {
    startSession(initialChapterId ?? null);
    // Runs once on mount to draw the first question for the initial filter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const localizedRaw = useMemo(() => (current ? current[language] : null), [current, language]);
  const localized = useMemo(
    () => (localizedRaw && optionOrder.length ? applyOptionOrder(localizedRaw, optionOrder) : null),
    [localizedRaw, optionOrder]
  );
  const isBookmarked = current ? bookmarkedQuestionIds.includes(current.id) : false;
  const hasAnswered = selectedIndex !== null;

  const handleSelect = (index: number) => {
    if (hasAnswered || !current || !localized || historyIndex < 0) return;
    setHistory((prev) => prev.map((entry, i) => (i === historyIndex ? { ...entry, selectedIndex: index } : entry)));
    const correct = index === localized.correctIndex;
    setSessionAnswered((n) => n + 1);
    if (correct) setSessionCorrect((n) => n + 1);
    void recordPracticeAnswer(current.id, correct);
  };

  const handlePrevious = () => {
    setHistoryIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    if (!isAtFrontier) {
      setHistoryIndex((i) => i + 1);
      return;
    }
    const seenIds = history.map((entry) => entry.question.id);
    drawNext(seenIds, chapterFilter);
  };

  const handlePickChapter = (chapterId: string | null) => {
    setMenuVisible(false);
    startSession(chapterId);
  };

  const activeChapterTitle = chapterFilter
    ? getChapterTitle(chapters.find((c) => c.id === chapterFilter) ?? chapters[0], language)
    : t("practice.allChapters");

  const chapterPicker = (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <Button
          mode="outlined"
          icon="filter-variant"
          onPress={() => setMenuVisible(true)}
          style={styles.chapterPickerButton}
          contentStyle={styles.chapterPickerContent}
        >
          {activeChapterTitle}
        </Button>
      }
    >
      {/* Bug fix: Paper's Menu.Item truncates its title to a single line
          with an ellipsis, which cut off longer chapter names entirely.
          Plain TouchableRipple rows (same primitive OptionButton is built
          on) give full control - no line limit, text wraps as needed. */}
      <TouchableRipple onPress={() => handlePickChapter(null)} style={styles.menuRow}>
        <Text style={styles.menuRowText}>{t("practice.allChapters")}</Text>
      </TouchableRipple>
      <Divider />
      {chapters.map((chapter) => (
        <TouchableRipple key={chapter.id} onPress={() => handlePickChapter(chapter.id)} style={styles.menuRow}>
          <Text style={styles.menuRowText}>{getChapterTitle(chapter, language)}</Text>
        </TouchableRipple>
      ))}
    </Menu>
  );

  if (sessionComplete) {
    const accuracyPercent = sessionAnswered > 0 ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0;
    return (
      <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={[styles.container, { paddingTop: 16 + insets.top }]}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          ✏️ {t("practice.title")}
        </Text>
        {chapterPicker}
        <Card mode="elevated" style={[styles.completeCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content style={styles.completeContent}>
            <Text variant="displaySmall">🏁</Text>
            <Text variant="titleLarge">{t("practice.sessionComplete")}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t("practice.sessionSummary", { correct: sessionCorrect, total: sessionAnswered, percent: accuracyPercent })}
            </Text>
          </Card.Content>
        </Card>
        <Button
          mode="contained"
          icon="restart"
          onPress={() => startSession(chapterFilter)}
          style={styles.restartButton}
        >
          {t("practice.practiceAgain")}
        </Button>
        <Button mode="text" icon="filter-variant" onPress={() => handlePickChapter(null)}>
          {t("practice.practiceAllChapters")}
        </Button>
      </ScrollView>
    );
  }

  if (!current || !localized) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium">{t("practice.title")}</Text>
      </View>
    );
  }

  const isCorrect = selectedIndex === localized.correctIndex;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={[styles.container, { paddingTop: 16 + insets.top }]}>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          ✏️ {t("practice.title")}
        </Text>
        <View style={[styles.countBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
          <MaterialCommunityIcons name="counter" size={14} color={theme.colors.secondary} />
          <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
            {sessionAnswered}
          </Text>
        </View>
        <IconButton
          icon="bookmark-multiple-outline"
          onPress={() => router.push("/bookmarks")}
          accessibilityLabel={t("practice.viewBookmarks")}
        />
        <IconButton
          icon={isBookmarked ? "bookmark" : "bookmark-outline"}
          iconColor={isBookmarked ? theme.colors.primary : theme.colors.onSurfaceVariant}
          onPress={() => toggleBookmark(current.id)}
          accessibilityLabel={t("practice.toggleBookmark")}
        />
      </View>

      {chapterPicker}

      <ArabicFlipCard
        enabled={arabicHelpEnabled}
        arabic={
          current.ar
            ? { ...current.ar, options: applyOptionOrderToArabic(current.ar.options, optionOrder) }
            : undefined
        }
        showExplanation={hasAnswered}
        style={styles.flipRegion}
        front={
          <>
            <Card mode="elevated" style={styles.questionCard}>
              <Card.Content style={styles.questionContent}>
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.questionIcon}
                />
                <Text variant="titleMedium" style={styles.questionText}>
                  {localized.question}
                </Text>
              </Card.Content>
            </Card>

            {localized.options.map((option, index) => {
              const isCorrectOption = index === localized.correctIndex;
              const isSelected = index === selectedIndex;
              let mode: "contained" | "outlined" = "outlined";
              let containedColor: string | undefined;
              let contentColor: string | undefined;
              let icon: "check-circle" | "close-circle" | undefined;

              if (hasAnswered) {
                if (isCorrectOption) {
                  mode = "contained";
                  containedColor = success;
                  contentColor = onSuccess;
                  icon = "check-circle";
                } else if (isSelected) {
                  mode = "contained";
                  containedColor = theme.colors.error;
                  contentColor = theme.colors.onError;
                  icon = "close-circle";
                }
              }

              return (
                <OptionButton
                  key={index}
                  label={`${OPTION_LETTERS[index]}. ${option}`}
                  mode={mode}
                  containedColor={containedColor}
                  contentColor={contentColor}
                  icon={icon}
                  onPress={() => handleSelect(index)}
                  disabled={hasAnswered}
                  style={styles.optionButton}
                />
              );
            })}
          </>
        }
      />

      {hasAnswered ? (
        <>
          <View
            style={[
              styles.feedbackBanner,
              { backgroundColor: isCorrect ? successContainer : theme.colors.errorContainer },
            ]}
          >
            <MaterialCommunityIcons
              name={isCorrect ? "check-circle" : "close-circle"}
              size={20}
              color={isCorrect ? success : theme.colors.error}
            />
            <Text variant="titleMedium" style={{ color: isCorrect ? success : theme.colors.error }}>
              {isCorrect ? `✅ ${t("practice.correct")}` : `❌ ${t("practice.incorrect")}`}
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.explanation}>
            💡 {localized.explanation}
          </Text>
          <SourceCitationCard source={localized.source} />
        </>
      ) : null}

      <View style={styles.navRow}>
        <Button icon="chevron-left" disabled={historyIndex <= 0} onPress={handlePrevious}>
          {t("practice.previous")}
        </Button>
        <Button
          icon="chevron-right"
          mode={hasAnswered ? "contained" : "outlined"}
          contentStyle={{ flexDirection: "row-reverse" }}
          disabled={isAtFrontier && !hasAnswered}
          onPress={handleNext}
        >
          {t("practice.next")}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerTitle: { flex: 1 },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 4,
  },
  chapterPickerButton: { marginVertical: 12, alignSelf: "flex-start" },
  chapterPickerContent: { flexDirection: "row-reverse" },
  menuRow: { paddingVertical: 12, paddingHorizontal: 16, minWidth: 260, maxWidth: 320 },
  menuRowText: { fontSize: 14, lineHeight: 20 },
  questionCard: { marginBottom: 16 },
  flipRegion: { marginBottom: 4 },
  // Bug fix: icon and question text used to stack vertically (icon on its
  // own line, question below) because Card.Content's default flex
  // direction is column. Now a row, with the icon nudged down slightly to
  // optically align with the first line of text instead of its very top.
  questionContent: { flexDirection: "row", alignItems: "flex-start" },
  questionIcon: { marginRight: 8, marginTop: 3, flexShrink: 0 },
  questionText: { flex: 1, flexShrink: 1, minWidth: 0 },
  optionButton: { marginBottom: 10 },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
  },
  explanation: { marginTop: 12, marginBottom: 4 },
  navRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, marginBottom: 32 },
  completeCard: { marginTop: 8, marginBottom: 20 },
  completeContent: { alignItems: "center", gap: 8 },
  restartButton: { marginBottom: 8 },
});
