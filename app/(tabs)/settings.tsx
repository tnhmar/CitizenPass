import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Button, Divider, RadioButton, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import type { AppLanguage, AppTheme } from "../../src/types";

const LANGUAGE_OPTIONS: { value: AppLanguage; labelKey: string; nativeLabel: string }[] = [
  { value: "en", labelKey: "settings.language", nativeLabel: "English" },
  { value: "fr", labelKey: "settings.language", nativeLabel: "Fran\u00e7ais" },
];

const THEME_OPTIONS: { value: AppTheme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const themePref = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  const resetProgress = useProgressStore((state) => state.resetProgress);

  const handleResetData = () => {
    Alert.alert(
      t("settings.resetData"),
      "This will erase all locally stored settings, bookmarks, and progress on this device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: t("settings.resetData"),
          style: "destructive",
          onPress: async () => {
            await Promise.all([resetSettings(), resetProgress()]);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text variant="headlineMedium">{t("settings.title")}</Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t("settings.language")}
      </Text>
      <RadioButton.Group onValueChange={(value) => setLanguage(value as AppLanguage)} value={language}>
        {LANGUAGE_OPTIONS.map((option) => (
          <View key={option.value} style={styles.optionRow}>
            <RadioButton value={option.value} />
            <Text onPress={() => setLanguage(option.value)}>{option.nativeLabel}</Text>
          </View>
        ))}
      </RadioButton.Group>

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {t("settings.theme")}
      </Text>
      <RadioButton.Group onValueChange={(value) => setTheme(value as AppTheme)} value={themePref}>
        {THEME_OPTIONS.map((option) => (
          <View key={option.value} style={styles.optionRow}>
            <RadioButton value={option.value} />
            <Text onPress={() => setTheme(option.value)}>{option.label}</Text>
          </View>
        ))}
      </RadioButton.Group>

      <Divider style={styles.divider} />

      <Button mode="outlined" onPress={handleResetData} textColor={theme.colors.error}>
        {t("settings.resetData")}
      </Button>

      <Text variant="bodySmall" style={styles.disclaimer}>
        {t("common.disclaimer")}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  divider: {
    marginVertical: 16,
  },
  disclaimer: {
    marginTop: 24,
    opacity: 0.7,
  },
});
