import { test, expect } from "../fixtures";

test.describe("Message Create (Gap Handles)", () => {
  test("shows drag handles on gap hover", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Gap hover zone at index 1 (after first message, clearly below participant headers)
    const gapHover = page.getByTestId("message-gap-hover-1");
    await expect(gapHover).toBeVisible();

    const handle = page.getByTestId("message-create-handle-1-A");
    // Before hover, handle should not be visible
    await expect(handle).not.toBeVisible();

    await gapHover.hover();
    await expect(handle).toBeVisible();
  });

  test("drag from handle to participant creates a message", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Hover gap-1 (after the existing message) to reveal handles
    const gapHover = page.getByTestId("message-gap-hover-1");
    await gapHover.hover();

    const handleA = page.getByTestId("message-create-handle-1-A");
    await expect(handleA).toBeVisible();

    // Get participant C position as drag target
    const participantC = page.locator('[data-participant-id="C"]');
    const cBox = await participantC.boundingBox();
    expect(cBox).toBeTruthy();

    const handleBox = await handleA.boundingBox();
    expect(handleBox).toBeTruthy();

    // Drag from A handle to C participant center
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      cBox!.x + cBox!.width / 2,
      cBox!.y + cBox!.height / 2,
      { steps: 10 },
    );
    await page.mouse.up();

    // A new message should have been created and __lastContentChange updated
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toMatch(/A->C/);
  });

  test("drag from a sync occurrence bar to a participant creates a nested message", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const occurrence = page.locator(
      '[data-el-type="occurrence"][data-belongs-to="B"]',
    );
    const occurrenceBox = await occurrence.boundingBox();
    expect(occurrenceBox).toBeTruthy();

    const participantC = page.locator('[data-participant-id="C"]');
    const cBox = await participantC.boundingBox();
    expect(cBox).toBeTruthy();

    await page.mouse.move(
      occurrenceBox!.x + occurrenceBox!.width / 2,
      occurrenceBox!.y + occurrenceBox!.height / 2,
    );
    await page.mouse.down();

    await expect(
      page.getByTestId("message-create-drag-indicator"),
    ).toBeVisible();
    await expect(page.getByTestId("message-create-drag-indicator")).toHaveText(
      "+",
    );

    await page.mouse.move(
      cBox!.x + cBox!.width / 2,
      cBox!.y + cBox!.height / 2,
      {
        steps: 10,
      },
    );
    await page.mouse.up();

    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toBe("A\nB\nC\nA->B.hello() {\n  B->C.newMessage()\n}");
  });

  test("Escape key cancels drag without creating message", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const gapHover = page.getByTestId("message-gap-hover-1");
    await gapHover.hover();

    const handleA = page.getByTestId("message-create-handle-1-A");
    await expect(handleA).toBeVisible();

    const handleBox = await handleA.boundingBox();
    expect(handleBox).toBeTruthy();

    const participantC = page.locator('[data-participant-id="C"]');
    const cBox = await participantC.boundingBox();
    expect(cBox).toBeTruthy();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      cBox!.x + cBox!.width / 2,
      cBox!.y + cBox!.height / 2,
      { steps: 5 },
    );

    // Cancel with Escape
    await page.keyboard.press("Escape");
    await page.mouse.up();

    // Content should not have changed (original only has A->B.hello())
    const content = await page.evaluate(
      () => (window as any).__lastContentChange ?? null,
    );
    if (content !== null) {
      expect(content).not.toMatch(/A->C/);
    }
  });

  test("shows gap containers at start and end of message list", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // The fixture has 1 message (A->B.hello()), so gap-0 (before) and gap-1 (after) should exist
    await expect(page.getByTestId("message-gap-0")).toBeAttached();
    await expect(page.getByTestId("message-gap-1")).toBeAttached();
  });
});
