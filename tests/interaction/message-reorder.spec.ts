import { test, expect } from "../fixtures";
import { clickMessageArrow } from "./clickMessageArrow";

test.describe("Message Reorder", () => {
  test("shows a dedicated handle on hover and only that handle starts a drag", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    const messages = page.locator(".statement-container .message");
    await expect(messages).toHaveCount(2);
    const first = messages.first();
    const second = messages.nth(1);
    const handle = first.getByRole("button", {
      name: "Drag to reorder message",
    });
    await expect(handle).toBeAttached();
    await expect(handle).toHaveCSS("opacity", "0");
    await first.hover();
    await expect(handle).toHaveCSS("opacity", "1");
    await expect(handle).toHaveCSS("width", "32px");
    await expect(handle).toHaveCSS("height", "24px");

    const target = await second.boundingBox();
    if (!target) throw new Error("missing target message");
    await handle.hover();
    await expect(page.locator(".sequence-diagram")).toHaveScreenshot(
      "message-reorder-handle-hover.png",
    );
    await page.mouse.down();
    await page.mouse.move(
      target.x + target.width / 2,
      target.y + target.height - 2,
      { steps: 12 },
    );
    await page.mouse.up();
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toContain("A->C: second\nA->B: first");
    await expect(page.getByTestId("message-rename")).toHaveCount(0);
  });

  // ADR 0002, P4: the hover reveal is a hover affordance; a running reorder
  // owns the diagram, so the rows it passes over keep their handles hidden.
  test("does not reveal other handles while a reorder runs", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    const messages = page.locator(".statement-container .message");
    await expect(messages).toHaveCount(2);
    const first = messages.first();
    const second = messages.nth(1);
    const handle = first.getByRole("button", {
      name: "Drag to reorder message",
    });
    const otherHandle = second.getByRole("button", {
      name: "Drag to reorder message",
    });
    await second.hover();
    await expect(otherHandle).toHaveCSS("opacity", "1");

    await first.hover();
    await handle.hover();
    await page.mouse.down();
    const target = await second.boundingBox();
    if (!target) throw new Error("missing target message");
    await page.mouse.move(
      target.x + target.width / 2,
      target.y + target.height / 2,
      { steps: 12 },
    );
    await expect(
      page.locator('.statement-container[data-reorder-state="dragging"]'),
    ).toHaveCount(1);
    await expect(otherHandle).toHaveCSS("opacity", "0");

    await page.keyboard.press("Escape");
    await page.mouse.up();
    await second.hover();
    await expect(otherHandle).toHaveCSS("opacity", "1");
  });

  test("an arrow click opens the toolbar, while an arrow drag leaves the order alone", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    const messages = page.locator(".statement-container .message");
    await expect(messages).toHaveCount(2);
    const first = messages.first();
    const secondBox = await messages.nth(1).boundingBox();
    if (!secondBox) throw new Error("missing target message");

    await clickMessageArrow(first);
    await expect(page.getByTestId("message-rename")).toBeVisible();

    const firstBox = await first.boundingBox();
    if (!firstBox) throw new Error("missing source message");
    await page.mouse.move(
      firstBox.x + firstBox.width - 3,
      firstBox.y + firstBox.height - 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      secondBox.x + secondBox.width / 2,
      secondBox.y + secondBox.height - 2,
      { steps: 12 },
    );
    await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(
      0,
    );
    await page.mouse.up();
    expect(
      await page.evaluate(() => (window as any).__lastContentChange ?? null),
    ).toBeNull();
  });

  test("a handle click and an invalid drop leave the menu closed and content unchanged", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    const first = page.locator(".statement-container .message").first();
    const handle = first.getByRole("button", {
      name: "Drag to reorder message",
    });
    await first.hover();
    await handle.click();
    await expect(page.getByTestId("message-rename")).toHaveCount(0);

    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(10, 10, { steps: 12 });
    await page.mouse.up();
    await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(
      0,
    );
    await expect(page.getByTestId("message-rename")).toHaveCount(0);
    expect(
      await page.evaluate(() => (window as any).__lastContentChange ?? null),
    ).toBeNull();
  });

  test("keyboard focus reveals the handle without opening the toolbar", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    const handle = page
      .locator(".statement-container .message-reorder-handle")
      .first();
    await handle.focus();
    await expect(handle).toHaveCSS("opacity", "1");
    await expect(page.getByTestId("message-rename")).toHaveCount(0);
  });
  test("releasing a handle drag over its own arrow does not select the message", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    const first = page.locator(".statement-container .message").first();
    const box = await first.boundingBox();
    if (!box) throw new Error("missing source message");
    await first.hover();
    await first
      .getByRole("button", { name: "Drag to reorder message" })
      .hover();
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 3, box.y + box.height - 2, {
      steps: 12,
    });
    await page.mouse.up();
    await expect(page.getByTestId("message-rename")).toHaveCount(0);
    await expect(first).toHaveAttribute("data-selected", "false");
    await clickMessageArrow(first);
    await expect(page.getByTestId("message-rename")).toBeVisible();
  });

  test("leaving a valid drop target before release cancels the reorder", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    const messages = page.locator(".statement-container .message");
    const first = messages.first();
    const secondBox = await messages.nth(1).boundingBox();
    if (!secondBox) throw new Error("missing target message");
    await first.hover();
    const handle = first.getByRole("button", {
      name: "Drag to reorder message",
    });
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(
      secondBox.x + secondBox.width / 2,
      secondBox.y + secondBox.height - 2,
      { steps: 12 },
    );
    await page.mouse.move(10, 10, { steps: 12 });
    await page.mouse.up();
    expect(
      await page.evaluate(() => (window as any).__lastContentChange ?? null),
    ).toBeNull();
  });

  test("Escape cancels an active handle drag", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    const messages = page.locator(".statement-container .message");
    const first = messages.first();
    const secondBox = await messages.nth(1).boundingBox();
    if (!secondBox) throw new Error("missing target message");
    await first.hover();
    const handle = first.getByRole("button", {
      name: "Drag to reorder message",
    });
    await handle.hover();
    await handle.focus();
    await page.mouse.down();
    await page.mouse.move(
      secondBox.x + secondBox.width / 2,
      secondBox.y + secondBox.height - 2,
      { steps: 12 },
    );
    await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(
      1,
    );
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(
      0,
    );
    await page.mouse.up();
    expect(
      await page.evaluate(() => (window as any).__lastContentChange ?? null),
    ).toBeNull();
    await expect
      .poll(() => page.evaluate(() => document.body.style.cursor))
      .toBe("");
  });

  test("reorders top-level messages by dragging one above another", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    const messages = page.locator(".statement-container .message");
    const count = await messages.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const secondMessage = messages.nth(1);
    const firstMessage = messages.nth(0);
    const handle = secondMessage.getByRole("button", {
      name: "Drag to reorder message",
    });
    const targetBox = await firstMessage.boundingBox();

    expect(targetBox).toBeTruthy();

    await secondMessage.hover();
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + 2,
      { steps: 12 },
    );
    await page.mouse.up();

    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toContain("A\nB\nC\nA->C: second\nA->B: first");
  });

  test("reorders top-level messages by dragging one below another", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    const messages = page.locator(".statement-container .message");
    const count = await messages.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const firstMessage = messages.nth(0);
    const secondMessage = messages.nth(1);
    const handle = firstMessage.getByRole("button", {
      name: "Drag to reorder message",
    });
    const targetBox = await secondMessage.boundingBox();

    expect(targetBox).toBeTruthy();

    await firstMessage.hover();
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + targetBox!.height - 2,
      { steps: 12 },
    );
    await page.mouse.up();

    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toContain("A\nB\nC\nA->C: second\nA->B: first");
  });

  test("shows a grab cursor only on the message handle", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    const firstMessage = page.locator(".statement-container .message").first();
    await firstMessage.hover();
    await expect(firstMessage).toHaveAttribute(
      "title",
      "Click label to edit · click arrow to select · drag handle to reorder",
    );
    await expect(firstMessage).toHaveCSS("cursor", "pointer");
    await expect(
      firstMessage.getByRole("button", { name: "Drag to reorder message" }),
    ).toHaveCSS("cursor", "grab");
  });

  test("shows immediate pending feedback on pointer down before drag threshold", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    const firstMessage = page.locator(".statement-container .message").first();
    const handle = firstMessage.getByRole("button", {
      name: "Drag to reorder message",
    });
    await firstMessage.hover();
    await handle.hover();
    await page.mouse.down();

    await expect(
      page
        .locator('.statement-container[data-reorder-state="pending"]')
        .first(),
    ).toBeVisible();
    await expect(handle).toHaveCSS("cursor", "grabbing");
    await expect(page.locator("body")).toHaveCSS("cursor", "grabbing");

    await page.mouse.up();
  });

  test("keeps the grabbing cursor while actively dragging", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    const messages = page.locator(".statement-container .message");
    const firstMessage = messages.nth(0);
    const secondMessage = messages.nth(1);
    const handle = firstMessage.getByRole("button", {
      name: "Drag to reorder message",
    });
    const targetBox = await secondMessage.boundingBox();

    expect(targetBox).toBeTruthy();

    await firstMessage.hover();
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + targetBox!.height / 2,
      { steps: 4 },
    );

    await expect(
      page
        .locator('.statement-container[data-reorder-state="dragging"]')
        .first(),
    ).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("cursor", "grabbing");

    await page.mouse.up();
  });
});
