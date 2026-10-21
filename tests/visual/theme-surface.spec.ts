import { PNG } from "pngjs";
import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures";
import { mkdir, writeFile } from "node:fs/promises";

const FIXTURE = "/e2e/fixtures/theme-surface.html";
const CANVAS = [48, 57, 68];
const CSS_OVERRIDE = [71, 85, 105];

type BrowserFixture = Window & {
  themeSurface: any;
  __themeSurfaceReady: boolean;
};

function pixel(png: PNG, x: number, y: number): number[] {
  const i = (y * png.width + x) * 4;
  return Array.from(png.data.subarray(i, i + 4));
}

function pngFromDataUrl(dataUrl: string): PNG {
  return PNG.sync.read(Buffer.from(dataUrl.split(",")[1], "base64"));
}

async function openFixture(page: Page) {
  await page.goto(FIXTURE);
  await page.waitForFunction(
    () => (window as BrowserFixture).__themeSurfaceReady,
  );
}

test.describe("public theme surface", () => {
  test("stages the first mount until the caller supplies a dark palette", async ({
    page,
  }) => {
    await openFixture(page);
    await page.evaluate(() =>
      (window as BrowserFixture).themeSurface.create("framed"),
    );
    // A host can construct the renderer before it knows its colour scheme.
    await page.waitForTimeout(250);
    const before = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#framed-host *"))
        .map((el) => getComputedStyle(el).backgroundColor)
        .filter((color) => color === "rgb(255, 255, 255)"),
    );
    expect(before).toEqual([]);

    const transientWhite = await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      const host = document.getElementById("framed-host")!;
      const white: string[] = [];
      const sample = () => {
        host
          .querySelectorAll(".bg-skin-canvas, .frame, .sequence-diagram")
          .forEach((el) => {
            if (getComputedStyle(el).backgroundColor === "rgb(255, 255, 255)") {
              white.push(el.className);
            }
          });
      };
      const observer = new MutationObserver(sample);
      observer.observe(host, {
        subtree: true,
        childList: true,
        attributes: true,
      });
      let active = true;
      const tick = () => {
        sample();
        if (active) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      await fixture.instance("framed").render(fixture.CODE, {
        theme: "theme-dark",
        palette: fixture.SOFT_DARK,
      });
      active = false;
      observer.disconnect();
      sample();
      return white;
    });
    expect(transientWhite).toEqual([]);
    await expect(
      page.locator('#framed-host [data-participant-id="Observer"]'),
    ).toBeVisible();
    expect(
      await page.evaluate(() =>
        (window as BrowserFixture).themeSurface
          .instance("framed")
          .getCanvasSurface(),
      ),
    ).toEqual({ backgroundColor: "rgb(48, 57, 68)" });
    await expect(
      page.locator("#framed-host .bg-skin-canvas").first(),
    ).toHaveCSS("background-color", "rgb(48, 57, 68)");
    await expect(page.locator("#framed-host .frame")).toHaveCSS(
      "background-color",
      "rgb(52, 63, 75)",
    );
  });

  test("settles rapid renders and applies the final code, theme, palette, and numbering", async ({
    page,
  }) => {
    await openFixture(page);
    const result = await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      const instance = fixture.create("framed");
      await instance.render("Initial.call()", {
        theme: "theme-dark",
        palette: fixture.SOFT_DARK,
      });
      const latestCode = "Final.call() { Receiver.done() }";
      const outcomes = await Promise.allSettled([
        instance.render("First.call()", {
          theme: "theme-dark",
          palette: fixture.SOFT_DARK,
          enableNumbering: true,
        }),
        instance.render("Second.call()", {
          theme: "theme-default",
          palette: fixture.SOFT_DARK,
          enableNumbering: true,
        }),
        instance.render(latestCode, {
          theme: "theme-default",
          palette: fixture.SOFT_LIGHT,
          enableNumbering: false,
        }),
      ]);
      return {
        statuses: outcomes.map((outcome) => outcome.status),
        code: instance.code,
        theme: instance.theme,
        surface: instance.getCanvasSurface(),
      };
    });
    expect(result.statuses).toEqual(["fulfilled", "fulfilled", "fulfilled"]);
    expect(result.code).toBe("Final.call() { Receiver.done() }");
    expect(result.theme).toBe("theme-default");
    expect(result.surface).toEqual({ backgroundColor: "rgb(243, 245, 247)" });
    await expect(
      page.locator('#framed-host [data-participant-id="Final"]'),
    ).toBeVisible();
    await expect(
      page.locator('#framed-host [data-participant-id="First"]'),
    ).toHaveCount(0);
    await expect(page.locator("#framed-host .message-number")).toHaveCount(0);
    await expect(page.locator("#framed-host .sequence-diagram")).toContainText(
      "Final",
    );
    await expect(
      page.locator("#framed-host .sequence-diagram"),
    ).not.toContainText("Second");

    // Identical code still has to commit a later configuration change.
    await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      await fixture
        .instance("framed")
        .render("Final.call() { Receiver.done() }", {
          theme: "theme-dark",
          palette: fixture.SOFT_DARK,
          enableNumbering: true,
        });
    });
    await expect(
      page.locator("#framed-host .message-number").first(),
    ).toBeVisible();
    await expect(
      page.locator("#framed-host .bg-skin-canvas").first(),
    ).toHaveCSS("background-color", "rgb(48, 57, 68)");
  });

  test("keeps framed and naked palette surfaces isolated", async ({ page }) => {
    await openFixture(page);
    const surfaces = await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      const framed = fixture.create("framed");
      const naked = fixture.create("naked");
      await Promise.all([
        framed.render(fixture.CODE, {
          theme: "theme-dark",
          palette: fixture.SOFT_DARK,
        }),
        naked.render("Naked.call()", {
          theme: "theme-default",
          palette: fixture.SOFT_LIGHT,
        }),
      ]);
      return [framed.getCanvasSurface(), naked.getCanvasSurface()];
    });
    expect(surfaces).toEqual([
      { backgroundColor: "rgb(48, 57, 68)" },
      { backgroundColor: "rgb(243, 245, 247)" },
    ]);
    await expect(
      page.locator("#framed-host .bg-skin-canvas").first(),
    ).toHaveCSS("background-color", "rgb(48, 57, 68)");
    await expect(page.locator("#naked-host .sequence-diagram")).toHaveCSS(
      "background-color",
      "rgb(243, 245, 247)",
    );
    await expect(page.locator("#naked-host .frame")).toHaveCount(0);
  });

  test("paints a naked named dark theme without a palette", async ({
    page,
  }) => {
    await openFixture(page);
    const surface = await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      const instance = fixture.create("naked");
      await instance.render("Naked.call()", { theme: "theme-dark" });
      return instance.getCanvasSurface();
    });
    expect(surface).toEqual({ backgroundColor: "rgb(31, 31, 31)" });
    await expect(page.locator("#naked-host .sequence-diagram")).toHaveCSS(
      "background-color",
      "rgb(31, 31, 31)",
    );
  });

  test("reads a CSS-only canvas override and paints PNG and SVG exports across the host", async ({
    page,
  }, testInfo) => {
    await openFixture(page);
    const data = await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      const instance = fixture.create("framed");
      await instance.render(fixture.CODE, {
        theme: "theme-dark",
        palette: fixture.SOFT_DARK,
      });
      const canvas = document.querySelector<HTMLElement>(
        "#framed-host .bg-skin-canvas",
      )!;
      canvas.style.backgroundColor = "#475569";
      return {
        surface: instance.getCanvasSurface(),
        png: await instance.getPng(),
        svg: await instance.getSvg(),
      };
    });
    expect(data.surface).toEqual({ backgroundColor: "rgb(71, 85, 105)" });
    const png = pngFromDataUrl(data.png);
    expect(png.width).toBeGreaterThan(1000);
    expect(pixel(png, 1, 1).slice(0, 3)).toEqual(CSS_OVERRIDE);
    expect(pixel(png, png.width - 2, 2).slice(0, 3)).toEqual(CSS_OVERRIDE);
    await testInfo.attach("soft-dark-html-export.png", {
      body: Buffer.from(data.png.split(",")[1], "base64"),
      contentType: "image/png",
    });
    await page.evaluate(
      async (svg) => (window as BrowserFixture).themeSurface.showExport(svg),
      data.svg,
    );
    const exportImage = page.locator("#export-image");
    await expect(exportImage).toBeVisible();
    const svgPixels = PNG.sync.read(await exportImage.screenshot());
    expect(svgPixels.width).toBeGreaterThan(1000);
    expect(pixel(svgPixels, 1, 1).slice(0, 3)).toEqual(CSS_OVERRIDE);
    expect(pixel(svgPixels, svgPixels.width - 2, 2).slice(0, 3)).toEqual(
      CSS_OVERRIDE,
    );
    await testInfo.attach("soft-dark-svg-export.png", {
      body: PNG.sync.write(svgPixels),
      contentType: "image/png",
    });
  });

  test("composites a translucent CSS canvas once across PNG and SVG exports", async ({
    page,
  }) => {
    await openFixture(page);
    const data = await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      const host = document.getElementById("framed-host")!;
      host.style.backgroundColor = "white";
      const instance = fixture.create("framed");
      await instance.render(fixture.CODE, {
        theme: "theme-dark",
        palette: fixture.SOFT_DARK,
      });
      document.querySelector<HTMLElement>(
        "#framed-host .bg-skin-canvas",
      )!.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      return {
        surface: instance.getCanvasSurface(),
        png: await instance.getPng(),
        svg: await instance.getSvg(),
      };
    });
    expect(data.surface).toEqual({ backgroundColor: "rgb(128, 128, 128)" });
    const png = pngFromDataUrl(data.png);
    expect(pixel(png, 1, 1).slice(0, 3)).toEqual([128, 128, 128]);
    expect(pixel(png, png.width - 2, 2).slice(0, 3)).toEqual([128, 128, 128]);

    await page.evaluate(
      async (svg) => (window as BrowserFixture).themeSurface.showExport(svg),
      data.svg,
    );
    const svgPixels = PNG.sync.read(
      await page.locator("#export-image").screenshot(),
    );
    expect(pixel(svgPixels, 1, 1).slice(0, 3)).toEqual([128, 128, 128]);
    expect(pixel(svgPixels, svgPixels.width - 2, 2).slice(0, 3)).toEqual([
      128, 128, 128,
    ]);
  });

  test("native SVG covers viewport corners and retains explicit participant and brand paints", async ({
    page,
  }, testInfo) => {
    await openFixture(page);
    const surface = await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      const result = await fixture.native();
      return result.surface;
    });
    expect(surface).toEqual({ backgroundColor: "#303944" });
    const svg = page.locator("#native-output > svg");
    await expect(svg).toBeVisible();
    const pixels = PNG.sync.read(await svg.screenshot());
    expect(pixel(pixels, 0, 0).slice(0, 3)).toEqual(CANVAS);
    expect(pixel(pixels, pixels.width - 1, 0).slice(0, 3)).toEqual(CANVAS);
    expect(pixel(pixels, 0, pixels.height - 1).slice(0, 3)).toEqual(CANVAS);
    expect(
      pixel(pixels, pixels.width - 1, pixels.height - 1).slice(0, 3),
    ).toEqual(CANVAS);
    await expect(
      page.locator(
        '#native-output [data-participant="Client"] .participant-box',
      ),
    ).toHaveAttribute("style", "fill:#101820;");
    await expect(
      page.locator(
        '#native-output [data-participant="Client"] .participant-label',
      ),
    ).toHaveAttribute("style", "fill:#fff;");
    await expect(
      page.locator(
        '#native-output [data-participant="Service"] .participant-label',
      ),
    ).toHaveAttribute("style", "fill:#000;");
    await expect(
      page.locator(
        '#native-output [data-participant="Service"] .participant-icon [fill="#ED7100"]',
      ),
    ).toHaveCount(1);
    await testInfo.attach("soft-dark-native-svg.png", {
      body: PNG.sync.write(pixels),
      contentType: "image/png",
    });

    await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      await fixture.native(fixture.CODE, { theme: "theme-dark" });
    });
    const namedDark = PNG.sync.read(await svg.screenshot());
    expect(pixel(namedDark, 0, 0).slice(0, 3)).toEqual([31, 31, 31]);
    expect(
      pixel(namedDark, namedDark.width - 1, namedDark.height - 1).slice(0, 3),
    ).toEqual([31, 31, 31]);

    await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      await fixture.native(fixture.CODE, { theme: "theme-neon" });
    });
    const namedNeon = PNG.sync.read(await svg.screenshot());
    expect(pixel(namedNeon, 0, 0).slice(0, 3)).toEqual([0, 0, 0]);
    expect(
      pixel(namedNeon, namedNeon.width - 1, namedNeon.height - 1).slice(0, 3),
    ).toEqual([0, 0, 0]);
  });

  test("resolves system preference in the host before passing concrete options", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await openFixture(page);
    const result = await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      const dark = matchMedia("(prefers-color-scheme: dark)").matches;
      const palette = dark ? fixture.SOFT_DARK : fixture.SOFT_LIGHT;
      const theme = dark ? "theme-dark" : "theme-default";
      const instance = fixture.create("framed");
      await instance.render(fixture.CODE, { theme, palette });
      return {
        dark,
        theme: instance.theme,
        surface: instance.getCanvasSurface(),
      };
    });
    expect(result).toEqual({
      dark: true,
      theme: "theme-dark",
      surface: { backgroundColor: "rgb(48, 57, 68)" },
    });
  });

  test("captures matching HTML and native SVG in both host palettes", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1200, height: 460 });
    for (const scheme of ["dark", "light"] as const) {
      await openFixture(page);
      await page.evaluate(async (currentScheme) => {
        const fixture = (window as BrowserFixture).themeSurface;
        const isDark = currentScheme === "dark";
        const palette = isDark ? fixture.SOFT_DARK : fixture.SOFT_LIGHT;
        const theme = isDark ? "theme-dark" : "theme-default";
        document.body.style.cssText = `display:flex;gap:20px;padding:20px;background:${palette.canvas};`;
        document.getElementById("naked-host")!.style.display = "none";
        document.getElementById("export-output")!.style.display = "none";
        const host = document.getElementById("framed-host")!;
        host.style.width = "700px";
        host.style.minHeight = "420px";
        host.style.backgroundColor = palette.canvas;
        const instance = fixture.create("framed");
        await Promise.all([
          instance.render(fixture.CODE, { theme, palette }),
          fixture.native(fixture.CODE, { theme, palette }),
        ]);
      }, scheme);
      await expect(
        page.locator('#framed-host [data-participant-id="Observer"]'),
      ).toBeVisible();
      await expect(page.locator("#native-output > svg")).toBeVisible();
      await page.waitForFunction(() =>
        Array.from(
          document.querySelectorAll("#framed-host .participant .h-6.w-6"),
        ).every((slot) => slot.querySelector("svg")),
      );
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach(`soft-${scheme}-html-native.png`, {
        body: screenshot,
        contentType: "image/png",
      });
      if (process.env.CAPTURE_THEME_SURFACE === "1") {
        const dir = "docs/evidence/core-theme-surface";
        await mkdir(dir, { recursive: true });
        await writeFile(`${dir}/soft-${scheme}-html-native.png`, screenshot);
      }
    }
  });

  test("maps pocket and secondary text roles in fragments, comments, dividers, and occurrences", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1500, height: 640 });
    await openFixture(page);
    await page.evaluate(async () => {
      const fixture = (window as BrowserFixture).themeSurface;
      document.body.style.cssText = `display:flex;gap:20px;padding:20px;background:${fixture.SOFT_DARK.canvas};`;
      document.getElementById("naked-host")!.style.display = "none";
      document.getElementById("export-output")!.style.display = "none";
      const host = document.getElementById("framed-host")!;
      host.style.width = "700px";
      host.style.minHeight = "560px";
      const instance = fixture.create("framed");
      await Promise.all([
        instance.render(fixture.STRUCTURE_CODE, {
          theme: "theme-dark",
          palette: fixture.SOFT_DARK,
        }),
        fixture.native(fixture.STRUCTURE_CODE, {
          theme: "theme-dark",
          palette: fixture.SOFT_DARK,
        }),
      ]);
    });
    await expect(
      page.locator("#framed-host .fragment .header").first(),
    ).toHaveCSS("background-color", "rgb(66, 79, 94)");
    await expect(page.locator("#framed-host .comments").first()).toHaveCSS(
      "color",
      "rgb(184, 195, 207)",
    );
    await expect(page.locator("#framed-host .divider > div").nth(1)).toHaveCSS(
      "background-color",
      "rgb(66, 79, 94)",
    );
    await expect(page.locator("#framed-host .occurrence").first()).toHaveCSS(
      "background-color",
      "rgb(66, 79, 94)",
    );
    await expect(
      page.locator("#native-output .fragment-header").first(),
    ).toHaveCSS("fill", "rgb(66, 79, 94)");
    await expect(
      page.locator("#native-output .comment-text").first(),
    ).toHaveCSS("fill", "rgb(184, 195, 207)");
    await expect(page.locator("#native-output .divider-bg").first()).toHaveCSS(
      "fill",
      "rgb(66, 79, 94)",
    );
    await expect(page.locator("#native-output .occurrence").first()).toHaveCSS(
      "fill",
      "rgb(66, 79, 94)",
    );
    await page.waitForFunction(() =>
      Array.from(
        document.querySelectorAll("#framed-host .participant .h-6.w-6"),
      ).every((slot) => slot.querySelector("svg")),
    );
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach("soft-dark-structure-html-native.png", {
      body: screenshot,
      contentType: "image/png",
    });
    if (process.env.CAPTURE_THEME_SURFACE === "1") {
      const dir = "docs/evidence/core-theme-surface";
      await mkdir(dir, { recursive: true });
      await writeFile(`${dir}/soft-dark-structure-html-native.png`, screenshot);
    }
  });
});
