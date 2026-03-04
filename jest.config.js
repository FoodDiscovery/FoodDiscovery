module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>"],
  testMatch: ["**/*.test.[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/_layout.tsx",
    "!**/styles/**",
  ],
  coverageReporters: ["text", "text-summary", "lcov"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 75,
      branches: 65,
      functions: 75,
    },
  },
};
