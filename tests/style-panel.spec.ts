import { test, expect } from "./fixtures";

test.describe("Smoke test", () => {
  test("style-panel", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/smoke-creation.html");
    // Wait for the app to be fully loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // get element whose class is message and it has text content 'm'
    const messageLabel = page.locator(".message").filter({ hasText: "m" });

    // Take a screenshot before click - this ensures the page is in a stable state
    await expect(page).toHaveScreenshot("before-click.png", {
      threshold: 0.01,
      fullPage: true,
    });

    // Click the message element (no force needed when page is stable)
    await messageLabel.click();

    // Add a wait to ensure the component has time to initialize
    await page.waitForTimeout(500);

    // Take a screenshot after click to document the style panel appearance
    await expect(page).toHaveScreenshot("after-click.png", {
      threshold: 0.01,
      fullPage: true,
    });

    // Verify the style panel is visible
    await expect(page.locator("#style-panel")).toBeVisible({ timeout: 5000 });
  });
});
