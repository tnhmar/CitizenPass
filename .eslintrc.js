module.exports = {
  extends: ["expo"],
  rules: {},
  ignorePatterns: ["/dist/*", "/node_modules/*"],
  overrides: [
    {
      files: ["jest.setup.js"],
      env: { jest: true },
    },
  ],
};
