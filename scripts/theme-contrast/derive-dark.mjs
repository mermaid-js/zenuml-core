#!/usr/bin/env node
// Derive the theme-dark palette (ADR 0004, step 3).
//
// Inputs: the measured theme-default roles (scripts/audit-theme-contrast.mjs
// --measure, saved as docs/ux-research/evidence/theme-dark/measure-theme-default.json)
// and the host surfaces (hosts.json). Method:
//   1. canvas = nearest neutral (chroma 0) to the Atlassian dark surface.
//   2. every role starts at the light theme's OKLCH lightness distance from
//      its background, mirrored onto the canvas (darker-than-bg becomes
//      lighter-than-bg), chroma 0.
//   3. each role is then moved away from its composited background in 0.005 L
//      steps until it clears its APCA floor plus a 1 Lc margin. Text that sits
//      on a filled surface (fragment label, divider label, HTTP verbs) is solved
//      after the fill, trying both polarities and keeping the better one; when
//      neither clears, the fill is lightened until dark text does.
//   4. GET/POST/DELETE keep a hue each but are separated by lightness so their
//      Lc on the code background differs pairwise by >= 8 under deuteranopia
//      and protanopia simulation (Machado 2009).
// Output: derive-dark.json (every token with its Lc) and the CSS/SVG values
// on stdout, which src/assets/tailwind.css and src/svg/themes.ts transcribe.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { apcaContrast } from "../color/apca.mjs";
import { simulateCvd } from "../color/cvd.mjs";
import { formatOklch, inSrgbGamut, oklchToHex, srgbToOklch } from "../color/oklch.mjs";
import { parseColor, srgbToLinear, toHex } from "../color/srgb.mjs";
import { FLOORS } from "./roles.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const EVIDENCE = resolve(ROOT, "docs/ux-research/evidence/theme-dark");
// Lc above the floor: antialiased edge pixels of a neighbouring surface (a
// nested bar half a pixel off at 2x) read a few Lc worse than the solid colour.
const MARGIN = 3;

const measure = JSON.parse(readFileSync(resolve(EVIDENCE, "measure-theme-default.json"), "utf8"));
const hosts = JSON.parse(readFileSync(resolve(EVIDENCE, "hosts.json"), "utf8"));
const light = Object.fromEntries(measure.measure["theme-default"].map((r) => [r.key, r]));

const lc = (fg, bg) => Math.abs(apcaContrast(fg, bg));
const grey = (L) => oklchToHex({ L: Math.max(0, Math.min(1, L)), C: 0, h: 0 });
const Lof = (hex) => srgbToOklch(hex).L;

/** Lightest neutral with the lightness of `hex`. */
function nearestNeutral(hex) {
  return grey(Lof(hex));
}

/**
 * Move a grey away from `bg` (direction +1 lighter, -1 darker) from `startL`
 * until lc >= floor + MARGIN. Returns null when the gamut runs out first.
 */
function solveGrey(startL, bg, floor, direction) {
  for (let L = Math.max(0, Math.min(1, startL)); L >= 0 && L <= 1; L += 0.005 * direction) {
    const hex = grey(L);
    if (lc(hex, bg) >= floor + MARGIN) return hex;
  }
  return null;
}

/** Mirror the light theme's ΔL of `key` onto `bgL`: darker-than-bg becomes lighter-than-bg. */
function mirrored(key, bgL) {
  const row = light[key];
  if (!row) throw new Error(`no measured role ${key}`);
  return Math.min(1, bgL + Math.abs(row.dL));
}

const out = { generated: new Date().toISOString(), method: "see derive-dark.mjs header", tokens: {}, notes: [] };
const note = (s) => out.notes.push(s);

