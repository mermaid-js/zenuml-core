import { test, expect } from "./fixtures";

test.describe("Defect 406", () => {
  test.beforeEach(async ({ page }) => {
    // run these tests as if in a desktop
    // browser with a 720p monitor
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("Fragments under Creation", async ({ page }) => {
    await page.goto("/cy/defect-406-alt-under-creation.html");
    await expect(page.locator('[data-signature="m6"]')).toBeVisible({
      timeout: 5000,
    });
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
