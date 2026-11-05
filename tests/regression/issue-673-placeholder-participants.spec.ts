import { test, expect } from "../fixtures";

// #673: a nameless participant or `new` used to render a box with the internal
// placeholder text "Missing `Participant`" / "Missing Constructor". No box
// should appear until a name exists. The diagram then looks like an empty
// document, which shows only the default starter actor.
// Test titles must not contain a greater-than sign: the shard planner cannot
// express them in its test list.
const open = (page: import("@playwright/test").Page, dsl: string) =>
  page.goto(`/e2e/fixtures/creation.html?dsl=${encodeURIComponent(dsl)}`);

const NAMELESS: Array<[string, string]> = [
  ["at sign", "@"],
  ["stereotype only", "<<S>>"],
  ["new", "new"],
  ["assigned new", "r = new"],
  ["at sign in a group", "group G {@"],
];

for (const [title, dsl] of NAMELESS) {
  test(`${title} draws no placeholder participant`, async ({ page }) => {
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

for (const [title, dsl, id] of [
  ["named stereotype", "<<S>> A", "A"],
  ["typed participant", "@Actor A", "A"],
  ["creation", "new B()", "B"],
] as const) {
  test(`${title} still draws participant ${id}`, async ({ page }) => {
    await open(page, dsl);
    await expect(
      page.locator(
        `.sequence-diagram .participant[data-participant-id="${id}"]`,
      ),
    ).toHaveCount(1);
  });
}

test("a nameless new keeps its body, takes no number and leaves no gap", async ({
  page,
}) => {
  await open(page, "A.a()\nnew {\n  B.c()\n}\nA.d()");
  await expect(page.locator(".interaction.creation")).toHaveCount(0);
  const ids = await page
    .locator(".sequence-diagram .participant")
    .evaluateAll((els) =>
      els.map((e) => e.getAttribute("data-participant-id")),
    );
  expect(ids).toEqual(["_STARTER_", "A", "B"]);
  const targets = await page
    .locator(".interaction")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-target")));
  expect(targets).toEqual(["A", "B", "A"]);
  const text = await page.locator(".zenuml").first().innerText();
  expect(text).toContain("c()");
  expect(text).not.toContain("Missing");
});
