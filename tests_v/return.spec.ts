import { test, expect } from "./fixtures";
import {
  initVerticalDebug,
  writeVerticalDebug,
} from "../tests/utils/verticalDebug";

test.describe("Return statements", () => {
  test("return produced by assignment", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("/cy/return-assignment.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("return-assignment.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "return-assignment");
      }
    }
  });

  test("return produced by keyword", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("/cy/return-keyword.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("return-keyword.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "return-keyword");
      }
    }
  });

  test("return produced by annotation", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("/cy/return-annotation.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("return-annotation.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "return-annotation");
      }
    }
  });
});
