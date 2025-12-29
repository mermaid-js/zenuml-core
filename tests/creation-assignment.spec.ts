import { test, expect } from "./fixtures";

test.describe("Rendering", () => {
  test("creation assignment", async ({ page }) => {
    await page.goto("/cy/creation-assignment.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("creation-assignment.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("creation assignment 2", async ({ page }) => {
    await page.goto("/cy/creation-assignment-2.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("creation-assignment-2.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });
});
