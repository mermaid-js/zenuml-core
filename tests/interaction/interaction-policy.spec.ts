import { expect, test, type Page } from "@playwright/test";

// ADR 0002: while the participant editor is open, other diagram controls do
// not react. A press on them only closes the editor.

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

const openEditor = async (page: Page, id: string) => {
  const participant = page.locator(`.participant[data-participant-id="${id}"]`);
  const box = await participant.boundingBox();
  expect(box).toBeTruthy();
  await participant.click({ position: { x: 3, y: box!.height - 3 } });
  await expect(page.getByTestId("participant-style-panel")).toBeVisible();
};

test("a press on a fragment collapse button only closes the participant editor", async ({
  page,
}) => {
  await setup(page);
  const alt = page.locator(".fragment-alt");
  const header = alt.locator(":scope > .header");
  const collapse = header.locator(".collapse-button");

  // Find where the collapse icon sits while idle.
  await header.hover();
  await expect(collapse).toBeVisible();
  const iconBox = (await collapse.boundingBox())!;

  await openEditor(page, "A");
  await header.hover();
  await expect(collapse).toBeHidden();

  await page.mouse.click(
    iconBox.x + iconBox.width / 2,
    iconBox.y + iconBox.height / 2,
  );
  await expect(page.getByTestId("participant-style-panel")).toHaveCount(0);
  await expect(alt.locator(":scope > .hidden")).toHaveCount(0);

  // Idle again: the same press now collapses.
  await header.hover();
  await collapse.click();
  await expect(alt.locator(":scope > .hidden")).toHaveCount(1);
});

test("a press on a visible expand icon only closes the participant editor", async ({
  page,
}) => {
  await setup(page);
  const alt = page.locator(".fragment-alt");
  const header = alt.locator(":scope > .header");
  await header.hover();
  await header.locator(".collapse-button").click();
  await expect(alt.locator(":scope > .hidden")).toHaveCount(1);

  // The expand icon stays visible: it shows the collapsed state.
  const expand = header.locator(".collapsible-header > span").last();
  await openEditor(page, "A");
  await expect(expand).toBeVisible();

  // pointerdown closes the editor before click fires; the press decides.
  await expand.click();
  await expect(page.getByTestId("participant-style-panel")).toHaveCount(0);
  await expect(alt.locator(":scope > .hidden")).toHaveCount(1);
});

test("gap handles do not offer message creation while the participant editor is open", async ({
  page,
}) => {
  await setup(page);
  const gap = page.getByTestId("message-gap-hover-1").first();
  const handle = page.locator('[data-testid^="message-create-handle-1-"]');

  await gap.hover();
  await expect(handle.first()).toBeVisible();

  await page.mouse.move(0, 0);
  await openEditor(page, "A");
  await gap.hover({ force: true });
  await expect(handle).toHaveCount(0);
});
