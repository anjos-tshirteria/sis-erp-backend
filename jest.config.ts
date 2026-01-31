import type { Config } from "jest";

/** @type {import('jest').Config} */
import { pathsToModuleNameMapper } from "ts-jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: pathsToModuleNameMapper(
    {
      "@src/*": ["src/*"],
      "test/*": ["test/*"],
    },
    {
      prefix: "<rootDir>/",
    },
  ),
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/*.spec.ts", "**/*.test.ts"],
};

export default config;
