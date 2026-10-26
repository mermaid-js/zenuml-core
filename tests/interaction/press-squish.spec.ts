import { openDiagram } from "../fixtures";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { clickMessageArrow } from "./clickMessageArrow";

// ADR 0003, P4 (press squish): a pressed chrome control scales to 0.975 in
// 60 ms and springs back. Disabled and aria-disabled controls never squish.
// Reduced motion (the media query or data-reduce-motion="true") turns it off.

const PRESSED = "matrix(0.975, 0, 0, 0.975, 0, 0)";
const SETTLE_MS = 150;

const transformOf = (locator: Locator) =>
  locator.evaluate((el) => getComputedStyle(el).transform);

async function centre(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).toBeTruthy();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
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

async function openMessagePanel(page: Page) {
  await page.goto("/e2e/fixtures/editable-label.html");
  const message = page
    .locator(".interaction.async .message")
    .filter({ hasText: "Hello Bob" });
  await expect(message).toBeVisible({ timeout: 5000 });
  await clickMessageArrow(message);
  const wrap = page.getByTestId("message-wrap-menu");
  await expect(wrap).toBeVisible();
  return wrap;
}

async function pressedTransform(page: Page, target: Locator) {
  const { x, y } = await centre(target);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(SETTLE_MS);
  const pressed = await transformOf(target);
  await page.mouse.up();
  return pressed;
}

test.describe("press squish", () => {
  test("insert button squishes while pressed and returns at rest", async ({
    page,
  }) => {
    const button = await revealInsertButton(page);
    expect(await transformOf(button)).toBe("none");
    const { x, y } = await centre(button);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.waitForTimeout(SETTLE_MS);
    expect(await transformOf(button)).toBe(PRESSED);
    await page.mouse.up();
    // The click inserted a participant and unmounted this button; read a fresh
    // one after the spring has settled.
    await page.waitForTimeout(600);
    const next = page.getByTestId("participant-insert-button-0");
    expect(await transformOf(next)).toBe("none");
  });

  test("insert button keeps its opacity transitions next to the transform", async ({
    page,
  }) => {
    const button = await revealInsertButton(page);
    const property = await button.evaluate(
      (el) => getComputedStyle(el).transitionProperty,
    );
    for (const name of [
      "opacity",
      "border-color",
      "color",
      "box-shadow",
      "transform",
    ]) {
      expect(property, `transition-property has ${name}`).toContain(name);
    }
  });

  test("a message panel button squishes while pressed", async ({ page }) => {
    const wrap = await openMessagePanel(page);
    expect(await transformOf(wrap)).toBe("none");
    expect(await pressedTransform(page, wrap)).toBe(PRESSED);
  });

  // The gap handle starts a drag on pointerdown, which suppresses the mouse
  // events that set :active and unmounts the handle about 12 ms later (probed
  // 2026-10-20), so a real press never reaches the squish rule. The composition
  // is still checked by forcing :active through the DevTools protocol.
  test("the gap handle scales in place and keeps its translate", async ({
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
    const rest = await centre(handle);
    const restTransform = await transformOf(handle);
    expect(restTransform).not.toBe("none");

    const client = await page.context().newCDPSession(page);
    await client.send("DOM.enable");
    await client.send("CSS.enable");
    const { root } = await client.send("DOM.getDocument", { depth: 0 });
    const { nodeId } = await client.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector: '[data-testid^="message-create-handle-1-"]',
    });
    await client.send("CSS.forcePseudoState", {
      nodeId,
      forcedPseudoClasses: ["active"],
    });
    await page.waitForTimeout(SETTLE_MS);
    const pressed = await centre(handle);
    const pressedTransform = await transformOf(handle);
    await client.send("CSS.forcePseudoState", {
      nodeId,
      forcedPseudoClasses: [],
    });

    expect(Math.abs(pressed.x - rest.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(pressed.y - rest.y)).toBeLessThanOrEqual(1);
    const parse = (t: string) =>
      t
        .replace(/^matrix\(|\)$/g, "")
        .split(",")
        .map(Number);
    const [, , , , restTx, restTy] = parse(restTransform);
    const [sx, , , sy, tx, ty] = parse(pressedTransform);
    expect(sx).toBeCloseTo(0.975, 3);
    expect(sy).toBeCloseTo(0.975, 3);
    expect(tx).toBeCloseTo(restTx, 1);
    expect(ty).toBeCloseTo(restTy, 1);
  });

  test("the stereotype pill, a real press, scales in place and keeps its translate", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('.participant[data-participant-id="A"]');
    await expect(participant).toBeVisible({ timeout: 5000 });
    const box = await participant.boundingBox();
    await participant.click({ position: { x: 3, y: box!.height - 3 } });
    const pill = page.getByRole("button", { name: "Add stereotype" });
    await expect(pill).toBeVisible();
    const rest = await centre(pill);
    const restTransform = await transformOf(pill);
    expect(restTransform).not.toBe("none");
    await page.mouse.move(rest.x, rest.y);
    await page.mouse.down();
    await page.waitForTimeout(SETTLE_MS);
    const pressed = await centre(pill);
    const pressedTransform = await transformOf(pill);
    await page.mouse.up();
    expect(Math.abs(pressed.x - rest.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(pressed.y - rest.y)).toBeLessThanOrEqual(1);
    expect(pressedTransform).toMatch(/^matrix\(0\.975, 0, 0, 0\.975, /);
  });

  test("an aria-disabled item does not squish", async ({ page }) => {
    const wrap = await openMessagePanel(page);
    await wrap.click();
    const sync = page.getByTestId("message-type-menu");
    await sync.click();
    const disabled = page.getByTestId("message-type-sync");
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(await pressedTransform(page, disabled)).toBe("none");
  });

  test.describe("reduced motion (media query)", () => {
    test("insert button and panel button do not squish", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const button = await revealInsertButton(page);
      expect(await pressedTransform(page, button)).toBe("none");
      const wrap = await openMessagePanel(page);
      expect(await pressedTransform(page, wrap)).toBe("none");
    });
  });

  test.describe("reduced motion (data-reduce-motion)", () => {
    test("insert button and panel button do not squish", async ({ page }) => {
      const button = await revealInsertButton(page);
      // The attribute goes on an ancestor of the diagram (here <body>): the
      // popovers render in their own .zenuml portal roots, so the diagram root
      // alone would not reach them.
      await page.evaluate(() =>
        document.body.setAttribute("data-reduce-motion", "true"),
      );
      expect(await pressedTransform(page, button)).toBe("none");
      const wrap = await openMessagePanel(page);
      // The attribute goes on an ancestor of the diagram (here <body>): the
      // popovers render in their own .zenuml portal roots, so the diagram root
      // alone would not reach them.
      await page.evaluate(() =>
        document.body.setAttribute("data-reduce-motion", "true"),
      );
      expect(await pressedTransform(page, wrap)).toBe("none");
    });
  });
});
