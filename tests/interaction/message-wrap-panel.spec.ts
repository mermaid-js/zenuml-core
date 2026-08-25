import { test, expect } from "../fixtures";

test.describe("Message Wrap Panel", () => {
  test("wraps an async message with alt and focuses the condition", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const asyncMessage = page
      .locator(".interaction.async .message")
      .filter({ hasText: "Hello Bob" });
    await asyncMessage.click();

    const wrapButton = page.getByTestId("message-wrap-alt");
    await expect(wrapButton).toBeVisible();
    await wrapButton.click();

    const condition = page.locator(".fragment-alt .condition").first();
    await expect(condition).toHaveAttribute("contenteditable", "true");
    await expect(page.getByTestId("message-wrap-alt")).toHaveCount(0);
    await page.keyboard.type("approved");
    await page.keyboard.press("Enter");

    await expect(page.locator(".fragment-alt")).toBeVisible({ timeout: 10000 });
    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain("if(approved) {\n  D->C: Hello Bob\n}");
  });

  test("wraps an async message with loop", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const msg = page
      .locator(".interaction.async .message")
      .filter({ hasText: "Hello Alice" });
    await msg.click();

    const wrapButton = page.getByTestId("message-wrap-loop");
    await expect(wrapButton).toBeVisible();
    await wrapButton.click();

    const condition = page.locator(".fragment-loop .condition").first();
    await expect(condition).toHaveAttribute("contenteditable", "true");
    await page.keyboard.type("retries");
    await page.keyboard.press("Enter");

    await expect(page.locator(".fragment-loop")).toBeVisible({ timeout: 10000 });
    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain("loop(retries)");
    const dsl = await page.evaluate(() => (window as any).__lastContentChange ?? "");
    expect(dsl).toContain("C->D: Hello Alice");
  });

  test("wraps a return message with opt", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const msg = page
      .locator(".interaction.return .message")
      .filter({ hasText: "Response payload" });
    await msg.click();

    const wrapButton = page.getByTestId("message-wrap-opt");
    await expect(wrapButton).toBeVisible();
    await wrapButton.click();

    const condition = page.locator(".opt .condition").first();
    await expect(condition).toHaveAttribute("contenteditable", "true");
    await page.keyboard.type("hasData");
    await page.keyboard.press("Enter");

    await expect(page.locator(".opt")).toBeVisible({ timeout: 10000 });
    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain("opt(hasData)");
    const dsl = await page.evaluate(() => (window as any).__lastContentChange ?? "");
    expect(dsl).toContain("D-->C: Response payload");
  });

  test("wraps an async message with par", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const msg = page
      .locator(".interaction.async .message")
      .filter({ hasText: "Good to see you" });
    await msg.click();

    const wrapButton = page.getByTestId("message-wrap-par");
    await expect(wrapButton).toBeVisible();
    await wrapButton.click();

    const condition = page.locator(".fragment-par .condition").first();
    await expect(condition).toHaveAttribute("contenteditable", "true");
    await page.keyboard.type("parallel");
    await page.keyboard.press("Enter");

    await expect(page.locator(".fragment-par")).toBeVisible({ timeout: 10000 });
    await expect
      .poll(() => page.evaluate(() => (window as any).__lastContentChange ?? null))
      .toContain("par(parallel) {\n  C->D: Good to see you\n}");
  });
});
