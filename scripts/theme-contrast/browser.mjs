// Playwright plumbing shared by the audit, the measurement and the benchmark:
// a dev server, a page per (DPR, forced-colors) combination, and one
// "render + walk + screenshot + measure" pass.

import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { TEXT_ROLES, LINE_ROLES, FILL_ROLES, CHROME_SELECTOR } from "./roles.mjs";
import { walkDiagram } from "./walker.mjs";
import { Screenshot, measure } from "./sample.mjs";
import { composite, parseColorAlpha, toHex } from "../color/srgb.mjs";

export async function waitForServer(url, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`dev server did not answer at ${url} within ${timeoutMs}ms`);
}

/** Start `bun run dev` on `port`; returns a stop() function. */
export async function startDevServer(port, cwd) {
  const child = spawn("bun", ["run", "dev", "--", `--port=${port}`, "--strictPort"], {
    cwd,
    stdio: ["ignore", "ignore", "inherit"],
  });
  await waitForServer(`http://127.0.0.1:${port}/e2e/fixtures/fixture.html`);
  return () => child.kill("SIGTERM");
}

export async function launchBrowser() {
  return chromium.launch({ args: ["--force-color-profile=srgb"] });
}

/**
 * Open a page with the given device scale factor and forced-colors setting.
 */
export async function openPage(browser, { dpr = 1, forcedColors = false, width = 1200, height = 800 } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
    forcedColors: forcedColors ? "active" : "none",
    colorScheme: forcedColors ? "dark" : "light",
  });
  const page = await ctx.newPage();
  return { page, ctx, dpr };
}

/**
 * Walk the current page and measure every item against a full-page screenshot.
 * `mode` is "dom" for the zenuml DOM renderer or "svg" for any inline SVG.
 */
export async function walkAndMeasure(page, dpr, { mode = "dom", rootSelector, skipFills = false } = {}) {
  await page.evaluate(() => document.fonts.ready);
  const signature = () =>
    page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight, document.querySelectorAll(".participant, .message, .occurrence, text").length].join(","));
  const spec = {
    mode,
    rootSelector: rootSelector || (mode === "svg" ? "svg" : ".zenuml"),
    textRoles: TEXT_ROLES,
    lineRoles: LINE_ROLES,
    fillRoles: FILL_ROLES,
    chromeSelector: CHROME_SELECTOR,
    skipFills,
  };
  // The walk and the screenshot must see the same layout: retry when the
  // page moved between them (icons arriving, a late overlay measurement).
  let walked;
  let buf;
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const before = await signature();
    walked = await page.evaluate(walkDiagram, spec);
    buf = await page.screenshot({ fullPage: true });
    const after = await signature();
    if (before === after) break;
    await page.waitForTimeout(300);
  }
  const shot = new Screenshot(PNG.sync.read(buf), dpr);
  const surfaces = resolveSurfaces(shot, walked.surfaces, walked.items);
  const items = walked.items.map((it) => measure(shot, it, surfaces));
  return { items, screenshot: buf, surfaces };
}

/**
 * Surface colours as painted: the frame is the frame; a header or divider
 * box with alpha is composited over the frame.
 */
export function resolveSurfaces(shot, raw, items) {
  const out = {};
  const frame = raw.frame ? toOpaque(raw.frame, null) : null;
  out.frame = frame;
  for (const k of ["occurrence", "header", "dividerBox"]) {
    if (!raw[k]) continue;
    out[k] = toOpaque(raw[k], frame, k === "header" && raw.headerOpacity != null ? Number(raw.headerOpacity) : 1);
  }
  return out;
}

function toOpaque(color, over, extraAlpha = 1) {
  const [r, g, b, a] = parseColorAlpha(color);
  const alpha = a * extraAlpha;
  if (alpha >= 0.999) return toHex([r, g, b]);
  if (!over) return null;
  return toHex(composite([r, g, b, alpha], over));
}

/**
 * Open a fixture page once per pass; the render functions below then draw
 * each case in place. One navigation per pass keeps a dev-server reload from
 * racing a per-case goto, and is several times faster.
 */
export async function openFixture(page, baseUrl, kind) {
  if (kind === "svg") {
    await page.goto(`${baseUrl}/e2e/fixtures/svg-test.html`);
    await page.waitForFunction(() => typeof window.__renderSvg === "function");
  } else if (kind === "host-matrix") {
    await page.goto(`${baseUrl}/e2e/fixtures/host-matrix.html?case=smoke`);
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  } else {
    await page.goto(`${baseUrl}/e2e/fixtures/fixture.html?case=smoke`);
    await page.locator(".sequence-diagram .participant").first().waitFor({ timeout: 15000 });
  }
}

/**
 * ZenUml.render() debounces every render after the first, so the promise can
 * settle before the DOM does. Wait until the document height, the number of
 * participants and messages, and the fonts have been stable for 200ms.
 */
export async function waitForStableLayout(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    () =>
      new Promise((done) => {
        const snapshot = () =>
          [
            document.documentElement.scrollHeight,
            document.documentElement.scrollWidth,
            document.querySelectorAll(".participant").length,
            document.querySelectorAll(".message").length,
            document.querySelectorAll(".occurrence").length,
          ].join(",");
        let last = snapshot();
        let stableFor = 0;
        const tick = () => {
          const now = snapshot();
          stableFor = now === last ? stableFor + 100 : 0;
          last = now;
          if (stableFor >= 200 && document.fonts.status === "loaded") done();
          else setTimeout(tick, 100);
        };
        setTimeout(tick, 100);
      }),
  );
}

/** Render a DSL case through the DOM fixture with a theme (page already open). */
export async function renderDomCase(page, baseUrl, code, theme) {
  if (!page.url().includes("fixture.html")) await openFixture(page, baseUrl, "dom");
  await page.evaluate(([c, t]) => window.zenUml.render(c, { theme: t }), [code, theme]);
  await waitForStableLayout(page);
}

/** Render a DSL case through the SVG renderer fixture with a theme (page already open). */
export async function renderSvgCase(page, baseUrl, code, theme) {
  if (!page.url().includes("svg-test.html")) await openFixture(page, baseUrl, "svg");
  await page.evaluate(([c, t]) => window.__renderSvg(c, t), [code, theme]);
  await page.locator("#svg-output > svg").waitFor({ timeout: 15000 });
}

/** Render a DSL case on every host panel of the host-matrix page (page already open). */
export async function renderHostMatrixCase(page, baseUrl, code, theme) {
  if (!page.url().includes("host-matrix.html")) await openFixture(page, baseUrl, "host-matrix");
  await page.evaluate(([c, t]) => window.__renderAll(c, t), [code, theme]);
  await waitForStableLayout(page);
}
