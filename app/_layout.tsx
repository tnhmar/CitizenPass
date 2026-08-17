import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import "../src/i18n";

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
