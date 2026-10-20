#!/usr/bin/env node
// Theme contrast audit (ADR 0004).
//
// Renders the E2E corpus through the DOM and SVG renderers, walks every text,
// line and fill, samples each element's background from a full-page
// screenshot, computes APCA Lc and fails on any element under its floor
// (scripts/theme-contrast/roles.mjs: text 75, 12px text 90, lines 45, fills 30).
//
// Usage:
//   node scripts/audit-theme-contrast.mjs                      # audit, needs a dev server on 14000
//   node scripts/audit-theme-contrast.mjs --start-server       # starts its own (CI)
//   node scripts/audit-theme-contrast.mjs --measure --themes theme-default
//                                                              # per-role OKLCH distances, no gate
// Options:
//   --themes a,b        themes to render (default theme-default,theme-dark)
//   --gate a,b          themes that must meet every floor (default: themes
//                       without a baseline file)
//   --baseline <json>   known sub-floor items for a grandfathered theme
//                       (default scripts/theme-contrast/baseline-<theme>.json)
//   --dpr 1,2           device scale factors (default 1,2)
//   --renderers dom,svg (default dom,svg)
//   --forced-colors     add a forced-colors pass (DOM, dpr 1)
//   --host-matrix       add the host-matrix page pass (DOM, dpr 1)
//   --cases all|a,b     (default all = HTML_VISUAL_CASES + audit extras)
//   --base-url <url>    (default http://127.0.0.1:14000)
//   --start-server      start `bun run dev` on --port (default 14020)
//   --json <file> --md <file>   write the report
//   --quick             3 cases, dpr 1, dom only (smoke)
//   --shots <dir>       save every full-page screenshot the audit measured

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { corpus } from "./theme-contrast/cases.mjs";
import { floorFor } from "./theme-contrast/roles.mjs";
import {
  launchBrowser,
  openFixture,
  openPage,
  renderDomCase,
  renderHostMatrixCase,
  renderSvgCase,
  startDevServer,
  walkAndMeasure,
} from "./theme-contrast/browser.mjs";
import { formatOklch, srgbToOklch } from "./color/oklch.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const a = {
    themes: ["theme-default", "theme-dark"],
    gate: null,
    baseline: null,
    dpr: [1, 2],
    renderers: ["dom", "svg"],
    forcedColors: false,
    hostMatrix: false,
    cases: "all",
    baseUrl: "http://127.0.0.1:14000",
    startServer: false,
    port: 14020,
    json: null,
    md: null,
    measure: false,
    quick: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = () => argv[++i];
    if (k === "--") continue; // `bun run audit:contrast -- …` may forward the separator
    if (k === "--themes") a.themes = v().split(",");
    else if (k === "--gate") a.gate = v().split(",");
    else if (k === "--baseline") a.baseline = v();
    else if (k === "--dpr") a.dpr = v().split(",").map(Number);
    else if (k === "--renderers") a.renderers = v().split(",");
    else if (k === "--forced-colors") a.forcedColors = true;
    else if (k === "--host-matrix") a.hostMatrix = true;
    else if (k === "--cases") a.cases = v();
    else if (k === "--base-url") a.baseUrl = v();
    else if (k === "--start-server") a.startServer = true;
    else if (k === "--port") a.port = Number(v());
    else if (k === "--json") a.json = v();
    else if (k === "--md") a.md = v();
    else if (k === "--measure") a.measure = true;
    else if (k === "--quick") a.quick = true;
    else if (k === "--shots") a.shots = v();
    else throw new Error(`unknown option ${k}`);
  }
  if (a.quick) {
    a.dpr = [1];
    a.renderers = ["dom"];
    if (a.cases === "all") a.cases = "smoke,demo1-smoke,audit-ref-guards";
  }
  if (a.startServer) a.baseUrl = `http://127.0.0.1:${a.port}`;
  return a;
}

/** Items that fail their floor. Fills marked gate:false and meta rows never fail. */
function failures(items) {
  return items.filter((it) => {
    if (it.kind === "meta" || it.error) return false;
    if (it.userStyled) return false; // the author's own colours, not the theme's
    if (it.overlap) return false; // drawn over another diagram surface: reported under overlaps
    if (it.kind === "fill" && it.gate === false) return false;
    return it.absLc < floorFor(it);
  });
}

