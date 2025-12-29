import { test, expect } from "./fixtures";

test.describe("Rendering", () => {
  test("Async message mini - 1", async ({ page }) => {
    await page.goto("/cy/async-message-mini-1.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("async-message-mini-1.png", {
      threshold: 0.01,
      fullPage: true,
    });
  });

  test("Async message mini - 2", async ({ page }) => {
    await page.goto("/cy/async-message-mini-2.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("async-message-mini-2.png", {
      threshold: 0.01,
      fullPage: true,
    });
  });
});
