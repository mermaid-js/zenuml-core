import { test, expect } from "./fixtures";
import { initVerticalDebug, writeVerticalDebug } from "./utils/verticalDebug";

test.describe("Smoke test", () => {
  test("Self Sync Message at Root", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/self-sync-message-at-root.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });
    try {
      await expect(page).toHaveScreenshot({
        threshold: 0.01,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "self-sync-message-at-root-debug");
      }
    }
  });
});
