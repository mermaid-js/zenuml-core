import { test, expect } from "@playwright/test";
import { initVerticalDebug, writeVerticalDebug } from "./utils/verticalDebug";

test.describe("Rendering", () => {
  test("Async message mini - 1", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("/cy/async-message-mini-1.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    try {
      await expect(page).toHaveScreenshot("async-message-mini-1.png", {
        threshold: 0.01,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "async-message-mini-1-debug");
      }
    }
  });

  test("Async message mini - 2", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("/cy/async-message-mini-2.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    try {
      await expect(page).toHaveScreenshot("async-message-mini-2.png", {
        threshold: 0.01,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "async-message-mini-2-debug");
      }
    }
  });
});
