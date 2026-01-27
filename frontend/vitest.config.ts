import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "@": path.resolve(__dirname, "./"),
    },
  },
})
