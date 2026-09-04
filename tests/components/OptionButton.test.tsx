import { render } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { StyleSheet } from "react-native";
import type { StyleProp, TextStyle } from "react-native";
import { OptionButton } from "../../src/components/OptionButton";
import { getPaperTheme } from "../../src/theme/paperThemes";

const theme = getPaperTheme("classicRed", "light");

// Typed against TextStyle (not `never`/`unknown`) so StyleSheet.flatten's
// generic resolves properly; the final `as string | undefined` only covers
// the gap between RN's ColorValue type and the plain hex strings this app's
// theme always uses for `color`.
function textColor(style: StyleProp<TextStyle>): string | undefined {
  return StyleSheet.flatten(style)?.color as string | undefined;
}

// Theme audit regression coverage: OptionButton previously defaulted every
// "outlined" (i.e. unanswered) option's text to theme.colors.primary (brand
// red), and Exam mode used mode="contained" (also brand red) for a
// selection the user made but that hasn't been graded yet. See
// docs/theme-navigation-responsive-overhaul.md.
describe("OptionButton", () => {
  it("uses neutral on-surface text for an unanswered (outlined) option, not brand primary", () => {
    const { getByText } = render(
      <PaperProvider theme={theme}>
        <OptionButton label="A. Test option" mode="outlined" onPress={() => {}} />
      </PaperProvider>
    );
    const label = getByText("A. Test option");
    expect(textColor(label.props.style)).toBe(theme.colors.onSurface);
    expect(textColor(label.props.style)).not.toBe(theme.colors.primary);
  });

  it("uses the secondary-tinted 'selected' state (not primary/error) for a mid-exam pick", () => {
    const { getByText } = render(
      <PaperProvider theme={theme}>
        <OptionButton label="B. Test option" mode="selected" onPress={() => {}} />
      </PaperProvider>
    );
    const label = getByText("B. Test option");
    expect(textColor(label.props.style)).toBe(theme.colors.onSecondaryContainer);
    expect(textColor(label.props.style)).not.toBe(theme.colors.primary);
    expect(textColor(label.props.style)).not.toBe(theme.colors.error);
  });

  it("still allows explicit graded colors for contained mode (Practice mode correct/incorrect reveal)", () => {
    const { getByText } = render(
      <PaperProvider theme={theme}>
        <OptionButton
          label="C. Test option"
          mode="contained"
          onPress={() => {}}
          containedColor={theme.colors.error}
          contentColor={theme.colors.onError}
        />
      </PaperProvider>
    );
    const label = getByText("C. Test option");
    expect(textColor(label.props.style)).toBe(theme.colors.onError);
  });
});
