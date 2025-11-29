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
  {
    name: "creation inside alt branch",
    url: "http://127.0.0.1:8080/cy/creation-alt.html",
    snapshot: "creation-alt.png",
    debugSlug: "creation-alt",
  },
  {
    name: "creation inside section fragment",
    url: "http://127.0.0.1:8080/cy/creation-section.html",
    snapshot: "creation-section.png",
    debugSlug: "creation-section",
  },
  {
    name: "creation inside try/catch fragment",
    url: "http://127.0.0.1:8080/cy/creation-tcf.html",
    snapshot: "creation-tcf.png",
    debugSlug: "creation-tcf",
  },
  {
    name: "creation inside loop fragment",
    url: "http://127.0.0.1:8080/cy/creation-loop.html",
    snapshot: "creation-loop.png",
    debugSlug: "creation-loop",
  },
  {
    name: "multiple creations in sequence",
    url: "http://127.0.0.1:8080/cy/creation-multi.html",
    snapshot: "creation-multi.png",
    debugSlug: "creation-multi",
  },
];

cases.forEach((item) => {
  test.describe(item.name, () => {
    test("renders identically in both vertical modes", async ({ page }) => {
      const didEnableDebug = await initVerticalDebug(page);
      await page.goto(item.url);

      await expect(page.locator(".privacy>span>svg")).toBeVisible({
        timeout: 15000,
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
