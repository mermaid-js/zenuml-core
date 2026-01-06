import { test, expect } from "@playwright/test";

test.describe("Fragments with Return Test", () => {
  test("should render if-else and try-catch-finally with return statements correctly", async ({
    page,
  }) => {
    await page.goto("/cy/fragments-with-return.html");
    // Wait for the privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take a snapshot of the rendered diagram
    await expect(page).toHaveScreenshot({
      threshold: 0.02,  // There is always one pixel difference when I run playwright with UI.
      fullPage: true,
      maxDiffPixels: 3, // Allow up to 3 pixels to differ for anti-aliasing variations
    });
  });
});
