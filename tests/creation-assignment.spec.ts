import { test, expect } from "@playwright/test";
import { initVerticalDebug, writeVerticalDebug } from "./utils/verticalDebug";

test.describe("Creation assignment", () => {
  test("renders without regression", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/creation-assignment.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("creation-assignment.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "creation-assignment");
      }
    }
  });
});
