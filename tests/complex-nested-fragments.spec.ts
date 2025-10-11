import { test, expect } from "@playwright/test";

test.describe("Complex Nested Fragments Test", () => {
  test("should render complex DSL with comments, alt fragments, and nested try-catch correctly", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/complex-nested-fragments.html");
    
    // Wait for the privacy icon to be loaded (standard pattern)
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take a full page screenshot for visual regression testing
    await expect(page).toHaveScreenshot({
      threshold: 0.02,
      fullPage: true,
    });
  });
});
