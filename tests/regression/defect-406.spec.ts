import { test, expect } from "../fixtures";

test.describe("Defect 406", () => {
  test.beforeEach(async ({ page }) => {
    // run these tests as if in a desktop
    // browser with a 720p monitor
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("Fragments under Creation", async ({ page }) => {
    await page.goto("/e2e/fixtures/fixture.html?case=defect-406");
    await expect(page.locator('[data-signature="m6"]')).toBeVisible({
      timeout: 5000,
    });
    // Wait until the participant has rendered
    await expect(page.locator(".sequence-diagram .participant").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });
});
