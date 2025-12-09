import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    name: "e2e",
    globals: true,
    environment: "jsdom",
    include: ["tests/e2e/**/*.spec.ts", "tests/e2e/**/*.spec.tsx"],
    exclude: ["node_modules", ".next", "dist"],
    setupFiles: ["./tests/setup.e2e.ts"],
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.config.*",
        "**/types/**",
        "**/*.d.ts",
        "**/mockData/**"
      ]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
