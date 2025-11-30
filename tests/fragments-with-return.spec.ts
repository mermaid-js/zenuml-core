import { test, expect } from "@playwright/test";

test.describe("Fragments with Return Test", () => {
  test("should render if-else and try-catch-finally with return statements correctly", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/fragments-with-return.html");
    // Wait for the privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take a snapshot of the rendered diagram
    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });
});

