/**
 * SVG theme palettes.
 *
 * The DOM renderer themes itself with CSS custom properties defined per theme
 * class in src/assets/tailwind.css. The SVG renderer emits a self-contained
 * <style> block instead, so it needs the same colours as plain literals. This
 * module holds one palette per supported theme and builds that style block.
 *
 * Slot values are transcribed from the corresponding CSS class in
 * src/assets/tailwind.css. When a theme leaves a custom property unset there,
 * the palette carries the value the DOM renderer effectively falls back to.
 *
 * `theme-default` reproduces the previously hard-coded style block byte for
 * byte; src/svg/themes.spec.ts pins that, so the committed SVG snapshots do not
 * move when a new theme is added.
 */

/** Theme names renderToSvg accepts. */
export type SvgTheme =
  | "theme-default"
  | "theme-mermaid"
  | "theme-clean-light"
  | "theme-clean-dark"
  | "theme-neon";

export interface SvgPalette {
  /** Outer frame rule and the header separator line. */
  frameBorder: string;
  /** Frame interior, header strip and group-title backdrop. */
  frameBg: string;
  /** Diagram title text. */
  titleText: string;
  participantBg: string;
  /** Participant box outline, lifeline, icon stroke and group outline. */
  participantBorder: string;
  /** Participant label, icon colour and group title text. */
  participantText: string;
  /** Message line, arrow head and return line. */
  messageArrow: string;
  /** Message label and return label/icon. */
  messageText: string;
  occurrenceBg: string;
  occurrenceBorder: string;
  fragmentBorder: string;
  fragmentHeaderBg: string;
  /** `.fragment-header` fill-opacity — 0.498 when the CSS colour carries alpha. */
  fragmentHeaderOpacity: string;
  /** Fragment label, condition and section label. */
  fragmentText: string;
  fragmentSeparator: string;
  commentText: string;
  fontFamily: string;
}

import {
  DIAGRAM_FONT_STACK,
  IBM_PLEX_SANS_400_DATA_URI,
  IBM_PLEX_SANS_FAMILY,
} from "./fonts/ibmPlexSans";

/** src/assets/tailwind.css `.theme-default`. */
const DEFAULT_PALETTE: SvgPalette = {
  frameBorder: "#666",
  frameBg: "#ffffff",
  titleText: "#222",
  participantBg: "#ffffff",
  participantBorder: "#666",
  participantText: "#222",
  messageArrow: "#000",
  messageText: "#222",
  occurrenceBg: "#dedede",
  occurrenceBorder: "#666",
  fragmentBorder: "#666",
  fragmentHeaderBg: "#dedede",
  fragmentHeaderOpacity: "0.498",
  fragmentText: "#000",
  fragmentSeparator: "#e5e7eb",
  commentText: "#333",
  fontFamily: DIAGRAM_FONT_STACK,
};

export const THEME_PALETTES: Record<SvgTheme, SvgPalette> = {
  "theme-default": DEFAULT_PALETTE,

  // `.theme-mermaid` sets only base/text/border/occurrence, and hides the
  // footer — chrome the SVG output does not draw. Every slot it leaves unset
  // matches theme-default, so the two render identically.
  "theme-mermaid": DEFAULT_PALETTE,

  // src/assets/tailwind.css `.theme-clean-light`.
  "theme-clean-light": {
    frameBorder: "#e5e9f0",
    frameBg: "#ffffff",
    titleText: "#353748",
    participantBg: "#edf4fe",
    participantBorder: "#368eff",
    participantText: "#368eff",
    messageArrow: "#368eff",
    messageText: "#368eff",
    occurrenceBg: "#ffffff",
    occurrenceBorder: "#368eff",
    fragmentBorder: "#c8c9c9",
    fragmentHeaderBg: "#edf4fe",
    fragmentHeaderOpacity: "1",
    fragmentText: "#368eff",
    fragmentSeparator: "#e5e9f0",
    commentText: "#353748",
    fontFamily: DIAGRAM_FONT_STACK,
  },

  // src/assets/tailwind.css `.theme-clean-dark`.
  "theme-clean-dark": {
    frameBorder: "#cecfd2",
    frameBg: "#111628",
    titleText: "#cecfd2",
    participantBg: "#5964f2",
    participantBorder: "#cecfd2",
    participantText: "#536fff",
    messageArrow: "#536fff",
    messageText: "#cecfd2",
    occurrenceBg: "#5964f2",
    occurrenceBorder: "#cecfd2",
    fragmentBorder: "#cecfd2",
    fragmentHeaderBg: "#5964f2",
    fragmentHeaderOpacity: "1",
    fragmentText: "#cecfd2",
    fragmentSeparator: "#cecfd2",
    commentText: "#cecfd2",
    fontFamily: DIAGRAM_FONT_STACK,
  },

  // src/assets/tailwind.css `.theme-neon`. The DOM theme also swaps in the
  // MS Sans Serif webfont (`.zenuml .theme-neon`); the SVG names it first and
  // keeps the Helvetica stack behind it, since a consumer embedding the SVG
  // will not have that @font-face rule.
  "theme-neon": {
    frameBorder: "#60ff33",
    frameBg: "#000000",
    titleText: "#8ffc5b",
    participantBg: "#000000",
    participantBorder: "#8ffc5b",
    participantText: "#8ffc5b",
    messageArrow: "#8ffc5b",
    messageText: "#8ffc5b",
    occurrenceBg: "#8ffc5b",
    occurrenceBorder: "#8ffc5b",
    fragmentBorder: "#60ff33",
    fragmentHeaderBg: "#000000",
    fragmentHeaderOpacity: "1",
    fragmentText: "#8ffc5b",
    fragmentSeparator: "#60ff33",
    commentText: "#8ffc5b",
    fontFamily: `"MS Sans Serif", ${DIAGRAM_FONT_STACK}`,
  },
};

