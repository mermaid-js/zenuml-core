import { test, expect } from "../fixtures";

test.describe("Message Create", () => {
  test("shows + handles at each gap when hovering between messages", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const gap = page.getByTestId("message-gap-1");
    await expect(gap).toBeAttached();

    const gapBox = await gap.boundingBox();
    expect(gapBox).toBeTruthy();
    await page.mouse.move(
      gapBox!.x + gapBox!.width / 2,
      gapBox!.y,
    );

    await expect(
      page.getByTestId("message-create-handle-1-A"),
    ).toBeVisible({ timeout: 3000 });
    await expect(
      page.getByTestId("message-create-handle-1-B"),
    ).toBeVisible();
    await expect(
      page.getByTestId("message-create-handle-1-C"),
    ).toBeVisible();
  });

  test("highlights valid target during drag and supports escape cancel", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const gap = page.getByTestId("message-gap-1");
    await expect(gap).toBeAttached();
    const gapBox = await gap.boundingBox();
    expect(gapBox).toBeTruthy();
    await page.mouse.move(
      gapBox!.x + gapBox!.width / 2,
      gapBox!.y,
    );

    const handle = page.getByTestId("message-create-handle-1-A");
    await expect(handle).toBeVisible({ timeout: 3000 });

    const targetParticipant = page.locator('[data-participant-id="B"]');
    const handleBox = await handle.boundingBox();
    const targetBox = await targetParticipant.boundingBox();

    expect(handleBox).toBeTruthy();
    expect(targetBox).toBeTruthy();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + targetBox!.height / 2,
      { steps: 12 },
    );

    await expect(page.getByTestId("message-create-target-B")).toBeVisible();
    await page.keyboard.press("Escape");

    await expect(page.getByTestId("message-create-target-B")).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toBeNull();
  });

  test("drags from a gap handle to another participant, creates a message, and focuses the label", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const gap = page.getByTestId("message-gap-1");
    await expect(gap).toBeAttached();
    const gapBox = await gap.boundingBox();
    expect(gapBox).toBeTruthy();
    await page.mouse.move(
      gapBox!.x + gapBox!.width / 2,
      gapBox!.y,
    );

    const handle = page.getByTestId("message-create-handle-1-B");
    await expect(handle).toBeVisible({ timeout: 3000 });

    const targetParticipant = page.locator('[data-participant-id="C"]');
    const handleBox = await handle.boundingBox();
    const targetBox = await targetParticipant.boundingBox();

    expect(handleBox).toBeTruthy();
    expect(targetBox).toBeTruthy();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + targetBox!.height / 2,
      { steps: 12 },
    );
    await page.mouse.up();

    const label = page.locator(
      ".interaction.sync .editable-span-base",
    ).last();
    await expect(label).toBeVisible({ timeout: 10000 });
    await expect(label).toHaveAttribute("contenteditable", "true");

    await page.keyboard.type("approve()");
    await page.keyboard.press("Enter");

    await expect(label).toHaveText("approve()", { timeout: 10000 });
    const code = await page.evaluate(
      () => (window as any).__lastContentChange ?? null,
    );
    expect(code).toBeTruthy();
    expect(code).toContain("A->B.hello()");
    expect(code).toContain('B->C."approve()"');
  });
});
