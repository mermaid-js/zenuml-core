#!/usr/bin/env node
// Chrome token gates for ADR 0003 (docs/adr/0003-borrow-claude-design-values.md).
//
// Gate 1: every `--zu-*` custom property is declared in src/assets/tailwind.css,
//         inside a `.zenuml` rule (never `:root`), and ends with an origin comment:
//         `/* src: <prettified artifact>:<line> */` naming a copy recorded in
//         docs/ux-research/evidence/provenance.json, or `/* zenuml-owned */`.
//         No other file under src/ declares a `--zu-*` property (consuming one
//         through var() is fine).
// Gate 2: the chrome files listed in scripts/ux-research/chrome-files.txt use no
//         one-off radius or shadow: no `rounded-[…]`, `shadow-[…]`, `duration-[…]`,
//         `ease-[…]`, and no stock Tailwind `rounded`, `rounded-{sm,md,lg,xl,2xl,3xl}`
//         or `shadow`, `shadow-{sm,md,lg,xl,2xl,inner}`. `rounded-full`, `rounded-none`,
//         `shadow-none` and every `*-zu-*` utility are allowed.
//
// Usage: node scripts/check-zu-tokens.mjs            (exit 1 on any finding)
//        import { runChecks } from "./check-zu-tokens.mjs"  (returns the findings)

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOKENS_FILE = "src/assets/tailwind.css";
const PROVENANCE = "docs/ux-research/evidence/provenance.json";
const CHROME_LIST = "scripts/ux-research/chrome-files.txt";

const DECL_RE = /--zu-[a-z0-9-]+\s*:/;
const ORIGIN_RE =
  /\/\*\s*(?:src:\s*([A-Za-z0-9_.-]+\.pretty\.css):(\d+)|zenuml-owned)\s*\*\/\s*$/;
// Stock or arbitrary radius / shadow / motion utilities, with any variant prefix.
const ONE_OFF_RE =
  /(?<![\w-])(?:[a-z-]+:)*(?:(?:rounded|shadow|duration|ease|ring)-\[|rounded(?:-(?:sm|md|lg|xl|2xl|3xl))?(?![\w-])|shadow(?:-(?:sm|md|lg|xl|2xl|inner))?(?![\w-]))/g;

function listFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) listFiles(p, out);
    else if (/\.(tsx?|jsx?|css|scss)$/.test(name) && !/\.(spec|stories)\./.test(name))
      out.push(p);
  }
  return out;
}

function knownArtifacts() {
  const prov = JSON.parse(readFileSync(join(ROOT, PROVENANCE), "utf8"));
  return new Set((prov.prettified_copies?.files ?? []).map((f) => f.file));
}

// Innermost selector must be a `.zenuml` compound with an optional attribute
// selector, optionally preceded by ancestors: `.zenuml`, `.zenuml[data-x="y"]`,
// `[data-x="y"] .zenuml`. A selector list qualifies only if every member does.
const ZENUML_SELECTOR_RE = /^(?:[^,{}]*\s)?\.zenuml(?:\[[^\]]*\])*$/;
function isZenumlSelector(rule) {
  const parts = rule.split(",").map((p) => p.trim());
  return parts.length > 0 && parts.every((p) => !p.includes(":root") && ZENUML_SELECTOR_RE.test(p));
}

function checkDeclarations(errors) {
  const artifacts = knownArtifacts();
  const text = readFileSync(join(ROOT, TOKENS_FILE), "utf8");
  const lines = text.split("\n");
  // Minimal rule tracker: the selector text that opened each `{` still open.
  const stack = [];
  let pending = "";
  let declared = 0;
  let inComment = false;
  lines.forEach((raw, i) => {
    const lineNo = i + 1;
    if (DECL_RE.test(raw)) {
      declared += 1;
      const rule = stack.length ? stack[stack.length - 1] : "(top level)";
      if (!isZenumlSelector(rule)) {
        errors.push(
          `${TOKENS_FILE}:${lineNo}: --zu-* token declared under "${rule.trim()}"; only ".zenuml" (optionally with attribute selectors or ancestors) is allowed`,
        );
      }
      const m = raw.match(ORIGIN_RE);
      if (!m) {
        errors.push(
          `${TOKENS_FILE}:${lineNo}: token has no origin comment (/* src: <file>:<line> */ or /* zenuml-owned */)`,
        );
      } else if (m[1] && !artifacts.has(m[1])) {
        errors.push(
          `${TOKENS_FILE}:${lineNo}: origin "${m[1]}" is not a prettified copy listed in ${PROVENANCE}`,
        );
      }
    }
    // Track rule nesting; block comments (single or multi-line) never count.
    let j = 0;
    while (j < raw.length) {
      if (inComment) {
        const end = raw.indexOf("*/", j);
        if (end < 0) break;
        inComment = false;
        j = end + 2;
        continue;
      }
      if (raw.startsWith("/*", j)) {
        inComment = true;
        j += 2;
        continue;
      }
      const ch = raw[j];
      if (ch === "{") {
        stack.push(pending.trim());
        pending = "";
      } else if (ch === "}") {
        stack.pop();
        pending = "";
      } else if (ch === ";") {
        pending = "";
      } else {
        pending += ch;
      }
      j += 1;
    }
    if (!inComment) pending += " ";
  });
  if (declared === 0) errors.push(`${TOKENS_FILE}: no --zu-* tokens declared`);
  // No declarations anywhere else under src/.
  for (const file of listFiles(join(ROOT, "src"))) {
    const rel = relative(ROOT, file);
    if (rel === TOKENS_FILE) continue;
    const src = readFileSync(file, "utf8");
    src.split("\n").forEach((l, i) => {
      if (DECL_RE.test(l) && !/var\(--zu-/.test(l)) {
        errors.push(`${rel}:${i + 1}: --zu-* token declared outside ${TOKENS_FILE}`);
      }
    });
  }
}

function chromeFiles() {
  const list = readFileSync(join(ROOT, CHROME_LIST), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const files = [];
  for (const entry of list) {
    const abs = join(ROOT, entry);
    if (!existsSync(abs)) continue;
    if (statSync(abs).isDirectory()) files.push(...listFiles(abs));
    else files.push(abs);
  }
  return files;
}

function checkOneOffs(errors) {
  for (const file of chromeFiles()) {
    const rel = relative(ROOT, file);
    const src = readFileSync(file, "utf8");
    src.split("\n").forEach((l, i) => {
      // Only class strings matter; skip import lines and comments.
      if (/^\s*(import|\/\/|\*)/.test(l)) return;
      const hits = l.match(ONE_OFF_RE);
      if (hits) {
        errors.push(`${rel}:${i + 1}: one-off radius/shadow/motion utility ${[...new Set(hits)].join(", ")}; use a *-zu-* utility`);
      }
    });
  }
}

export function runChecks() {
  const errors = [];
  checkDeclarations(errors);
  checkOneOffs(errors);
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = runChecks();
  if (errors.length) {
    console.error(`check-zu-tokens: ${errors.length} finding(s)`);
    for (const e of errors) console.error("  " + e);
    process.exit(1);
  }
  console.log("check-zu-tokens: ok");
}
