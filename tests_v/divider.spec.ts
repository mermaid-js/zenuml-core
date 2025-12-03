import { test, expect } from "./fixtures";
import {
  initVerticalDebug,
  writeVerticalDebug,
} from "../tests/utils/verticalDebug";

test.describe("Divider", () => {
  test("divider only diagram", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("/cy/divider.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("divider-basic.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "divider-basic");
      }
    }
  });
});
