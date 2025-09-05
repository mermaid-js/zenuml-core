import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: resolve(__dirname, "test/setup.ts"),
    include: [
      "src/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "test/**/*.{test,spec}.{js,ts,jsx,tsx}",
    ],
    exclude: [
      "node_modules/**",
      "tests/**", // Exclude Playwright tests
      "**/tests/**/*.spec.ts", // Exclude Playwright test files specifically
      "**/tests/**/*.spec.js", // Exclude Playwright test files specifically
    ],
  },
});
