import { test, expect } from "@playwright/test";
import { initVerticalDebug, writeVerticalDebug } from "./utils/verticalDebug";

test.describe("Demo1 DSL", () => {
  test("renders without visual regression", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/demo1.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("demo1.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "demo1-debug");
      }
    }
  });
});