// 1. Canvas.
const atlassian = hosts.hosts.atlassian.tokens["elevation.surface"];
const canvas = nearestNeutral(atlassian);
out.canvas = {
  atlassianSurface: atlassian,
  atlassianOklch: formatOklch(srgbToOklch(atlassian)),
  canvas,
  canvasOklch: formatOklch(srgbToOklch(canvas)),
  otherHosts: {
    github: hosts.hosts.github.tokens["--bgColor-default"],
    vscode: hosts.hosts.vscode.tokens["dark_modern editor.background"],
    mermaid: hosts.hosts.mermaid.tokens["background"],
  },
};
const bgL = Lof(canvas);
const token = (name, value, role, bg, floor, extra = {}) => {
  const opaque = value !== "transparent";
  out.tokens[name] = {
    value, role, bg,
    lc: bg && opaque ? +lc(value, bg).toFixed(1) : null,
    floor,
    oklch: opaque ? formatOklch(srgbToOklch(value)) : null,
    ...extra,
  };
  return value;
};
// The canvas is the derivation's base (out.canvas) but is not emitted as a
// token: the outer padding ring is transparent and host-owned (ADR 0004
// update, 2026-10-21), so theme-dark leaves --color-bg-canvas unset.
token("--color-bg-frame", canvas, "fill:frame", null, null, { origin: "= canvas, as theme-default" });
token("--color-bg-participant", canvas, "fill:participant-fill", null, null, { origin: "= frame, as theme-default (edge carried by the border)" });

// Shared solvers ------------------------------------------------------------
const fill = (name, key, floor = FLOORS.fill) => {
  const start = mirrored(key, bgL);
  const hex = solveGrey(start, canvas, floor, +1);
  return token(name, hex, key, canvas, floor, { mirroredStart: grey(start) });
};
// `bg` is the surface the line must clear; the mirrored start is always taken
// from the frame, which is where the light theme's distance was measured.
const line = (name, key, bg = canvas) => {
  const start = mirrored(key, bgL);
  const hex = solveGrey(start, bg, FLOORS.line, +1);
  return token(name, hex, key, bg, FLOORS.line, { mirroredStart: grey(start) });
};
const text = (name, key, floor = FLOORS.text, bg = canvas) => {
  const start = mirrored(key, Lof(bg));
  const hex = solveGrey(start, bg, floor, +1);
  return token(name, hex, key, bg, floor, { mirroredStart: grey(start) });
};
/**
 * A filled surface that carries text: the fill clears the fill floor against
 * the canvas, then the text is tried light (from white down) and dark (from
 * black up). On this canvas a band at Lc 30 is a mid grey on which neither
 * polarity clears Lc 75, so the band is lightened until dark text does: a
 * light chip. Returns { fill, text, polarity }.
 */
const chip = (fillKey, textFloor = FLOORS.text) => {
  const start = mirrored(fillKey, bgL);
  let hex = solveGrey(start, canvas, FLOORS.fill, +1);
  const lightText = solveGrey(1, hex, textFloor, -1);
  if (lightText && lc(lightText, hex) >= textFloor + MARGIN) return { fill: hex, text: lightText, polarity: "light", mirroredStart: grey(start), bandAtFloor: hex };
  const bandAtFloor = hex;
  let dark = null;
  for (let L = Lof(hex); L <= 1 && !dark; L += 0.005) {
    hex = grey(L);
    dark = solveGrey(0, hex, textFloor, +1);
  }
  return { fill: hex, text: dark, polarity: "dark", mirroredStart: grey(start), bandAtFloor };
};

// 2. Fills against the frame.
const occurrence = fill("--color-bg-occurrence", "fill:occurrence");
token("--color-bg-comment-code", "transparent", "fill:comment-code", null, null, {
  origin: "no fill: theme-default's #f9f2f4 reads Lc 0 on white (a tint, not a surface); a painted code background would have to be a light chip to carry text at Lc 75",
});
token("--color-bg-comment-table-head", "transparent", "fill:comment-table-head", null, null, { origin: "no fill, as comment-code; the table keeps its borders" });

