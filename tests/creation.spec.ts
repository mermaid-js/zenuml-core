import { test, expect } from "@playwright/test";

test.describe("Smoke test", () => {
  test("creation", async ({ page }) => {
    await page.goto("/cy/smoke-creation.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("creation.png", {
      threshold: 0.01,
      fullPage: true,
    });
  });
});
