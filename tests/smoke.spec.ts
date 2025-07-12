import { test, expect } from "@playwright/test";

test.describe("Smoke test", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/cy/smoke.html");

    // Wait for the element to be visible
    await expect(page.locator('[data-signature="append(line)"]')).toBeVisible({
      timeout: 5000,
    });

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("should-load-the-home-page.png", {
      threshold: 0.012,
      fullPage: true,
    });
  });
});