/**
 * Palette for a theme name. An unknown or omitted name resolves to
 * theme-default, so a stale or misspelled `--theme` on the CLI still renders.
 */
export function resolvePalette(theme?: string): SvgPalette {
  if (theme && theme in THEME_PALETTES) {
    return THEME_PALETTES[theme as SvgTheme];
  }
  return DEFAULT_PALETTE;
}

/**
 * The `<style>` body embedded in every rendered SVG.
 *
 * Sequence-number styling is deliberately kept neutral so it reads across
 * light and dark themes; the fragment number background reuses the theme's
 * fragment text colour at low opacity.
 */
export function buildThemeStyles(p: SvgPalette): string {
  return `
  @font-face { font-family: "${IBM_PLEX_SANS_FAMILY}"; font-weight: 400; font-style: normal; src: url(${IBM_PLEX_SANS_400_DATA_URI}) format("woff2"); }
  .frame-border-outer { fill: ${p.frameBorder}; }
  .frame-border-inner { fill: ${p.frameBg}; }
  .frame-header-bg { fill: ${p.frameBg}; }
  .frame-header-line { stroke: ${p.frameBorder}; stroke-width: 1; shape-rendering: crispEdges; }
  .frame-title { font-family: ${p.fontFamily}; font-size: 14px; font-weight: 400; fill: ${p.titleText}; }
  .participant-box { fill: ${p.participantBg}; stroke: ${p.participantBorder}; stroke-width: 1; }
  .participant-label { font-family: ${p.fontFamily}; font-size: 14px; fill: ${p.participantText}; }
  .participant-icon { color: ${p.participantText}; }
  .participant-icon [fill="currentColor"]:not([stroke]) { stroke: ${p.participantBorder}; stroke-width: 1; }
  .lifeline { stroke: ${p.participantBorder}; stroke-width: 1; }
  .message-line { stroke: ${p.messageArrow}; stroke-width: 1; shape-rendering: crispEdges; }
  .message-label { font-family: ${p.fontFamily}; font-size: 15px; fill: ${p.messageText}; }
  .arrow-head { fill: ${p.messageArrow}; stroke: ${p.messageArrow}; stroke-width: 1; }
  .arrow-open { fill: none; }
  .occurrence { fill: ${p.occurrenceBg}; stroke: ${p.occurrenceBorder}; stroke-width: 1; shape-rendering: crispEdges; }
  .fragment-border { fill: none; stroke: ${p.fragmentBorder}; stroke-width: 1; }
  .fragment-header { fill: ${p.fragmentHeaderBg}; fill-opacity: ${p.fragmentHeaderOpacity}; stroke: none; shape-rendering: crispEdges; }
  .fragment-number-bg { fill: #6b7280; fill-opacity: 0.1; stroke: none; }
  .message-number-bg { fill: #6b7280; fill-opacity: 0.1; stroke: none; }
  .fragment-label { font-family: ${p.fontFamily}; font-size: 14px; font-weight: 400; font-variant-caps: all-small-caps; fill: ${p.fragmentText}; }
  .fragment-condition { font-family: ${p.fontFamily}; font-size: 14px; fill: ${p.fragmentText}; }
  .fragment-separator { stroke: ${p.fragmentSeparator}; stroke-width: 1; shape-rendering: crispEdges; }
  .fragment-section-keyword { font-variant-caps: all-small-caps; }
  .fragment-section-label { font-family: ${p.fontFamily}; font-size: 14px; fill: ${p.fragmentText}; }
  .return-line { stroke: ${p.messageArrow}; stroke-width: 1; stroke-dasharray: 6,4; shape-rendering: crispEdges; }
  .return-arrow { stroke: ${p.messageArrow}; stroke-width: 1; fill: none; }
  .return-label { font-family: ${p.fontFamily}; font-size: 15px; fill: ${p.messageText}; }
  .return-icon { fill: ${p.messageText}; }
  .divider-line { stroke: #aaaa33; stroke-width: 1; }
  .divider-bg { fill: #fff5ad; stroke: #aaaa33; stroke-width: 1; }
  .divider-label { font-family: ${p.fontFamily}; font-size: 14px; fill: #333; }
  .comment-text { font-family: ${p.fontFamily}; font-size: 14px; fill: ${p.commentText}; opacity: 0.5; }
  .guard-keyword { font-family: ${p.fontFamily}; font-size: 12px; font-weight: 400; font-variant-caps: all-small-caps; fill: #6b7280; }
  .seq-number { font-family: ${p.fontFamily}; font-size: 12px; font-weight: 400; fill: #6b7280; }
  .group-outline { fill: none; stroke: ${p.participantBorder}; }
  .group-title-bg { fill: ${p.frameBg}; stroke: none; }
  .group-title-text { font-family: ${p.fontFamily}; font-size: 13px; font-weight: 400; fill: ${p.participantText}; }
`;
}
