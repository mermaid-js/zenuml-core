import { test, expect } from "../fixtures";
import { PNG } from "pngjs";

test("1px message shafts meet arrowheads at DPR 1 and 2", async ({ browser }) => {
  for (const dpr of [1, 2]) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: dpr });
    try {
      await page.goto("/e2e/fixtures/editable-label.html");
      await expect(page.locator(".occurrence").first()).toBeVisible();
      const arrows = await page.evaluate(() => ["Hello Alice", "Hello Bob"].map((label) => {
        const message = [...document.querySelectorAll(".message:not(.self)")].find((element) =>
          element.textContent?.includes(label),
        )!;
        const box = message.querySelector("svg[width='7']")!.getBoundingClientRect();
        return { label, x: box.x, y: box.y, rtl: message.querySelector("svg line")?.getAttribute("x1") === "100%" };
      }));
      const png = PNG.sync.read(await page.screenshot());
      const red = (x: number, y: number) => png.data[(y * png.width + x) * 4];
      const samples = (x: number, arrowY: number) => {
        const rows = [];
        for (let y = Math.floor((arrowY - 1) * dpr); y < Math.ceil((arrowY + 11) * dpr); y++) {
          rows.push({ y, ink: Math.max(0, 242 - red(x, y)) });
        }
        return rows;
      };
      const center = (rows: { y: number; ink: number }[]) =>
        rows.reduce((sum, row) => sum + row.y * row.ink, 0) /
        rows.reduce((sum, row) => sum + row.ink, 0);

      for (const arrow of arrows) {
        const shaftCandidates = Array.from({ length: 12 }, (_, i) =>
          samples(Math.round((arrow.x + (arrow.rtl ? 18 + i : -18 - i)) * dpr), arrow.y)
            .filter((row) => row.ink > 20),
        );
        const shaft = shaftCandidates.sort((a, b) =>
          b.reduce((sum, row) => sum + row.ink, 0) - a.reduce((sum, row) => sum + row.ink, 0),
        )[0];
        const wingX = Math.round((arrow.x + (arrow.rtl ? 5 : 2)) * dpr);
        const wing = samples(wingX, arrow.y).filter((row) =>
          row.ink > 20 && Math.abs(row.y - (arrow.y + 5) * dpr) > dpr,
        );

        expect(shaft.length, `${arrow.label} shaft at DPR ${dpr}`).toBeGreaterThan(0);
        expect(wing.length, `${arrow.label} wing at DPR ${dpr}`).toBeGreaterThan(0);
        expect(Math.abs(center(shaft) - center(wing)), `${arrow.label} at DPR ${dpr}`).toBeLessThan(0.3 * dpr);
      }
    } finally {
      await page.close();
    }
  }
});

test("arrow tips extend 1px farther in the message direction", async ({ page }) => {
  await page.goto("/e2e/fixtures/editable-label.html");
  await expect(page.locator(".occurrence").first()).toBeVisible();
  const offsets = await page.evaluate(() => ["Hello Alice", "Hello Bob"].map((label) => {
    const message = [...document.querySelectorAll(".message:not(.self)")].find((element) =>
      element.textContent?.includes(label),
    )!;
    const line = message.querySelector("svg line")!;
    const path = message.querySelector<SVGPathElement>("svg[width='7'] path")!;
    const rtl = line.getAttribute("x1") === "100%";
    const point = path.ownerSVGElement!.createSVGPoint();
    point.x = rtl ? 0.85 : 6.15;
    point.y = 4.5;
    const tip = point.matrixTransform(path.getScreenCTM()!);
    const edge = rtl ? line.getBoundingClientRect().left : line.getBoundingClientRect().right;
    return { label, offset: tip.x - edge };
  }));
  expect(offsets[0].offset).toBeCloseTo(0.15, 2);
  expect(offsets[1].offset).toBeCloseTo(-0.15, 2);
});
