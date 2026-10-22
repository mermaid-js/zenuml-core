import { test, type Page } from "@playwright/test";

const go = async (page: Page) => {
  await page.goto("/e2e/fixtures/probe-conflicts.html");
  await page.waitForSelector(".participant");
};
const snap = async (page: Page, label: string) => {
  await page.waitForTimeout(200);
  const s = await page.evaluate(() => {
    const vis = (sel: string) => { const e = document.querySelector(sel) as HTMLElement | null; return !!e && e.getBoundingClientRect().width > 0; };
    const ed = document.querySelector('[contenteditable="true"]');
    return {
      editor: vis('[data-testid="participant-style-panel"]'),
      menu: vis('[data-testid="message-rename"]'),
      gapMenu: !!document.querySelector('[data-testid^="gap-insert-menu-"]'),
      editing: ed ? `${ed.className.split(" ")[0]}:${ed.textContent}` : null,
      selected: Array.from(document.querySelectorAll(".participant.selected")).map(e => e.getAttribute("data-participant-id")),
      selMsg: document.querySelector(".message[data-selected='true']")?.textContent?.trim() ?? null,
      active: document.activeElement?.tagName + "." + (document.activeElement?.className || "").split(" ")[0],
      code: (window as any).__lastContentChange ?? "",
    };
  });
  console.log(`## ${label}\n` + JSON.stringify(s));
};
const corner = async (page: Page, id: string) => {
  const p = page.locator(`.participant[data-participant-id="${id}"]`);
  const b = (await p.boundingBox())!;
  await p.click({ position: { x: 3, y: b.height - 3 } });
};
const label = (page: Page, text: string) => page.locator(`.message .editable-span-base:text-is("${text}")`).first();
const arrow = async (page: Page, text: string) => {
  const m = page.locator(".message", { hasText: text }).first();
  const b = (await m.boundingBox())!;
  await m.click({ position: { x: b.width - 3, y: b.height - 2 } });
};
const title = (page: Page) => page.locator(".title .editable-span-base");
const cond = (page: Page) => page.locator(".condition.editable-span-base, .condition .editable-span-base").first();

test("P1 title click while participant editor open", async ({ page }) => {
  await go(page); await corner(page, "A"); await snap(page, "editor open");
  await title(page).click(); await snap(page, "after title click");
});
test("P2 condition click while participant editor open", async ({ page }) => {
  await go(page); await corner(page, "A");
  await cond(page).click(); await snap(page, "after condition click");
});
test("P3 other participant name-label click while editor open on A", async ({ page }) => {
  await go(page); await corner(page, "A");
  await page.locator('.participant[data-participant-id="B"] .participant-name').click();
  await snap(page, "after B label click");
  await page.keyboard.type("X"); await page.keyboard.press("Enter"); await page.waitForTimeout(100);
  await snap(page, "after rename commit");
});
test("P4 same participant name-label click while editor open on A", async ({ page }) => {
  await go(page); await corner(page, "A");
  await page.locator('.participant[data-participant-id="A"] .participant-name').click();
  await snap(page, "after A label click");
  await page.keyboard.press("End"); await page.keyboard.type("2"); await page.keyboard.press("Enter"); await page.waitForTimeout(150);
  await snap(page, "after rename commit");
});
test("P5 click participant while editing a message label", async ({ page }) => {
  await go(page); await label(page, "first").click(); await snap(page, "editing label");
  await corner(page, "B"); await snap(page, "after participant press");
});
test("P5b click collapse while editing a message label", async ({ page }) => {
  await go(page); await label(page, "first").click();
  await page.locator(".collapsible-header").first().click(); await page.waitForTimeout(100);
  await snap(page, "after collapse press");
  console.log("fragment collapsed:", await page.locator(".fragment-alt").first().getAttribute("class"));
});
test("P6 insert participant while editing a message label", async ({ page }) => {
  await go(page); await label(page, "first").click();
  await page.evaluate(() => { const b = document.querySelector('[data-testid="participant-append-button"]') as HTMLElement|null; b?.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true})); b?.click(); }); await page.waitForTimeout(100);
  await snap(page, "after insert press");
});
test("P7 escape while editing label with menu open", async ({ page }) => {
  await go(page); await arrow(page, "first"); await snap(page, "menu open");
  await label(page, "first").click(); await snap(page, "editing under menu");
  await page.keyboard.press("Escape"); await snap(page, "after esc 1");
  await page.keyboard.press("Escape"); await snap(page, "after esc 2");
});
test("P9 participant click while message menu open", async ({ page }) => {
  await go(page); await arrow(page, "first"); await corner(page, "A"); await snap(page, "after participant click");
});
test("P13 message label click while gap menu open", async ({ page }) => {
  await go(page);
  await page.getByTestId("message-gap-hover-1").first().click({ button: "right", force: true });
  await snap(page, "gap menu");
  await label(page, "first").click(); await snap(page, "after label click");
});
test("P14 title click while message menu open", async ({ page }) => {
  await go(page); await arrow(page, "first"); await title(page).click(); await snap(page, "after title click");
});
test("P15 title click while gap menu open", async ({ page }) => {
  await go(page);
  await page.getByTestId("message-gap-hover-1").first().click({ button: "right", force: true });
  await title(page).click(); await snap(page, "after title click");
});
test("P16 keyboard: Enter on participant then Enter on its label", async ({ page }) => {
  await go(page);
  await page.locator('.participant[data-participant-id="A"]').focus();
  await page.keyboard.press("Enter"); await snap(page, "after Enter on participant");
  await page.locator('.participant[data-participant-id="A"] .participant-name').focus();
  await page.keyboard.press("Enter"); await snap(page, "after Enter on label");
});
test("P17 host input focus while editor open with name draft", async ({ page }) => {
  await go(page); await corner(page, "A");
  const name = page.getByTestId("participant-style-panel").getByLabel("Name", { exact: true });
  await name.fill("AA");
  await page.locator("#host-input").click(); await page.waitForTimeout(100);
  await snap(page, "after host input click");
});
test("P18 reorder handle press while editing label", async ({ page }) => {
  await go(page); await label(page, "last").click();
  const b = await page.evaluate(() => { const r = document.querySelector(".message-reorder-handle")!.getBoundingClientRect(); return {x:r.x,y:r.y}; });
  await page.mouse.move(b.x + 8, b.y + 8); await page.mouse.down(); await page.mouse.move(b.x + 8, b.y + 200, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(100); await snap(page, "after drag");
});
test("P19 double-click message label then type", async ({ page }) => {
  await go(page); await label(page, "inner").dblclick(); await snap(page, "after dblclick");
});

test("P20 message label click while participant editor open", async ({ page }) => {
  await go(page); await corner(page, "A"); await label(page, "last").click(); await snap(page, "after label click");
});
test("P21 click label then click empty canvas: code changed?", async ({ page }) => {
  await go(page); await label(page, "first").click(); await snap(page, "editing");
  await page.mouse.click(600, 600); await snap(page, "after click-away");
});
test("P22 click message arrow while editing another label", async ({ page }) => {
  await go(page); await label(page, "first").click(); await arrow(page, "last"); await snap(page, "after arrow click");
});
test("P23 gap handle drag while editing label", async ({ page }) => {
  await go(page); await label(page, "first").click();
  const z = await page.evaluate(() => { const r = document.querySelector('[data-testid="message-gap-hover-2"]')!.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  await page.mouse.move(z.x, z.y); await page.mouse.down(); await page.mouse.move(z.x+100, z.y, {steps:5}); await page.mouse.up(); await snap(page, "after gap drag");
});
