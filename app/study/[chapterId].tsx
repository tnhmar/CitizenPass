import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, Button, Divider, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getChapterContent } from "../../src/data/contentLoader";
import { getChapterVisual } from "../../src/constants/chapterIcons";

export default function ChapterDetailScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const language = useSettingsStore((state) => state.language);
  const chapterProgress = useProgressStore((state) => state.chapterProgress);
  const setChapterCompletion = useProgressStore((state) => state.setChapterCompletion);

  const content = chapterId ? getChapterContent(chapterId, language) : null;
  const visual = getChapterVisual(chapterId ?? "");
  const completionPercent = chapterId ? chapterProgress[chapterId]?.completionPercent ?? 0 : 0;
  const isComplete = completionPercent >= 100;

  if (!content) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium">{t("study.notFound")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: 16 + insets.top }]}
    >
      <View style={styles.titleRow}>
        <View style={[styles.iconCircle, { backgroundColor: `${visual.color}1A` }]}>
          <MaterialCommunityIcons name={visual.icon as any} size={26} color={visual.color} />
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          {visual.emoji} {content.title}
        </Text>
      </View>

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
            <View key={`b-${index}`} style={styles.bulletRow}>
              <MaterialCommunityIcons name="circle-small" size={20} color={visual.color} />
              <Text variant="bodyMedium" style={styles.bulletText}>
                {bullet}
              </Text>
            </View>
          ))}
        </View>
      ))}

      <Divider style={styles.divider} />

      <View style={styles.sourceRow}>
        <MaterialCommunityIcons
          name="book-open-page-variant-outline"
          size={16}
          color={theme.colors.onSurfaceVariant}
        />
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
          {content.source.guide} — {content.source.sourceUrl}
        </Text>
      </View>

      <Button
        mode="contained"
        icon="pencil"
        onPress={() => router.push({ pathname: "/practice", params: { chapterId: content.chapterId } })}
        style={styles.practiceButton}
      >
        {t("study.practiceThisChapter")}
      </Button>

      <Button
        mode={isComplete ? "outlined" : "text"}
        icon={isComplete ? "check-circle" : "check"}
        onPress={() => setChapterCompletion(chapterId as string, 100)}
        disabled={isComplete}
        style={styles.completeButton}
      >
        {isComplete ? t("study.chapterCompleted") : t("study.markAsRead")}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  title: { flex: 1 },
  section: { marginBottom: 20 },
  sectionHeading: { marginBottom: 8 },
  paragraph: { marginBottom: 8, lineHeight: 22 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6, marginLeft: 4 },
  bulletText: { flex: 1, lineHeight: 22 },
  divider: { marginVertical: 16 },
  sourceRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 16 },
  practiceButton: { marginBottom: 12 },
  completeButton: { marginBottom: 32 },
});
