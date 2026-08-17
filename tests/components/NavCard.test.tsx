import { render, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { NavCard } from "../../src/components/NavCard";

describe("NavCard", () => {
  it("renders title and description, and calls onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = render(
      <PaperProvider>
        <NavCard title="Practice" description="Random questions" onPress={onPress} />
      </PaperProvider>
    );

    expect(getByText("Practice")).toBeTruthy();
    expect(getByText("Random questions")).toBeTruthy();

    fireEvent.press(getByLabelText("Practice"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
