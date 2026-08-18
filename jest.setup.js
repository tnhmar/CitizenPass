jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// @expo/vector-icons relies on expo-font to load icon fonts natively.
// In the Jest test environment there is no native font loader, so we
// replace icon components with a lightweight Text-based stand-in. This
// keeps component tests (e.g. NavCard) fast and free of native module
// errors without needing real font assets.
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  function createIconStub(iconSetName) {
    return function IconStub(props) {
      return React.createElement(Text, props, props && props.name ? props.name : iconSetName);
    };
  }

  return new Proxy(
    {},
    {
      get: (_target, iconSetName) => createIconStub(String(iconSetName)),
    }
  );
});
