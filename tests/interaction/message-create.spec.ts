import { test, expect } from "../fixtures";

test.describe("Message Create", () => {
  test("drags from one participant to another, creates a sync message, and focuses the label", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const sourceHandle = page.getByTestId("message-create-handle-A");
    const targetParticipant = page.locator('[data-participant-id="B"]');

    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await targetParticipant.boundingBox();

    expect(sourceBox).toBeTruthy();
    expect(targetBox).toBeTruthy();

    await page.mouse.move(
      sourceBox!.x + sourceBox!.width / 2,
      sourceBox!.y + sourceBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + targetBox!.height / 2,
      { steps: 12 },
    );
    await page.mouse.up();

    const label = page.locator(".interaction.sync .editable-span-base");
    await expect(label).toBeVisible({ timeout: 10000 });
    await expect(label).toHaveAttribute("contenteditable", "true");

    await page.keyboard.type("approve()");
    await page.keyboard.press("Enter");

    await expect(label).toHaveText("approve()", { timeout: 10000 });
    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain('A\nB\nA->B."approve()"');
  });
});
