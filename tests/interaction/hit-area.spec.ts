import { openDiagram } from "../fixtures";
import { expect, test, type Locator, type Page } from "@playwright/test";

// ADR 0003, P4 (hit areas): the painted circle stays 12 / 16 px, the pointer
// target is at least 24 x 24 (the insert button's whole 36 x 36 reveal
// wrapper).

const OFFSETS: Array<[number, number]> = [
  [11, 0],
  [-11, 0],
  [0, 11],
  [0, -11],
  [8, 8],
  [8, -8],
  [-8, 8],
  [-8, -8],
];

async function expectTargetFrom(page: Page, control: Locator) {
  const box = await control.boundingBox();
  expect(box).toBeTruthy();
  const cx = box!.x + box!.width / 2;
  const cy = box!.y + box!.height / 2;
  const handle = await control.elementHandle();
  for (const [dx, dy] of OFFSETS) {
    const hit = await page.evaluate(
      ([el, x, y]) => {
        const found = document.elementFromPoint(x as number, y as number);
        return !!found && (el as Element).contains(found);
      },
      [handle, cx + dx, cy + dy] as const,
    );
    expect(hit, `elementFromPoint at (${dx}, ${dy}) hits the control`).toBe(
      true,
    );
  }
  return { cx, cy, box: box! };
}

async function revealInsertButton(page: Page) {
  await openDiagram(page, "/e2e/fixtures/insert-participant.html");
  const a = await page
    .locator("[data-lifeline-id=A] .participant")
    .boundingBox();
  const c = await page
    .locator("[data-lifeline-id=C] .participant")
    .boundingBox();
  await page.mouse.move((a!.x + a!.width + c!.x) / 2, a!.y + a!.height / 2);
  const button = page.getByTestId("participant-insert-button-0");
  await expect(button).toHaveCSS("opacity", /^0\.[1-9]|^1$/);
  return button;
}

test.describe("24 px hit areas, visual unchanged", () => {
  test("participant insert button: 16 px circle, 36 px target, click from the corner", async ({
    page,
  }) => {
    const button = await revealInsertButton(page);
    const { cx, cy, box } = await expectTargetFrom(page, button);
    expect(box.width).toBe(16);
    expect(box.height).toBe(16);
    const before = await page.locator(".participant").count();
    await page.mouse.click(cx + 10, cy + 10);
    await expect(page.locator(".participant")).toHaveCount(before + 1);
  });

  test("gap create handle: 12 px circle, 24 px target, drag from the edge", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    const zone = page.getByTestId("message-gap-hover-1");
    await expect(zone).toBeVisible({ timeout: 5000 });
    await zone.hover();
    const handle = page
      .locator('[data-testid^="message-create-handle-1-"]')
      .first();
    await expect(handle).toBeVisible();
    const { cx, cy, box } = await expectTargetFrom(page, handle);
    expect(Math.round(box.width)).toBe(12);
    expect(Math.round(box.height)).toBe(12);

    // The handle stays while the pointer sits on the extended area.
    await page.mouse.move(cx, cy + 10);
    await page.waitForTimeout(300);
    await expect(handle).toBeVisible();

    await page.mouse.move(cx + 10, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 40, cy + 4, { steps: 4 });
    // A drag in progress shows the preview line (a horizontal SVG line has no
    // height, so it is attached rather than "visible").
    await expect(
      page.getByTestId("message-create-preview-line"),
    ).toBeAttached();
    await page.mouse.up();
  });
});
