import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

// Scaffold placeholder. Home dashboard (Continue Studying, Practice,
// Simulated Exam, Progress, Settings entry points) is implemented in a
// later milestone.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">CitizenPass</Text>
      <Text variant="bodyMedium">Home screen scaffold.</Text>
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
