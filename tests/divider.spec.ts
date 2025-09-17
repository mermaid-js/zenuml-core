import { test, expect } from "@playwright/test";

test.describe("Divider Component", () => {
  test("should render divider with all features", async ({ page }) => {
    await page.goto("http://localhost:8080/cy/divider.html");
    
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
    
    // Wait for ZenUML to load and render
    await page.waitForTimeout(5000);
    
    // Check that dividers are present
    const dividerCount = await page.locator(".divider").count();
    expect(dividerCount).toBeGreaterThan(0);
    
    // Test the first divider found
    const firstDivider = page.locator(".divider").first();
    
    // Check that the divider is visible
    await expect(firstDivider).toBeVisible();
    
    // Check that it has the correct structure
    await expect(firstDivider).toHaveClass(/flex/);
    await expect(firstDivider).toHaveClass(/items-center/);
    
    // Check for left and right lines
    const leftLine = firstDivider.locator(".left");
    const rightLine = firstDivider.locator(".right");
    
    await expect(leftLine).toBeVisible();
    await expect(rightLine).toBeVisible();
    
    // Check that lines have h-px class
    await expect(leftLine).toHaveClass(/h-px/);
    await expect(rightLine).toHaveClass(/h-px/);
    
    // Check for name element
    const nameElement = firstDivider.locator(".name");
    await expect(nameElement).toBeVisible();
    await expect(nameElement).toHaveClass(/text-center/);
    await expect(nameElement).toHaveClass(/px-2/);
    
    // Check that the text content is correct
    await expect(nameElement).toContainText("Basic Divider");
  });
});