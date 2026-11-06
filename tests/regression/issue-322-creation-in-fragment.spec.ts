import { test, expect } from "../fixtures";

// #322: a creation message inside a fragment, where the created participant
// sits left of the creator, lost its right-to-left arrow and collapsed to
// 8 px. The creation took the fragment's left-most participant as its
// source instead of the creator.
const plain = '"b:B" B A\nA.m111 {\n  b = new B\n}';
const inFragment =
  '"b:B" B A\na = A.m111 {\n  if(x) {\n    b = new B\n  }\n}';
const existingInFragment = "B A\nA.m() {\n  if(x) {\n    new B\n  }\n}";

async function measure(page: any, dsl: string) {
  await page.goto(`/e2e/fixtures/creation.html?dsl=${encodeURIComponent(dsl)}`);
  await expect(page.locator(".interaction.creation")).toBeVisible();
  return page.evaluate(() => {
    const el = document.querySelector(".interaction.creation") as HTMLElement;
    const label = el.querySelector(".message .name") as HTMLElement;
    return {
      rtl: el.classList.contains("right-to-left"),
      width: el.getBoundingClientRect().width,
      labelWidth: label.getBoundingClientRect().width,
    };
  });
}

test("creation inside a fragment keeps its right-to-left arrow (#322)", async ({
  page,
}) => {
  const base = await measure(page, plain);
  expect(base.rtl).toBe(true);
  const m = await measure(page, inFragment);
  expect(m.rtl).toBe(true);
  expect(m.width).toBeGreaterThanOrEqual(100);
  expect(Math.abs(m.width - base.width)).toBeLessThanOrEqual(2);
  expect(m.labelWidth).toBeGreaterThan(0);
});

test("creation of an existing participant inside a fragment points left (#322)", async ({
  page,
}) => {
  const m = await measure(page, existingInFragment);
  expect(m.rtl).toBe(true);
  expect(m.width).toBeGreaterThanOrEqual(100);
  expect(m.labelWidth).toBeGreaterThan(0);
});
