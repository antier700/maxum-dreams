const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["<rootDir>/src/**/*.test.[jt]s?(x)"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
};

module.exports = createJestConfig(customJestConfig);
