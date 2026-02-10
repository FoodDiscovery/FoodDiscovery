module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>"],
  testMatch: ["**/*.test.[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/_layout.tsx",
  ],
  coverageReporters: ["text", "text-summary", "lcov"],
  coverageDirectory: "coverage",
};
