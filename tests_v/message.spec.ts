import { test, expect } from "./fixtures";
import { initVerticalDebug, writeVerticalDebug } from "../tests/utils/verticalDebug";

test.describe("Messages", () => {
  test("sync message", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/message-sync.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("message-sync.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "message-sync");
      }
    }
  });

  test("async message", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/message-async.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("message-async.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "message-async");
      }
    }
  });

  test("sync message with block", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/message-with-block.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("message-with-block.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "message-with-block");
      }
    }
  });
});
