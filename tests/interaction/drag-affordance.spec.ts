import { test, expect } from "../fixtures";

test.describe("Drag Affordance", () => {
  test("shows grip dots on message hover and hides when not hovered", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-message.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const firstStatement = page.locator(".statement-container").first();
    const grip = firstStatement.getByTestId("reorder-grip");

    await expect(grip).toHaveCount(1);
    await expect(grip).toHaveCSS("opacity", "0");

    const message = firstStatement.locator(".message");
    await message.hover();

    await expect(grip).not.toHaveCSS("opacity", "0");
  });

  test("shows grip dots on messages inside fragments", async ({ page }) => {
    await page.goto("/e2e/fixtures/reorder-fragment.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const fragmentStatement = page.locator(".fragment-alt .statement-container").first();
    const grip = fragmentStatement.getByTestId("reorder-grip");

    await expect(grip).toHaveCount(1);
    await expect(grip).toHaveCSS("opacity", "0");

    const message = fragmentStatement.locator(".message");
    await message.hover();

    await expect(grip).not.toHaveCSS("opacity", "0");
  });
});
