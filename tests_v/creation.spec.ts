import { test, expect } from "./fixtures";
import {
  initVerticalDebug,
  writeVerticalDebug,
} from "../tests/utils/verticalDebug";

const cases = [
  {
    name: "root creation",
    url: "/cy/smoke-creation.html",
    snapshot: "creation-root.png",
    debugSlug: "creation-root",
  },
  {
    name: "creation inside par",
    url: "/cy/single-1.html",
    snapshot: "creation-par.png",
    debugSlug: "creation-par",
  },
  {
    name: "creation assignment after inline message",
    url: "/cy/creation-assignment.html",
    snapshot: "creation-assignment.png",
    debugSlug: "creation-assignment",
  },
  {
    name: "creation inside alt branch",
    url: "/cy/creation-alt.html",
    snapshot: "creation-alt.png",
    debugSlug: "creation-alt",
  },
  {
    name: "creation inside section fragment",
    url: "/cy/creation-section.html",
    snapshot: "creation-section.png",
    debugSlug: "creation-section",
  },
  {
    name: "creation inside try/catch fragment",
    url: "/cy/creation-tcf.html",
    snapshot: "creation-tcf.png",
    debugSlug: "creation-tcf",
  },
  {
    name: "creation inside loop fragment",
    url: "/cy/creation-loop.html",
    snapshot: "creation-loop.png",
    debugSlug: "creation-loop",
  },
  {
    name: "multiple creations in sequence",
    url: "/cy/creation-multi.html",
    snapshot: "creation-multi.png",
    debugSlug: "creation-multi",
  },
  {
    name: "creation assignment inside block",
    url: "/cy/creation-assignment-block.html",
    snapshot: "creation-assignment-block.png",
    debugSlug: "creation-assignment-block",
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
        }
      }
    });
  });
});
