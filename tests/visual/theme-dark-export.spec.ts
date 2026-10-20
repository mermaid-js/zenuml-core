import { test, expect } from "../fixtures";
import { PNG } from "pngjs";

/**
 * Export paths keep the dark background (ADR 0004, step 6).
 *
 * `ZenUml.getPng()` used to pass `backgroundColor: "white"` to html-to-image,
 * which painted the padding ring white around a dark canvas. The PNG must now
 * read the theme's canvas colour both inside the frame and in the ring.
 */
async function pngOf(dataUrl: string): Promise<PNG> {
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  return PNG.sync.read(Buffer.from(base64, "base64"));
}

function pixel(png: PNG, x: number, y: number): [number, number, number, number] {
  const i = (y * png.width + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}

test.describe("theme-dark export", () => {
  test("getPng keeps the dark canvas inside the frame and in the padding ring", async ({ page }) => {
    await page.goto("/e2e/fixtures/fixture.html?case=smoke&theme=theme-dark");
    await expect(page.locator(".sequence-diagram .participant").first()).toBeVisible();
    await page.waitForLoadState("networkidle");

    const dataUrl: string = await page.evaluate(() => (window as any).zenUml.getPng());
    const png = await pngOf(dataUrl);
    expect(png.width).toBeGreaterThan(100);

    // The canvas div has p-1 (4px) around the frame; the frame's top-left
    // corner is rounded, so sample inside the ring and well inside the frame.
    const ring = pixel(png, 1, 1);
    const inside = pixel(png, 40, 60);
    // The host element is page-wide; the export must not paint the area
    // beside the diagram white.
    const beside = pixel(png, png.width - 2, 2);
    const canvas = [31, 31, 31]; // --color-bg-canvas #1f1f1f
    expect(ring.slice(0, 3)).toEqual(canvas);
    expect(inside.slice(0, 3)).toEqual(canvas);
    expect(beside.slice(0, 3)).toEqual(canvas);
  });

  test("getSvg embeds the dark canvas colour", async ({ page }) => {
    await page.goto("/e2e/fixtures/fixture.html?case=smoke&theme=theme-dark");
    await expect(page.locator(".sequence-diagram .participant").first()).toBeVisible();
    const svg: string = await page.evaluate(() => (window as any).zenUml.getSvg());
    // html-to-image inlines computed styles; the canvas colour must be there.
    expect(decodeURIComponent(svg)).toContain("rgb(31, 31, 31)");
  });

  test("renderToSvg output for theme-dark paints the frame dark", async ({ page }) => {
    await page.goto("/e2e/fixtures/svg-test.html");
    await page.evaluate(() => (window as any).__renderSvg("A.m() { B.n() }", "theme-dark"));
    await expect(page.locator("#svg-output > svg")).toBeVisible();
    const fill = await page.evaluate(() =>
      getComputedStyle(document.querySelector("#svg-output .frame-border-inner")!).fill,
    );
    expect(fill).toBe("rgb(31, 31, 31)");
  });
});
