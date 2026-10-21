import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToSvg } from "./renderToSvg";
import { buildThemeStyles, resolvePalette, THEME_PALETTES } from "./themes";
import type { SvgPalette, SvgTheme } from "./themes";
import { IBM_PLEX_SANS_400_DATA_URI } from "./fonts/ibmPlexSans";
import { themeBaseColor } from "../surface";

/**
 * Pin the default <style> body so theme changes cannot silently alter its
 * rendering. The participant stroke is 1px as required by the current
 * rendering contract.
 */
const LEGACY_DEFAULT_STYLES = `
  @font-face { font-family: "IBM Plex Sans"; font-weight: 400; font-style: normal; src: url(${IBM_PLEX_SANS_400_DATA_URI}) format("woff2"); }
  .frame-border-outer { fill: #666; }
  .frame-border-inner { fill: #ffffff; }
  .frame-header-bg { fill: #ffffff; }
  .frame-header-line { stroke: #666; stroke-width: 1; shape-rendering: crispEdges; }
  .frame-title { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 14px; font-weight: 400; fill: #222; }
  .participant-box { fill: #ffffff; stroke: #666; stroke-width: 1; }
  .participant-label { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 14px; fill: #222; }
  .stereotype-label { fill: #222; }
  .participant-icon { color: #222; }
  .lifeline { stroke: #666; stroke-width: 1; }
  .message-line { stroke: #000; stroke-width: 1; shape-rendering: crispEdges; }
  .message-label { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 15px; fill: #222; }
  .arrow-head { fill: #000; stroke: #000; stroke-width: 1; }
  .arrow-open { fill: none; }
  .self-call-line { stroke: #000; stroke-width: 1; fill: none; }
  .occurrence { fill: #dedede; stroke: #666; stroke-width: 1; shape-rendering: crispEdges; }
  .fragment-border { fill: none; stroke: #666; stroke-width: 1; }
  .fragment-header { fill: #dedede; fill-opacity: 0.498; stroke: none; shape-rendering: crispEdges; }
  .fragment-number-bg { fill: #6b7280; fill-opacity: 0.1; stroke: none; }
  .message-number-bg { fill: #6b7280; fill-opacity: 0.1; stroke: none; }
  .fragment-label { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 14px; font-weight: 400; font-variant-caps: all-small-caps; fill: #000; }
  .fragment-condition { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 14px; fill: #000; opacity: 0.65; }
  .fragment-section-dim { opacity: 0.65; }
  .fragment-section-bg { fill: #ffffff; }
  .fragment-icon { color: #000; }
  .fragment-separator { stroke: #e5e7eb; stroke-width: 1; shape-rendering: crispEdges; }
  .fragment-section-keyword { font-variant-caps: all-small-caps; }
  .fragment-section-label { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 14px; fill: #000; }
  .return-line { stroke: #000; stroke-width: 1; stroke-dasharray: 6,4; shape-rendering: crispEdges; }
  .return-arrow { stroke: #000; stroke-width: 1; fill: none; }
  .return-label { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 15px; fill: #222; }
  .return-icon { fill: #222; }
  .divider-line { stroke: #aaaa33; stroke-width: 1; }
  .divider-bg { fill: #fff5ad; stroke: #aaaa33; stroke-width: 1; }
  .divider-label { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 14px; fill: #333; }
  .comment-text { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 14px; fill: #333; opacity: 0.5; }
  .guard-keyword { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 12px; font-weight: 400; font-variant-caps: all-small-caps; fill: #6b7280; }
  .seq-number { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 12px; font-weight: 400; fill: #6b7280; }
  .fragment-number { fill: #6b7280; }
  .group-outline { fill: none; stroke: #666; }
  .group-title-bg { fill: #ffffff; stroke: none; }
  .group-title-text { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 13px; font-weight: 400; fill: #222; }
`;

