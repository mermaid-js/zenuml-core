import { expect, test, type Page } from "@playwright/test";

// Two participant-editor defects seen on 2026-10-20 while reviewing the chrome:
// 1. The name row is centred under the participant box and clamped to the
//    viewport with an 8 px margin (VIEWPORT_MARGIN), but the clamp used a
//    width measured before the row had layout, so the first participant's row
//    hung off the left edge.
// 2. Pressing another participant while the editor was open exited the editor
//    on pointerdown and reopened it on click, which unmounted the mask and the
//    row between the two events and flashed. The press now does nothing; the
//    click switches.

const VIEWPORT_MARGIN = 8;

const cornerOf = async (page: Page, id: string) => {
  const participant = page.locator(`.participant[data-participant-id="${id}"]`);
  const box = await participant.boundingBox();
  expect(box).toBeTruthy();
  return { participant, x: box!.x + 3, y: box!.y + box!.height - 3, box: box! };
};

const openPanel = async (page: Page, id: string) => {
  const { participant, box } = await cornerOf(page, id);
  await participant.click({ position: { x: 3, y: box.height - 3 } });
  return page.getByTestId("participant-name-row");
};

test.describe("participant name row stays inside the viewport", () => {
  for (const width of [1200, 480]) {
    test(`first participant at ${width} px wide`, async ({ page }) => {
      await page.setViewportSize({ width, height: 600 });
      await page.goto("/e2e/fixtures/insert-participant.html");
      const row = await openPanel(page, "A");
      await expect(row).toBeVisible();
      await expect
        .poll(async () => (await row.boundingBox())!.x, { timeout: 2000 })
        // translateX(-50%) of an odd width lands on a half pixel.
        .toBeGreaterThanOrEqual(VIEWPORT_MARGIN - 0.5);
      const box = await row.boundingBox();
      expect(box!.x + box!.width).toBeLessThanOrEqual(width - VIEWPORT_MARGIN);
    });
  }

  test("the row re-centres on the new participant after a switch", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 600 });
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const row = await openPanel(page, "C");
    const { box: c } = await cornerOf(page, "C");
    const box = await row.boundingBox();
    expect(box).toBeTruthy();
    const centre = box!.x + box!.width / 2;
    expect(Math.abs(centre - (c.x + c.width / 2))).toBeLessThanOrEqual(1);
  });
});

test.describe("switching participants keeps the editor mounted", () => {
  test("a press on another participant does not close the editor; the click switches", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 600 });
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    const mask = page.getByTestId("participant-editor-mask");
    await expect(panel).toBeVisible();
    const panelHandle = await panel.elementHandle();
    const maskHandle = await mask.elementHandle();

    const { x, y } = await cornerOf(page, "C");
    await page.mouse.move(x, y);
    await page.mouse.down();
    // Between pointerdown and pointerup the editor must still be there.
    expect(await panelHandle!.evaluate((el) => el.isConnected)).toBe(true);
    expect(await maskHandle!.evaluate((el) => el.isConnected)).toBe(true);
    await expect(panel).toHaveAttribute("aria-label", "Edit participant A");
    await page.mouse.up();

    // The click switched the editor to C without remounting it.
    await expect(panel).toHaveAttribute("aria-label", "Edit participant C");
    expect(await panelHandle!.evaluate((el) => el.isConnected)).toBe(true);
    expect(await maskHandle!.evaluate((el) => el.isConnected)).toBe(true);
    const row = page.getByTestId("participant-name-row");
    const { box: c } = await cornerOf(page, "C");
    await expect
      .poll(async () => {
        const b = await row.boundingBox();
        return b ? Math.abs(b.x + b.width / 2 - (c.x + c.width / 2)) : 999;
      })
      .toBeLessThanOrEqual(1);
  });

  test("clicking the open participant again keeps the editor open", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 600 });
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    const handle = await panel.elementHandle();
    await openPanel(page, "A");
    await expect(panel).toHaveAttribute("aria-label", "Edit participant A");
    expect(await handle!.evaluate((el) => el.isConnected)).toBe(true);
  });

  test("a press on the canvas still closes the editor", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 600 });
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    await expect(panel).toBeVisible();
    await page.mouse.click(600, 500);
    await expect(panel).toHaveCount(0);
  });
});
