import type { CDPSession, Page } from "@playwright/test";
import { test, expect, lastContentChange } from "../fixtures";

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: { width: 800, height: 800 },
});

type Point = { x: number; y: number };

const center = (box: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Point => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

const moveTouch = async (cdp: CDPSession, from: Point, to: Point) => {
  for (let step = 1; step <= 8; step += 1) {
    const progress = step / 8;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: from.x + (to.x - from.x) * progress,
          y: from.y + (to.y - from.y) * progress,
          id: 1,
        },
      ],
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
};

const startTouch = (cdp: CDPSession, point: Point) =>
  cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ ...point, id: 1 }],
  });

const finishTouch = (cdp: CDPSession, type: "touchEnd" | "touchCancel") =>
  cdp.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: [],
  });

const contentChange = (page: Page) => lastContentChange(page, "")();

test("a visible handle reorders messages with native touch without opening the menu", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/reorder-message.html");
  const messages = page.locator(".statement-container .message");
  const first = messages.nth(0);
  const second = messages.nth(1);
  await expect(second).toBeVisible();

  const handle = second.getByRole("button", {
    name: "Drag to reorder message",
  });
  await expect(handle).toHaveCSS("opacity", "1");
  await expect(handle).toHaveCSS("pointer-events", "auto");
  await expect(handle).toHaveCSS("touch-action", "none");
  const source = await handle.boundingBox();
  const destination = await first.boundingBox();
  expect(source).toBeTruthy();
  expect(destination).toBeTruthy();
  const from = center(source!);
  const to = {
    x: destination!.x + destination!.width / 2,
    y: destination!.y + 2,
  };
  const cdp = await page.context().newCDPSession(page);

  await startTouch(cdp, from);
  await moveTouch(cdp, from, to);
  await finishTouch(cdp, "touchEnd");
  await cdp.detach();

  await expect
    .poll(() => contentChange(page))
    .toContain("A->C: second\nA->B: first");
  await expect(page.getByTestId("message-rename")).toHaveCount(0);
});

test("a single threshold-crossing touch move can drop immediately", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/reorder-message.html");
  const messages = page.locator(".statement-container .message");
  const first = messages.first();
  const second = messages.nth(1);
  await expect(second).toBeVisible();
  const handleBox = await second
    .getByRole("button", { name: "Drag to reorder message" })
    .boundingBox();
  const targetBox = await first.boundingBox();
  expect(handleBox).toBeTruthy();
  expect(targetBox).toBeTruthy();
  const from = center(handleBox!);
  const to = { x: targetBox!.x + targetBox!.width / 2, y: targetBox!.y + 2 };
  const cdp = await page.context().newCDPSession(page);

  await startTouch(cdp, from);
  for (const offset of [1, 2]) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: from.x, y: from.y - offset, id: 1 }],
    });
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ ...to, id: 1 }],
  });
  await finishTouch(cdp, "touchEnd");
  await cdp.detach();

  await expect
    .poll(() => contentChange(page))
    .toContain("A->C: second\nA->B: first");
});

test("a handle tap leaves the menu closed, and editing removes the handle", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/reorder-message.html");
  const first = page.locator(".statement-container .message").first();
  await expect(first).toBeVisible();
  const handle = first.getByRole("button", { name: "Drag to reorder message" });
  const handleBox = await handle.boundingBox();
  expect(handleBox).toBeTruthy();
  const cdp = await page.context().newCDPSession(page);

  await startTouch(cdp, center(handleBox!));
  await finishTouch(cdp, "touchEnd");
  await expect(page.getByTestId("message-rename")).toHaveCount(0);
  expect(await contentChange(page)).toBe("");

  const label = first.locator(".editable-span-base");
  const labelBox = await label.boundingBox();
  expect(labelBox).toBeTruthy();
  await startTouch(cdp, center(labelBox!));
  await finishTouch(cdp, "touchEnd");
  await cdp.detach();
  await expect(label).toHaveAttribute("contenteditable", "true");
  await expect(handle).toHaveCount(0);
});

test("touch release outside and touch cancellation leave the order unchanged", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/reorder-message.html");
  const messages = page.locator(".statement-container .message");
  const first = messages.first();
  const second = messages.nth(1);
  await expect(second).toBeVisible();
  const handle = second.getByRole("button", {
    name: "Drag to reorder message",
  });
  const source = await handle.boundingBox();
  const target = await first.boundingBox();
  expect(source).toBeTruthy();
  expect(target).toBeTruthy();
  const from = center(source!);
  const to = { x: target!.x + target!.width / 2, y: target!.y + 2 };
  const outside = { x: 10, y: 10 };
  const cdp = await page.context().newCDPSession(page);

  await startTouch(cdp, from);
  await moveTouch(cdp, from, to);
  await moveTouch(cdp, to, outside);
  await finishTouch(cdp, "touchEnd");
  await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(0);
  expect(await contentChange(page)).toBe("");

  await startTouch(cdp, from);
  await moveTouch(cdp, from, to);
  await finishTouch(cdp, "touchCancel");
  await cdp.detach();
  await expect(page.locator('[data-reorder-state="dragging"]')).toHaveCount(0);
  expect(await contentChange(page)).toBe("");
  await expect(page.getByTestId("message-rename")).toHaveCount(0);
});
