import { test, expect } from "./fixtures";

test.describe("Rendering", () => {
  test("return-in-nested-if", async ({ page }) => {
    await page.goto("/cy/return-in-nested-if.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("return-in-nested-if.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });
});
