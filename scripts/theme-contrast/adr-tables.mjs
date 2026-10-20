#!/usr/bin/env node
// Print the ADR 0004 evidence tables from the JSON files under
// docs/ux-research/evidence/theme-dark/ so the ADR never retypes a number.
//
// Usage: node scripts/theme-contrast/adr-tables.mjs [measure|hosts|tokens|tints|audit|benchmark|host-sample|all]

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const E = resolve(ROOT, "docs/ux-research/evidence/theme-dark");
const load = (f) => (existsSync(resolve(E, f)) ? JSON.parse(readFileSync(resolve(E, f), "utf8")) : null);
const fmt = (n, d = 1) => (n == null || Number.isNaN(n) ? "—" : Number(n).toFixed(d));
const table = (cols, rows) =>
  [`| ${cols.map((c) => c[0]).join(" | ")} |`, `| ${cols.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${cols.map((c) => c[1](r)).join(" | ")} |`)].join("\n");

const sections = {
  measure() {
    const m = load("measure-theme-default.json");
    const rows = m.measure["theme-default"].filter((r) => r.role !== "text-other");
    return table(
      [
        ["role", (r) => r.key],
        ["n", (r) => r.n],
        ["fg", (r) => r.fg],
        ["bg", (r) => r.bg],
        ["fg OKLCH", (r) => r.fgOklch],
        ["ΔL from bg", (r) => (r.dL >= 0 ? "+" : "") + r.dL.toFixed(3)],
        ["Lc", (r) => fmt(r.lc)],
        ["floor", (r) => (r.floor == null ? "—" : r.floor)],
      ],
      rows,
    );
  },
  hosts() {
    const h = load("hosts.json");
    const rows = [];
    for (const [name, host] of Object.entries(h.hosts)) {
      for (const [token, value] of Object.entries(host.tokens)) rows.push({ host: name, token, value });
    }
    return table([["host", (r) => r.host], ["token", (r) => `\`${r.token}\``], ["value", (r) => `\`${r.value}\``]], rows);
  },
  tokens() {
    const d = load("derive-dark.json");
    const rows = Object.entries(d.tokens).map(([name, t]) => ({ name, ...t }));
    return table(
      [
        ["token", (r) => `\`${r.name}\``],
        ["value", (r) => `\`${r.value}\``],
        ["OKLCH", (r) => r.oklch || "—"],
        ["measured against", (r) => r.bg || "—"],
        ["Lc", (r) => fmt(r.lc)],
        ["floor", (r) => r.floor ?? "—"],
        ["note", (r) => r.origin || (r.mirroredStart ? `mirrored start ${r.mirroredStart}` : "")],
      ],
      rows,
    );
  },
  tints() {
    const d = load("derive-dark.json");
    const t = d.httpTints;
    const rows = Object.entries(t.table).map(([verb, v]) => ({ verb, ...v }));
    return (
      table(
        [
          ["verb", (r) => r.verb.toUpperCase()],
          ["hex", (r) => `\`${r.hex}\``],
          ["Lc on canvas", (r) => fmt(r.lc)],
          ["deuteranopia", (r) => `\`${r.deuteranopia.hex}\` Lc ${fmt(r.deuteranopia.lc)}`],
          ["protanopia", (r) => `\`${r.protanopia.hex}\` Lc ${fmt(r.protanopia.lc)}`],
        ],
        rows,
      ) + `\n\nMinimum pairwise Lc separation under either simulation: ${t.minPairwiseLcSeparationUnderCvd} (required ≥ 8).`
    );
  },
  audit() {
    const a = load("audit-report.json");
    if (!a) return "(audit-report.json not found)";
    const passes = table(
      [
        ["pass", (p) => p.label],
        ["items", (p) => p.items],
        ["under floor", (p) => p.failures],
      ],
      a.passes,
    );
    const roles = (theme) =>
      table(
        [
          ["role", (r) => r.key],
          ["n", (r) => r.n],
          ["min Lc", (r) => fmt(r.minLc)],
          ["median Lc", (r) => fmt(r.medianLc)],
          ["floor", (r) => (r.floor == null ? "—" : r.floor)],
          ["meets floor", (r) => (r.floor == null ? "—" : r.minLc >= r.floor ? "yes" : "no")],
        ],
        a.summary[theme],
      );
    const overlaps = (theme) =>
      (a.overlaps?.[theme] || []).length
        ? table([["role over surface", (o) => o.key], ["n", (o) => o.n], ["min Lc", (o) => fmt(o.minLc)]], a.overlaps[theme])
        : "(none)";
    return `### Passes\n\n${passes}\n\n### theme-dark by role\n\n${roles("theme-dark")}\n\n### theme-dark overlaps (reported, not gated)\n\n${overlaps("theme-dark")}\n\n### theme-default by role (grandfathered baseline)\n\n${roles("theme-default")}`;
  },
  benchmark() {
    const b = load("benchmark.json");
    return b.markdown;
  },
  "host-sample"() {
    const h = load("host-sample.json");
    if (!h) return "(host-sample.json not found)";
    const rows = Object.entries(h.summary).map(([k, s]) => ({ key: k, ...s }));
    return (
      `Page: ${h.url}\nHost colour mode: ${h.hostColorMode}; host body ${h.hostBodyBackground}; macro iframe body ${h.iframeBodyBackground}; stale deployed rules removed: ${h.staleRulesRemoved}.\n${h.items} items, ${h.failures} under floor.\n\n` +
      table([["role", (r) => r.key], ["n", (r) => r.n], ["min Lc", (r) => fmt(r.minLc)], ["worst fg on bg", (r) => `${r.fg} on ${r.bg}`]], rows)
    );
  },
};

const argv = process.argv.slice(2);
const write = argv.includes("--write");
const which = argv.find((a) => a !== "--write") || "all";
const names = which === "all" ? Object.keys(sections) : [which];
if (write) {
  // Replace every `<!-- TABLES:x --> … <!-- /TABLES:x -->` block in the ADR.
  const adrFile = resolve(ROOT, "docs/adr/0004-theme-dark.md");
  let adr = readFileSync(adrFile, "utf8");
  for (const n of names) {
    const re = new RegExp(`(<!-- TABLES:${n} -->\\n)[\\s\\S]*?(\\n<!-- /TABLES:${n} -->)`);
    if (!re.test(adr)) throw new Error(`no TABLES:${n} markers in the ADR`);
    adr = adr.replace(re, `$1${sections[n]()}$2`);
  }
  writeFileSync(adrFile, adr);
  process.stdout.write(`spliced ${names.join(", ")} into ${adrFile}\n`);
} else {
  for (const n of names) {
    if (!sections[n]) throw new Error(`unknown section ${n}`);
    process.stdout.write(`<!-- ${n} -->\n${sections[n]()}\n\n`);
  }
}
