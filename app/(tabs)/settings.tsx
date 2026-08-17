import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

// Scaffold placeholder for Settings (language, theme, reset data).
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Settings</Text>
      <Text variant="bodyMedium">Settings scaffold.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
