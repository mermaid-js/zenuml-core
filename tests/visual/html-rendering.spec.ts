import { test, expect, openDiagram } from "../fixtures";
import { HTML_VISUAL_CASES, DEFAULT_THRESHOLD } from "../test-cases";

test.describe("HTML Rendering", () => {
  for (const { name, threshold } of HTML_VISUAL_CASES) {
    test(name, async ({ page }) => {
      await openDiagram(page, `/e2e/fixtures/fixture.html?case=${name}`);

      // Wait for async icon imports to complete (stereotypes like @VPC, @RDS)
      await page.waitForLoadState("networkidle");
      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll(".participant .h-6.w-6")).every(
            (slot) => slot.querySelector("svg"),
          ),
        null,
        { timeout: 10000 },
      );

      await expect(page).toHaveScreenshot(`${name}.png`, {
        threshold: threshold ?? DEFAULT_THRESHOLD,
        fullPage: true,
      });
    });
  }
});
