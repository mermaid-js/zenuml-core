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
    // Clear existing text and add new content
    await messageLabel.pressSequentially("1");
    await messageLabel.press("Enter");
    await expect(page.locator("label").getByText("method()1")).toBeVisible();
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
    await messageLabel.pressSequentially(" n");
    await messageLabel.press("Backspace");
    await messageLabel.pressSequentially("n");
    await messageLabel.press("Enter");
    await expect(
      page.locator("label").getByText("SelfMessage n"),
    ).toBeVisible();
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
    await messageLabel.pressSequentially(" how are you?");
    await messageLabel.press("Enter");
    await expect(
      page.locator("label").getByText("Hello Bob how are you?"),
    ).toBeVisible();
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
    const messageLabel = page.locator("label").filter({ hasText: "create" });
    await messageLabel.dblclick();
    await messageLabel.pressSequentially("1");
    await expect(page.getByText("create1")).toBeVisible();
  });
});
