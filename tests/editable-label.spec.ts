import { test, expect } from "@playwright/test";

test.describe("Editable Label", () => {
  test("Special characters & extra spaces", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/smoke-editable-label.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("method()", { exact: false })).toBeVisible();
    await expect(page.getByText("Alice", { exact: false })).toBeVisible();

    // Edit the message - use stable locator
    const messageLabel = page.locator(".interaction.sync .message .editable-span-base").first();
    await expect(messageLabel).toHaveText("method()");
    await messageLabel.dblclick();

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Use page.keyboard to avoid stale locator issues
    await page.keyboard.type("1");
    await page.keyboard.press("Enter");

    // Wait for the edit to complete
    await page.waitForTimeout(500);

    await expect(page.locator("span").getByText("meth1od()")).toBeVisible({
      timeout: 10000,
    });
    await page.locator(".header").click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });

  test("Self message", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/smoke-editable-label.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use a stable locator that won't change with text
    const messageLabel = page.locator(".self-invocation .editable-span-base");
    await expect(messageLabel).toHaveText("SelfMessage");
    await messageLabel.dblclick();

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Move cursor to end before typing (double-click may select word or place cursor in middle)
    await page.keyboard.press("End");
    
    // Use page.keyboard instead of element methods to avoid stale locator issues
    await page.keyboard.type(" n");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("n");
    await page.keyboard.press("Enter");

    // Wait for the edit to complete
    await page.waitForTimeout(500);

    await expect(page.locator("span").getByText("SelfMessage n")).toBeVisible({
      timeout: 10000,
    });
    await page.locator(".header").click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });

  test("Async message", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/smoke-editable-label.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use stable locator with text filter
    const messageLabel = page.locator(".interaction.async .message .editable-span-base").filter({ hasText: "Hello Bob" });
    await expect(messageLabel).toBeVisible();
    await messageLabel.dblclick();

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Move cursor to end and use page.keyboard
    await page.keyboard.press("End");
    await page.keyboard.type(" how are you?");
    await page.keyboard.press("Enter");

    // Wait for the edit to complete
    await page.waitForTimeout(500);

    await expect(
      page.locator("span").getByText("Hello Bob how are you?"),
    ).toBeVisible({ timeout: 10000 });
    await page.locator(".header").click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });

  test("Creation message", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/smoke-editable-label.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use stable locator
    const messageLabel = page.locator(".interaction.creation .message .editable-span-base");
    await expect(messageLabel).toHaveText("create");
    await messageLabel.dblclick();

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Move cursor to end and use page.keyboard
    await page.keyboard.press("End");
    await page.keyboard.type("1");
    await page.keyboard.press("Enter");

    // Wait for the edit to complete
    await page.waitForTimeout(500);

    await expect(page.locator(".interaction.creation .message .editable-span-base").filter({ hasText: "create1" })).toBeVisible({ timeout: 10000 });
  });

  test("ESC cancels edit and reverts to original text", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/smoke-editable-label.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use stable locator
    const messageLabel = page.locator(".interaction.sync .message .editable-span-base").first();
    const originalText = await messageLabel.textContent();
    await expect(messageLabel).toHaveText("method()");
    
    // Start editing
    await messageLabel.dblclick();

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Type some text to modify
    await page.keyboard.press("End");
    await page.keyboard.type("MODIFIED");

    // Verify text is modified in the DOM
    await expect(messageLabel).toHaveText("method()MODIFIED");

    // Press ESC to cancel
    await page.keyboard.press("Escape");

    // Wait for the cancel to complete
    await page.waitForTimeout(300);

    // Verify text is reverted to original
    await expect(messageLabel).toHaveText(originalText || "method()");
    
    // Take a screenshot to verify visual state
    await page.locator(".header").click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });
});