describe("SVG theme palettes", () => {
  it("emits the expected style block for theme-default", () => {
    expect(buildThemeStyles(THEME_PALETTES["theme-default"])).toBe(
      LEGACY_DEFAULT_STYLES,
    );
  });

  it("renders theme-mermaid as the DOM does: #666 arrows, no header band", () => {
    const code = "A.method() { if (x) { B.reply() } }";
    const mermaid = renderToSvg(code, { theme: "theme-mermaid" }).svg;
    expect(mermaid).toContain(".arrow-head { fill: #666; stroke: #666;");
    expect(mermaid).toContain(".fragment-header { fill: #ffffff; fill-opacity: 1;");
    expect(mermaid).not.toBe(renderToSvg(code, { theme: "theme-default" }).svg);
  });

  it("renders theme-clean-dark and theme-darcula as aliases of theme-dark", () => {
    const code = "A.method() { B.reply() }";
    const dark = renderToSvg(code, { theme: "theme-dark" }).svg;
    expect(renderToSvg(code, { theme: "theme-clean-dark" }).svg).toBe(dark);
    expect(renderToSvg(code, { theme: "theme-darcula" }).svg).toBe(dark);
    expect(dark).not.toBe(renderToSvg(code).svg);
  });

  it("gives every other theme a distinct style block", () => {
    const distinct = new Set(
      (Object.keys(THEME_PALETTES) as SvgTheme[]).map((name) =>
        buildThemeStyles(THEME_PALETTES[name]),
      ),
    );
    // 7 names: clean-dark and darcula share dark's palette, so five remain:
    // default, mermaid, clean-light, dark, neon.
    expect(distinct.size).toBe(5);
  });

  it("falls back to theme-default for an unknown or missing theme", () => {
    expect(resolvePalette(undefined)).toBe(THEME_PALETTES["theme-default"]);
    expect(resolvePalette("theme-does-not-exist")).toBe(
      THEME_PALETTES["theme-default"],
    );
  });

  it("puts the requested theme's colours into the rendered SVG", () => {
    const code = "A.method()";
    const neon = renderToSvg(code, { theme: "theme-neon" }).svg;
    const dflt = renderToSvg(code).svg;

    expect(neon).toContain("#8ffc5b");
    expect(neon).toContain("MS Sans Serif");
    expect(dflt).not.toContain("#8ffc5b");
    expect(neon).not.toBe(dflt);
  });

  it("keeps geometry identical across themes", () => {
    // A theme changes colours only; participant positions and diagram size
    // must not move, or the SVG and DOM renderers would disagree per theme.
    const code = "A.method() { B.reply() }";
    const a = renderToSvg(code, { theme: "theme-default" });
    const b = renderToSvg(code, { theme: "theme-dark" });
    expect([b.width, b.height, b.viewBox]).toEqual([
      a.width,
      a.height,
      a.viewBox,
    ]);
  });
});

/**
 * DOM/SVG palette parity.
 *
 * The DOM renderer colours itself through the `var()` fallback chains in
 * tailwind.config.js, fed by the custom properties each `.theme-*` class sets
 * in src/assets/tailwind.css. The SVG palette must carry the value those
 * chains resolve to, so this resolves every palette slot through the real
 * config and the real stylesheet instead of retyping either.
 */
const require = createRequire(import.meta.url);
const tailwindConfig = require("../../tailwind.config.js");
const TAILWIND_CSS = readFileSync(
  resolve(__dirname, "../assets/tailwind.css"),
  "utf8",
);

/** `--name: value;` declarations per selector, from every flat CSS block. */
function cssVarsBySelector(css: string): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  const block = /([^{}]+?)\s*\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = block.exec(css))) {
    const selectors = m[1].split(",").map((s) => s.trim().split(/\s+/).pop()!);
    const decl = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let d: RegExpExecArray | null;
    while ((d = decl.exec(m[2]))) {
      for (const sel of selectors) {
        (out[sel] ??= {})[d[1]] = d[2].trim();
      }
    }
  }
  return out;
}

const VARS = cssVarsBySelector(TAILWIND_CSS);

/** Custom properties in force under `.theme-x`: the theme's own over `:root`. */
function themeVars(theme: string): Record<string, string> {
  return { ...VARS[":root"], ...VARS[`.${theme}`] };
}

/** Resolve `var(--a, var(--b, literal))` against a theme's custom properties. */
function resolveChain(chain: string, vars: Record<string, string>): string | undefined {
  const s = chain.trim();
  if (!s.startsWith("var(")) return s;
  const inner = s.slice(4, -1);
  const comma = inner.indexOf(",");
  const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
  const fallback = comma < 0 ? undefined : inner.slice(comma + 1);
  if (vars[name] !== undefined) return resolveChain(vars[name], vars);
  return fallback === undefined ? undefined : resolveChain(fallback, vars);
}

