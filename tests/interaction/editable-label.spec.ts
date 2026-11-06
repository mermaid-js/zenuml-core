import { test, expect } from "../fixtures";
import { clickMessageArrow } from "./clickMessageArrow";

test("one real click on a message label opens inline editing", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/editable-label.html");
  const message = page.locator(".interaction.sync .message").first();
  const label = message.locator(".editable-span-base");
  await label.click();
  await expect(label).toHaveAttribute("contenteditable", "true");
  await expect(label).toBeFocused();
  await expect(page.getByTestId("message-rename")).toHaveCount(0);
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("renamed()");
  await page.keyboard.press("Enter");
  await expect(label).not.toHaveAttribute("contenteditable", "true");
  await expect(label).toHaveText("renamed()");
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
    )
    .toContain('A."renamed()"');
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(1);
});

test("a real double click edits, and an outside click saves", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/editable-label.html");
  const label = page
    .locator(".interaction.sync .message .editable-span-base")
    .first();
  await label.dblclick();
  await expect(label).toHaveAttribute("contenteditable", "true");
  await expect(page.getByTestId("message-rename")).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("outsideSaved()");
  await expect(page.getByTestId("message-rename")).toHaveCount(0);
  await page.locator(".header").click();
  await expect(label).not.toHaveAttribute("contenteditable", "true");
  await expect(label).toHaveText("outsideSaved()");
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
    )
    .toContain('A."outsideSaved()"');
});

test("arrow click selects the message, then a label click edits without reopening the toolbar", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/editable-label.html");
  const message = page.locator(".interaction.sync .message").first();
  const label = message.locator(".editable-span-base");

  await clickMessageArrow(message);
  await expect(message).toHaveAttribute("data-selected", "true");
  await expect(page.getByTestId("message-rename")).toBeVisible();
  await label.click();
  await expect(label).toHaveAttribute("contenteditable", "true");
  await expect(page.getByTestId("message-rename")).toHaveCount(0);
  await label.click();
  await expect(page.getByTestId("message-rename")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(label).not.toHaveAttribute("contenteditable", "true");
});

test("clicking a different label saves the first and edits the second", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/editable-label.html");
  const first = page.locator(".interaction.sync .message").first();
  const second = page.locator(".interaction.async .message").first();
  const firstLabel = first.locator(".editable-span-base");
  const secondLabel = second.locator(".editable-span-base");
  await firstLabel.click();
  await expect(firstLabel).toHaveAttribute("contenteditable", "true");
  await secondLabel.click();
  await expect(firstLabel).not.toHaveAttribute("contenteditable", "true");
  await expect(secondLabel).toHaveAttribute("contenteditable", "true");
  await expect(secondLabel).toBeFocused();
});

async function clickToEdit(messageLabel: import("@playwright/test").Locator) {
  await messageLabel.click();
  await expect(messageLabel).toHaveAttribute("contenteditable", "true");
  await expect(messageLabel).toBeFocused();
}

test.describe("Editable Label", () => {
  test("Special characters & extra spaces", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    // Wait until the participant has rendered
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("method()", { exact: false })).toBeVisible();
    await expect(page.getByText("Alice", { exact: false })).toBeVisible();

    // Edit the message - use stable locator
    const messageLabel = page
      .locator(".interaction.sync .message .editable-span-base")
      .first();
    await expect(messageLabel).toHaveText("method()");
    await clickToEdit(messageLabel);

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Use page.keyboard to avoid stale locator issues
    await page.keyboard.type("1");
    await page.keyboard.press("Enter");

    // Wait for the edit to complete
    await page.waitForTimeout(500);

    // The click lands on the label centre, so where the caret falls depends
    // on glyph widths: between "t" and "h" with IBM Plex Sans.
    await expect(page.locator("span").getByText("met1hod()")).toBeVisible({
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
    await page.goto("/e2e/fixtures/editable-label.html");
    // Wait until the participant has rendered
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use a stable locator that won't change with text
    const messageLabel = page.locator(".self-invocation .editable-span-base");
    await expect(messageLabel).toHaveText("SelfMessage");
    await clickToEdit(messageLabel);

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Move cursor to end before typing (click places cursor at click point)
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
    await page.goto("/e2e/fixtures/editable-label.html");
    // Wait until the participant has rendered
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use stable locator with text filter
    const messageLabel = page
      .locator(".interaction.async .message .editable-span-base")
      .filter({ hasText: "Hello Bob" });
    await expect(messageLabel).toBeVisible();
    await clickToEdit(messageLabel);

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Type through the browser keyboard, including the space character.
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
      maxDiffPixels: 10,
      fullPage: true,
    });
  });

  test("Creation message", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    // Wait until the participant has rendered
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use stable locator
    const messageLabel = page.locator(
      ".interaction.creation .message .editable-span-base",
    );
    await expect(messageLabel).toHaveText("create");
    await clickToEdit(messageLabel);

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Move cursor to end and use page.keyboard
    await page.keyboard.press("End");
    await page.keyboard.type("1");
    await page.keyboard.press("Enter");

    // Wait for the edit to complete
    await page.waitForTimeout(500);

    await expect(
      page
        .locator(".interaction.creation .message .editable-span-base")
        .filter({ hasText: "create1" }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("ESC cancels edit and reverts to original text", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    // Wait until the participant has rendered
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use stable locator
    const messageLabel = page
      .locator(".interaction.sync .message .editable-span-base")
      .first();
    const originalText = await messageLabel.textContent();
    await expect(messageLabel).toHaveText("method()");

    // Start editing with two real clicks.
    await clickToEdit(messageLabel);

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
    // Click header to fully deselect, then blur to dismiss any lingering focus/caret
    await page.locator(".header").click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot({
      threshold: 0.02,
      maxDiffPixelRatio: 0.01,
      fullPage: true,
    });
  });
});
