import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  workers: 4,
  use: { baseURL: "http://127.0.0.1:14000" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1200, height: 800 }, launchOptions: { executablePath: process.env.PW_CHROMIUM } } }],
});
