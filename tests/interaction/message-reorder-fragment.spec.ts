import { test, expect } from "../fixtures";

test.describe("Message Reorder in Fragment", () => {
  test("reorders messages inside a fragment by dragging", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message-fragment.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const pingMsg = page.locator(".fragment .interaction .message").filter({ hasText: "ping" });
    const pongMsg = page.locator(".fragment .interaction .message").filter({ hasText: "pong" });
    await expect(pingMsg).toBeVisible();
    await expect(pongMsg).toBeVisible();

    const pongBox = await pongMsg.boundingBox();
    const pingBox = await pingMsg.boundingBox();
    expect(pongBox).toBeTruthy();
    expect(pingBox).toBeTruthy();

    await page.mouse.move(
      pongBox!.x + pongBox!.width / 2,
      pongBox!.y + pongBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      pongBox!.x + pongBox!.width / 2,
      pingBox!.y + 2,
      { steps: 10 },
    );
    await page.mouse.up();

    await expect.poll(async () =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
      { timeout: 10000 },
    ).toBeTruthy();

    const dsl: string = await page.evaluate(
      () => (window as any).__lastContentChange ?? "",
    );
    const lines = dsl.split("\n");
    const pongLine = lines.findIndex((l: string) => l.includes("pong"));
    const pingLine = lines.findIndex((l: string) => l.includes("ping"));
    expect(pongLine).toBeLessThan(pingLine);

    expect(lines[pongLine].startsWith("  ")).toBe(true);
    expect(lines[pingLine].startsWith("  ")).toBe(true);
  });
});
