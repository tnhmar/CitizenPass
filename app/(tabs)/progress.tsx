import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

// Scaffold placeholder for Progress tracking.
export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Progress</Text>
      <Text variant="bodyMedium">Progress tracking scaffold.</Text>
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
