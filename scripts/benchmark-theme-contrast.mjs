#!/usr/bin/env node
// Benchmark (ADR 0004, step 5): the same sequence rendered by zenuml
// theme-dark (DOM and SVG), Mermaid's dark theme, PlantUML's dark mode and
// D2's dark theme, measured with the same sampler as the audit
// (scripts/theme-contrast): every <text> is a text item, every stroked shape a
// line item, each against the background sampled from the screenshot.
//
// Usage:
//   node scripts/benchmark-theme-contrast.mjs --base-url http://127.0.0.1:14000 \
//     --plantuml-jar <path> --d2 <path> [--mermaid <esm url or path>] \
//     --out docs/ux-research/evidence/theme-dark/benchmark.json [--shots <dir>]
//
// Mermaid is loaded from the npm ESM build (jsdelivr) at a pinned version
// unless --mermaid points at a local file; PlantUML renders with `-darkmode`
// (`java -jar plantuml.jar -tsvg -darkmode`); D2 renders with
// `--theme 200` ("Dark Mauve", D2's first dark theme).

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { launchBrowser, openPage, renderDomCase, renderSvgCase, walkAndMeasure } from "./theme-contrast/browser.mjs";
import { floorFor } from "./theme-contrast/roles.mjs";

const MERMAID_VERSION = "12.2.0";

function parseArgs(argv) {
  const a = {
    baseUrl: "http://127.0.0.1:14000",
    plantumlJar: null,
    d2: null,
    mermaid: `https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.esm.min.mjs`,
    out: null,
    shots: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = () => argv[++i];
    if (k === "--base-url") a.baseUrl = v();
    else if (k === "--plantuml-jar") a.plantumlJar = v();
    else if (k === "--d2") a.d2 = v();
    else if (k === "--mermaid") a.mermaid = v();
    else if (k === "--out") a.out = v();
    else if (k === "--shots") a.shots = v();
    else throw new Error(`unknown option ${k}`);
  }
  return a;
}

// One sequence, four dialects. Same participants, same messages, one alt
// fragment with a condition, one note/comment, one self call, one return.
const SEQUENCE = {
  zenuml: `// Order placement
Client.placeOrder(cart) {
  Orders.validate(cart) {
    Inventory.reserve(items)
    if (inStock) {
      Payments.charge(total)
      return receipt
    } else {
      return backorder
    }
  }
  Orders.notify()
}`,
  mermaid: `sequenceDiagram
  participant Client
  participant Orders
  participant Inventory
  participant Payments
  Note over Client: Order placement
  Client->>Orders: placeOrder(cart)
  activate Orders
  Orders->>Inventory: reserve(items)
  alt inStock
    Orders->>Payments: charge(total)
    Payments-->>Orders: receipt
  else
    Orders-->>Client: backorder
  end
  Orders->>Orders: notify()
  deactivate Orders`,
  plantuml: `@startuml
participant Client
participant Orders
participant Inventory
participant Payments
note over Client: Order placement
Client -> Orders: placeOrder(cart)
activate Orders
Orders -> Inventory: reserve(items)
alt inStock
  Orders -> Payments: charge(total)
  Payments --> Orders: receipt
else
  Orders --> Client: backorder
end
Orders -> Orders: notify()
deactivate Orders
@enduml`,
  d2: `shape: sequence_diagram
Client
Orders
Inventory
Payments
note: Order placement
Client -> Orders: placeOrder(cart)
Orders -> Inventory: reserve(items)
inStock: {
  Orders -> Payments: charge(total)
  Payments -> Orders: receipt
}
else: {
  Orders -> Client: backorder
}
Orders -> Orders: notify()`,
};

function summarise(items) {
  const texts = items.filter((i) => i.kind === "text" && !i.error);
  const lines = items.filter((i) => i.kind === "line" && !i.error);
  const stats = (list) => {
    if (!list.length) return { n: 0 };
    const abs = list.map((i) => i.absLc).sort((a, b) => a - b);
    return {
      n: abs.length,
      min: +abs[0].toFixed(1),
      median: +abs[Math.floor(abs.length / 2)].toFixed(1),
      max: +abs[abs.length - 1].toFixed(1),
      underFloor: list.filter((i) => i.absLc < floorFor(i)).length,
      worst: list.slice().sort((a, b) => a.absLc - b.absLc)[0],
    };
  };
  const t = stats(texts);
  const l = stats(lines);
  const strip = (w) => (w ? { text: w.text, fg: w.fg, bg: w.bg, lc: +w.lc.toFixed(1), fontSize: w.fontSize, path: w.path } : null);
  return { text: { ...t, worst: strip(t.worst) }, line: { ...l, worst: strip(l.worst) } };
}

