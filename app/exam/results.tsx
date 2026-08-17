import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

// Scaffold placeholder for the Exam Results / review screen.
export default function ExamResultsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Results</Text>
      <Text variant="bodyMedium">Exam results scaffold.</Text>
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
