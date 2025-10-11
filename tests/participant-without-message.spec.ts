import { test, expect } from "@playwright/test";

test.describe("Participant without message", () => {
  test("should render participants without messages correctly", async ({ page }) => {
    await page.goto("/cy/participant-without-message.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("participant-without-message.png", {
      threshold: 0.01,
      fullPage: true,
    });
  });
});
