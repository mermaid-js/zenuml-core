import { test, expect } from "@playwright/test";

test.describe("Creation RTL Layout", () => {
  test("should render creation message with right-to-left layout", async ({
    page,
  }) => {
    await page.goto("/cy/creation-rtl.html");

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });
});

