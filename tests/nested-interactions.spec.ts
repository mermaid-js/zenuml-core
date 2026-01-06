import { test, expect } from "./fixtures";

test.describe("Nested Interactions Test", () => {
  test("should render nested interactions with fragment and self-invocation correctly", async ({
    page,
  }) => {
    await page.goto("/cy/nested-interaction-with-fragment.html");
    // Wait for the privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Verify the participants are rendered
    await expect(page.locator(".participant")).toHaveCount(
      await page.locator(".participant").count(),
    );
    await expect(page.locator(".participant").first()).toBeVisible();

    // Verify the if fragment exists
    await expect(page.locator(".fragment")).toBeVisible();

    // Take a snapshot of the rendered diagram
    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });

  test("should render nested interactions with outbound message and fragment correctly", async ({
    page,
  }) => {
    await page.goto("/cy/nested-interaction-with-outbound.html");
    // Wait for the privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Verify the participants are rendered
    await expect(page.locator(".participant")).toHaveCount(
      await page.locator(".participant").count(),
    );
    await expect(page.locator(".participant").first()).toBeVisible();

    // Verify the if fragment exists
    await expect(page.locator(".fragment")).toBeVisible();

    // Take a snapshot of the rendered diagram
    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });
});
