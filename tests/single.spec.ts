import { test, expect } from "./fixtures";
import { initVerticalDebug, writeVerticalDebug } from "./utils/verticalDebug";
import {
  captureDebugScreenshot,
  exportComponentBreakdown,
} from "./utils/debugScreenshot";

test.describe("Rendering", () => {
  test("single-1", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/single-1.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("single-1.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "single-1-debug");
        await captureDebugScreenshot(page, "single-1");
        await exportComponentBreakdown(page, "single-1");
      }
    }
  });
});
