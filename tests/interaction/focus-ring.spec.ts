import { expect, test, type Locator, type Page } from "@playwright/test";
import { clickMessageArrow } from "./clickMessageArrow";

// ADR 0003, Gate 4: every focusable control in the editing chrome shows the
// one focus ring under keyboard modality. No control may fall back to the
// browser default outline (`outline-style: auto`), and focusing a control must
// change its outline or its box-shadow.

const CONTROLS =
  'button, input, [role="menuitem"], [role="option"], [tabindex]:not([tabindex="-1"])';

type Finding = {
  control: string;
  focusVisible: boolean;
  outlineStyle: string;
  changed: boolean;
};

async function audit(page: Page, root: Locator): Promise<Finding[]> {
  await expect(root.first()).toBeVisible();
  const handle = await root.first().elementHandle();
  expect(handle).toBeTruthy();
  // A non-modifier key press puts Chromium in keyboard modality so programmatic
  // focus() matches :focus-visible. ScrollLock does nothing else; Tab would
  // move focus out of a menu and close it.
  await page.keyboard.press("ScrollLock");
  return handle!.evaluate((el, selector) => {
    const style = (node: Element) => {
      const cs = getComputedStyle(node);
      return {
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        outlineColor: cs.outlineColor,
        boxShadow: cs.boxShadow,
      };
    };
    // Tailwind's outline-none leaves a transparent 2px solid outline for forced
    // colours; that is not a visible indicator.
    const visibleOutline = (o: ReturnType<typeof style>) =>
      o.outlineStyle !== "none" &&
      o.outlineWidth !== "0px" &&
      !/^rgba\(.*,\s*0\)$/.test(o.outlineColor) &&
      o.outlineColor !== "transparent";
    const candidates = new Set<Element>(el.querySelectorAll(selector));
    if (el.matches(selector)) candidates.add(el);
    const controls = [...candidates].filter(
      (c) => !(c as HTMLButtonElement).disabled,
    );
    // Rest state is read before any focus moves. A control a surface focused
    // when it opened is already showing its focus state, so it must carry the
    // ring itself. Blurring it would close some surfaces.
    const rest = new Map(controls.map((c) => [c, style(c)]));
    const startedFocused = document.activeElement;
    const out: Finding[] = [];
    for (const c of controls) {
      (c as HTMLElement).focus();
      const at = style(c);
      const before = rest.get(c)!;
      out.push({
        control:
          c.getAttribute("data-testid") ??
          c.getAttribute("aria-label") ??
          c.getAttribute("title") ??
          c.tagName.toLowerCase(),
        focusVisible: c.matches(":focus-visible"),
        outlineStyle: at.outlineStyle,
        changed:
          c === startedFocused
            ? at.boxShadow.includes("rgb(71, 85, 105)") || visibleOutline(at)
            : at.boxShadow !== before.boxShadow ||
              visibleOutline(at) !== visibleOutline(before) ||
              (visibleOutline(at) && at.outlineColor !== before.outlineColor),
      });
    }
    return out;
  }, CONTROLS);
}

async function expectRing(page: Page, root: Locator, minControls = 1) {
  const findings = await audit(page, root);
  expect(findings.length).toBeGreaterThanOrEqual(minControls);
  for (const f of findings) {
    expect(f.focusVisible, `${f.control} matches :focus-visible`).toBe(true);
    expect(f.outlineStyle, `${f.control} outline-style`).not.toBe("auto");
    expect(f.changed, `${f.control} shows a focus indicator`).toBe(true);
  }
}

async function openParticipantPanel(page: Page) {
  await page.goto("/e2e/fixtures/insert-participant.html");
  const participant = page.locator('.participant[data-participant-id="A"]');
  await expect(participant).toBeVisible({ timeout: 5000 });
  const box = await participant.boundingBox();
  expect(box).toBeTruthy();
  await participant.click({ position: { x: 3, y: box!.height - 3 } });
  return page.getByTestId("participant-style-panel");
}

test.describe("one focus ring on every chrome control", () => {
  test("participant panel", async ({ page }) => {
    const panel = await openParticipantPanel(page);
    await expectRing(page, panel, 3);
  });

  test("type picker", async ({ page }) => {
    const panel = await openParticipantPanel(page);
    await panel.getByRole("button", { name: /^Set icon/ }).click();
    const picker = page.getByRole("dialog", {
      name: "Participant type",
      exact: true,
    });
    await expectRing(page, picker, 3);
  });

  test("colour picker", async ({ page }) => {
    const panel = await openParticipantPanel(page);
    await panel.getByRole("button", { name: /^Set color/ }).click();
    const picker = page.getByRole("dialog", {
      name: "Participant colour",
      exact: true,
    });
    await expectRing(page, picker, 3);
  });

  test("message style panel and its submenus", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    const message = page
      .locator(".interaction.async .message")
      .filter({ hasText: "Hello Bob" });
    await expect(message).toBeVisible({ timeout: 5000 });
    await clickMessageArrow(message);
    const panel = page
      .getByTestId("message-rename")
      .locator('xpath=ancestor::div[contains(@class,"zenuml")][1]');
    await expectRing(page, panel, 4);
    await page.getByTestId("message-type-menu").click();
    await expectRing(page, panel, 7);
    await page.getByTestId("message-wrap-menu").click();
    await expectRing(page, panel, 7);
  });

  test("gap insert menu", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    const zone = page.getByTestId("message-gap-hover-1");
    await expect(zone).toBeVisible({ timeout: 5000 });
    await zone.focus();
    await page.keyboard.press("Shift+F10");
    const menu = page.getByTestId("gap-insert-menu-1");
    await expectRing(page, menu, 1);
  });

  test("message create handle", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    const zone = page.getByTestId("message-gap-hover-1");
    await expect(zone).toBeVisible({ timeout: 5000 });
    await zone.hover();
    const handle = page.locator('[data-testid^="message-create-handle-1-"]');
    await expect(handle.first()).toBeVisible();
    await expectRing(page, handle.first());
  });

  test("participant insert button", async ({ page }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({ timeout: 5000 });
    const a = await page.locator("[data-lifeline-id=A] .participant").boundingBox();
    const c = await page.locator("[data-lifeline-id=C] .participant").boundingBox();
    await page.mouse.move(
      (a!.x + a!.width + c!.x) / 2,
      a!.y + a!.height / 2,
    );
    const button = page.getByTestId("participant-insert-button-0");
    await expect(button).toHaveCSS("opacity", /^0\.[1-9]|^1$/);
    await expectRing(page, button);
  });
});
