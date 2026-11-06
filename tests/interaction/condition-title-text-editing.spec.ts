import { expect, test } from "../fixtures";

const FIXTURE = "/e2e/fixtures/condition-title-guard.html";

// A condition or title edit must register as an active text editor, like a
// message or participant edit does. While it is active the diagram hides the
// controls that would change the code or the layout under the editor.
for (const [name, selector] of [
  ["fragment condition", ".condition.editable-span-base"],
  ["diagram title", ".title .editable-span-base"],
] as const) {
  test(`${name} edit hides insertion and reorder controls until it ends`, async ({
    page,
  }) => {
    await page.goto(FIXTURE);
    const field = page.locator(selector).first();
    const insertButton = page.getByTestId("participant-insert-button-0");
    await expect(insertButton).toHaveCount(1);

    await field.click();
    await expect(field).toHaveAttribute("contenteditable", "true");
    await expect(insertButton).toHaveCount(0);
    await expect(page.getByTestId(/^message-create-handle-/)).toHaveCount(0);
    await expect(page.locator(".message-reorder-handle")).toHaveCount(0);

    // Escape cancels the edit and releases the guard.
    await page.keyboard.press("Escape");
    await expect(field).not.toHaveAttribute("contenteditable", "true");
    await expect(insertButton).toHaveCount(1);
  });
}
