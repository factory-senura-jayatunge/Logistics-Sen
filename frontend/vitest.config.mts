import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    pool: "threads",
    reporters: ["verbose"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov"],
      include: ["lib/**/*.ts", "hooks/**/*.ts", "components/**/*.tsx"],
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"],
      thresholds: {
        lines: 2,
        functions: 15,
        branches: 20,
        statements: 2,
      },
    },
  },
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "@": path.resolve(__dirname, "./"),
    },
  },
})
