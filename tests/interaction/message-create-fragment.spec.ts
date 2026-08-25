import { test, expect } from "../fixtures";

const hoverFragmentGap = async (page: any, gapIndex: number) => {
  const gap = await page.evaluate((idx: number) => {
    const gaps = document.querySelectorAll('[data-testid^="message-gap-"]');
    for (const g of gaps) {
      if (
        g.getAttribute("data-testid") === `message-gap-${idx}` &&
        g.closest(".fragment")
      ) {
        const inner = g.firstElementChild as HTMLElement | null;
        if (!inner) return null;
        const r = inner.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }
    }
    return null;
  }, gapIndex);
  expect(gap).toBeTruthy();
  await page.mouse.move(gap!.x, gap!.y);
};

test.describe("Message Create in Fragment", () => {
  test("shows + handles inside a fragment gap", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message-fragment.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await hoverFragmentGap(page, 1);

    await expect(
      page.getByTestId("message-create-handle-1-A"),
    ).toBeVisible({ timeout: 3000 });
    await expect(
      page.getByTestId("message-create-handle-1-B"),
    ).toBeVisible();
  });

  test("creates a message inside a fragment via drag", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message-fragment.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await hoverFragmentGap(page, 1);

    const handle = page.getByTestId("message-create-handle-1-A");
    await expect(handle).toBeVisible({ timeout: 3000 });

    const targetParticipant = page.locator('[data-participant-id="C"]');
    const handleBox = await handle.boundingBox();
    const targetBox = await targetParticipant.boundingBox();
    expect(handleBox).toBeTruthy();
    expect(targetBox).toBeTruthy();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + targetBox!.height / 2,
      { steps: 12 },
    );
    await page.mouse.up();

    await expect.poll(async () =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
      { timeout: 10000 },
    ).toBeTruthy();

    const dsl: string = await page.evaluate(
      () => (window as any).__lastContentChange ?? "",
    );
    expect(dsl).toContain("if(condition)");
    expect(dsl).toContain("A->B.ping()");
    expect(dsl).toContain("B->C.pong()");
    const lines = dsl.split("\n");
    const ifLineIndex = lines.findIndex((l: string) => l.includes("if(condition)"));
    const closingBrace = lines.findIndex((l: string, i: number) => i > ifLineIndex && l.trim() === "}");
    const newMsgIndex = lines.findIndex((l: string) => l.includes("newMessage") || l.includes("A->C"));
    expect(newMsgIndex).toBeGreaterThan(ifLineIndex);
    expect(newMsgIndex).toBeLessThan(closingBrace);
  });
});
