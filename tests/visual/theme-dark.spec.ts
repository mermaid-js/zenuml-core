import { test, expect } from "../fixtures";
import { TEST_CASES, DEFAULT_THRESHOLD } from "../test-cases";

/**
 * theme-dark (ADR 0004) through both renderers. The DOM fixture takes the
 * theme from `?theme=`; the SVG fixture takes it as the second argument of
 * `__renderSvg`. The cases cover a group, a divider, comments with HTTP
 * verbs, nested fragments, numbering and a plain call.
 */
const DARK_CASES = ["smoke", "demo1-smoke", "demo3-nested-fragments", "fragment-issue"];

test.describe("theme-dark", () => {
  for (const name of DARK_CASES) {
    test(`dom-${name}`, async ({ page }) => {
      await page.goto(`/e2e/fixtures/fixture.html?case=${name}&theme=theme-dark`);
      await expect(page.locator(".sequence-diagram .participant").first()).toBeVisible({
        timeout: 5000,
      });
      await page.waitForLoadState("networkidle");
      // Cloud icons (@Lambda, @EC2 …) arrive through a lazy import that
      // networkidle can miss. AsyncIcon renders an empty placeholder with the
      // same classes until the icon is in, and only the loaded icon carries
      // aria-description, so wait until no icon container is still empty.
      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll(".participant .h-6.w-6")).every(
            (slot) => slot.querySelector("svg"),
          ),
        null,
        { timeout: 10000 },
      );
      await expect(page).toHaveScreenshot(`dark-dom-${name}.png`, {
        threshold: DEFAULT_THRESHOLD,
        fullPage: true,
      });
    });

    test(`svg-${name}`, async ({ page }) => {
      const code = TEST_CASES[name];
      if (!code) throw new Error(`Missing test case: ${name}`);
      await page.goto("/e2e/fixtures/svg-test.html");
      await page.evaluate((c) => (window as any).__renderSvg(c, "theme-dark"), code);
      await expect(page.locator("#svg-output > svg")).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveScreenshot(`dark-svg-${name}.png`, {
        threshold: DEFAULT_THRESHOLD,
        fullPage: true,
      });
    });
  }

  test("keyboard focus ring keeps a frame-coloured gap and a ring that clears 3:1", async ({
    page,
  }) => {
    // --zu-focus-ring is a gap (--zu-page) inside a ring (--zu-ring-focus).
    // On theme-dark the gap must be the frame, not a white halo, and the ring
    // must then carry the WCAG 2 non-text floor (3:1) against the frame alone.
    await page.goto("/e2e/fixtures/insert-participant.html?theme=theme-dark");
    const participant = page.locator(".participant").first();
    const name = participant.locator(".editable-span-base");
    for (let i = 0; i < 12; i += 1) {
      if (await participant.evaluate((element) => element === document.activeElement)) break;
      await page.keyboard.press("Tab");
    }
    await expect(participant).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await expect(name).toBeFocused();

    const { frame, shadow } = await name.evaluate((element) => ({
      frame: getComputedStyle(element.closest(".frame")!).backgroundColor,
      shadow: getComputedStyle(element).boxShadow,
    }));
    const colours = shadow.match(/rgba?\([^)]*\)/g) ?? [];
    expect(colours.length).toBe(3);
    expect(frame).toBe("rgb(31, 31, 31)");
    expect(colours[0]).toBe(frame);

    const luminance = (rgb: string) => {
      const [r, g, b] = rgb.match(/[\d.]+/g)!.slice(0, 3).map((v) => {
        const c = Number(v) / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [hi, lo] = [luminance(colours[1]), luminance(frame)].sort((a, b) => b - a);
    expect((hi + 0.05) / (lo + 0.05)).toBeGreaterThanOrEqual(3);
  });

  test("theme-clean-dark and theme-darcula render as theme-dark", async ({ page }) => {
    // The aliases set the same custom properties, so the composited frame
    // colours match; a screenshot per alias would only duplicate the baseline.
    const read = async (theme: string) => {
      await page.goto(`/e2e/fixtures/fixture.html?case=smoke&theme=${theme}`);
      await expect(page.locator(".sequence-diagram .participant").first()).toBeVisible();
      return page.evaluate(() => {
        const frame = document.querySelector(".frame")!;
        const cs = getComputedStyle(frame);
        const header = getComputedStyle(document.querySelector(".fragment > .header")!);
        return [cs.backgroundColor, cs.borderColor, cs.color, header.backgroundColor, header.color];
      });
    };
    const dark = await read("theme-dark");
    expect(dark[0]).toBe("rgb(31, 31, 31)");
    expect(await read("theme-clean-dark")).toEqual(dark);
    expect(await read("theme-darcula")).toEqual(dark);
  });
});
