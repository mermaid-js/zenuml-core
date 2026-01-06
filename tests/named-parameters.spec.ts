import { test, expect } from "./fixtures";

test.describe("Named Parameters", () => {
  test("should render named parameters correctly", async ({ page }) => {
    await page.goto("/cy/named-parameters.html");

    // Wait for the diagram to be loaded by checking for a specific signature
    await expect(page.locator('[data-signature*="method(userId=123"]')).toBeVisible({
      timeout: 5000,
    });

    // Wait for privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Check that named parameters are displayed correctly in the diagram
    await expect(page.locator('[data-signature*="method(userId=123"]')).toBeVisible();
    await expect(page.locator('[data-signature*="create(type="]')).toBeVisible();
    await expect(page.locator('[data-signature*="mixedCall(1,name="]')).toBeVisible();
    await expect(page.locator('[data-signature="oldStyle(1,2,3)"]')).toBeVisible();
    await expect(page.locator('[data-signature*="complex(first="]')).toBeVisible();

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("named-parameters.png", {
      threshold: 0.01,
      fullPage: true,
    });
  });

  test("should handle backward compatibility", async ({ page }) => {
    await page.goto("/cy/named-parameters.html");

    // Verify that traditional positional parameters still work
    await expect(page.locator('[data-signature="oldStyle(1,2,3)"]')).toBeVisible({
      timeout: 5000,
    });

    // Verify that mixed parameters work
    await expect(page.locator('[data-signature*="mixedCall(1,name="]')).toBeVisible();
  });
});