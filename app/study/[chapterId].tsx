import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Text, Button, Divider, useTheme } from "react-native-paper";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import { getChapterContent } from "../../src/data/contentLoader";

export default function ChapterDetailScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const theme = useTheme();
  const language = useSettingsStore((state) => state.language);
  const chapterProgress = useProgressStore((state) => state.chapterProgress);
  const setChapterCompletion = useProgressStore((state) => state.setChapterCompletion);

  const content = chapterId ? getChapterContent(chapterId, language) : null;
  const completionPercent = chapterId ? chapterProgress[chapterId]?.completionPercent ?? 0 : 0;
  const isComplete = completionPercent >= 100;

  if (!content) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium">Chapter not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {content.title}
      </Text>

      {content.sections.map((section) => (
        <View key={section.id} style={styles.section}>
          {section.heading ? (
            <Text variant="titleMedium" style={styles.sectionHeading}>
              {section.heading}
            </Text>
          ) : null}

          {section.paragraphs.map((paragraph, index) => (
            <Text key={`p-${index}`} variant="bodyMedium" style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}

          {section.bullets.map((bullet, index) => (
            <Text key={`b-${index}`} variant="bodyMedium" style={styles.bullet}>
              {"\u2022 "}
              {bullet}
            </Text>
          ))}
        </View>
      ))}

      <Divider style={styles.divider} />

      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {content.source.guide} — {content.source.sourceUrl}
      </Text>

      <Button
        mode={isComplete ? "outlined" : "contained"}
        onPress={() => setChapterCompletion(chapterId as string, 100)}
        disabled={isComplete}
        style={styles.completeButton}
      >
        {isComplete ? "Chapter completed" : "Mark chapter as read"}
      </Button>
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
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 22,
  },
  bullet: {
    marginBottom: 6,
    marginLeft: 8,
    lineHeight: 22,
  },
  divider: {
    marginVertical: 16,
  },
  completeButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
