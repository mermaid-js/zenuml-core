import { test, expect } from "./fixtures";
import { initVerticalDebug, writeVerticalDebug } from "./utils/verticalDebug";

const demos = [
  {
    name: "Demo1 DSL",
    url: "http://127.0.0.1:8080/cy/demo1.html",
    snapshot: "demo1.png",
    debugSlug: "demo1-debug",
  },
  {
    name: "Demo3 DSL",
    url: "http://127.0.0.1:8080/cy/demo3.html",
    snapshot: "demo3.png",
    debugSlug: "demo3-debug",
  },
  {
    name: "Demo4 DSL",
    url: "http://127.0.0.1:8080/cy/demo4.html",
    snapshot: "demo4.png",
    debugSlug: "demo4-debug",
  },
];

demos.forEach((demo) => {
  test.describe(demo.name, () => {
    test("renders without visual regression", async ({ page }) => {
      const didEnableDebug = await initVerticalDebug(page);
      await page.goto(demo.url);

      await expect(page.locator(".privacy>span>svg")).toBeVisible({
        timeout: 5000,
      });

      try {
        await expect(page).toHaveScreenshot(demo.snapshot, {
          threshold: 0.02,
          fullPage: true,
        });
      } finally {
        if (didEnableDebug) {
          await writeVerticalDebug(page, demo.debugSlug);
        }
      }
    });
  });
});
