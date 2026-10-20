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
  | "theme-dark"
  | "theme-clean-dark"
  | "theme-darcula"
  | "theme-neon";

export interface SvgPalette {
  /** Outer frame rule and the header separator line. */
  frameBorder: string;
  /** Frame interior, header strip and group-title backdrop. */
  frameBg: string;
  /** Diagram title text. */
  titleText: string;
  participantBg: string;
  /** Participant box outline and icon stroke. */
  participantBorder: string;
  /** Lifeline (the DOM draws it from --color-border-base). */
  lifeline: string;
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
  /** Fragment label inside the header band. */
  fragmentHeaderText: string;
  /** Fragment condition, guard keyword row and section label. */
  fragmentText: string;
  /** Opacity of the condition text and the catch/finally sections. */
  guardOpacity: string;
  fragmentSeparator: string;
  commentText: string;
  commentOpacity: string;
  /** Dashed outline around a participant group. */
  groupOutline: string;
  /** Divider rule lines and the note box border. */
  dividerLine: string;
  dividerBg: string;
  dividerText: string;
  /** Sequence-number badge text; the badge fill is the same colour at `numberBgOpacity`. */
  numberText: string;
  /** A fragment's number sits in the header band. */
  fragmentNumberText: string;
  numberBg: string;
  numberBgOpacity: string;
  /** Guard keyword (`if`, `else`, `while`) in fragment sections. */
  guardText: string;
  fontFamily: string;
}

import {
  DIAGRAM_FONT_STACK,
  IBM_PLEX_SANS_FONT_FACE_CSS,
} from "./fonts/ibmPlexSans";

/** src/assets/tailwind.css `.theme-default`. */
const DEFAULT_PALETTE: SvgPalette = {
  frameBorder: "#666",
  frameBg: "#ffffff",
  titleText: "#222",
  participantBg: "#ffffff",
  participantBorder: "#666",
  lifeline: "#666",
  participantText: "#222",
  messageArrow: "#000",
  messageText: "#222",
  occurrenceBg: "#dedede",
  occurrenceBorder: "#666",
  fragmentBorder: "#666",
  fragmentHeaderBg: "#dedede",
  fragmentHeaderOpacity: "0.498",
  fragmentHeaderText: "#000",
  fragmentText: "#000",
  guardOpacity: "0.65",
  fragmentSeparator: "#e5e7eb",
  commentText: "#333",
  commentOpacity: "0.5",
  groupOutline: "#666",
  dividerLine: "#aaaa33",
  dividerBg: "#fff5ad",
  dividerText: "#333",
  numberText: "#6b7280",
  fragmentNumberText: "#6b7280",
  numberBg: "#6b7280",
  numberBgOpacity: "0.1",
  guardText: "#6b7280",
  fontFamily: DIAGRAM_FONT_STACK,
};

/** src/assets/tailwind.css `.theme-dark` (and its aliases). */
const DARK_PALETTE: SvgPalette = {
  frameBorder: "#dadada",
  frameBg: "#1f1f1f",
  titleText: "#fbfbfb",
  participantBg: "#1f1f1f",
  participantBorder: "#dadada",
  lifeline: "#dadada",
  participantText: "#fbfbfb",
  messageArrow: "#ffffff",
  messageText: "#fbfbfb",
  occurrenceBg: "#818181",
  occurrenceBorder: "#dadada",
  fragmentBorder: "#dadada",
  fragmentHeaderBg: "#e9e9e9",
  fragmentHeaderOpacity: "1",
  fragmentHeaderText: "#000000",
  fragmentText: "#d4d4d4",
  guardOpacity: "1",
  fragmentSeparator: "#9f9f9f",
  commentText: "#d4d4d4",
  commentOpacity: "1",
  groupOutline: "#dadada",
  dividerLine: "#9f9f9f",
  dividerBg: "#cfcfcf",
  dividerText: "#000000",
  numberText: "#ededed",
  fragmentNumberText: "#000000",
  // No badge: the slot is transparent, so the fill colour is irrelevant at opacity 0.
  numberBg: "#ededed",
  numberBgOpacity: "0",
  guardText: "#ececec",
  fontFamily: DIAGRAM_FONT_STACK,
};

