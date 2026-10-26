import { test, expect, openDiagram, lastContentChange } from "../fixtures";
import { clickMessageArrow } from "./clickMessageArrow";
import type { Page } from "@playwright/test";

const wrapAsyncMessage = async (
  page: Page,
  kind: "alt" | "loop" | "opt" | "par",
) => {
  const message = page
    .locator(".interaction.async .message")
    .filter({ hasText: "Hello Bob" });
  await clickMessageArrow(message);
  await page.getByTestId("message-wrap-menu").click();
  const button = page.getByTestId(`message-wrap-${kind}`);
  await expect(button).toBeVisible();
  await button.click();
};

test.describe("Message Wrap Panel", () => {
  test("wraps an async message with alt and focuses the condition", async ({
    page,
  }) => {
    await openDiagram(page, "/e2e/fixtures/editable-label.html");

    await wrapAsyncMessage(page, "alt");

    const condition = page.locator(".fragment-alt .condition").first();
    await expect(condition).toHaveAttribute("contenteditable", "true");
    await expect(page.getByTestId("message-wrap-menu")).toHaveCount(0);
    await page.keyboard.type("approved");
    await page.keyboard.press("Enter");

    await expect(page.locator(".fragment-alt")).toBeVisible({ timeout: 10000 });
    await expect
      .poll(lastContentChange(page))
      .toContain("if(approved) {\n  D->C: Hello Bob\n}");
  });

  test("wraps an async message with loop and focuses the condition", async ({
    page,
  }) => {
    await openDiagram(page, "/e2e/fixtures/editable-label.html");

    await wrapAsyncMessage(page, "loop");

    const condition = page.locator(".fragment-loop .condition").first();
    await expect(condition).toHaveAttribute("contenteditable", "true");
    await page.keyboard.type("hasMore");
    await page.keyboard.press("Enter");

    await expect(page.locator(".fragment-loop")).toBeVisible({
      timeout: 10000,
    });
    await expect
      .poll(lastContentChange(page))
      .toContain("loop(hasMore) {\n  D->C: Hello Bob\n}");
  });

  test("wraps an async message with opt and focuses the condition", async ({
    page,
  }) => {
    await openDiagram(page, "/e2e/fixtures/editable-label.html");

    await wrapAsyncMessage(page, "opt");

    const condition = page.locator(".opt .condition").first();
    await expect(condition).toHaveAttribute("contenteditable", "true");
    await page.keyboard.type("optional");
    await page.keyboard.press("Enter");

    await expect(page.locator(".opt")).toBeVisible({ timeout: 10000 });
    await expect
      .poll(lastContentChange(page))
      .toContain("opt(optional) {\n  D->C: Hello Bob\n}");
  });

  test("wraps an async message with par and focuses the condition", async ({
    page,
  }) => {
    await openDiagram(page, "/e2e/fixtures/editable-label.html");

    await wrapAsyncMessage(page, "par");

    const condition = page.locator(".fragment-par .condition").first();
    await expect(condition).toHaveAttribute("contenteditable", "true");
    await page.keyboard.type("parallel");
    await page.keyboard.press("Enter");

    await expect(page.locator(".fragment-par")).toBeVisible({ timeout: 10000 });
    await expect
      .poll(lastContentChange(page))
      .toContain("par(parallel) {\n  D->C: Hello Bob\n}");
  });
});
