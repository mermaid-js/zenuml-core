import { test, expect } from "../fixtures";

test.describe("Message Wrap Panel", () => {
  test("wraps an async message with alt and focuses the condition", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const asyncMessage = page
      .locator(".interaction.async .message")
      .filter({ hasText: "Hello Bob" });
    await asyncMessage.click();

    const wrapButton = page.getByTestId("message-wrap-alt");
    await expect(wrapButton).toBeVisible();
    await wrapButton.click();

    const condition = page.locator(".fragment-alt .condition").first();
    await expect(condition).toHaveAttribute("contenteditable", "true");
    await expect(page.getByTestId("message-wrap-alt")).toHaveCount(0);
    await page.keyboard.type("approved");
    await page.keyboard.press("Enter");

    await expect(page.locator(".fragment-alt")).toBeVisible({ timeout: 10000 });
    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain("if(approved) {\n  D->C: Hello Bob\n}");
  });
});