export const THEME_PALETTES: Record<SvgTheme, SvgPalette> = {
  "theme-default": DEFAULT_PALETTE,

  // `.theme-mermaid` sets only base/text/border/occurrence (and hides the
  // footer, which the SVG does not draw). Two slots it leaves unset fall back
  // differently from theme-default in the DOM: the message arrow resolves to
  // the border colour and the fragment header to the frame (no band). The
  // palette follows the DOM (themes.spec.ts).
  "theme-mermaid": {
    ...DEFAULT_PALETTE,
    messageArrow: "#666",
    fragmentHeaderBg: "#ffffff",
    fragmentHeaderOpacity: "1",
  },

  // src/assets/tailwind.css `.theme-clean-light`, resolved through the DOM
  // chains (themes.spec.ts): the title, fragment border, separator and comment
  // used to carry values the DOM never showed.
  "theme-clean-light": {
    frameBorder: "#e5e9f0",
    frameBg: "#ffffff",
    titleText: "#368eff",
    participantBg: "#edf4fe",
    participantBorder: "#368eff",
    // The DOM lifeline is --color-border-base, not the participant border.
    lifeline: "#c8c9c9",
    participantText: "#368eff",
    messageArrow: "#368eff",
    messageText: "#368eff",
    occurrenceBg: "#ffffff",
    occurrenceBorder: "#368eff",
    fragmentBorder: "#e5e9f0",
    fragmentHeaderBg: "#edf4fe",
    fragmentHeaderOpacity: "1",
    fragmentHeaderText: "#368eff",
    fragmentText: "#368eff",
    guardOpacity: "0.65",
    fragmentSeparator: "#e5e7eb",
    commentText: "#333",
    commentOpacity: "0.5",
    // Slots every DOM theme still renders with the theme-default literals
    // (their CSS chains fall back to these values; only a theme that sets the
    // slot changes them).
    groupOutline: "#666",
    dividerLine: "#aaaa33",
    dividerBg: "#fff5ad",
    dividerText: "#333",
    numberText: "#6b7280",
    fragmentNumberText: "#6b7280",
    numberBg: "#6b7280",
    numberBgOpacity: "0.1",
    guardText: "#6b7280",
    fontFamily: DIAGRAM_FONT_STACK,
  },

  // The one dark theme (ADR 0004); theme-clean-dark and theme-darcula are
  // aliases of it. Values are the derived tokens in
  // docs/ux-research/evidence/theme-dark/derive-dark.json, transcribed from
  // the `.theme-dark` block in src/assets/tailwind.css; themes.spec.ts
  // resolves every slot through tailwind.config.js and checks them.
  "theme-dark": DARK_PALETTE,
  "theme-clean-dark": DARK_PALETTE,
  "theme-darcula": DARK_PALETTE,

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
    lifeline: "#60ff33",
    participantText: "#8ffc5b",
    messageArrow: "#8ffc5b",
    messageText: "#8ffc5b",
    occurrenceBg: "#8ffc5b",
    occurrenceBorder: "#8ffc5b",
    fragmentBorder: "#60ff33",
    fragmentHeaderBg: "#000000",
    fragmentHeaderOpacity: "1",
    fragmentHeaderText: "#8ffc5b",
    fragmentText: "#8ffc5b",
    guardOpacity: "0.65",
    // Neither slot is set by `.theme-neon`; the DOM shows the defaults.
    fragmentSeparator: "#e5e7eb",
    commentText: "#333",
    commentOpacity: "0.5",
    // Slots every DOM theme still renders with the theme-default literals
    // (their CSS chains fall back to these values; only a theme that sets the
    // slot changes them).
    groupOutline: "#666",
    dividerLine: "#aaaa33",
    dividerBg: "#fff5ad",
    dividerText: "#333",
    numberText: "#6b7280",
    fragmentNumberText: "#6b7280",
    numberBg: "#6b7280",
    numberBgOpacity: "0.1",
    guardText: "#6b7280",
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
 * Every colour comes from the palette. The DOM renderer never themed the group
 * outline, divider, sequence numbers or guard keyword before these became
 * slots, so every palette carries the theme-default literals for them until a
 * theme sets the slot.
 */
export function buildThemeStyles(p: SvgPalette): string {
  return `
  ${IBM_PLEX_SANS_FONT_FACE_CSS}
  .frame-border-outer { fill: ${p.frameBorder}; }
  .frame-border-inner { fill: ${p.frameBg}; }
  .frame-header-bg { fill: ${p.frameBg}; }
  .frame-header-line { stroke: ${p.frameBorder}; stroke-width: 1; shape-rendering: crispEdges; }
  .frame-title { font-family: ${p.fontFamily}; font-size: 14px; font-weight: 400; fill: ${p.titleText}; }
  .participant-box { fill: ${p.participantBg}; stroke: ${p.participantBorder}; stroke-width: 1; }
  .participant-label { font-family: ${p.fontFamily}; font-size: 14px; fill: ${p.participantText}; }
  .stereotype-label { fill: ${p.participantText}; }
  .participant-icon { color: ${p.participantText}; }
  .participant-icon [fill="currentColor"]:not([stroke]) { stroke: ${p.participantBorder}; stroke-width: 1; }
  .lifeline { stroke: ${p.lifeline}; stroke-width: 1; }
  .message-line { stroke: ${p.messageArrow}; stroke-width: 1; shape-rendering: crispEdges; }
  .message-label { font-family: ${p.fontFamily}; font-size: 15px; fill: ${p.messageText}; }
  .arrow-head { fill: ${p.messageArrow}; stroke: ${p.messageArrow}; stroke-width: 1; }
  .arrow-open { fill: none; }
  .self-call-line { stroke: ${p.messageArrow}; stroke-width: 1; fill: none; }
  .occurrence { fill: ${p.occurrenceBg}; stroke: ${p.occurrenceBorder}; stroke-width: 1; shape-rendering: crispEdges; }
  .fragment-border { fill: none; stroke: ${p.fragmentBorder}; stroke-width: 1; }
  .fragment-header { fill: ${p.fragmentHeaderBg}; fill-opacity: ${p.fragmentHeaderOpacity}; stroke: none; shape-rendering: crispEdges; }
  .fragment-number-bg { fill: ${p.numberBg}; fill-opacity: ${p.numberBgOpacity}; stroke: none; }
  .message-number-bg { fill: ${p.numberBg}; fill-opacity: ${p.numberBgOpacity}; stroke: none; }
  .fragment-label { font-family: ${p.fontFamily}; font-size: 14px; font-weight: 400; font-variant-caps: all-small-caps; fill: ${p.fragmentHeaderText}; }
  .fragment-condition { font-family: ${p.fontFamily}; font-size: 14px; fill: ${p.fragmentText}; opacity: ${p.guardOpacity}; }
  .fragment-section-dim { opacity: ${p.guardOpacity}; }
  .fragment-section-bg { fill: ${p.frameBg}; }
  .fragment-icon { color: ${p.fragmentHeaderText}; }
  .fragment-separator { stroke: ${p.fragmentSeparator}; stroke-width: 1; shape-rendering: crispEdges; }
  .fragment-section-keyword { font-variant-caps: all-small-caps; }
  .fragment-section-label { font-family: ${p.fontFamily}; font-size: 14px; fill: ${p.fragmentText}; }
  .return-line { stroke: ${p.messageArrow}; stroke-width: 1; stroke-dasharray: 6,4; shape-rendering: crispEdges; }
  .return-arrow { stroke: ${p.messageArrow}; stroke-width: 1; fill: none; }
  .return-label { font-family: ${p.fontFamily}; font-size: 15px; fill: ${p.messageText}; }
  .return-icon { fill: ${p.messageText}; }
  .divider-line { stroke: ${p.dividerLine}; stroke-width: 1; }
  .divider-bg { fill: ${p.dividerBg}; stroke: ${p.dividerLine}; stroke-width: 1; }
  .divider-label { font-family: ${p.fontFamily}; font-size: 14px; fill: ${p.dividerText}; }
  .comment-text { font-family: ${p.fontFamily}; font-size: 14px; fill: ${p.commentText}; opacity: ${p.commentOpacity}; }
  .guard-keyword { font-family: ${p.fontFamily}; font-size: 12px; font-weight: 400; font-variant-caps: all-small-caps; fill: ${p.guardText}; }
  .seq-number { font-family: ${p.fontFamily}; font-size: 12px; font-weight: 400; fill: ${p.numberText}; }
  .fragment-number { fill: ${p.fragmentNumberText}; }
  .group-outline { fill: none; stroke: ${p.groupOutline}; }
  .group-title-bg { fill: ${p.frameBg}; stroke: none; }
  .group-title-text { font-family: ${p.fontFamily}; font-size: 13px; font-weight: 400; fill: ${p.participantText}; }
`;
}
