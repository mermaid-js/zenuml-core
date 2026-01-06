import { test, expect } from "./fixtures";

const demos = [
  {
    name: "Demo1 DSL",
    url: "/cy/demo1.html",
    snapshot: "demo1.png",
    debugSlug: "demo1-debug",
  },
  {
    name: "Demo3 DSL",
    url: "/cy/demo3.html",
    snapshot: "demo3.png",
    debugSlug: "demo3-debug",
  },
  {
    name: "Demo4 DSL",
    url: "/cy/demo4.html",
    snapshot: "demo4.png",
    debugSlug: "demo4-debug",
  },
];

demos.forEach((demo) => {
  test.describe(demo.name, () => {
    test("renders without visual regression", async ({ page }) => {
      await page.goto(demo.url);

      await expect(page.locator(".privacy>span>svg")).toBeVisible({
        timeout: 5000,
      });

      await expect(page).toHaveScreenshot(demo.snapshot, {
        threshold: 0.02,
        fullPage: true,
      });
    });
  });
});
