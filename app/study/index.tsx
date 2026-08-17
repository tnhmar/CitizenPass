import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

// Scaffold placeholder for the Study chapters list.
export default function StudyIndexScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Study</Text>
      <Text variant="bodyMedium">Chapter list scaffold.</Text>
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
