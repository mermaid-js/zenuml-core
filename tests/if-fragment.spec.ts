import { test, expect } from "./fixtures";

test.describe("If Fragment Test", () => {
  test("should render if fragment correctly", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/if-fragment.html");
    // Wait for the privacy icon to be loaded
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    // Verify the participants are rendered
    await expect(page.locator(".participant")).toHaveCount(2);
    await expect(page.locator(".participant").nth(0)).toContainText("Client");
    await expect(page.locator(".participant").nth(1)).toContainText("Server");

    // Verify the initial message
    await expect(page.locator(".message").first()).toContainText("SendRequest");

    // Verify the if fragment
    await expect(page.locator(".fragment")).toBeVisible();
    await expect(page.locator(".fragment .header")).toContainText("Alt");
    await expect(page.locator(".fragment .condition")).toContainText("true");

    // Verify the self message inside if block
    await expect(page.locator(".fragment .message")).toContainText(
      "processRequest",
    );

    // Take a snapshot of the rendered diagram
    await expect(page).toHaveScreenshot({
      threshold: 0.01,
      fullPage: true,
    });
  });
});