// 3. Lines against the frame (the gate samples the frame side of a border).
// The audit classifies a sampled pixel within 8 per channel of a surface as
// that surface, and Chromium antialiases the edge of a nested bar to a lighter
// blend (#898989 for #818181 on Linux), so lines that meet bars are solved
// against the lightest shade that still counts as the bar.
const SURFACE_TOLERANCE = 8;
const occurrenceEdge = toHex(parseColor(occurrence).map((c) => Math.min(255, c + SURFACE_TOLERANCE)));
// The lifeline (border-base) is drawn over occurrence bars (LifeLineLayer sits
// above the message layer), so border-base must also clear the bar's fill.
const border = line("--color-border-base", "line:frame-border", occurrenceEdge);
note(`border-base ${border}: Lc ${lc(border, occurrenceEdge).toFixed(1)} on the bar's antialiased edge ${occurrenceEdge} (fill ${occurrence} + ${SURFACE_TOLERANCE}; the lifeline crosses bars), Lc ${lc(border, canvas).toFixed(1)} on the frame.`);
token("--color-border-frame", border, "line:frame-border", canvas, FLOORS.line, { origin: "= border-base" });
token("--color-border-participant", border, "line:participant-border", canvas, FLOORS.line, { origin: "= border-base (also the lifeline)" });
token("--color-border-fragment", border, "line:fragment-border", canvas, FLOORS.line, { origin: "= border-base" });
token("--color-border-group", border, "line:group-outline", canvas, FLOORS.line, { origin: "= border-base" });
token("--color-outline-primary", border, "line:outline", canvas, FLOORS.line, { origin: "= border-base" });
// Nested occurrence bars overlap, so a border can sit on another bar's fill:
// solve it against the fill (the harder side); the frame side then clears too.
const occurrenceBorder = line("--color-border-occurrence", "line:occurrence-border", occurrenceEdge);
note(`occurrence border ${occurrenceBorder}: Lc ${lc(occurrenceBorder, occurrenceEdge).toFixed(1)} on the bar's antialiased edge ${occurrenceEdge} (nested bars), Lc ${lc(occurrenceBorder, canvas).toFixed(1)} on the frame.`);
line("--color-message-arrow", "line:message-line");
const separator = line("--color-border-fragment-separator", "line:separator");
token("--color-border-comment-table", separator, "line:comment-table", canvas, FLOORS.line, { origin: "= fragment separator" });

// 4. Chips: fragment header + label, divider box + label.
{
  // The band also carries the fragment's 12px sequence number, so the text
  // on it is solved to the small-text floor.
  const h = chip("fill:fragment-header", FLOORS.smallText);
  if (h.polarity === "dark") {
    note(`fragment header: a band that clears Lc ${FLOORS.fill} on ${canvas} is ${h.bandAtFloor}, on which white reads Lc ${lc("#ffffff", h.bandAtFloor).toFixed(1)} (< ${FLOORS.text}); the band is therefore a light chip ${h.fill} with dark text ${h.text}, light enough for its 12px number to clear Lc ${FLOORS.smallText}.`);
  }
  token("--color-bg-fragment-header", h.fill, "fill:fragment-header", canvas, FLOORS.fill, { mirroredStart: h.mirroredStart, polarity: h.polarity });
  token("--color-text-fragment-header", h.text, "text:fragment-label", h.fill, FLOORS.text);
  token("--color-text-fragment-number", h.text, "text:number", h.fill, FLOORS.smallText, { origin: "= text-fragment-header; the number sits in the band" });
  const rule = solveGrey(h.polarity === "dark" ? 0 : 1, h.fill, FLOORS.line, h.polarity === "dark" ? +1 : -1);
  token("--color-border-fragment-header-rule", rule, "line:fragment-header-rule", h.fill, FLOORS.line);
  // Dividers keep theme-default's note-box shape (box + rule lines).
  const d = chip("fill:divider-box");
  token("--color-bg-divider", d.fill, "fill:divider-box", canvas, FLOORS.fill, { mirroredStart: d.mirroredStart, polarity: d.polarity });
  token("--color-text-divider", d.text, "text:divider-text", d.fill, FLOORS.text);
  const dl = line("--color-border-divider", "line:divider-line");
  if (lc(dl, d.fill) < FLOORS.line) note(`divider rule ${dl} reads Lc ${lc(dl, d.fill).toFixed(1)} against the note box ${d.fill}; the rule is measured against the frame.`);
}

