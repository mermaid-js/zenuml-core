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

    await expect(message).toHaveAttribute("title", "Click to select · drag to reorder");
    await expect(message).toHaveCSS("cursor", "ns-resize");
  });

  test("moves a top-level message into a fragment by dragging onto a fragment message", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-cross-fragment.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const outside = page.locator(".statement-container .message").filter({
      hasText: "outside()",
    });
    const alpha = page.locator(".fragment-alt .statement-container .message").filter({ hasText: "alpha()" });

    const sourceBox = await outside.boundingBox();
    const targetBox = await alpha.boundingBox();
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

    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain(`if(ready) {
  B->A.outside()
  A->B.alpha()
  A->C.beta()
}`);
  });

  test("moves a fragment message out to the top level by dragging onto a top-level message", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-cross-fragment.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const alpha = page.locator(".fragment-alt .statement-container .message").filter({ hasText: "alpha()" });
    const outside = page.locator(".statement-container .message").filter({
      hasText: "outside()",
    });

    const sourceBox = await alpha.boundingBox();
    const targetBox = await outside.boundingBox();
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

    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain(`A
B
C
A->B.alpha()
B->A.outside()
if(ready) {
  A->C.beta()
}`);
  });
});
