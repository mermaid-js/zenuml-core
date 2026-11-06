#!/usr/bin/env node
// Transcribe docs/ux-research/evidence/theme-dark/derive-dark.json into
//   - the `.theme-dark, .theme-clean-dark, .theme-darcula` block in src/assets/tailwind.css
//   - the theme-dark focus tokens on `.zenuml` in the same file
//   - the DARK_PALETTE object in src/svg/themes.ts
// Idempotent; run after scripts/theme-contrast/derive-dark.mjs.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const derived = JSON.parse(readFileSync(resolve(ROOT, "docs/ux-research/evidence/theme-dark/derive-dark.json"), "utf8"));
const T = Object.fromEntries(Object.entries(derived.tokens).map(([k, v]) => [k, v]));

// 1. CSS blocks: the theme block, and the focus tokens on the inner .zenuml
//    (it declares the --zu-* tokens again, so the theme block cannot reach them)
{
  const file = resolve(ROOT, "src/assets/tailwind.css");
  let css = readFileSync(file, "utf8");
  // --zu-* lines also carry the origin marker the ADR 0003 token gate requires.
  const line = (indent) => ([name, t]) => {
    const c = t.lc != null ? `Lc ${t.lc} on ${t.bg}, floor ${t.floor}` : t.origin || "";
    const owned = name.startsWith("--zu-") ? " /* zenuml-owned */" : "";
    return `${indent}${name}: ${t.value};${c ? ` /* ${c} */` : ""}${owned}`;
  };
  const replaceBlock = (open, close, lines) => {
    const start = css.indexOf(open);
    const end = css.indexOf(close, start);
    if (start < 0 || end < 0) throw new Error(`block ${JSON.stringify(open)} not found in tailwind.css`);
    css = css.slice(0, start + open.length) + lines.join("\n") + css.slice(end);
  };
  const entries = Object.entries(T);
  replaceBlock("  .theme-darcula {\n", "\n  }\n", entries.filter(([, t]) => t.scope !== "zenuml").map(line("    ")));
  replaceBlock(".theme-dark .zenuml, .theme-clean-dark .zenuml, .theme-darcula .zenuml {\n", "\n}\n", entries.filter(([, t]) => t.scope === "zenuml").map(line("  ")));
  writeFileSync(file, css);
}

// 2. SVG palette
{
  const file = resolve(ROOT, "src/svg/themes.ts");
  const ts = readFileSync(file, "utf8");
  const open = "const DARK_PALETTE: SvgPalette = {\n";
  const start = ts.indexOf(open);
  const end = ts.indexOf("\n};\n", start);
  if (start < 0 || end < 0) throw new Error("DARK_PALETTE not found in themes.ts");
  const v = (k) => T[k].value;
  const transparent = (k) => v(k) === "transparent";
  const body = [
    `  frameBorder: "${v("--color-border-frame")}",`,
    `  frameBg: "${v("--color-bg-frame")}",`,
    `  titleText: "${v("--color-text-title")}",`,
    `  participantBg: "${v("--color-bg-participant")}",`,
    `  participantBorder: "${v("--color-border-participant")}",`,
    `  lifeline: "${v("--color-border-base")}",`,
    `  participantText: "${v("--color-text-participant")}",`,
    `  messageArrow: "${v("--color-message-arrow")}",`,
    `  messageText: "${v("--color-text-message")}",`,
    `  occurrenceBg: "${v("--color-bg-occurrence")}",`,
    `  occurrenceBorder: "${v("--color-border-occurrence")}",`,
    `  fragmentBorder: "${v("--color-border-fragment")}",`,
    `  fragmentHeaderBg: "${v("--color-bg-fragment-header")}",`,
    `  fragmentHeaderOpacity: "1",`,
    `  fragmentHeaderText: "${v("--color-text-fragment-header")}",`,
    `  fragmentText: "${v("--color-text-fragment")}",`,
    `  guardOpacity: "${v("--opacity-guard")}",`,
    `  fragmentSeparator: "${v("--color-border-fragment-separator")}",`,
    `  commentText: "${v("--color-text-comment")}",`,
    `  commentOpacity: "${v("--opacity-comment")}",`,
    `  groupOutline: "${v("--color-border-group")}",`,
    `  dividerLine: "${v("--color-border-divider")}",`,
    `  dividerBg: "${v("--color-bg-divider")}",`,
    `  dividerText: "${v("--color-text-divider")}",`,
    `  numberText: "${v("--color-text-number")}",`,
    `  fragmentNumberText: "${v("--color-text-fragment-number")}",`,
    `  // ${transparent("--color-bg-number") ? "No badge: the slot is transparent, so the fill colour is irrelevant at opacity 0." : "Badge fill."}`,
    `  numberBg: "${transparent("--color-bg-number") ? v("--color-text-number") : v("--color-bg-number")}",`,
    `  numberBgOpacity: "${transparent("--color-bg-number") ? "0" : "1"}",`,
    `  guardText: "${v("--color-text-guard")}",`,
    `  fontFamily: DIAGRAM_FONT_STACK,`,
  ];
  writeFileSync(file, ts.slice(0, start + open.length) + body.join("\n") + ts.slice(end));
}
console.log("applied derive-dark.json to tailwind.css and themes.ts");
