#!/usr/bin/env node
// Sample a theme-dark diagram inside a real host page (ADR 0004, step 7).
//
// Opens `--url` with a saved Playwright storage state, finds the first iframe
// whose URL matches `--frame`, injects the local UMD build (dist/zenuml.js)
// into that frame, renders `--case` there with `--theme`, screenshots the
// whole page and measures the diagram with the audit's walker and sampler
// (rects are offset by the iframe's position). Writes the screenshot, a JSON
// report and a markdown summary next to each other.
//
// Usage:
//   node scripts/theme-contrast/host-sample.mjs --url <page> --frame <substring>
//     --storage-state <playwright json> --out <dir> [--case demo1-smoke]
//     [--theme theme-dark] [--bundle dist/zenuml.js] [--headed]
//
// The frame is given the local build because the deployed @zenuml/core on the
// host predates theme-dark; everything around the diagram (page chrome, the
// macro iframe's own background) is the host's, untouched.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { corpus } from "./cases.mjs";
import { TEXT_ROLES, LINE_ROLES, FILL_ROLES, CHROME_SELECTOR, floorFor } from "./roles.mjs";
import { walkDiagram } from "./walker.mjs";
import { Screenshot, measure } from "./sample.mjs";
import { resolveSurfaces } from "./browser.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  const a = { url: null, frame: "", storageState: null, out: null, case: "demo1-smoke", theme: "theme-dark", bundle: "dist/zenuml.js", headed: false, viewportHeight: 3200 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = () => argv[++i];
    if (k === "--url") a.url = v();
    else if (k === "--frame") a.frame = v();
    else if (k === "--storage-state") a.storageState = v();
    else if (k === "--out") a.out = v();
    else if (k === "--case") a.case = v();
    else if (k === "--theme") a.theme = v();
    else if (k === "--bundle") a.bundle = v();
    else if (k === "--headed") a.headed = true;
    else if (k === "--viewport-height") a.viewportHeight = Number(v());
    else throw new Error(`unknown option ${k}`);
  }
  if (!a.url || !a.out) throw new Error("--url and --out are required");
  return a;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(resolve(args.out), { recursive: true });
  const code = corpus(args.case)[args.case];
  const bundle = readFileSync(resolve(ROOT, args.bundle), "utf8");

  const browser = await chromium.launch({ headless: !args.headed, args: ["--force-color-profile=srgb"] });
  const ctx = await browser.newContext({
    storageState: args.storageState ? resolve(args.storageState) : undefined,
    // Confluence scrolls an inner container, so a full-page screenshot is the
    // viewport: make it tall enough to hold the whole macro.
    viewport: { width: 1400, height: args.viewportHeight },
    deviceScaleFactor: 1,
    bypassCSP: true,
    // Confluence follows the OS scheme when the account's theme is "Match
    // system"; `data-color-mode` on <html> is recorded in the report.
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  try {
    await page.goto(args.url, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    const colorMode = await page.evaluate(() => document.documentElement.getAttribute("data-color-mode") || document.documentElement.getAttribute("data-theme") || "");

    let frame = null;
    for (let i = 0; i < 60 && !frame; i++) {
      frame = page.frames().find((f) => f !== page.mainFrame() && f.url().includes(args.frame));
      if (!frame) await page.waitForTimeout(500);
    }
    if (!frame) throw new Error(`no iframe whose URL contains "${args.frame}" (frames: ${page.frames().map((f) => f.url()).join(", ")})`);
    const frameEl = await frame.frameElement();
    await frameEl.scrollIntoViewIfNeeded();

    // The core deployed on the host predates this change and still ships the
    // dead src/themes/theme-dark.css, whose `.zenuml.theme-dark` rules would
    // colour the injected diagram with Dracula values. Remove those rules so
    // the frame matches the post-release state; everything else stays.
    const staleRules = await frame.evaluate(() => {
      let removed = 0;
      for (const sheet of Array.from(document.styleSheets)) {
        let rules;
        try { rules = sheet.cssRules; } catch { continue; }
        for (let i = rules.length - 1; i >= 0; i--) {
          const r = rules[i];
          if (r.selectorText && /\.zenuml\.theme-dark/.test(r.selectorText)) { sheet.deleteRule(i); removed++; }
          else if (r.selectorText === ":root" && r.style && r.style.getPropertyValue("--crayola")) { sheet.deleteRule(i); removed++; }
        }
      }
      return removed;
    });
    // Give the frame the local build and render the case in a fresh host
    // element appended to the frame's body (the existing macro stays).
    await frame.evaluate(bundle);
    await frame.evaluate(
      async ([c, t]) => {
        const Z = window.zenuml && (window.zenuml.default || window.zenuml.ZenUml || window.zenuml);
        const pre = document.createElement("pre");
        pre.className = "zenuml";
        pre.id = "theme-dark-sample";
        pre.style.margin = "0";
        document.body.appendChild(pre);
        const instance = new Z(pre);
        await instance.render(c, { theme: t });
        window.__sample = instance;
      },
      [code, args.theme],
    );
    await frame.waitForSelector("#theme-dark-sample .sequence-diagram .participant", { timeout: 30000 });
    await page.waitForTimeout(800);
    await frameEl.scrollIntoViewIfNeeded();

    const frameBox = await frameEl.boundingBox();
    const walked = await frame.evaluate(walkDiagram, {
      mode: "dom",
      rootSelector: "#theme-dark-sample",
      textRoles: TEXT_ROLES,
      lineRoles: LINE_ROLES,
      fillRoles: FILL_ROLES,
      chromeSelector: CHROME_SELECTOR,
    });
    const iframeBg = await frame.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const hostBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const buf = await page.screenshot({ fullPage: true });
    const shot = new Screenshot(PNG.sync.read(buf), 1);
    const scroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
    const frameScroll = await frame.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
    const surfaces = resolveSurfaces(null, walked.surfaces, walked.items);
    // The Forge bridge fixes the iframe's height; anything the injected
    // diagram draws below that edge is clipped and must not be measured.
    const visibleBottom = frameBox.y + frameBox.height + scroll.y;
    const items = walked.items.filter((it) => !it.rect || it.rect.y - frameScroll.y + frameBox.y + scroll.y + it.rect.h <= visibleBottom).map((it) => {
      if (!it.rect) return it;
      // walker rects are frame-document coordinates; move them to page-document coordinates
      const rect = {
        x: it.rect.x - frameScroll.x + frameBox.x + scroll.x,
        y: it.rect.y - frameScroll.y + frameBox.y + scroll.y,
        w: it.rect.w,
        h: it.rect.h,
      };
      return measure(shot, { ...it, rect }, surfaces);
    });
    const fails = items.filter((it) => it.kind !== "meta" && !it.error && !it.userStyled && !it.overlap && !(it.kind === "fill" && it.gate === false) && it.absLc < floorFor(it));
    const overlaps = items.filter((it) => it.overlap && it.absLc < floorFor(it)).map((f) => ({ role: f.role, surface: f.bgSurface, fg: f.fg, bg: f.bg, lc: +f.lc.toFixed(1) }));
    const summary = {};
    for (const it of items) {
      if (it.kind === "meta" || it.error || it.userStyled || it.overlap) continue;
      const k = `${it.kind}:${it.role}`;
      const s = (summary[k] ??= { n: 0, minLc: Infinity, fg: null, bg: null });
      s.n++;
      if (it.absLc < s.minLc) Object.assign(s, { minLc: it.absLc, fg: it.fg, bg: it.bg });
    }
    const report = { url: args.url, frame: frame.url(), case: args.case, theme: args.theme, hostColorMode: colorMode, staleRulesRemoved: staleRules, overlaps, walked: walked.items.length, clipped: walked.items.length - items.length, hostBodyBackground: hostBg, iframeBodyBackground: iframeBg, frameBox, items: items.length, failures: fails.length, summary, fails: fails.map((f) => ({ role: f.role, kind: f.kind, path: f.path, text: f.text, fg: f.fg, bg: f.bg, lc: f.lc, floor: floorFor(f) })) };
    writeFileSync(resolve(args.out, "host-sample.png"), buf);
    writeFileSync(resolve(args.out, "host-sample.json"), JSON.stringify(report, null, 2));
    const md = [
      `| role | n | min Lc | floor | worst fg on bg |`,
      `| --- | --- | --- | --- | --- |`,
      ...Object.entries(summary)
        .sort()
        .map(([k, s]) => `| ${k} | ${s.n} | ${s.minLc.toFixed(1)} | ${k.startsWith("fill:participant") || k.startsWith("fill:canvas") ? "—" : floorFor({ kind: k.split(":")[0], fontSize: 14 })} | ${s.fg} on ${s.bg} |`),
    ].join("\n");
    writeFileSync(resolve(args.out, "host-sample.md"), md + "\n");
    process.stdout.write(`host color mode: ${colorMode || "(none)"}; host body ${hostBg}; iframe body ${iframeBg}; stale rules removed: ${staleRules}\n${items.length} items, ${fails.length} under floor\n${md}\n`);
  } finally {
    await ctx.close();
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
