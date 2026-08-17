import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

// Scaffold placeholder for Practice Mode.
export default function PracticeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Practice</Text>
      <Text variant="bodyMedium">Practice mode scaffold.</Text>
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
