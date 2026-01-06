import { test, expect } from "./fixtures";

test.describe("Smoke test", () => {
  test("interaction", async ({ page }) => {
    await page.goto("/cy/smoke-interaction.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("interaction.png", {
      threshold: 0.01,
      fullPage: true,
    });
  });
});
