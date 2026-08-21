import { StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Button, Divider, SegmentedButtons, Switch, Card, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import type { AppLanguage, AppTheme } from "../../src/types";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const themePref = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const arabicHelpEnabled = useSettingsStore((state) => state.arabicHelpEnabled);
  const setArabicHelpEnabled = useSettingsStore((state) => state.setArabicHelpEnabled);
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  const resetProgress = useProgressStore((state) => state.resetProgress);

  const handleResetData = () => {
    Alert.alert(t("settings.resetData"), t("settings.resetConfirmBody"), [
      { text: t("settings.resetConfirmCancel"), style: "cancel" },
      {
        text: t("settings.resetData"),
        style: "destructive",
        onPress: async () => {
          await Promise.all([resetSettings(), resetProgress()]);
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>
        ⚙️ {t("settings.title")}
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        🌐 {t("settings.language")}
      </Text>
      <SegmentedButtons
        value={language}
        onValueChange={(value) => setLanguage(value as AppLanguage)}
        buttons={[
          { value: "en", label: "English", icon: "alpha-e-circle-outline" },
          { value: "fr", label: "Français", icon: "alpha-f-circle-outline" },
        ]}
      />

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        🎨 {t("settings.theme")}
      </Text>
      <SegmentedButtons
        value={themePref}
        onValueChange={(value) => setTheme(value as AppTheme)}
        buttons={[
          { value: "light", label: "Light", icon: "white-balance-sunny" },
          { value: "dark", label: "Dark", icon: "weather-night" },
          { value: "system", label: "Auto", icon: "cellphone" },
        ]}
      />

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        🗣️ {t("settings.arabicHelp")}
      </Text>
      <Card mode="outlined">
        <Card.Content style={styles.arabicToggleRow}>
          <Text variant="bodyMedium" style={styles.arabicToggleText}>
            {t("settings.arabicHelpDescription")}
          </Text>
          <Switch value={arabicHelpEnabled} onValueChange={setArabicHelpEnabled} />
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        🗑️ {t("settings.dataSection")}
      </Text>
      <Button
        mode="outlined"
        icon="delete-outline"
        onPress={handleResetData}
        textColor={theme.colors.error}
        style={styles.resetButton}
      >
        {t("settings.resetData")}
      </Button>

      <Card mode="outlined" style={[styles.disclaimerCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Card.Content style={styles.disclaimerContent}>
          <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}>
            {t("common.disclaimer")}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  sectionTitle: { marginTop: 8, marginBottom: 10 },
  divider: { marginVertical: 20 },
  resetButton: { marginTop: 4 },
  arabicToggleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  arabicToggleText: { flex: 1 },
  disclaimerCard: { marginTop: 24 },
  disclaimerContent: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
});
