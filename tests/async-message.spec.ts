import { test, expect } from "./fixtures";

test.describe("Rendering", () => {
  test("Async message - 1", async ({ page }) => {
    await page.goto("/cy/async-message-1.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("async-message-1.png", {
      threshold: 0.01,
      fullPage: true,
    });
  });

  test("Async message - 2", async ({ page }) => {
    await page.goto("/cy/async-message-2.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("async-message-2.png", {
      threshold: 0.01,
      fullPage: true,
    });
  });

  test("Async message - 3", async ({ page }) => {
    await page.goto("/cy/async-message-3.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("async-message-3.png", {
      threshold: 0.01,
      fullPage: true,
    });
  });
});
