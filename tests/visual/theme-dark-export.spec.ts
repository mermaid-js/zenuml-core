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

function pixel(
  png: PNG,
  x: number,
  y: number,
): [number, number, number, number] {
  const i = (y * png.width + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}

test.describe("theme-dark export", () => {
  test("constructor applies the initial palette on the first visible commit", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/svg-test.html");
    const first = await page.evaluate(async () => {
      const { default: ZenUml } = await import("/src/core.tsx");
      const host = document.createElement("div");
      document.body.append(host);
      let firstCanvas: { theme: string; surface: string } | undefined;
      const observer = new MutationObserver(() => {
        const canvas = host.querySelector<HTMLElement>(".bg-skin-canvas");
        if (canvas && !firstCanvas) {
          firstCanvas = {
            theme: canvas.className,
            surface: getComputedStyle(canvas).backgroundColor,
          };
        }
      });
      observer.observe(host, { childList: true, subtree: true });
      const renderer = new ZenUml(host, false, {
        theme: "theme-dark",
        palette: { canvasBg: "#343f4b" },
      });
      await renderer.render("A->B: Hi", {});
      observer.disconnect();
      return firstCanvas;
    });
    expect(first?.theme).toContain("theme-dark");
    expect(first?.surface).toBe("rgb(52, 63, 75)");
  });

  test("getPng keeps the dark canvas inside the frame and in the padding ring", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/fixture.html?case=smoke&theme=theme-dark");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible();
    await page.waitForLoadState("networkidle");

    const dataUrl: string = await page.evaluate(() =>
      (window as any).zenUml.getPng(),
    );
    const png = await pngOf(dataUrl);
    expect(png.width).toBeGreaterThan(100);
    const documentWidth = await page
      .locator(".bg-skin-canvas")
      .evaluate((el) => Math.ceil(el.getBoundingClientRect().width));
    expect(png.width).toBe(documentWidth);

    // The canvas div has p-1 (4px) around the frame; the frame's top-left
    // corner is rounded, so sample inside the ring and well inside the frame.
    const ring = pixel(png, 1, 1);
    const inside = pixel(png, 40, 60);
    // Intrinsic document bounds include the right canvas edge.
    const beside = pixel(png, png.width - 2, 2);
    const canvas = [31, 31, 31]; // --color-bg-canvas #1f1f1f
    expect(ring.slice(0, 3)).toEqual(canvas);
    expect(inside.slice(0, 3)).toEqual(canvas);
    expect(beside.slice(0, 3)).toEqual(canvas);
  });

  test("getSvg embeds the dark canvas colour", async ({ page }) => {
    await page.goto("/e2e/fixtures/fixture.html?case=smoke&theme=theme-dark");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible();
    const svg: string = await page.evaluate(() =>
      (window as any).zenUml.getSvg(),
    );
    // html-to-image inlines computed styles; the canvas colour must be there.
    expect(decodeURIComponent(svg)).toContain("rgb(31, 31, 31)");
  });

  test("author CSS alpha resolves once against the declared theme base in both HTML exports", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/fixture.html?case=smoke&theme=theme-dark");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible();
    await page.evaluate(() => {
      const style = document.createElement("style");
      style.textContent =
        ".zenuml .bg-skin-canvas { background-color: rgba(255, 0, 0, .5) !important; }";
      document.head.append(style);
    });
    const surface = await page.evaluate(() =>
      (window as any).zenUml.getSurface(),
    );
    expect(surface.backgroundColor).toBe("rgb(143, 15, 15)");
    const screen = await page.locator(".bg-skin-canvas").screenshot();
    const screenPng = PNG.sync.read(screen);
    expect(pixel(screenPng, 1, 1)).toEqual([143, 15, 15, 255]);
    const png = await pngOf(
      await page.evaluate(() => (window as any).zenUml.getPng()),
    );
    expect(pixel(png, 1, 1)).toEqual([143, 15, 15, 255]);
    const svg = await page.evaluate(() => (window as any).zenUml.getSvg());
    expect(decodeURIComponent(svg)).toContain("rgb(143, 15, 15)");
  });

  test("native SVG paints opaque canvas corners with palette colours", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/svg-test.html");
    const result = await page.evaluate(async () => {
      const { renderToSvg } = await import("/src/svg/renderToSvg.ts");
      const rendered = renderToSvg("@Boundary A #0747A6\nA->B: ping", {
        theme: "theme-dark",
        palette: { canvasBg: "rgba(255, 0, 0, .5)", frameBg: "#424f5e" },
      });
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rendered.svg)}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = rendered.width;
      canvas.height = rendered.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      return {
        surface: rendered.surface,
        corner: [...context.getImageData(0, 0, 1, 1).data],
      };
    });
    expect(result.surface.backgroundColor).toBe("rgb(143, 15, 15)");
    expect(result.corner).toEqual([143, 15, 15, 255]);
  });

  test("semantic palette reaches the HTML diagram and clears on a light theme switch", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/fixture.html?case=smoke&theme=theme-dark");
    const paletteState = await page.evaluate(async () => {
      const renderer = (window as any).zenUml;
      await renderer.render("A->B: ping", {
        theme: "theme-dark",
        palette: {
          canvasBg: "#343f4b",
          frameBg: "#424f5e",
          participantBg: "#304f69",
          participantText: "#eef2f6",
          messageArrow: "#b8c3cf",
        },
      });
      const participant = document.querySelector(
        ".sequence-diagram .participant",
      )!;
      const diagram = document.querySelector(".sequence-diagram")!;
      const painted = {
        canvas: renderer.getSurface().backgroundColor,
        participantBg: getComputedStyle(participant).backgroundColor,
        participantText: getComputedStyle(participant).color,
        messageArrow: getComputedStyle(diagram)
          .getPropertyValue("--color-message-arrow")
          .trim(),
      };
      document.body.style.backgroundColor = "#303944";
      await renderer.render(undefined, {
        theme: "theme-default",
        palette: undefined,
      });
      return { painted, light: renderer.getSurface().backgroundColor };
    });
    expect(paletteState.painted).toEqual({
      canvas: "rgb(52, 63, 75)",
      participantBg: "rgb(48, 79, 105)",
      participantText: "rgb(238, 242, 246)",
      messageArrow: "#b8c3cf",
    });
    expect(paletteState.light).toBe("rgb(255, 255, 255)");
  });

  test("renderToSvg output for theme-dark paints the frame dark", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/svg-test.html");
    await page.evaluate(() =>
      (window as any).__renderSvg("A.m() { B.n() }", "theme-dark"),
    );
    await expect(page.locator("#svg-output > svg")).toBeVisible();
    const fill = await page.evaluate(
      () =>
        getComputedStyle(
          document.querySelector("#svg-output .frame-border-inner")!,
        ).fill,
    );
    expect(fill).toBe("rgb(31, 31, 31)");
  });
});
