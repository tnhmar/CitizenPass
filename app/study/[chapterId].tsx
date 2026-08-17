import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";

// Scaffold placeholder for a single chapter's study content.
export default function ChapterDetailScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Chapter</Text>
      <Text variant="bodyMedium">Chapter detail scaffold ({chapterId}).</Text>
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
