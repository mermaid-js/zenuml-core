import { test, expect } from "../fixtures";
import { HTML_VISUAL_CASES, DEFAULT_THRESHOLD } from "../test-cases";

test.describe("HTML Rendering", () => {
  for (const { name, threshold } of HTML_VISUAL_CASES) {
    test(name, async ({ page }) => {
      await page.goto(`/e2e/fixtures/fixture.html?case=${name}`);

      // Wait for diagram to render
      await expect(page.locator(".privacy>span>svg")).toBeVisible({
        timeout: 5000,
      });

      // Wait for async icon imports to complete (stereotypes like @VPC, @RDS)
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`${name}.png`, {
        threshold: threshold ?? DEFAULT_THRESHOLD,
        fullPage: true,
      });
    });
  }
});
