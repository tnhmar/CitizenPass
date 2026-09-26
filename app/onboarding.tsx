import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text, Button, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../src/store/useSettingsStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OnboardingStep = {
  icon: string;
  emoji: string;
  titleKey: string;
  descriptionKey: string;
};

const STEPS: OnboardingStep[] = [
  { icon: "book-open-page-variant", emoji: "📘", titleKey: "onboarding.studyTitle", descriptionKey: "onboarding.studyDescription" },
  { icon: "pencil", emoji: "✏️", titleKey: "onboarding.practiceTitle", descriptionKey: "onboarding.practiceDescription" },
  { icon: "timer-outline", emoji: "⏱️", titleKey: "onboarding.examTitle", descriptionKey: "onboarding.examDescription" },
];

/**
 * Shown once, the first time the app's Home screen would otherwise be
 * shown (see the hasSeenOnboarding check in app/(tabs)/index.tsx) - a
 * brief orientation to the recommended Study -> Practice -> Exam flow,
 * not a feature tour of every screen. Colors are picked per step to
 * echo the same Study/Practice/Exam color coding already used on Home's
 * NavCards (secondary/primary/tertiary), so the association carries
 * over once onboarding is done.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);

  const stepColors = [theme.colors.secondary, theme.colors.primary, theme.colors.tertiary];
  const isLastStep = step === STEPS.length - 1;
  const current = STEPS[step];
  const color = stepColors[step];

  const handleFinish = () => {
    void completeOnboarding();
    router.replace("/");
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: 24 + insets.top }]}>
      <View style={styles.skipRow}>
        <Button mode="text" onPress={handleFinish} compact>
          {t("onboarding.skip")}
        </Button>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: `${color}1A` }]}>
          <MaterialCommunityIcons name={current.icon as any} size={48} color={color} />
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          {current.emoji} {t(current.titleKey)}
        </Text>
        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          {t(current.descriptionKey)}
        </Text>
      </View>

      <View style={styles.dotsRow}>
        {STEPS.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, { backgroundColor: index === step ? theme.colors.primary : theme.colors.surfaceVariant }]}
          />
        ))}
      </View>

      <Button mode="contained" onPress={handleNext} style={styles.nextButton}>
        {isLastStep ? t("onboarding.getStarted") : t("onboarding.next")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  skipRow: { flexDirection: "row", justifyContent: "flex-end" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 16 },
  iconCircle: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  title: { textAlign: "center" },
  description: { textAlign: "center", lineHeight: 22 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nextButton: { marginBottom: 8 },
});