/** Normalise any CSS colour to { hex: "#rrggbb", alpha }. */
function normalise(color: string): { hex: string; alpha: number } {
  const c = color.trim().toLowerCase();
  if (c === "transparent") return { hex: "#000000", alpha: 0 };
  if (c.startsWith("#")) {
    let h = c.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((x) => x + x).join("");
    const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { hex: `#${h.slice(0, 6)}`, alpha };
  }
  const m = c.match(/^rgba?\(([^)]+)\)$/);
  if (!m) throw new Error(`cannot normalise colour: ${color}`);
  const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  const hex = `#${parts.slice(0, 3).map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  return { hex, alpha: parts.length > 3 ? parts[3] : 1 };
}

const cfg = tailwindConfig.theme.extend;
describe("document backing parity with theme CSS", () => {
  for (const selector of Object.keys(VARS).filter((key) => /^\.theme-[a-z-]+$/.test(key))) {
    const theme = selector.slice(1);
    it(`${theme}: opaque backing matches the declared canvas`, () => {
      const canvas = resolveChain(cfg.backgroundColor.skin.canvas, themeVars(theme));
      expect(canvas).toBeDefined();
      expect(normalise(themeBaseColor(theme))).toEqual(normalise(canvas!));
    });
  }
});

/** Palette slot -> the tailwind.config.js chain the DOM uses for it. */
const SLOT_CHAINS: Record<Exclude<keyof SvgPalette, "fontFamily" | "fragmentHeaderOpacity" | "numberBgOpacity">, string> = {
  frameBorder: cfg.borderColor.skin.frame,
  frameBg: cfg.backgroundColor.skin.frame,
  titleText: cfg.textColor.skin.title,
  participantBg: cfg.backgroundColor.skin.participant,
  participantBorder: cfg.borderColor.skin.participant,
  lifeline: cfg.backgroundColor.skin.lifeline,
  participantText: cfg.textColor.skin.participant,
  messageArrow: cfg.textColor.skin["message-arrow"],
  messageText: cfg.textColor.skin.message,
  occurrenceBg: cfg.backgroundColor.skin.occurrence,
  occurrenceBorder: cfg.borderColor.skin.occurrence,
  fragmentBorder: cfg.borderColor.skin.fragment,
  fragmentHeaderBg: cfg.backgroundColor.skin["fragment-header"],
  fragmentHeaderText: cfg.textColor.skin["fragment-header"],
  fragmentText: cfg.textColor.skin.fragment,
  guardOpacity: cfg.opacity["skin-guard"],
  fragmentSeparator: cfg.borderColor.skin["fragment-separator"],
  commentText: cfg.textColor.skin.comment,
  commentOpacity: cfg.opacity["skin-comment"],
  groupOutline: cfg.borderColor.skin.group,
  dividerLine: cfg.borderColor.skin.divider,
  dividerBg: cfg.backgroundColor.skin.divider,
  dividerText: cfg.textColor.skin.divider,
  numberText: cfg.textColor.skin.number,
  fragmentNumberText: cfg.textColor.skin["fragment-number"],
  numberBg: cfg.backgroundColor.skin.number,
  guardText: cfg.textColor.skin.guard,
};

describe("SVG palette parity with the DOM slot chains", () => {
  for (const theme of Object.keys(THEME_PALETTES) as SvgTheme[]) {
    it(`${theme}: every palette slot equals its resolved DOM chain`, () => {
      const palette = THEME_PALETTES[theme];
      const vars = themeVars(theme);
      const mismatches: string[] = [];
      for (const [slot, chain] of Object.entries(SLOT_CHAINS) as [keyof typeof SLOT_CHAINS, string][]) {
        const resolved = resolveChain(chain, vars);
        if (resolved === undefined) {
          mismatches.push(`${slot}: chain resolves to nothing`);
          continue;
        }
        if (slot === "guardOpacity" || slot === "commentOpacity") {
          if (Number(resolved) !== Number(palette[slot])) {
            mismatches.push(`${slot}: DOM ${resolved} vs SVG ${palette[slot]}`);
          }
          continue;
        }
        const dom = normalise(resolved);
        const svg = normalise(palette[slot]);
        if (slot === "fragmentHeaderBg") {
          if (dom.alpha.toFixed(3) !== Number(palette.fragmentHeaderOpacity).toFixed(3)) {
            mismatches.push(`fragmentHeaderOpacity: DOM ${dom.alpha.toFixed(3)} vs SVG ${palette.fragmentHeaderOpacity}`);
          }
        } else if (slot === "numberBg") {
          if (dom.alpha.toFixed(3) !== Number(palette.numberBgOpacity).toFixed(3)) {
            mismatches.push(`numberBgOpacity: DOM ${dom.alpha.toFixed(3)} vs SVG ${palette.numberBgOpacity}`);
          }
          if (dom.alpha === 0) continue; // colour is irrelevant at opacity 0
        } else if (dom.alpha !== 1) {
          mismatches.push(`${slot}: DOM value ${resolved} carries alpha; the SVG palette has no slot for it`);
        }
        if (dom.hex !== svg.hex) mismatches.push(`${slot}: DOM ${resolved} -> ${dom.hex} vs SVG ${palette[slot]}`);
      }
      expect(mismatches).toEqual([]);
    });
  }

  it("Divider.tsx keeps the divider chains of tailwind.config.js inline", () => {
    // The divider keeps its colours inline so bracket styles keep precedence;
    // the strings must stay the config's chains.
    const src = readFileSync(
      resolve(__dirname, "../components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Divider/Divider.tsx"),
      "utf8",
    );
    expect(src).toContain(`"${cfg.borderColor.skin.divider}"`);
    expect(src).toContain(`"${cfg.backgroundColor.skin.divider}"`);
    expect(src).toContain(`"${cfg.textColor.skin.divider}"`);
  });
});
