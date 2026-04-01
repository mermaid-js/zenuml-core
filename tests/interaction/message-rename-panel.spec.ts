import { test, expect } from "../fixtures";

test.describe("Message Rename Panel", () => {
  test("renames an async message from the toolbar", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const asyncMessage = page
      .locator(".interaction.async .message")
      .filter({ hasText: "Hello Bob" });
    await asyncMessage.click();

    const renameButton = page.getByTestId("message-rename");
    await expect(renameButton).toBeVisible();
    await renameButton.click();

    const editableLabel = page
      .locator(".interaction.async .editable-span-base")
      .filter({ hasText: "Hello Bob" });
    await expect(editableLabel).toHaveAttribute("contenteditable", "true");

    await page.keyboard.type("Hello Alice");
    await page.keyboard.press("Enter");

    await expect(
      page
        .locator(".interaction.async .editable-span-base")
        .filter({ hasText: "Hello Alice" })
        .first(),
    ).toBeVisible({ timeout: 10000 });
    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain("D->C:Hello Alice");
  });
});
