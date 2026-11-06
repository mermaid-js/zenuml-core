import { expect, test, type Locator, type Page } from "@playwright/test";
import { clickMessageArrow } from "./clickMessageArrow";

// P2 of ADR 0003: every popover root enters with `zu-pop-in` (200 ms,
// --zu-dur-base) and leaves with `zu-pop-out` (120 ms, --zu-dur-snap). Under
// reduced motion both durations are 0 and the root unmounts at once.

type Animation = { name: string; duration: number | string | undefined };

const animationsOf = (root: Locator) =>
  root.evaluate((el) =>
    el.getAnimations().map((a) => ({
      name: (a as CSSAnimation).animationName,
      duration: a.effect?.getTiming().duration,
    })),
  ) as Promise<Animation[]>;

const openParticipantPanel = async (page: Page) => {
  await page.goto("/e2e/fixtures/insert-participant.html");
  const participant = page.locator('.participant[data-participant-id="A"]');
  const box = await participant.boundingBox();
  expect(box).toBeTruthy();
  await participant.click({ position: { x: 3, y: box!.height - 3 } });
  return page.getByTestId("participant-name-row");
};

const openMessagePanel = async (page: Page) => {
  await page.goto("/e2e/fixtures/editable-label.html");
  const message = page
    .locator(".interaction.async .message")
    .filter({ hasText: "Hello Bob" });
  await clickMessageArrow(message);
  return page.locator("#style-panel > div").first();
};

const openGapMenu = async (page: Page) => {
  await page.goto("/e2e/fixtures/create-message.html");
  const gap = page.getByTestId("message-gap-hover-1");
  await gap.focus();
  await page.keyboard.press("Shift+F10");
  return page.getByTestId("gap-insert-menu-1");
};

const surfaces: Array<{
  name: string;
  open: (page: Page) => Promise<Locator>;
}> = [
  { name: "participant panel", open: openParticipantPanel },
  { name: "message style panel", open: openMessagePanel },
  { name: "gap menu", open: openGapMenu },
];

test.describe("popover motion (P2)", () => {
  for (const surface of surfaces) {
    test(`${surface.name} enters with zu-pop-in and exits with zu-pop-out`, async ({
      page,
    }) => {
      const root = await surface.open(page);
      await expect(root).toBeVisible();
      await expect(root).toHaveClass(/zu-pop-enter/);
      const entering = await animationsOf(root);
      expect(entering.map((a) => a.name)).toContain("zu-pop-in");
      expect(entering.find((a) => a.name === "zu-pop-in")?.duration).toBe(200);

      // Capture the element, press Escape, and read it in the same tick: the
      // exit class and animation must be on the still-attached node.
      const handle = await root.elementHandle();
      expect(handle).toBeTruthy();
      await page.keyboard.press("Escape");
      const exiting = await handle!.evaluate((el) => ({
        connected: el.isConnected,
        exit: el.classList.contains("zu-pop-exit"),
        animations: el.getAnimations().map((a) => ({
          name: (a as CSSAnimation).animationName,
          duration: a.effect?.getTiming().duration,
        })),
      }));
      expect(exiting.connected).toBe(true);
      expect(exiting.exit).toBe(true);
      expect(exiting.animations.map((a) => a.name)).toContain("zu-pop-out");
      expect(
        exiting.animations.find((a) => a.name === "zu-pop-out")?.duration,
      ).toBe(120);
      await expect(root).toHaveCount(0);
    });

    test(`${surface.name} has no motion and unmounts at once under reduced motion`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const root = await surface.open(page);
      await expect(root).toBeVisible();
      const durations = (await animationsOf(root)).map((a) => a.duration);
      expect(durations.every((d) => d === 0)).toBe(true);
      const handle = await root.elementHandle();
      await page.keyboard.press("Escape");
      // One macrotask is enough: no exit frame is scheduled.
      await page.evaluate(() => new Promise((r) => setTimeout(r, 0)));
      expect(await handle!.evaluate((el) => el.isConnected)).toBe(false);
    });

    test(`${surface.name} has no motion and unmounts at once with data-reduce-motion on an ancestor`, async ({
      page,
    }) => {
      // P3: the host attribute goes on an ancestor of the diagram (here <html>).
      // The popovers render in their own .zenuml portal roots, so the diagram
      // root alone would not reach them.
      // An init script runs before <html> exists in Chromium, so set the
      // attribute as soon as the element appears.
      await page.addInitScript(() => {
        const set = () =>
          document.documentElement?.setAttribute("data-reduce-motion", "true");
        if (document.documentElement) return set();
        new MutationObserver((_, observer) => {
          if (!document.documentElement) return;
          set();
          observer.disconnect();
        }).observe(document, { childList: true });
      });
      const root = await surface.open(page);
      await expect(root).toBeVisible();
      const durations = (await animationsOf(root)).map((a) => a.duration);
      expect(durations.every((d) => d === 0)).toBe(true);
      const handle = await root.elementHandle();
      await page.keyboard.press("Escape");
      await page.evaluate(() => new Promise((r) => setTimeout(r, 0)));
      expect(await handle!.evaluate((el) => el.isConnected)).toBe(false);
    });
  }

  test("type and colour pickers enter and exit inside the participant panel", async ({
    page,
  }) => {
    await openParticipantPanel(page);
    const panel = page.getByTestId("participant-style-panel");
    await panel.getByRole("button", { name: /^Set color/ }).click();
    const picker = page.getByRole("dialog", { name: "Participant colour" });
    await expect(picker).toBeVisible();
    const wrapper = picker.locator("xpath=..");
    await expect(wrapper).toHaveClass(/zu-pop-enter/);
    const handle = await wrapper.elementHandle();
    await page.keyboard.press("Escape");
    expect(
      await handle!.evaluate(
        (el) => el.isConnected && el.classList.contains("zu-pop-exit"),
      ),
    ).toBe(true);
    await expect(picker).toHaveCount(0);
    // The panel itself is still open after closing a picker.
    await expect(panel).toBeVisible();
  });
});
