import { test, expect } from "../fixtures";

test.describe("Participant Insert", () => {
  test("shows insert affordance between participants", async ({ page }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page.getByTestId("participant-insert-button-0")).toBeVisible();
  });

  test("one-click inserts a participant between two lifelines and rewrites DSL", async ({ page }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const addButton = page.getByTestId("participant-insert-button-0");
    await expect(addButton).toBeVisible();
    await addButton.click();

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

  test("insert button is vertically centered with participant headers", async ({ page }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const geometry = await page.evaluate(() => {
      const participantA = document.querySelector('#A .participant')?.getBoundingClientRect();
      const participantC = document.querySelector('#C .participant')?.getBoundingClientRect();
      const button = document.querySelector('[data-testid="participant-insert-button-0"]')?.getBoundingClientRect();
      return { participantA, participantC, button };
    });

    expect(geometry.participantA).toBeTruthy();
    expect(geometry.participantC).toBeTruthy();
    expect(geometry.button).toBeTruthy();

    const participantCenterY = (geometry.participantA!.top + geometry.participantA!.bottom) / 2;
    const buttonCenterY = (geometry.button!.top + geometry.button!.bottom) / 2;
    expect(Math.abs(buttonCenterY - participantCenterY)).toBeLessThan(15);

    const buttonCenterX = (geometry.button!.left + geometry.button!.right) / 2;
    expect(buttonCenterX).toBeGreaterThan(geometry.participantA!.right);
    expect(buttonCenterX).toBeLessThan(geometry.participantC!.left);
  });
});
