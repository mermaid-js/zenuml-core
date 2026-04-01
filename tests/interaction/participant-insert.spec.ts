import { test, expect } from "../fixtures";

test.describe("Participant Insert", () => {
  test("inserts a participant between two lifelines and rewrites DSL", async ({ page }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const middleGap = page.getByTestId("participant-insert-gap-1");
    await middleGap.hover();

    const addButton = page.getByTestId("participant-insert-button-1");
    await expect(addButton).toBeVisible();
    await addButton.click();

    await page.getByTestId("participant-insert-name").fill("B");
    await page.getByTestId("participant-insert-submit").click();

    await expect(page.locator('[data-participant-id="B"]')).toBeVisible({
      timeout: 10000,
    });

    const geometry = await page.evaluate(() => {
      const read = (selector: string) =>
        document.querySelector(selector)?.getBoundingClientRect();
      return {
        a: read('#A .participant'),
        b: read('#B .participant'),
        c: read('#C .participant'),
      };
    });

    expect(geometry.a).toBeTruthy();
    expect(geometry.b).toBeTruthy();
    expect(geometry.c).toBeTruthy();
    expect(geometry.b!.left).toBeGreaterThan(geometry.a!.left);
    expect(geometry.b!.left).toBeLessThan(geometry.c!.left);

    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain("A\nB\nC\nA->C: Ping");
  });
});
