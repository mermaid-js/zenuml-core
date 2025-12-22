import { test, expect } from "./fixtures";

test.describe("Rendering", () => {
  test("vertical-1", async ({ page }) => {
    await page.goto("/cy/vertical-1.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-1.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-2", async ({ page }) => {
    await page.goto("/cy/vertical-2.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-2.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });
});
