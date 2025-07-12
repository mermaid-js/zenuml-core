import { test, expect } from "@playwright/test";

test.describe("Smoke test", () => {
  test("fragmentIssue", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/smoke-fragment-issue.html");
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
    await page.goto("http://127.0.0.1:8080/cy/smoke-fragment.html");
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
