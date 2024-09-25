const config = {
  transform: {},
  projects: [
    {
      displayName: "gamepad-utils",
      testMatch: ["**/scripts/gamepad-utils.test.js"],
      moduleFileExtensions: ["js"],
      transform: {
        "^.+\\.[t|j]sx?$": "babel-jest"
      },
    },
    {
      displayName: "browser-tests",
      testMatch: ["**/test/browser/*.test.js"],
      moduleFileExtensions: ["js"],
      runner: 'jest-serial-runner'
    }
  ]
};

module.exports = config;
