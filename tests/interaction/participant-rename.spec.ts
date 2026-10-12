import { test, expect } from "../fixtures";

async function expectParticipantScreenshot(
  page: import("@playwright/test").Page,
  participant: import("@playwright/test").Locator,
  name: string,
) {
  const box = await participant.boundingBox();
  expect(box).not.toBeNull();
  await expect(page).toHaveScreenshot(name, {
    clip: {
      x: Math.max(0, box!.x - 6),
      y: Math.max(0, box!.y - 6),
      width: box!.width + 12,
      height: box!.height + 12,
    },
  });
}

test.describe("Participant name rename", () => {
  test("frame whitespace selects and name click edits without reopening the toolbar", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('[data-participant-id="A"]');
    const name = participant.locator(".participant-name");
    const box = await participant.boundingBox();
    expect(box).toBeTruthy();

    await participant.click({ position: { x: 3, y: box!.height - 3 } });
    await expect(page.getByTestId("participant-style-panel")).toBeVisible();
    await name.click();
    await expect(name).toHaveAttribute("contenteditable", "true");
    await expect(page.getByTestId("participant-style-panel")).toHaveCount(0);
    await name.click();
    await expect(page.getByTestId("participant-style-panel")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(name).not.toHaveAttribute("contenteditable", "true");
  });

  test("uses the approved hover and editing states without changing geometry", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator(".participant").first();
    const name = participant.locator(".editable-span-base");
    await expect(name).toHaveText("A");

    const initial = await page.evaluate(() => {
      const participant = document.querySelector(".participant")!;
      const name = participant.querySelector(".editable-span-base")!;
      const box = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return [rect.x, rect.y, rect.width, rect.height];
      };
      return { participant: box(participant), name: box(name) };
    });

    await name.hover();
    await expect(name).toHaveAttribute("title", "Click to rename");
    await expect(name).toHaveCSS("outline-style", "none");
    await expect(name).toHaveCSS("background-color", "rgb(243, 244, 246)");
    await expect(name).toHaveCSS("cursor", "text");
    await expectParticipantScreenshot(
      page,
      participant,
      "participant-name-hover.png",
    );

    await name.click();
    await expect(name).toHaveAttribute("contenteditable", "true");
    await expect(name).toHaveCSS("outline-style", "solid");
    await expect(name).toHaveCSS("outline-width", "1px");
    await expect(name).toHaveCSS("outline-color", "rgb(59, 130, 246)");
    await expect(name).toHaveCSS("background-color", "rgb(239, 246, 255)");
    await expect(name).toHaveCSS("box-shadow", "none");
    await expect(name).toHaveCSS("cursor", "text");
    await expect(participant).not.toHaveClass(/ring-2/);
    await expectParticipantScreenshot(
      page,
      participant,
      "participant-name-editing.png",
    );

    const editing = await page.evaluate(() => {
      const participant = document.querySelector(".participant")!;
      const name = participant.querySelector(".editable-span-base")!;
      const box = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return [rect.x, rect.y, rect.width, rect.height];
      };
      return { participant: box(participant), name: box(name) };
    });
    expect(editing).toEqual(initial);

    await page.keyboard.press("End");
    await page.keyboard.type(" renamed");
    await page.keyboard.press("Enter");
    await expect(name).toHaveText("A renamed");
    await expect(name).not.toHaveAttribute("contenteditable", "true");
  });

  test("keyboard focus is visible and Enter edits; Escape cancels", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator(".participant").first();
    const name = participant.locator(".editable-span-base");

    for (let i = 0; i < 12; i += 1) {
      if (
        await participant.evaluate(
          (element) => element === document.activeElement,
        )
      ) {
        break;
      }
      await page.keyboard.press("Tab");
    }
    await expect(participant).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(participant).toHaveClass(/ring-2/);
    await page.keyboard.press("Tab");
    await expect(name).toBeFocused();
    await expect(name).toHaveCSS("outline-style", "solid");
    await expect(name).toHaveCSS("outline-width", "2px");
    await expect(name).toHaveCSS("outline-color", "rgb(37, 99, 235)");
    await expect(name).toHaveCSS("outline-offset", "2px");
    await expectParticipantScreenshot(
      page,
      participant,
      "participant-name-keyboard-focus.png",
    );

    await page.keyboard.press("Enter");
    await expect(name).toHaveAttribute("contenteditable", "true");
    await expect(participant).not.toHaveClass(/ring-2/);
    await expectParticipantScreenshot(
      page,
      participant,
      "participant-name-editing-selected.png",
    );
    await page.keyboard.press("End");
    await page.keyboard.type(" changed");
    await page.keyboard.press("Escape");
    await expect(name).toHaveText("A");
    await expect(name).not.toHaveAttribute("contenteditable", "true");
    await expect(participant).toHaveClass(/ring-2/);
  });
});
