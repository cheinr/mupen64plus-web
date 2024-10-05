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
      displayName: "all-tests",
      testMatch: [
        "**/test/browser/*.test.js",
        "**/scripts/gamepad-utils.test.js"
      ],
      moduleFileExtensions: ["js"],
      runner: 'jest-serial-runner'
    },
    {
      displayName: "release-browser-tests",
      testMatch: ["**/test/browser/release.test.js"],
      moduleFileExtensions: ["js"],
      runner: 'jest-serial-runner'
    }
  ]
};

module.exports = config;