function loadBaseline(theme, explicit) {
  const file = explicit || resolve(ROOT, `scripts/theme-contrast/baseline-${theme}.json`);
  if (!existsSync(file)) return null;
  return { file, ...JSON.parse(readFileSync(file, "utf8")) };
}

/** Role-level summary: n, min |Lc|, median |Lc|, floor, worst item. */
function summarise(items) {
  const byRole = new Map();
  for (const it of items) {
    if (it.kind === "meta" || it.error || it.userStyled) continue;
    const key = `${it.kind}:${it.role}`;
    if (!byRole.has(key)) byRole.set(key, []);
    byRole.get(key).push(it);
  }
  const rows = [];
  for (const [key, list] of byRole) {
    const sorted = [...list].sort((a, b) => a.absLc - b.absLc);
    const worst = sorted[0];
    rows.push({
      key,
      kind: worst.kind,
      role: worst.role,
      n: list.length,
      minLc: worst.absLc,
      medianLc: sorted[Math.floor(sorted.length / 2)].absLc,
      floor: worst.kind === "fill" && worst.gate === false ? null : floorFor(worst),
      fg: worst.fg,
      bg: worst.bg,
      worst: `${worst.case}${worst.host ? "@" + worst.host : ""} ${worst.path}${worst.text ? ` "${worst.text}"` : ""}`,
    });
  }
  return rows.sort((a, b) => a.key.localeCompare(b.key));
}

function mdTable(rows, cols) {
  const head = `| ${cols.map((c) => c[0]).join(" | ")} |\n| ${cols.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${cols.map((c) => c[1](r)).join(" | ")} |`).join("\n");
  return `${head}\n${body}`;
}

const fmt = (n) => (n == null ? "" : n.toFixed(1));

async function runPass(browser, args, cases, pass, log) {
  const { page, ctx, dpr } = await openPage(browser, { dpr: pass.dpr, forcedColors: pass.forcedColors });
  const items = [];
  try {
    await openFixture(page, args.baseUrl, pass.renderer);
    for (const [name, code] of Object.entries(cases)) {
      let measured;
      // In forced-colors mode the system paints every fill (Canvas), so only
      // text and lines are measured there.
      const skipFills = pass.forcedColors;
      if (pass.renderer === "svg") {
        await renderSvgCase(page, args.baseUrl, code, pass.theme);
        measured = await walkAndMeasure(page, dpr, { mode: "svg", rootSelector: "#svg-output > svg", skipFills });
      } else if (pass.renderer === "host-matrix") {
        await renderHostMatrixCase(page, args.baseUrl, code, pass.theme);
        measured = await walkAndMeasure(page, dpr, { mode: "dom", skipFills });
      } else {
        await renderDomCase(page, args.baseUrl, code, pass.theme);
        measured = await walkAndMeasure(page, dpr, { mode: "dom", skipFills });
      }
      for (const it of measured.items) items.push({ ...it, case: name, ...pass });
      if (args.shots) {
        mkdirSync(resolve(args.shots), { recursive: true });
        writeFileSync(resolve(args.shots, `${pass.label.replace(/[^a-z0-9@.-]+/gi, "_")}-${name}.png`), measured.screenshot);
      }
      log(`  ${pass.label} ${name}: ${measured.items.length} items, ${failures(measured.items).length} under floor`);
    }
  } finally {
    await ctx.close();
  }
  return items;
}

function passesFor(args) {
  const passes = [];
  for (const theme of args.themes) {
    for (const renderer of args.renderers) {
      for (const dpr of args.dpr) {
        passes.push({ theme, renderer, dpr, forcedColors: false, label: `${theme}/${renderer}@${dpr}x` });
      }
    }
    if (args.forcedColors && args.renderers.includes("dom")) {
      passes.push({ theme, renderer: "dom", dpr: 1, forcedColors: true, label: `${theme}/dom@1x forced-colors` });
    }
    if (args.hostMatrix) {
      passes.push({ theme, renderer: "host-matrix", dpr: 1, forcedColors: false, label: `${theme}/host-matrix@1x` });
    }
  }
  return passes;
}

