import { expect, test } from "../fixtures";
import { clickMessageArrow } from "./clickMessageArrow";

test("participant editing hides insertion and blocks message drag until editing ends", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/insert-participant.html");
  const participantName = page.locator(
    '[data-participant-id="A"] .participant-name',
  );
  const message = page.locator(".statement-container .message").first();
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(1);
  const initialMessageY = (await message.boundingBox())!.y;

  await participantName.click();
  await expect(participantName).toHaveAttribute("contenteditable", "true");
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(0);
  await expect(page.getByTestId(/^message-create-handle-/)).toHaveCount(0);
  await expect(message.locator(".message-reorder-handle")).toHaveCount(0);
  expect((await message.boundingBox())!.y).toBe(initialMessageY);

  const box = await message.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height + 30);
  await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(0);
  await page.mouse.up();

  await page.keyboard.press("Escape");
  await expect(participantName).not.toHaveAttribute("contenteditable", "true");
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(1);
});

test("message editing hides insertion and restores it after save", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/insert-participant.html");
  const message = page.locator(".statement-container .message").first();
  await clickMessageArrow(message);
  await page.getByTestId("message-rename").click();
  const label = message.locator(".editable-span-base");
  await expect(label).toHaveAttribute("contenteditable", "true");
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(0);
  await expect(page.getByTestId(/^message-create-handle-/)).toHaveCount(0);
  await expect(message.locator(".message-reorder-handle")).toHaveCount(0);

  await page.keyboard.press("Enter");
  await expect(label).not.toHaveAttribute("contenteditable", "true");
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(1);
});

test("selection alone leaves insertion enabled and outside click ends the guard", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/insert-participant.html");
  const participant = page.locator('.participant[data-participant-id="A"]');
  const name = participant.locator(".participant-name");
  const message = page.locator(".statement-container .message").first();

  await participant.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(1);
  await message.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(1);

  await name.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(0);
  await page.locator(".sequence-diagram").click({ position: { x: 8, y: 8 } });
  await expect(name).not.toHaveAttribute("contenteditable", "true");
  await expect(page.getByTestId("participant-insert-button-0")).toHaveCount(1);
});

test("message text selection cannot start reorder, and reorder works after editing", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/reorder-message.html");
  const messages = page.locator(".statement-container .message");
  const first = messages.nth(0);
  const second = messages.nth(1);
  await clickMessageArrow(first);
  await page.getByTestId("message-rename").click();
  const label = first.locator(".editable-span-base");
  await expect(label).toHaveAttribute("contenteditable", "true");
  await expect(first).toHaveAttribute(
    "title",
    "Click label to edit · click arrow to select",
  );
  await expect(first).toHaveCSS("user-select", "text");
  await expect(first.locator(".message-reorder-handle")).toHaveCount(0);

  const labelBox = await label.boundingBox();
  const secondBox = await second.boundingBox();
  expect(labelBox).toBeTruthy();
  expect(secondBox).toBeTruthy();
  await page.mouse.move(
    labelBox!.x + labelBox!.width / 2,
    labelBox!.y + labelBox!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    secondBox!.x + secondBox!.width / 2,
    secondBox!.y + secondBox!.height - 2,
    { steps: 8 },
  );
  await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(0);
  await page.mouse.up();
  expect(
    await page.evaluate(() => (window as any).__lastContentChange ?? null),
  ).toBeNull();

  await page.keyboard.press("Escape");
  await expect(label).not.toHaveAttribute("contenteditable", "true");
  await expect(first).toHaveAttribute(
    "title",
    "Click label to edit · click arrow to select · drag handle to reorder",
  );
  const handle = first.getByRole("button", { name: "Drag to reorder message" });
  await expect(handle).toBeAttached();

  const target = await second.boundingBox();
  expect(target).toBeTruthy();
  await first.hover();
  await handle.hover();
  await page.mouse.down();
  await page.mouse.move(
    target!.x + target!.width / 2,
    target!.y + target!.height - 2,
    { steps: 12 },
  );
  await page.mouse.up();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
    )
    .toContain("A->C: second\nA->B: first");
});

test("dragging editable message text selects text and never starts reorder", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/reorder-message.html");
  const message = page.locator(".statement-container .message").first();
  const label = message.locator(".editable-span-base");
  await label.click();
  await expect(label).toHaveAttribute("contenteditable", "true");

  const box = await label.boundingBox();
  expect(box).toBeTruthy();
  const y = box!.y + box!.height / 2;
  await page.mouse.move(box!.x + 2, y);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width - 2, y, { steps: 8 });
  await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ""))
    .not.toBe("");
  await page.mouse.up();
  await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(0);
});

test("dragging an idle message label does not reorder it", async ({ page }) => {
  await page.goto("/e2e/fixtures/reorder-message.html");
  const messages = page.locator(".statement-container .message");
  const label = messages.first().locator(".editable-span-base");
  const target = await messages.nth(1).boundingBox();
  const source = await label.boundingBox();
  expect(source).toBeTruthy();
  expect(target).toBeTruthy();

  await page.mouse.move(
    source!.x + source!.width / 2,
    source!.y + source!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    target!.x + target!.width / 2,
    target!.y + target!.height / 2,
    { steps: 8 },
  );
  await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(0);
  await page.mouse.up();
  expect(
    await page.evaluate(() => (window as any).__lastContentChange ?? null),
  ).toBeNull();
});
