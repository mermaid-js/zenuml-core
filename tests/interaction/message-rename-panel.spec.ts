import { test, expect } from "../fixtures";

test.describe("Message Rename Panel", () => {
  test("selects a message and clears selection on empty canvas click", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const asyncMessage = page
      .locator(".interaction.async .message")
      .filter({ hasText: "Hello Bob" });
    await asyncMessage.click();

    await expect(asyncMessage).toHaveAttribute("data-selected", "true");
    await expect(page.getByTestId("message-rename")).toBeVisible();

    await page.locator(".sequence-diagram").click({ position: { x: 8, y: 8 } });

    await expect(asyncMessage).toHaveAttribute("data-selected", "false");
    await expect(page.getByTestId("message-rename")).toHaveCount(0);
  });

  test("clears message selection with escape", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const asyncMessage = page
      .locator(".interaction.async .message")
      .filter({ hasText: "Hello Bob" });
    await asyncMessage.click();

    await expect(asyncMessage).toHaveAttribute("data-selected", "true");
    await expect(page.getByTestId("message-rename")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(asyncMessage).toHaveAttribute("data-selected", "false");
    await expect(page.getByTestId("message-rename")).toHaveCount(0);
  });

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
    await expect(
      page.locator('.interaction.async .message[data-selected="true"]').filter({
        hasText: "Hello Alice",
      }),
    ).toHaveAttribute("data-selected", "true");
    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain("D->C:Hello Alice");
  });
});
