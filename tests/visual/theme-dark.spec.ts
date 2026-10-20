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
