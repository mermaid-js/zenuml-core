import { test, expect } from "./fixtures";

test.describe("Return functionality", () => {
  test("return", async ({ page }) => {
    await page.goto("/cy/return.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });
    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });
});
