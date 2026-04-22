import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // File-size limits: flag modules that have grown too large to be easily
  // understood or reviewed. Kept above the current largest file to avoid
  // breaking the existing codebase; tighten over time as files are refactored.
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"],
    rules: {
      "max-lines": [
        "warn",
        {
          max: 1500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  // Relax the limit for test files, which can legitimately be longer.
  {
    files: ["**/__tests__/**", "**/*.test.*", "**/*.spec.*"],
    rules: {
      "max-lines": "off",
    },
  },
  // TypeScript naming conventions
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsparser,
    },
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        // Variables: camelCase, UPPER_CASE (constants), PascalCase (React components)
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        // Functions: camelCase or PascalCase (React components)
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        // Parameters: camelCase
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        // Types, interfaces, classes, enums: PascalCase
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        // Enum members: UPPER_CASE or PascalCase
        {
          selector: "enumMember",
          format: ["UPPER_CASE", "PascalCase"],
        },
        // Object literal properties: allow snake_case for API compatibility
        // Filter out CSS variables, HTTP headers, location keys, CSS class names
        {
          selector: "objectLiteralProperty",
          format: ["camelCase", "UPPER_CASE", "PascalCase", "snake_case"],
          leadingUnderscore: "allow",
          filter: {
            regex: "^(--|Content-|__html|.*[, ].*|[a-z]+-[a-z0-9.]+).*$",
            match: false,
          },
        },
        // Class/interface properties: camelCase
        {
          selector: "classProperty",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        // Type properties: allow snake_case for API types
        {
          selector: "typeProperty",
          format: ["camelCase", "snake_case"],
          leadingUnderscore: "allow",
        },
        // Methods: camelCase
        {
          selector: "method",
          format: ["camelCase"],
        },
      ],
    },
  },
])

export default eslintConfig
