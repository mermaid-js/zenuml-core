import { test, expect } from "@playwright/test";
import { initVerticalDebug, writeVerticalDebug } from "./utils/verticalDebug";

test.describe("Rendering", () => {
  test("alt-1", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/alt.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("alt-1.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "alt-1-debug");
      }
    }
  });

  test("alt-2", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/alt-2.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("alt-2.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "alt-2-debug");
      }
    }
  });
});
