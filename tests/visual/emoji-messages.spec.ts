import { test, expect } from "../fixtures";
import { DEFAULT_THRESHOLD } from "../test-cases";

const EMOJI_MESSAGE_CASES: { name: string; threshold?: number }[] = [
  { name: "emoji-async-message" },
  { name: "emoji-alt-condition" },
  { name: "emoji-comment" },
];

test.describe("Emoji in Messages and Conditions", () => {
  for (const { name, threshold } of EMOJI_MESSAGE_CASES) {
    test(name, async ({ page }) => {
      await page.goto(`/e2e/fixtures/fixture.html?case=${name}`);

      // Wait for diagram to render
      await expect(page.locator(".privacy>span>svg")).toBeVisible({
        timeout: 5000,
      });

      // Wait for async icon imports to complete
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`${name}.png`, {
        threshold: threshold ?? DEFAULT_THRESHOLD,
        fullPage: true,
      });
    });
  }
});
