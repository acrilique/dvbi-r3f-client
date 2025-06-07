import js from "@eslint/js";
import globals from "globals";
import eslintReact from "@eslint-react/eslint-plugin";
import reactCompiler from "eslint-plugin-react-compiler";
import * as reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default [
  {
    // These ignores are now global
    ignores: ["dist/**", "node_modules/**", "DVB-I-Reference-Client/**", ".triplex/**"],
  },
  // The main linting configuration, spread from tseslint.config()
  ...tseslint.config({
    files: ["./src/**/*.ts", "./src/**/*.tsx"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      eslintReact.configs["recommended-typescript"],
      reactCompiler.configs.recommended,
      reactHooks.configs.recommended,
      eslintPluginPrettierRecommended,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
      }
    },
    rules: {
      "no-console": "warn",
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  }),
];
