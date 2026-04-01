import { test, expect } from "../fixtures";

test.describe("Message Type Panel", () => {
  test("switches an async message to a return message and updates DSL", async ({ page }) => {
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(msg.text());
    });

    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const asyncMessage = page.locator(".interaction.async .message").filter({
      hasText: "Hello Bob",
    });
    await asyncMessage.click();

    const returnButton = page.getByTestId("message-type-return");
    await expect(returnButton).toBeVisible();
    await returnButton.click();

    await expect(page.locator(".interaction.return .message .editable-span-base").filter({
      hasText: "Hello Bob",
    })).toBeVisible({ timeout: 10000 });

    expect(logs.some((line) => line.includes("D-->C: Hello Bob"))).toBe(true);
  });

  test("switches a return message back to async and updates DSL", async ({ page }) => {
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(msg.text());
    });

    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const returnMessage = page.locator(".interaction.return .message").filter({
      hasText: "Response payload",
    });
    await returnMessage.click();

    const asyncButton = page.getByTestId("message-type-async");
    await expect(asyncButton).toBeVisible();
    await asyncButton.click();

    await expect(page.locator(".interaction.async .message .editable-span-base").filter({
      hasText: "Response payload",
    })).toBeVisible({ timeout: 10000 });

    expect(logs.some((line) => line.includes("D->C: Response payload"))).toBe(true);
  });
});
