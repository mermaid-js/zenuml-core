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

    // Edit the message
    const messageLabel = page.getByText("method()");
    await messageLabel.dblclick();

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Clear existing text and add new content
    await messageLabel.pressSequentially("1");
    await messageLabel.press("Enter");

    // Wait for the edit to complete
    await page.waitForTimeout(500);

    await expect(page.locator("label").getByText("method()1")).toBeVisible({
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

    // Edit the message
    const messageLabel = page.getByText("SelfMessage");
    await messageLabel.dblclick();

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    await messageLabel.pressSequentially(" n");
    await messageLabel.press("Backspace");
    await messageLabel.pressSequentially("n");
    await messageLabel.press("Enter");

    // Wait for the edit to complete
    await page.waitForTimeout(500);

    await expect(page.locator("label").getByText("SelfMessage n")).toBeVisible({
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

    // Edit the message
    const messageLabel = page.getByText("Hello Bob");
    await messageLabel.dblclick();

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    await messageLabel.pressSequentially(" how are you?");
    await messageLabel.press("Enter");

    // Wait for the edit to complete
    await page.waitForTimeout(500);

    await expect(
      page.locator("label").getByText("Hello Bob how are you?"),
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

    // Edit the message
    const messageLabel = page
      .locator('[data-type="creation"] .message .name label')
      .first();
    await messageLabel.dblclick();
    await messageLabel.press("End");
    await messageLabel.pressSequentially("1");
    await messageLabel.press("Enter");
    await expect(messageLabel).toContainText("create1");
  });
});