/** --measure: per-role composited colours and their OKLCH distance from the background. */
function measureReport(items, theme) {
  const rows = [];
  const byRole = new Map();
  for (const it of items) {
    if (it.kind === "meta" || it.error || it.userStyled || it.renderer !== "dom" || it.dpr !== 1) continue;
    const key = `${it.kind}:${it.role}`;
    if (!byRole.has(key)) byRole.set(key, []);
    byRole.get(key).push(it);
  }
  for (const [key, list] of [...byRole].sort((a, b) => a[0].localeCompare(b[0]))) {
    // Median by |Lc| picks a representative pair, not an average of colours.
    const sorted = [...list].sort((a, b) => a.absLc - b.absLc);
    const rep = sorted[Math.floor(sorted.length / 2)];
    const fg = srgbToOklch(rep.fg);
    const bg = srgbToOklch(rep.bg);
    rows.push({
      key, kind: rep.kind, role: rep.role, n: list.length,
      fg: rep.fg, bg: rep.bg,
      fgOklch: formatOklch(fg), bgOklch: formatOklch(bg),
      dL: fg.L - bg.L, C: fg.C, h: fg.h,
      lc: rep.lc, minLc: sorted[0].absLc, floor: rep.kind === "fill" && rep.gate === false ? null : floorFor(rep),
      fontSize: rep.fontSize,
    });
  }
  const md = [
    `## ${theme}: measured roles (DOM renderer, 1x, median item per role)`,
    "",
    mdTable(rows, [
      ["role", (r) => r.key],
      ["n", (r) => r.n],
      ["fg", (r) => r.fg],
      ["bg", (r) => r.bg],
      ["fg OKLCH", (r) => r.fgOklch],
      ["bg OKLCH", (r) => r.bgOklch],
      ["ΔL", (r) => (r.dL >= 0 ? "+" : "") + r.dL.toFixed(3)],
      ["Lc", (r) => fmt(r.lc)],
      ["min |Lc|", (r) => fmt(r.minLc)],
      ["floor", (r) => (r.floor == null ? "—" : r.floor)],
    ]),
  ].join("\n");
  return { rows, md };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cases = corpus(args.cases);
  const log = (s) => process.stderr.write(s + "\n");

  let stopServer = null;
  if (args.startServer) stopServer = await startDevServer(args.port, ROOT);
  const browser = await launchBrowser();
  const report = { generated: new Date().toISOString(), args, passes: [], summary: {}, failures: {}, gated: {}, measure: {} };
  let exitCode = 0;
  try {
    const all = [];
    for (const pass of passesFor(args)) {
      log(`pass ${pass.label}`);
      const items = await runPass(browser, args, cases, pass, log);
      all.push(...items);
      report.passes.push({ ...pass, items: items.length, failures: failures(items).length });
    }

    if (args.measure) {
      for (const theme of args.themes) {
        const r = measureReport(all.filter((it) => it.theme === theme), theme);
        report.measure[theme] = r.rows;
        process.stdout.write(r.md + "\n\n");
      }
    }

    const mdParts = [];
    for (const theme of args.themes) {
      const themeItems = all.filter((it) => it.theme === theme);
      const baseline = loadBaseline(theme, args.baseline);
      const gated = args.gate ? args.gate.includes(theme) : !baseline;
      const fails = failures(themeItems);
      report.summary[theme] = summarise(themeItems);
      // Overlaps: items drawn over a surface they were not designed for.
      // Whole items drawn on a foreign surface, plus stretches of a rule that
      // cross one (a lifeline over a header chip, a separator over a bar).
      const overlapByRole = new Map();
      const addOverlap = (it, surface, absLc, fg, bg) => {
        const k = `${it.kind}:${it.role} over ${surface}`;
        const e = overlapByRole.get(k) || { key: k, n: 0, minLc: Infinity, example: "" };
        e.n++;
        if (absLc < e.minLc) { e.minLc = absLc; e.example = `${it.case} ${it.path}${it.text ? ` "${it.text}"` : ""} (${fg} on ${bg})`; }
        overlapByRole.set(k, e);
      };
      for (const it of themeItems) {
        if (it.kind === "meta" || it.error || it.userStyled) continue;
        if (it.overlap && it.absLc < floorFor(it)) addOverlap(it, it.bgSurface, it.absLc, it.fg, it.bg);
        for (const o of it.overlaps || []) if (Math.abs(o.lc) < floorFor(it)) addOverlap(it, o.surface, Math.abs(o.lc), it.fg, o.bg);
      }
      report.overlaps = report.overlaps || {};
      report.overlaps[theme] = [...overlapByRole.values()].sort((a, b) => a.key.localeCompare(b.key));
      report.failures[theme] = fails.map((f) => ({
        pass: f.label, case: f.case, host: f.host, kind: f.kind, role: f.role, path: f.path, text: f.text,
        fontSize: f.fontSize, fg: f.fg, bg: f.bg, lc: f.lc, renderedLc: f.renderedLc, floor: floorFor(f), rect: f.rect, edge: f.edge,
      }));

      let newFails = fails;
      if (!gated && baseline) {
        // Grandfathered theme: only a role that was not already under its
        // floor when the baseline was recorded, or one that got worse than
        // the recorded minimum by more than 2 Lc, fails.
        const known = new Map(baseline.roles.map((r) => [`${r.kind}:${r.role}`, r.minLc]));
        newFails = fails.filter((f) => {
          const k = `${f.kind}:${f.role}`;
          return !known.has(k) || f.absLc < known.get(k) - 2;
        });
      }
      report.gated[theme] = { gated, baseline: baseline?.file || null, failures: fails.length, newFailures: newFails.length };
      if ((gated && fails.length) || (!gated && baseline && newFails.length)) exitCode = 1;

      mdParts.push(`## ${theme} — ${gated ? "gated" : baseline ? `grandfathered (${baseline.file.replace(ROOT + "/", "")})` : "report only"}`);
      mdParts.push("");
      mdParts.push(
        mdTable(report.summary[theme], [
          ["role", (r) => r.key],
          ["n", (r) => r.n],
          ["min |Lc|", (r) => fmt(r.minLc)],
          ["median |Lc|", (r) => fmt(r.medianLc)],
          ["floor", (r) => (r.floor == null ? "—" : r.floor)],
          ["ok", (r) => (r.floor == null ? "—" : r.minLc >= r.floor ? "yes" : "**no**")],
          ["worst (fg on bg)", (r) => `${r.fg} on ${r.bg} — ${r.worst}`],
        ]),
      );
      mdParts.push("");
      if (report.overlaps[theme].length) {
        mdParts.push(`Overlaps under floor (drawn over a surface the role is not designed for; reported, not gated):`);
        mdParts.push("");
        mdParts.push(
          mdTable(report.overlaps[theme], [
            ["role over surface", (o) => o.key],
            ["n", (o) => o.n],
            ["min |Lc|", (o) => fmt(o.minLc)],
            ["example", (o) => o.example],
          ]),
        );
        mdParts.push("");
      }
      if (fails.length) {
        mdParts.push(`${fails.length} item(s) under floor${!gated && baseline ? `, ${newFails.length} new` : ""}:`);
        mdParts.push("");
        mdParts.push(
          mdTable(newFails.length ? newFails : fails.slice(0, 40), [
            ["pass", (f) => f.label],
            ["case", (f) => f.case + (f.host ? "@" + f.host : "")],
            ["role", (f) => `${f.kind}:${f.role}`],
            ["element", (f) => `${f.path}${f.text ? ` "${f.text}"` : ""}`],
            ["fg on bg", (f) => `${f.fg} on ${f.bg}`],
            ["Lc", (f) => fmt(f.lc)],
            ["floor", (f) => floorFor(f)],
          ]),
        );
        mdParts.push("");
      }
    }
    const md = mdParts.join("\n");
    if (args.md) {
      mkdirSync(dirname(resolve(args.md)), { recursive: true });
      writeFileSync(resolve(args.md), md);
    }
    if (args.json) {
      mkdirSync(dirname(resolve(args.json)), { recursive: true });
      writeFileSync(resolve(args.json), JSON.stringify(report, null, 2));
    }
    if (!args.measure) process.stdout.write(md + "\n");
    for (const theme of args.themes) {
      const g = report.gated[theme];
      log(`${theme}: ${g.failures} under floor${g.baseline ? `, ${g.newFailures} new vs baseline` : ""} (${g.gated ? "gated" : "not gated"})`);
    }
  } finally {
    await browser.close();
    if (stopServer) stopServer();
  }
  process.exit(args.measure ? 0 : exitCode);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