async function measureSvgMarkup(page, svg, label, args, bodyBg) {
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:${bodyBg};}</style></head><body><div id="out">${svg}</div></body></html>`,
  );
  await page.waitForTimeout(300);
  const measured = await walkAndMeasure(page, 1, { mode: "svg", rootSelector: "#out > svg" });
  if (args.shots) writeFileSync(resolve(args.shots, `${label}.png`), measured.screenshot);
  return measured.items;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.shots) mkdirSync(resolve(args.shots), { recursive: true });
  const browser = await launchBrowser();
  const { page, ctx } = await openPage(browser, { dpr: 1 });
  const results = {};
  try {
    // zenuml DOM
    await renderDomCase(page, args.baseUrl, SEQUENCE.zenuml, "theme-dark");
    let m = await walkAndMeasure(page, 1, { mode: "dom" });
    if (args.shots) writeFileSync(resolve(args.shots, "zenuml-dom.png"), m.screenshot);
    results["zenuml theme-dark (DOM)"] = { ...summarise(m.items), source: "@zenuml/core theme-dark, DOM renderer" };

    // zenuml SVG
    await renderSvgCase(page, args.baseUrl, SEQUENCE.zenuml, "theme-dark");
    m = await walkAndMeasure(page, 1, { mode: "svg", rootSelector: "#svg-output > svg" });
    if (args.shots) writeFileSync(resolve(args.shots, "zenuml-svg.png"), m.screenshot);
    results["zenuml theme-dark (SVG)"] = { ...summarise(m.items), source: "@zenuml/core theme-dark, renderToSvg" };

    // Mermaid dark
    {
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#333;}</style></head><body><pre id="m" class="mermaid"></pre></body></html>`);
      const mermaidSrc = args.mermaid.startsWith("http") ? args.mermaid : `file://${resolve(args.mermaid)}`;
      const svg = await page.evaluate(
        async ([src, code]) => {
          const mod = await import(src);
          const mermaid = mod.default;
          mermaid.initialize({ startOnLoad: false, theme: "dark" });
          const { svg } = await mermaid.render("bench", code);
          return svg;
        },
        [mermaidSrc, SEQUENCE.mermaid],
      );
      // Mermaid's dark theme assumes background #333 (theme-dark.js `background`).
      const items = await measureSvgMarkup(page, svg, "mermaid-dark", args, "#333");
      results[`Mermaid ${MERMAID_VERSION} theme dark`] = { ...summarise(items), source: `mermaid@${MERMAID_VERSION} initialize({ theme: "dark" }), page background #333 (theme-dark.js background)` };
    }

    // PlantUML dark mode
    if (args.plantumlJar) {
      const svg = execFileSync("java", ["-jar", resolve(args.plantumlJar), "-tsvg", "-darkmode", "-pipe"], {
        input: SEQUENCE.plantuml,
        maxBuffer: 16 * 1024 * 1024,
      }).toString();
      const version = execFileSync("java", ["-jar", resolve(args.plantumlJar), "-version"]).toString().split("\n")[0];
      // PlantUML -darkmode paints its own background inside the SVG.
      const bgMatch = svg.match(/style="background:(#[0-9a-fA-F]{6})/);
      const items = await measureSvgMarkup(page, svg, "plantuml-dark", args, bgMatch ? bgMatch[1] : "#000");
      results["PlantUML -darkmode"] = { ...summarise(items), source: `${version}, java -jar plantuml.jar -tsvg -darkmode` };
    }

    // D2 dark theme
    if (args.d2) {
      const svg = execFileSync(resolve(args.d2), ["--theme", "200", "--pad", "20", "-", "-"], {
        input: SEQUENCE.d2,
        maxBuffer: 16 * 1024 * 1024,
      }).toString();
      const version = execFileSync(resolve(args.d2), ["--version"]).toString().trim();
      const items = await measureSvgMarkup(page, svg, "d2-dark", args, "#1f1f1f");
      results[`D2 ${version} theme 200 (Dark Mauve)`] = { ...summarise(items), source: `d2 ${version} --theme 200` };
    }
  } finally {
    await ctx.close();
    await browser.close();
  }

  const rows = Object.entries(results).map(([name, r]) => ({ name, ...r }));
  const md = [
    "| renderer | text n | text min Lc | text median | text under floor | line n | line min Lc | line median | line under floor | worst text |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map(
      (r) =>
        `| ${r.name} | ${r.text.n} | ${r.text.min ?? ""} | ${r.text.median ?? ""} | ${r.text.underFloor ?? ""} | ${r.line.n} | ${r.line.min ?? ""} | ${r.line.median ?? ""} | ${r.line.underFloor ?? ""} | ${r.text.worst ? `${r.text.worst.fg} on ${r.text.worst.bg} "${r.text.worst.text}"` : ""} |`,
    ),
  ].join("\n");
  const out = { generated: new Date().toISOString(), sequence: SEQUENCE, floors: "text 75 (12px: 90), lines 45", results, markdown: md };
  if (args.out) {
    mkdirSync(dirname(resolve(args.out)), { recursive: true });
    writeFileSync(resolve(args.out), JSON.stringify(out, null, 2));
  }
  process.stdout.write(md + "\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
