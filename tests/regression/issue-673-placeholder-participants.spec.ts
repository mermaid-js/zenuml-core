import { test, expect } from "../fixtures";

// #673: a nameless participant or `new` used to render a box with the internal
// placeholder text "Missing `Participant`" / "Missing Constructor". No box
// should appear until a name exists. The diagram then looks like an empty
// document, which shows only the default starter actor.
const open = (page: import("@playwright/test").Page, dsl: string) =>
  page.goto(`/e2e/fixtures/creation.html?dsl=${encodeURIComponent(dsl)}`);

for (const dsl of ["@", "<<S>>", "new", "r = new", "group G {@"]) {
  test(`${JSON.stringify(dsl)} draws no placeholder participant`, async ({
    page,
  }) => {
    await open(page, dsl);
    await expect(page.locator(".zenuml").first()).toBeVisible();
    await expect(page.locator(".sequence-diagram .participant")).toHaveCount(1);
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toHaveAttribute("data-participant-id", "_STARTER_");
    await expect(page.locator(".interaction.creation")).toHaveCount(0);
    expect(await page.locator("body").innerText()).not.toContain("Missing");
  });
}

for (const [dsl, id] of [
  ["<<S>> A", "A"],
  ["@Actor A", "A"],
  ["new B()", "B"],
] as const) {
  test(`${JSON.stringify(dsl)} still draws participant ${id}`, async ({
    page,
  }) => {
    await open(page, dsl);
    await expect(
      page.locator(
        `.sequence-diagram .participant[data-participant-id="${id}"]`,
      ),
    ).toHaveCount(1);
  });
}
