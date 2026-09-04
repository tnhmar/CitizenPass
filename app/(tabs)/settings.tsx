import { StyleSheet, ScrollView, Alert, View } from "react-native";
import { Text, Button, Divider, SegmentedButtons, Switch, Card, useTheme, TouchableRipple } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useProgressStore } from "../../src/store/useProgressStore";
import { useResponsive } from "../../src/hooks/useResponsive";
import { COLOR_SCHEME_IDS, COLOR_SCHEMES } from "../../src/theme/tokens";
import type { AppColorScheme, AppLanguage, AppTheme } from "../../src/types";

// MD3 type-scale base sizes (from react-native-paper's default theme), used
// so text can be scaled up on tablets without guessing at Paper's internal
// variant sizes - see useResponsive() and docs/theme-navigation-responsive-overhaul.md.
const MD3_SIZE = { headlineSmall: 24, titleMedium: 16, bodyMedium: 14, bodySmall: 12 } as const;

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isTablet, isLandscape, scale, contentMaxWidth } = useResponsive();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const themePref = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const setColorScheme = useSettingsStore((state) => state.setColorScheme);
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

  const dividerSpacing = isTablet ? 26 : 20;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.scrollContent}>
      <View
        style={[
          styles.container,
          contentMaxWidth ? { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" } : null,
        ]}
      >
        <Text variant="headlineSmall" style={[styles.header, { fontSize: MD3_SIZE.headlineSmall * scale }]}>
          ⚙️ {t("settings.title")}
        </Text>

        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: MD3_SIZE.titleMedium * scale }]}>
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

        <Divider style={{ marginVertical: dividerSpacing }} />

        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: MD3_SIZE.titleMedium * scale }]}>
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

        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { marginTop: 18, fontSize: MD3_SIZE.titleMedium * scale }]}
        >
          🎨 {t("settings.colorScheme")}
        </Text>
        <View style={[styles.swatchRow, isLandscape ? styles.swatchRowLandscape : null]}>
          {COLOR_SCHEME_IDS.map((id: AppColorScheme) => {
            const scheme = COLOR_SCHEMES[id];
            const selected = colorScheme === id;
            const circleSize = 44 * scale;
            return (
              <TouchableRipple
                key={id}
                onPress={() => setColorScheme(id)}
                borderless
                style={styles.swatchTouchable}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={t(scheme.labelKey)}
              >
                <View style={styles.swatchItem}>
                  <View
                    style={[
                      styles.swatchCircle,
                      {
                        backgroundColor: scheme.swatch,
                        width: circleSize,
                        height: circleSize,
                        borderRadius: circleSize / 2,
                        borderWidth: selected ? 3 : 0,
                        borderColor: theme.colors.onSurface,
                      },
                    ]}
                  >
                    {selected ? (
                      <MaterialCommunityIcons name="check" size={20 * scale} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text
                    variant="bodySmall"
                    style={[styles.swatchLabel, { fontSize: MD3_SIZE.bodySmall * scale }]}
                  >
                    {t(scheme.labelKey)}
                  </Text>
                </View>
              </TouchableRipple>
            );
          })}
        </View>

        <Divider style={{ marginVertical: dividerSpacing }} />

        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: MD3_SIZE.titleMedium * scale }]}>
          🗣️ {t("settings.arabicHelp")}
        </Text>
        <Card mode="outlined">
          <Card.Content style={[styles.arabicToggleRow, { paddingVertical: isTablet ? 8 : 0 }]}>
            <Text
              variant="bodyMedium"
              style={[styles.arabicToggleText, { fontSize: MD3_SIZE.bodyMedium * scale }]}
            >
              {t("settings.arabicHelpDescription")}
            </Text>
            <Switch value={arabicHelpEnabled} onValueChange={setArabicHelpEnabled} />
          </Card.Content>
        </Card>

        <Divider style={{ marginVertical: dividerSpacing }} />

        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: MD3_SIZE.titleMedium * scale }]}>
          🗑️ {t("settings.dataSection")}
        </Text>
        <Button
          mode="outlined"
          icon="delete-outline"
          onPress={handleResetData}
          textColor={theme.colors.error}
          style={styles.resetButton}
          contentStyle={{ paddingVertical: isTablet ? 6 : 2 }}
        >
          {t("settings.resetData")}
        </Button>

        <Card mode="outlined" style={[styles.disclaimerCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content style={styles.disclaimerContent}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18 * scale}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, flex: 1, fontSize: MD3_SIZE.bodySmall * scale }}
            >
              {t("common.disclaimer")}
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  container: { flex: 1 },
  header: { marginBottom: 16 },
  sectionTitle: { marginTop: 8, marginBottom: 10 },
  resetButton: { marginTop: 4 },
  arabicToggleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  arabicToggleText: { flex: 1 },
  disclaimerCard: { marginTop: 24 },
  disclaimerContent: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  swatchRow: { flexDirection: "row", flexWrap: "wrap", gap: 20, marginTop: 2 },
  swatchRowLandscape: { gap: 32 },
  swatchTouchable: { borderRadius: 12 },
  swatchItem: { alignItems: "center", padding: 6, gap: 6, width: 88 },
  swatchCircle: { alignItems: "center", justifyContent: "center" },
  swatchLabel: { textAlign: "center" },
});
