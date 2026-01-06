import { test, expect } from "./fixtures";

test.describe("Smoke test", () => {
  test("fragmentIssue", async ({ page }) => {
    await page.goto("/cy/smoke-fragment-issue.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });
    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });

  test("fragment", async ({ page }) => {
    await page.goto("/cy/smoke-fragment.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });
    await expect(page).toHaveScreenshot({
      threshold: 0.02,
      fullPage: true,
    });
  });
});
