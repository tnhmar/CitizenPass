import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";

/**
 * Bottom tab bar with Material Community Icons and themed active/inactive
 * colors. Headers are hidden here because each screen renders its own
 * emoji-titled header for a more custom, app-branded feel.
 */
export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home.title"),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons name={focused ? "home" : "home-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: t("practice.title"),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons name={focused ? "pencil" : "pencil-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t("progress.title"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-donut" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings.title"),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons name={focused ? "cog" : "cog-outline"} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
