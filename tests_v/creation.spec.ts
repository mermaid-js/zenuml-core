import { test, expect } from "./fixtures";
import { initVerticalDebug, writeVerticalDebug } from "../tests/utils/verticalDebug";
import {
  captureDebugScreenshot,
  exportComponentBreakdown,
} from "../tests/utils/debugScreenshot";

const cases = [
  {
    name: "root creation",
    url: "http://127.0.0.1:8080/cy/smoke-creation.html",
    snapshot: "creation-root.png",
    debugSlug: "creation-root",
  },
  {
    name: "creation inside par",
    url: "http://127.0.0.1:8080/cy/single-1.html",
    snapshot: "creation-par.png",
    debugSlug: "creation-par",
  },
  {
    name: "creation assignment after inline message",
    url: "http://127.0.0.1:8080/cy/creation-assignment.html",
    snapshot: "creation-assignment.png",
    debugSlug: "creation-assignment",
  },
];

cases.forEach((item) => {
  test.describe(item.name, () => {
    test("renders identically in both vertical modes", async ({ page }) => {
      const didEnableDebug = await initVerticalDebug(page);
      await page.goto(item.url);

      await expect(page.locator(".privacy>span>svg")).toBeVisible({
        timeout: 5000,
      });

      try {
        await expect(page).toHaveScreenshot(item.snapshot, {
          threshold: 0.02,
          fullPage: true,
        });
      } finally {
        if (didEnableDebug) {
          await writeVerticalDebug(page, item.debugSlug);
          await captureDebugScreenshot(page, item.debugSlug);
          await exportComponentBreakdown(page, item.debugSlug);
        }
      }
    });
  });
});
