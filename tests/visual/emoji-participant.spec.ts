import { test, expect } from "../fixtures";
import { DEFAULT_THRESHOLD } from "../test-cases";

const EMOJI_PARTICIPANT_CASES: { name: string; threshold?: number }[] = [
  { name: "emoji-participant" },
  { name: "emoji-multi-participants" },
  { name: "emoji-with-type" },
  { name: "emoji-with-stereotype" },
  { name: "emoji-no-emoji-baseline" },
];

test.describe("Emoji on Participants", () => {
  for (const { name, threshold } of EMOJI_PARTICIPANT_CASES) {
    test(name, async ({ page }) => {
      await page.goto(`/e2e/fixtures/fixture.html?case=${name}`);

      // Wait for diagram to render
      await expect(page.locator(".privacy>span>svg")).toBeVisible({
        timeout: 5000,
      });

      // Wait for async icon imports to complete (stereotypes, @Database etc.)
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`${name}.png`, {
        threshold: threshold ?? DEFAULT_THRESHOLD,
        fullPage: true,
      });
    });
  }
});
