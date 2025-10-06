import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: "test-results/",
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["html", { outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://127.0.0.1:8080",
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
    command: "bun run dev",
    url: "http://127.0.0.1:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
