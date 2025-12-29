import { test, expect } from "./fixtures";

test.describe("Rendering", () => {
  test("single-1", async ({ page }) => {
    await page.goto("/cy/single-1.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("single-1.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });
});
