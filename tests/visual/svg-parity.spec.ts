import { test, expect } from "../fixtures";
import { TEST_CASES, SVG_PARITY_CASES } from "../test-cases";

/**
 * SVG Parity Tests
 *
 * Renders every visual test fixture through renderToSvg() and captures
 * screenshot baselines. These verify structural/layout parity with the
 * React/HTML renderer — same elements, positions, and reading order.
 */
test.describe("SVG Parity Tests", () => {
  for (const name of SVG_PARITY_CASES) {
    test(`svg-${name}`, async ({ page }) => {
      const code = TEST_CASES[name];
      if (!code) throw new Error(`Missing test case: ${name}`);

      await page.goto("/cy/svg-test.html");
      await page.evaluate((c) => (window as any).__renderSvg(c), code);
      await expect(page.locator("#svg-output > svg")).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveScreenshot(`svg-${name}.png`, {
        threshold: 0.02,
        fullPage: true,
      });
    });
  }
});