// 5. Text on the frame.
const base = text("--color-text-base", "text:message");
token("--color-text-title", base, "text:title", canvas, FLOORS.text, { origin: "= text-base" });
token("--color-text-participant", base, "text:participant", canvas, FLOORS.text, { origin: "= text-base" });
token("--color-text-message", base, "text:message", canvas, FLOORS.text, { origin: "= text-base" });
token("--color-text-link", base, "text:link", canvas, FLOORS.text, { origin: "= text-base" });
text("--color-text-fragment", "text:fragment-condition");
note(
  "fragment condition, try/catch section labels (opacity 0.65) and comments (opacity 0.5) are composited at their slot opacity; theme-dark sets --opacity-guard and --opacity-comment to 1 and carries the hierarchy in lightness instead: white at 0.5 over " +
    canvas + " is Lc " + lc(grey((1 + bgL) / 2), canvas).toFixed(1) + ", white at 0.65 is Lc " + lc(oklchToHex({ L: bgL + 0.65 * (1 - bgL), C: 0, h: 0 }), canvas).toFixed(1) + ".",
);
const comment = text("--color-text-comment", "text:comment");
token("--color-text-control", comment, "text:control", canvas, FLOORS.text, { origin: "= text-comment" });
text("--color-text-guard", "text:guard-keyword", FLOORS.smallText);
text("--color-text-number", "text:number", FLOORS.smallText);
token("--color-bg-number", "transparent", "fill:number-badge", null, null, {
  origin: "no badge fill: theme-default's gray-500/10 reads Lc 0 on white; a painted badge would have to be a light chip to carry 12px text at Lc 90",
});

// 6. HTTP verb tints on the canvas (comment code has no fill): a hue each,
//    lightness separates them under CVD.
{
  const hues = { get: 264, post: 150, delete: 25 };
  const bg = canvas;
  const candidates = {};
  // Chroma 0.09 where the gamut allows it, else the most the hue can carry at
  // that lightness (light blues and reds run out of sRGB first).
  const inGamutAt = (L, h) => {
    for (let C = 0.09; C >= 0.03; C -= 0.01) {
      const lab = { L, a: C * Math.cos((h * Math.PI) / 180), b: C * Math.sin((h * Math.PI) / 180) };
      if (inSrgbGamut(lab)) return { L, C, h };
    }
    return null;
  };
  for (const [verb, h] of Object.entries(hues)) {
    candidates[verb] = [];
    for (let L = 0.55; L <= 0.985; L += 0.005) {
      const lch = inGamutAt(L, h);
      if (!lch) continue;
      const hex = oklchToHex(lch);
      if (lc(hex, bg) >= FLOORS.text + MARGIN) candidates[verb].push(hex);
    }
  }
  const sep = (a, b, kind) => Math.abs(lc(simulateCvd(a, kind), simulateCvd(bg, kind)) - lc(simulateCvd(b, kind), simulateCvd(bg, kind)));
  const MIN_SEP = 8;
  let best = null;
  for (const g of candidates.get) for (const p of candidates.post) for (const d of candidates.delete) {
    const seps = [];
    for (const kind of ["deuteranopia", "protanopia"]) seps.push(sep(g, p, kind), sep(g, d, kind), sep(p, d, kind));
    const m = Math.min(...seps);
    // POST lightest, DELETE darkest (go / stop), then the widest separation.
    const ordered = Lof(p) > Lof(g) && Lof(g) > Lof(d);
    if (m >= MIN_SEP && ordered && (!best || m > best.m)) best = { g, p, d, m };
  }
  if (!best) throw new Error("no HTTP tint triple separates by Lc under CVD");
  token("--color-text-http-get", best.g, "text:http-method", bg, FLOORS.text, { hue: hues.get });
  token("--color-text-http-post", best.p, "text:http-method", bg, FLOORS.text, { hue: hues.post });
  token("--color-text-http-delete", best.d, "text:http-method", bg, FLOORS.text, { hue: hues.delete });
  out.httpTints = {
    background: bg,
    minPairwiseLcSeparationUnderCvd: +best.m.toFixed(1),
    table: Object.fromEntries(
      [["get", best.g], ["post", best.p], ["delete", best.d]].map(([v, hex]) => [
        v,
        {
          hex,
          lc: +lc(hex, bg).toFixed(1),
          deuteranopia: { hex: simulateCvd(hex, "deuteranopia"), lc: +lc(simulateCvd(hex, "deuteranopia"), simulateCvd(bg, "deuteranopia")).toFixed(1) },
          protanopia: { hex: simulateCvd(hex, "protanopia"), lc: +lc(simulateCvd(hex, "protanopia"), simulateCvd(bg, "protanopia")).toFixed(1) },
        },
      ]),
    ),
  };
}

