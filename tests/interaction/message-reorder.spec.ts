import { test, expect } from "../fixtures";

test.describe("Message Reorder", () => {
  test("reorders top-level messages by dragging one above another", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const handles = page.locator('[data-testid^="message-reorder-handle-"]');
    const count = await handles.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const secondHandle = handles.nth(1);
    const firstHandle = handles.nth(0);
    const sourceBox = await secondHandle.boundingBox();
    const targetBox = await firstHandle.boundingBox();

    expect(sourceBox).toBeTruthy();
    expect(targetBox).toBeTruthy();

    await page.mouse.move(
      sourceBox!.x + sourceBox!.width / 2,
      sourceBox!.y + sourceBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + 2,
      { steps: 12 },
    );
    await page.mouse.up();

    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain("A\nB\nC\nA->C: second\nA->B: first");
  });

  test("reorders top-level messages by dragging one below another", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const handles = page.locator('[data-testid^="message-reorder-handle-"]');
    const count = await handles.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const firstHandle = handles.nth(0);
    const secondHandle = handles.nth(1);
    const sourceBox = await firstHandle.boundingBox();
    const targetBox = await secondHandle.boundingBox();

    expect(sourceBox).toBeTruthy();
    expect(targetBox).toBeTruthy();

    await page.mouse.move(
      sourceBox!.x + sourceBox!.width / 2,
      sourceBox!.y + sourceBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + targetBox!.height - 2,
      { steps: 12 },
    );
    await page.mouse.up();

    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain("A\nB\nC\nA->C: second\nA->B: first");
  });

  test("shows a reorder-specific tooltip on the drag handle", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page.locator('[data-testid^="message-reorder-handle-"]').first())
      .toHaveAttribute("title", "Drag to reorder message");
  });
});
