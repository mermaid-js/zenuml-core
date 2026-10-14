import { expect, test, type Page } from "@playwright/test";
import { clickMessageArrow } from "./clickMessageArrow";

// ADR 0002 P3: one input gate and one click-away / Escape owned by the
// interaction state. While a menu or the participant editor is open, the
// first press on a control that state does not allow only closes it (R2).

const CODE = `A->B: first
if(ok) {
  A->B: second
}`;

const setup = async (page: Page) => {
  await page.goto("/e2e/fixtures/insert-participant.html");
  await page.evaluate(async (code) => {
    await (window as any).zenUml.render(code, {
      theme: "theme-nab",
      enableParticipantInsertion: true,
      enableMessageInsertion: true,
      enableDividerInsertion: true,
      enableParticipantStyleEditing: true,
      enableMessageReorder: true,
    });
  }, CODE);
  await expect(page.locator(".fragment-alt")).toHaveCount(1);
};

const openGapMenu = async (page: Page, index: number) => {
  await page.getByTestId(`message-gap-hover-${index}`).first().click({
    button: "right",
    force: true,
  });
  await expect(page.getByTestId(`gap-insert-menu-${index}`)).toBeVisible();
};

const participantCorner = async (page: Page, id: string) => {
  const participant = page.locator(`.participant[data-participant-id="${id}"]`);
  const box = (await participant.boundingBox())!;
  return { participant, position: { x: 3, y: box.height - 3 } };
};

test("a press on a participant only closes an open gap menu", async ({
  page,
}) => {
  await setup(page);
  await openGapMenu(page, 1);

  const { participant, position } = await participantCorner(page, "A");
  await participant.click({ position });
  await expect(page.getByTestId("gap-insert-menu-1")).toHaveCount(0);
  await expect(page.getByTestId("participant-style-panel")).toHaveCount(0);

  // Idle again: the same press now opens the participant editor.
  await participant.click({ position });
  await expect(page.getByTestId("participant-style-panel")).toBeVisible();
});

test("a right-click on another gap only closes the open gap menu", async ({
  page,
}) => {
  await setup(page);
  await openGapMenu(page, 1);

  await page.getByTestId("message-gap-hover-0").first().click({
    button: "right",
    force: true,
  });
  await expect(page.getByTestId("gap-insert-menu-1")).toHaveCount(0);
  await expect(page.getByTestId("gap-insert-menu-0")).toHaveCount(0);

  await openGapMenu(page, 0);
});

test("a press on a message only closes an open gap menu", async ({ page }) => {
  await setup(page);
  await openGapMenu(page, 1);

  const message = page.locator(".statement-container .message").first();
  await clickMessageArrow(message);
  await expect(page.getByTestId("gap-insert-menu-1")).toHaveCount(0);
  await expect(page.getByTestId("message-rename")).toHaveCount(0);

  await clickMessageArrow(message);
  await expect(page.getByTestId("message-rename")).toBeVisible();
});

test("the open message menu and the participant editor keep their own controls", async ({
  page,
}) => {
  await setup(page);
  const message = page.locator(".statement-container .message").nth(1);
  await clickMessageArrow(message);
  await expect(page.locator(".interaction.sync")).toHaveCount(0);
  await page.getByTestId("message-type-menu").click();
  await page.getByTestId("message-type-sync").click();
  await expect(page.locator(".interaction.sync")).toHaveCount(1);

  await page.keyboard.press("Escape");
  await expect(page.getByTestId("message-rename")).toHaveCount(0);
  const { participant, position } = await participantCorner(page, "A");
  await participant.click({ position });
  const panel = page.getByTestId("participant-style-panel");
  await expect(panel).toBeVisible();
  await panel.getByLabel("Name").fill("Alice");
  await panel.getByLabel("Name").press("Enter");
  await expect(panel).toBeVisible();
  await expect(
    page.locator('.participant[data-participant-id="Alice"]'),
  ).toHaveCount(1);
});

test("Escape closes a gap menu whose item lost the focus", async ({ page }) => {
  await setup(page);
  await openGapMenu(page, 1);
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("gap-insert-menu-1")).toHaveCount(0);
});
