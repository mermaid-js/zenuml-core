import { test, expect } from "../fixtures";
import { clickMessageArrow } from "./clickMessageArrow";

test.describe("style panel application", () => {
  test("message toolbar keeps its styles and applies bold to the selected message", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    const message = page
      .locator(".interaction.async .message")
      .filter({ hasText: "Hello Bob" });
    await clickMessageArrow(message);

    const panel = page.locator("#style-panel");
    const bold = panel.getByRole("button", { name: "bold" });
    await expect(bold).toBeVisible();
    await expect(panel.locator(".bg-white")).toHaveClass(/theme-nab/);
    await expect(panel.locator(".bg-white")).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );
    await expect(bold).toHaveCSS("font-weight", "700");

    await bold.click();
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? ""),
      )
      .toContain("// [font-bold]\nD->C: Hello Bob");
    await expect(message.locator(".editable-span-base")).toHaveCSS(
      "font-weight",
      "700",
    );
    await clickMessageArrow(message);
    await panel.getByRole("button", { name: "italic" }).click();
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? ""),
      )
      .toContain("// [font-bold, italic]\nD->C: Hello Bob");
    await expect(message.locator(".editable-span-base")).toHaveCSS(
      "font-weight",
      "700",
    );
    await expect(message.locator(".editable-span-base")).toHaveCSS(
      "font-style",
      "italic",
    );
  });

  test("participant toolbar keeps its styles and applies color to an implicit participant", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('.participant[data-participant-id="A"]');
    const box = await participant.boundingBox();
    expect(box).toBeTruthy();
    await participant.click({ position: { x: 3, y: box!.height - 3 } });

    const panel = page.getByTestId("participant-style-panel");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveClass(/theme-nab/);
    await expect(panel).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await panel.getByRole("button", { name: "Set color to Red" }).click();

    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? ""),
      )
      .toMatch(/^A #ef4444\nC\nA->C: Ping/);
    await expect(participant).toHaveCSS("background-color", "rgb(239, 68, 68)");

    await participant.click({ position: { x: 3, y: box!.height - 3 } });
    await panel.getByRole("button", { name: "Set type to Actor" }).click();
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? ""),
      )
      .toMatch(/^@Actor A #ef4444\nC\nA->C: Ping/);
  });

  test("applies a type directly to an implicit participant", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('.participant[data-participant-id="A"]');
    const box = await participant.boundingBox();
    expect(box).toBeTruthy();
    await participant.click({ position: { x: 3, y: box!.height - 3 } });
    await page
      .getByTestId("participant-style-panel")
      .getByRole("button", { name: "Set type to Actor" })
      .click();

    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? ""),
      )
      .toMatch(/^@Actor A\nC\nA->C: Ping/);
  });
});
