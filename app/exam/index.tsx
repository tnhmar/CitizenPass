import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

// Scaffold placeholder for the Simulated Exam flow.
export default function ExamIndexScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Simulated Exam</Text>
      <Text variant="bodyMedium">Exam flow scaffold.</Text>
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
