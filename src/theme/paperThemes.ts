import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { brandColors } from "./tokens";

export const lightTheme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.canadaRed,
    onPrimary: "#FFFFFF",
    primaryContainer: brandColors.canadaRedSoft,
    secondary: brandColors.navy,
    secondaryContainer: "#E4E9F5",
    tertiary: brandColors.gold,
    error: brandColors.danger,
    errorContainer: brandColors.dangerSoft,
    background: "#FAFAFC",
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  roundness: 16,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#FF8A80",
    primaryContainer: "#5C1A1A",
    secondary: "#9FB8E0",
    secondaryContainer: "#243654",
    tertiary: brandColors.gold,
    error: "#FF6B6B",
    errorContainer: "#4A1616",
    background: "#0F1420",
  },
};
