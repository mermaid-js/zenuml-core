import { test, expect } from "../fixtures";

test.describe("Participant selection ring", () => {
  test("selected participant draws its ring in the default theme", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('[data-participant-id="A"]');
    const box = await participant.boundingBox();
    expect(box).toBeTruthy();

    await participant.click({ position: { x: 3, y: box!.height - 3 } });
    await expect(participant).toHaveClass(/ring-1/);
    // An invalid shadow fallback (e.g. `transparent`) voids the whole
    // box-shadow list, ring included.
    const shadow = await participant.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgb(56, 189, 248)");
  });
});
