import { test, expect, openDiagram } from "../fixtures";
import { DEFAULT_THRESHOLD } from "../test-cases";

const EMOJI_MESSAGE_CASES: { name: string; threshold?: number }[] = [
  { name: "emoji-async-message" },
  { name: "emoji-alt-condition" },
  { name: "emoji-comment" },
];

test.describe("Emoji in Messages and Conditions", () => {
  for (const { name, threshold } of EMOJI_MESSAGE_CASES) {
    test(name, async ({ page }) => {
      await openDiagram(page, `/e2e/fixtures/fixture.html?case=${name}`);

      // Wait for async icon imports to complete
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`${name}.png`, {
        threshold: threshold ?? DEFAULT_THRESHOLD,
        fullPage: true,
      });
    });
  }
});
