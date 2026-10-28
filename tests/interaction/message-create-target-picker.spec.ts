import { test, expect } from "../fixtures";
import type { Page } from "@playwright/test";

// Design: on-diagram editing, slice 1 (sections 6.1, 6.2, 11.3; scenarios
// A01-A04). A message is created with an explicit target, and dragging is
// not the only way to get there.

const lastChange = (page: Page) =>
  page.evaluate(() => (window as any).__lastContentChange ?? null);

const hoverGapNear = async (page: Page, gapIndex: number, name: string) => {
  const gap = await page
    .getByTestId(`message-gap-hover-${gapIndex}`)
    .boundingBox();
  const participant = await page
    .locator(`[data-participant-id="${name}"]`)
    .boundingBox();
  expect(gap).toBeTruthy();
  expect(participant).toBeTruthy();
  await page.mouse.move(
    participant!.x + participant!.width / 2,
    gap!.y + gap!.height / 2,
  );
};

const openPickerByClick = async (page: Page) => {
  await page.goto("/e2e/fixtures/create-message.html");
  await hoverGapNear(page, 1, "A");
  await page.getByTestId("message-create-handle-1-A").click();
  const picker = page.getByTestId("message-create-target-picker");
  await expect(picker).toBeVisible();
  return picker;
};

test.describe("Message create: target picker", () => {
  test("clicking the handle opens the target picker without changing the code", async ({
    page,
  }) => {
    const picker = await openPickerByClick(page);
    await expect(picker).toHaveAttribute("role", "listbox");
    await expect(picker.getByRole("option")).toHaveText(["A (self)", "B", "C"]);
    await expect(picker.getByRole("option", { name: "B" })).toBeFocused();
    await expect(page.getByTestId("message-create-source-dot")).toBeVisible();
    await expect.poll(() => lastChange(page)).toBeNull();
  });

  test("clicking a participant on the diagram creates a sync message to it", async ({
    page,
  }) => {
    await openPickerByClick(page);
    await page.locator('[data-participant-id="C"]').click();
    await expect.poll(() => lastChange(page)).toMatch(/A->C\.newMessage\(\)/);
    await expect(page.getByTestId("message-create-target-picker")).toHaveCount(
      0,
    );
  });

  test("choosing a picker option creates a sync message", async ({ page }) => {
    const picker = await openPickerByClick(page);
    await picker.getByRole("option", { name: "C" }).click();
    await expect.poll(() => lastChange(page)).toMatch(/A->C\.newMessage\(\)/);
  });

  test("the source option creates a self message", async ({ page }) => {
    const picker = await openPickerByClick(page);
    await picker.getByRole("option", { name: "A (self)" }).click();
    await expect.poll(() => lastChange(page)).toMatch(/A->A\.newMessage\(\)/);
  });

  test("Escape closes the picker and leaves the code unchanged", async ({
    page,
  }) => {
    await openPickerByClick(page);
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("message-create-target-picker")).toHaveCount(
      0,
    );
    await expect(page.getByTestId("message-create-source-dot")).toHaveCount(0);
    await expect.poll(() => lastChange(page)).toBeNull();
  });

  test("a press on blank diagram space cancels the picker", async ({
    page,
  }) => {
    await openPickerByClick(page);
    const diagram = await page.locator(".sequence-diagram").boundingBox();
    await page.mouse.click(
      diagram!.x + diagram!.width - 4,
      diagram!.y + diagram!.height - 4,
    );
    await expect(page.getByTestId("message-create-target-picker")).toHaveCount(
      0,
    );
    await expect.poll(() => lastChange(page)).toBeNull();
  });

  test("keyboard: Enter on a message gap opens the picker, arrows and Enter create", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    const gap = page.getByTestId("message-gap-hover-1");
    await expect(gap).toHaveAttribute("tabindex", "0");
    await expect(gap).toHaveAccessibleName("Add a message from A");
    await gap.focus();
    await page.keyboard.press("Enter");
    const picker = page.getByTestId("message-create-target-picker");
    await expect(picker).toBeVisible();
    await expect(picker.getByRole("option", { name: "B" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(picker.getByRole("option", { name: "C" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect.poll(() => lastChange(page)).toMatch(/A->C\.newMessage\(\)/);
  });

  test("keyboard: Escape returns focus to the gap", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    const gap = page.getByTestId("message-gap-hover-1");
    await gap.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByTestId("message-create-target-picker"),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("message-create-target-picker")).toHaveCount(
      0,
    );
    await expect(gap).toBeFocused();
    await expect.poll(() => lastChange(page)).toBeNull();
  });

  test("a drag released away from any participant keeps the draft in the picker", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await hoverGapNear(page, 1, "A");
    const handleBox = await page
      .getByTestId("message-create-handle-1-A")
      .boundingBox();
    const diagram = await page.locator(".sequence-diagram").boundingBox();
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(diagram!.x + diagram!.width + 80, handleBox!.y + 8, {
      steps: 8,
    });
    await page.mouse.up();
    const picker = page.getByTestId("message-create-target-picker");
    await expect(picker).toBeVisible();
    await expect.poll(() => lastChange(page)).toBeNull();
    await picker.getByRole("option", { name: "C" }).click();
    await expect.poll(() => lastChange(page)).toMatch(/A->C\.newMessage\(\)/);
  });
});
