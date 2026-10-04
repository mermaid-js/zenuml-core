import { describe, expect, it } from "vitest";
import { renderToSvg } from "./renderToSvg";
import { buildThemeStyles, resolvePalette, THEME_PALETTES } from "./themes";
import type { SvgTheme } from "./themes";
import { IBM_PLEX_SANS_400_DATA_URI } from "./fonts/ibmPlexSans";

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
  .participant-icon { color: #222; }
  .participant-icon [fill="currentColor"]:not([stroke]) { stroke: #666; stroke-width: 1; }
  .lifeline { stroke: #666; stroke-width: 1; }
  .message-line { stroke: #000; stroke-width: 1; shape-rendering: crispEdges; }
  .message-label { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 15px; fill: #222; }
  .arrow-head { fill: #000; stroke: #000; stroke-width: 1; }
  .arrow-open { fill: none; }
  .occurrence { fill: #dedede; stroke: #666; stroke-width: 1; shape-rendering: crispEdges; }
  .fragment-border { fill: none; stroke: #666; stroke-width: 1; }
  .fragment-header { fill: #dedede; fill-opacity: 0.498; stroke: none; shape-rendering: crispEdges; }
  .fragment-number-bg { fill: #6b7280; fill-opacity: 0.1; stroke: none; }
  .message-number-bg { fill: #6b7280; fill-opacity: 0.1; stroke: none; }
  .fragment-label { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 14px; font-weight: 400; font-variant-caps: all-small-caps; fill: #000; }
  .fragment-condition { font-family: "IBM Plex Sans", Helvetica, Verdana, serif; font-size: 14px; fill: #000; }
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

  it("renders theme-mermaid identically to theme-default", () => {
    // The two CSS classes differ only in footer visibility, which the SVG
    // output does not draw.
    const code = "A.method() { B.reply() }";
    expect(renderToSvg(code, { theme: "theme-mermaid" }).svg).toBe(
      renderToSvg(code, { theme: "theme-default" }).svg,
    );
  });

  it("gives every other theme a distinct style block", () => {
    const distinct = new Set(
      (Object.keys(THEME_PALETTES) as SvgTheme[]).map((name) =>
        buildThemeStyles(THEME_PALETTES[name]),
      ),
    );
    // 5 themes, but mermaid intentionally shares default's palette.
    expect(distinct.size).toBe(4);
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
    const b = renderToSvg(code, { theme: "theme-clean-dark" });
    expect([b.width, b.height, b.viewBox]).toEqual([
      a.width,
      a.height,
      a.viewBox,
    ]);
  });
});