// 7. Focus ring. --zu-focus-ring is a 1px gap in --zu-page inside a 2px ring
//    in --zu-ring-focus. On theme-dark the gap takes the frame, so focus does
//    not paint a white halo; the ring then stands on the frame alone, so it is
//    solved to the line floor against the frame and checked against WCAG 2's
//    3:1 for non-text focus indicators. The start mirrors theme-default's ring
//    (slate-600 on white) the way every other role is mirrored.
//    These tokens carry scope "zenuml": the diagram's inner .zenuml element
//    declares the --zu-* tokens again, so apply-derived writes them to a rule
//    on that element inside the theme rather than to the theme block.
{
  const DEFAULT_RING = "#475569"; // theme-default --zu-ring-focus
  const start = Math.min(1, bgL + Math.abs(Lof("#ffffff") - Lof(DEFAULT_RING)));
  const ring = solveGrey(start, canvas, FLOORS.line, +1);
  const luminance = (hex) => {
    const [r, g, b] = parseColor(hex).map((c) => srgbToLinear(c / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const wcag = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const ratio = wcag(ring, canvas);
  if (ratio < 3) throw new Error(`focus ring ${ring} reads ${ratio.toFixed(2)}:1 on ${canvas}, below WCAG 3:1`);
  token("--zu-page", canvas, "fill:focus-gap", null, null, { origin: "= frame: the focus ring's gap", scope: "zenuml" });
  token("--zu-ring-focus", ring, "line:focus-ring", canvas, FLOORS.line, { mirroredStart: grey(start), wcag: +ratio.toFixed(2), scope: "zenuml" });
  const [r, g, b] = parseColor(ring);
  out.tokens["--zu-ring-glow"] = { value: `rgba(${r}, ${g}, ${b}, 0.18)`, role: "fill:focus-glow", origin: "= ring at theme-default's glow alpha", scope: "zenuml" };
  out.tokens["--zu-focus-ring"] = {
    value: "0 0 0 1px var(--zu-page), 0 0 0 2px var(--zu-ring-focus), 0 0 0 6px var(--zu-ring-glow)",
    role: "focus",
    origin: "as theme-default; declared again because a custom property resolves var() where it is declared",
    scope: "zenuml",
  };
  note(`focus ring ${ring}: Lc ${lc(ring, canvas).toFixed(1)}, ${ratio.toFixed(2)}:1 on the frame ${canvas}; the gap is the frame.`);
}

out.tokens["--opacity-comment"] = { value: "1", role: "text:comment", origin: "see notes" };
out.tokens["--opacity-guard"] = { value: "1", role: "text:fragment-condition", origin: "see notes" };

writeFileSync(resolve(EVIDENCE, "derive-dark.json"), JSON.stringify(out, null, 2));

// CSS block for src/assets/tailwind.css
const css = [".theme-dark {"];
for (const [name, t] of Object.entries(out.tokens)) {
  const lcNote = t.lc != null ? ` /* Lc ${t.lc} on ${t.bg}, floor ${t.floor} */` : t.origin ? ` /* ${t.origin} */` : "";
  css.push(`  ${name}: ${t.value};${lcNote}`);
}
css.push("}");
process.stdout.write(css.join("\n") + "\n\n");
process.stdout.write("notes:\n" + out.notes.map((n) => "- " + n).join("\n") + "\n");
process.stdout.write(`canvas ${canvas} (${out.canvas.canvasOklch}) from Atlassian ${atlassian} (${out.canvas.atlassianOklch})\n`);
process.stdout.write(`http tints: ${JSON.stringify(out.httpTints, null, 1)}\n`);
