import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT) || 8080;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests_v",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: "test-results-v/",
  reporter: process.env.CI
    ? [
        ["github"],
        ["html", { open: "never", outputFolder: "playwright-report-v" }],
      ]
    : [["html", { outputFolder: "playwright-report-v" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1200, height: 800 },
        launchOptions: {
          args: ["--force-color-profile=srgb"],
        },
      },
    },
  ],
  webServer: {
    command: `bun run dev -- --port=${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
