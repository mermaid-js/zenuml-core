import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT) || 14000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: "test-results/",
  reporter: process.env.CI
    ? [
        ["github"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
        // Per-test durations for scripts/e2e-shard-timings.mjs. Lives under
        // outputDir (cleared at start, kept at end), not under the html
        // reporter's folder, which that reporter rewrites.
        ["json", { outputFile: "test-results/report.json" }],
      ]
    : [["html", { outputFolder: "playwright-report" }]],
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
        // Force color profile like Cypress config
        launchOptions: {
          args: ["--force-color-profile=srgb"],
        },
      },
    },
  ],
  webServer: {
    command: `bun run dev -- --port=${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
