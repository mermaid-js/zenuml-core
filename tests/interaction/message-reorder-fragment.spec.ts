import { test, expect } from "../fixtures";

test.describe("Message Reorder in Fragment", () => {
  test("reorders messages inside an alt fragment by dragging", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-fragment.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const messages = page.locator(".fragment-alt .statement-container .message");
    await expect(messages).toHaveCount(2);

    const first = messages.nth(0);
    const second = messages.nth(1);

    await expect(first).toContainText("alpha");
    await expect(second).toContainText("beta");

    const sourceBox = await second.boundingBox();
    const targetBox = await first.boundingBox();
    if (!sourceBox || !targetBox) throw new Error("missing bounding boxes");

    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + 2,
      { steps: 12 },
    );
    await page.mouse.up();

    await expect.poll(async () =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
    ).toContain("A->C: beta\n  A->B: alpha");
  });

  test("shows ns-resize cursor on messages inside a fragment", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-fragment.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const message = page.locator(".fragment-alt .statement-container .message").first();
    await message.hover();

    await expect(message).toHaveAttribute("title", "Click to edit, drag to reorder");
    await expect(message).toHaveCSS("cursor", "ns-resize");
  });
});
