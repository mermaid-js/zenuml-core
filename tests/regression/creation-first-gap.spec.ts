import { test, expect } from "../fixtures";

// With insertion controls on, the first root gap adds clearance above the
// first statement. A created participant's box is placed from the layout
// model, so it must include the same clearance: the «create» arrow meets the
// box at its vertical centre and the activation bar starts at the box bottom.
const cases = {
  "divider insertion only": "new A",
  "message and divider insertion": "A\nB\nA->B.hello()\nnew C",
};

for (const [name, dsl] of Object.entries(cases)) {
  test(`creation arrow meets the created box centre (${name})`, async ({
    page,
  }) => {
    await page.goto(
      `/e2e/fixtures/creation.html?dsl=${encodeURIComponent(dsl)}`,
    );
    await expect(page.locator(".creation .message")).toBeVisible();
    await expect(page.getByTestId("message-gap-0")).toBeAttached();

    const created = dsl.split("\n").pop()!.replace("new ", "");
    const m = await page.evaluate((createdName) => {
      const box = document
        .querySelector(`[data-participant-id="${createdName}"]`)!
        .getBoundingClientRect();
      const arrow = document
        .querySelector(".creation .message")!
        .getBoundingClientRect();
      const occurrence = document
        .querySelector(".creation .occurrence")!
        .getBoundingClientRect();
      return {
        arrowToCentre: arrow.bottom - (box.top + box.bottom) / 2,
        barToBoxBottom: occurrence.top - box.bottom,
      };
    }, created);

    expect(Math.abs(m.arrowToCentre)).toBeLessThanOrEqual(2);
    expect(m.barToBoxBottom).toBeLessThanOrEqual(0);
    expect(m.barToBoxBottom).toBeGreaterThanOrEqual(-4);
  });
}
