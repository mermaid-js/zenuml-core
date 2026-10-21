import { test, expect } from "../fixtures";

// #366: an icon token alone as a fragment condition used to parse with an
// empty condition; `check` became a self-call and `A.m()` fell into a spurious
// section fragment.
for (const keyword of ["if", "while"]) {
  test(`${keyword}([check]) renders the icon condition and one message`, async ({
    page,
  }) => {
    const dsl = `${keyword}([check]) {\n  A.m()\n}`;
    await page.goto(
      `/e2e/fixtures/creation.html?dsl=${encodeURIComponent(dsl)}`,
    );
    const fragment = page.locator(
      keyword === "if" ? ".fragment.alt" : ".fragment.loop",
    );
    await expect(fragment).toHaveCount(1);
    // The renderer shows `[check]` as its icon, as it does for `[check] a`.
    await expect(fragment.locator(".condition").first()).toContainText("✅");
    await expect(page.locator(".interaction")).toHaveCount(1);
    await expect(page.locator(".fragment.section")).toHaveCount(0);
  });
}

// Also fixes the digit case of #363: a bare number inside free-text.
test("if(retry 3 times) renders its text and one message", async ({ page }) => {
  const dsl = "if(retry 3 times) {\n  A.m()\n}";
  await page.goto(`/e2e/fixtures/creation.html?dsl=${encodeURIComponent(dsl)}`);
  await expect(page.locator(".fragment.alt")).toHaveCount(1);
  await expect(page.locator(".fragment.alt .condition").first()).toContainText(
    "retry 3 times",
  );
  await expect(page.locator(".interaction")).toHaveCount(1);
  await expect(page.locator(".fragment.section")).toHaveCount(0);
});
