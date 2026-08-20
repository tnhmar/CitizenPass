import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, Button, Card, IconButton, Menu, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import { drawRandomQuestions } from "../../src/data/questionLoader";
import { getChapterList, getChapterTitle } from "../../src/data/contentLoader";
import { randomOptionOrder, applyOptionOrder } from "../../src/utils/questionDisplay";
import { SourceCitationCard } from "../../src/components/SourceCitationCard";
import { OptionButton } from "../../src/components/OptionButton";
import type { Question } from "../../src/types";

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function PracticeScreen() {
  const { chapterId: initialChapterId } = useLocalSearchParams<{ chapterId?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const language = useSettingsStore((state) => state.language);
  const bookmarkedQuestionIds = useProgressStore((state) => state.bookmarkedQuestionIds);
  const toggleBookmark = useProgressStore((state) => state.toggleBookmark);
  const recordPracticeAnswer = useProgressStore((state) => state.recordPracticeAnswer);

  const chapters = getChapterList();
  const [chapterFilter, setChapterFilter] = useState<string | null>(initialChapterId ?? null);
  const [menuVisible, setMenuVisible] = useState(false);

  const [current, setCurrent] = useState<Question | null>(null);
  const [optionOrder, setOptionOrder] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const drawNext = (excludeIds: string[], chapter: string | null) => {
    const [next] = drawRandomQuestions(1, excludeIds, chapter ?? undefined);
    if (!next) {
      setCurrent(null);
      setSessionComplete(true);
      return;
    }
    setSeenIds((prev) => [...prev, next.id]);
    setCurrent(next);
    setOptionOrder(randomOptionOrder(next.en.options.length));
    setSelectedIndex(null);
  };

  const startSession = (chapter: string | null) => {
    setChapterFilter(chapter);
    setSeenIds([]);
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
    if (hasAnswered || !current || !localized) return;
    setSelectedIndex(index);
    const correct = index === localized.correctIndex;
    setSessionAnswered((n) => n + 1);
    if (correct) setSessionCorrect((n) => n + 1);
    void recordPracticeAnswer(current.id, correct);
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
      <Menu.Item title={t("practice.allChapters")} onPress={() => handlePickChapter(null)} />
      {chapters.map((chapter) => (
        <Menu.Item
          key={chapter.id}
          title={getChapterTitle(chapter, language)}
          onPress={() => handlePickChapter(chapter.id)}
        />
      ))}
    </Menu>
  );

  if (sessionComplete) {
    const accuracyPercent = sessionAnswered > 0 ? Math.round((sessionCorrect / sessionAnswered) * 100) : 0;
    return (
      <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
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
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
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
        let containedColor: string | undefined;
        let contentColor: string | undefined;
        let icon: "check-circle" | "close-circle" | undefined;

        if (hasAnswered) {
          if (isCorrectOption) {
            mode = "contained";
            containedColor = theme.colors.primary;
            contentColor = theme.colors.onPrimary;
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
          <Button
            mode="contained"
            icon="arrow-right-circle"
            onPress={() => drawNext(seenIds, chapterFilter)}
            style={styles.nextButton}
          >
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
  questionCard: { marginBottom: 16 },
  questionIcon: { marginBottom: 8 },
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
  nextButton: { marginTop: 16, marginBottom: 32 },
  completeCard: { marginTop: 8, marginBottom: 20 },
  completeContent: { alignItems: "center", gap: 8 },
  restartButton: { marginBottom: 8 },
});
