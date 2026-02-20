import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import globals from "globals"
import { defineConfig } from "eslint/config"

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,

  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "**/build/**",
      ".expo/**",
      "coverage/**"
    ],

    files: [
      "**/*.{ts,tsx,js,jsx}"
    ],

    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  }
)