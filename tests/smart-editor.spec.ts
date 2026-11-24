import { expect, test } from "@playwright/test";

// Dev-only demo page (smart-editor.html): the smart editor on the left, the
// rendered diagram on the right. The editor talks to the Langium language
// server in a Web Worker, so `data-smart-ready` marks the moment the server
// has answered `initialize`.
async function openEditor(page: import("@playwright/test").Page) {
  await page.goto("/smart-editor.html");
  await expect(page.locator("body")).toHaveAttribute("data-smart-ready", "1", {
    timeout: 30_000,
  });
  await page.locator(".cm-content").click();
}

test.describe("smart editor", () => {
  test("typing `A.` lists completions and accepting one updates the diagram", async ({
    page,
  }) => {
    await openEditor(page);
    await page.keyboard.type("A.");

    const list = page.locator(".cm-tooltip-autocomplete");
    await expect(list).toBeVisible({ timeout: 15_000 });
    expect(await list.locator("li").count()).toBeGreaterThan(0);

    // CodeMirror ignores Enter for 75 ms after the list opens, so a keystroke
    // faster than any person would type falls through as a newline.
    await page.waitForTimeout(200);
    await page.keyboard.press("Enter");

    await expect(page.locator(".cm-content")).toContainText("A.method()");
    await expect(page.locator("#diagram .message")).toContainText("method", {
      timeout: 10_000,
    });
  });

  test("a stray `}` is underlined and explained in plain words", async ({
    page,
  }) => {
    await openEditor(page);
    await page.keyboard.type("A.go()");
    await page.keyboard.press("Enter");
    await page.keyboard.type("}");

    const mark = page.locator(".cm-lintRange-error").first();
    await expect(mark).toBeVisible({ timeout: 15_000 });
    await mark.hover();
    await expect(page.locator(".cm-tooltip-lint")).toContainText(
      "has no matching {",
    );
  });
});
