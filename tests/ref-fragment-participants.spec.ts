import { test, expect } from "@playwright/test";

test.describe("Ref Fragment with Participants Test", () => {
  test("should render ref fragment with participants correctly", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/ref-fragment-participants.html");
    
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
