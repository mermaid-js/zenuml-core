import { test, expect } from "../fixtures";

test.describe("Message Reorder", () => {
  test("reorders top-level messages by dragging one above another", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const messages = page.locator(".statement-container .message");
    const count = await messages.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const secondMessage = messages.nth(1);
    const firstMessage = messages.nth(0);
    const sourceBox = await secondMessage.boundingBox();
    const targetBox = await firstMessage.boundingBox();

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

    const messages = page.locator(".statement-container .message");
    const count = await messages.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const firstMessage = messages.nth(0);
    const secondMessage = messages.nth(1);
    const sourceBox = await firstMessage.boundingBox();
    const targetBox = await secondMessage.boundingBox();

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

  test("shows a drag indicator when hovering a message", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const firstMessage = page.locator(".statement-container .message").first();
    await firstMessage.hover();
    await expect(firstMessage).toHaveCSS("cursor", "ns-resize");
    await expect
      .poll(async () =>
        firstMessage.evaluate((element) =>
          getComputedStyle(element, "::before").opacity,
        ),
      )
      .toBe("0.55");
  });

  test("shows immediate pending feedback on pointer down before drag threshold", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const firstMessage = page.locator(".statement-container .message").first();
    const box = await firstMessage.boundingBox();
    expect(box).toBeTruthy();

    await page.mouse.move(
      box!.x + box!.width / 2,
      box!.y + box!.height / 2,
    );
    await page.mouse.down();

    await expect(
      page.locator('.statement-container[data-reorder-state="pending"]').first(),
    ).toBeVisible();
    await expect(firstMessage).toHaveCSS("cursor", "grabbing");
    await expect(
      page.locator("body"),
    ).toHaveCSS("cursor", "grabbing");

    await page.mouse.up();
  });

  test("keeps the grabbing cursor while actively dragging", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const messages = page.locator(".statement-container .message");
    const firstMessage = messages.nth(0);
    const secondMessage = messages.nth(1);
    const sourceBox = await firstMessage.boundingBox();
    const targetBox = await secondMessage.boundingBox();

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
      { steps: 4 },
    );

    await expect(
      page.locator('.statement-container[data-reorder-state="dragging"]').first(),
    ).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("cursor", "grabbing");

    await page.mouse.up();
  });
});
