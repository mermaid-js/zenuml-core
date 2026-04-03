import { test, expect } from "../fixtures";

/**
 * Helper: activate inline editing on a message label using the two-step flow.
 *
 * EditableSpan.handleClick only enters edit mode when the nearest .message
 * ancestor already has data-selected="true". A Playwright-simulated second
 * click is blocked because React treats browser input events as trusted user
 * gestures and flushes state updates synchronously — the useOutsideClick
 * capture handler clears the selection before the bubble-phase React handler
 * can read data-selected="true". Instead we:
 *
 *   1. Playwright click (first step): selects the message (data-selected="true").
 *   2. Wait for data-selected="true" to appear in the DOM.
 *   3. Programmatic dispatchEvent (second step): React treats programmatic events
 *      as non-trusted and does NOT flush state updates synchronously, so
 *      useOutsideClick's setSelectedMessage(null) is batched. When React's own
 *      capture handler fires it still sees data-selected="true" and calls
 *      startEditing. Passing clientX/clientY preserves cursor placement.
 */
async function clickToEdit(page: import("@playwright/test").Page, messageLabel: import("@playwright/test").Locator) {
  // Step 1: first Playwright click selects the message
  await messageLabel.click();

  // Step 2: wait for the .message ancestor to become selected
  await messageLabel.evaluate((el) => {
    const msg = el.closest(".message");
    if (!msg) return;
    if (msg.getAttribute("data-selected") === "true") return;
    return new Promise<void>((resolve) => {
      const obs = new MutationObserver(() => {
        if (msg.getAttribute("data-selected") === "true") {
          obs.disconnect();
          resolve();
        }
      });
      obs.observe(msg, { attributes: true });
      setTimeout(() => { obs.disconnect(); resolve(); }, 2000);
    });
  });

  // Step 3: programmatic dispatchEvent at the label center enters edit mode.
  // Because this is a non-trusted event, React batches all state updates
  // (including useOutsideClick's setSelectedMessage(null)) until after the full
  // event cycle. React's own handler sees data-selected="true" and enters editing.
  await messageLabel.evaluate((el) => {
    const box = el.getBoundingClientRect();
    el.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      clientX: box.x + box.width / 2,
      clientY: box.y + box.height / 2,
    }));
  });

  // Wait for React to re-render and activate contenteditable, then wait for
  // the focusEditable setTimeout inside EditableSpan to run and focus the span.
  // Use a longer timeout to account for the two async steps (React render + setTimeout).
  await messageLabel.waitFor({ state: "attached" });
  await page.waitForFunction(() => {
    const span = document.querySelector(".editable-span-editing") as HTMLElement | null;
    return span !== null && span === document.activeElement;
  }, undefined, { timeout: 2000 });
}

test.describe("Editable Label", () => {
  test("Special characters & extra spaces", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("method()", { exact: false })).toBeVisible();
    await expect(page.getByText("Alice", { exact: false })).toBeVisible();

    // Edit the message - use stable locator
    const messageLabel = page.locator(".interaction.sync .message .editable-span-base").first();
    await expect(messageLabel).toHaveText("method()");
    await clickToEdit(page, messageLabel);

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
    await page.goto("/e2e/fixtures/editable-label.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use a stable locator that won't change with text
    const messageLabel = page.locator(".self-invocation .editable-span-base");
    await expect(messageLabel).toHaveText("SelfMessage");
    await clickToEdit(page, messageLabel);

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
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use stable locator with text filter
    const messageLabel = page.locator(".interaction.async .message .editable-span-base").filter({ hasText: "Hello Bob" });
    await expect(messageLabel).toBeVisible();
    await clickToEdit(page, messageLabel);

    // Wait for edit mode to be active
    await page.waitForTimeout(100);

    // Move cursor to end and use page.keyboard.
    // Use insertText for the string with spaces: MessageView.onKeyDown intercepts
    // the Space key (for accessibility) which would otherwise swallow spaces typed
    // via keyboard.type(). keyboard.insertText() bypasses keydown handlers.
    await page.keyboard.press("End");
    await page.keyboard.insertText(" how are you?");
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
    await page.goto("/e2e/fixtures/editable-label.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use stable locator
    const messageLabel = page.locator(".interaction.creation .message .editable-span-base");
    await expect(messageLabel).toHaveText("create");
    await clickToEdit(page, messageLabel);

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
    await page.goto("/e2e/fixtures/editable-label.html");
    // This line is to make sure the privacy icon is loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Edit the message - use stable locator
    const messageLabel = page.locator(".interaction.sync .message .editable-span-base").first();
    const originalText = await messageLabel.textContent();
    await expect(messageLabel).toHaveText("method()");

    // Start editing using the two-step flow
    await clickToEdit(page, messageLabel);

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
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot({
      threshold: 0.02,
      maxDiffPixelRatio: 0.01,
      fullPage: true,
    });
  });
});
