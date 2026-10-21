import colorString from "color-string";
import type { SvgPalette } from "./svg/themes";
import type { CSSProperties } from "react";

/** Optional semantic colour overrides shared by the HTML and native SVG renderers. */
export type DiagramPalette = Partial<
  Omit<SvgPalette, "fontFamily" | "fragmentHeaderOpacity" | "numberBgOpacity">
> & { canvasBg?: string };

const PALETTE_CSS_VARS: Record<keyof DiagramPalette, string> = {
  canvasBg: "--color-bg-canvas",
  frameBg: "--color-bg-frame",
  frameBorder: "--color-border-frame",
  titleText: "--color-text-title",
  participantBg: "--color-bg-participant",
  participantBorder: "--color-border-participant",
  participantText: "--color-text-participant",
  messageArrow: "--color-message-arrow",
  messageText: "--color-text-message",
  lifeline: "--color-border-base",
  occurrenceBg: "--color-bg-occurrence",
  occurrenceBorder: "--color-border-occurrence",
  fragmentBorder: "--color-border-fragment",
  fragmentHeaderBg: "--color-bg-fragment-header",
  fragmentHeaderText: "--color-text-fragment-header",
  fragmentText: "--color-text-fragment",
  fragmentSeparator: "--color-border-fragment-separator",
  guardOpacity: "--opacity-guard",
  guardText: "--color-text-guard",
  commentText: "--color-text-comment",
  commentOpacity: "--opacity-comment",
  groupOutline: "--color-border-group",
  dividerLine: "--color-border-divider",
  dividerBg: "--color-bg-divider",
  dividerText: "--color-text-divider",
  numberText: "--color-text-number",
  fragmentNumberText: "--color-text-fragment-number",
  numberBg: "--color-bg-number",
};

export function paletteCssVariables(palette: DiagramPalette): CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(palette)) {
    const cssVariable = PALETTE_CSS_VARS[key as keyof DiagramPalette];
    if (cssVariable && value !== undefined) style[cssVariable] = value;
  }
  return style as CSSProperties;
}

/** Keep native SVG styles self-contained when palette values come from a host. */
export function safeSvgPalette(
  palette?: DiagramPalette,
): DiagramPalette | undefined {
  if (!palette) return undefined;
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(palette)) {
    if (!(key in PALETTE_CSS_VARS) || typeof value !== "string") continue;
    if (key === "guardOpacity" || key === "commentOpacity") {
      const opacity = Number(value);
      if (Number.isFinite(opacity) && opacity >= 0 && opacity <= 1)
        safe[key] = value;
    } else if (
      /^[a-zA-Z0-9#(),.%/+\-\s]+$/.test(value) &&
      !/\b(?:url|expression|var)\s*\(/i.test(value)
    ) {
      safe[key] = value;
    }
  }
  return safe;
}

/** Raw outer-canvas paint. Transparent unless an author supplies canvasBg/CSS. */
export interface RenderSurface {
  backgroundColor: string;
}

/** Accept only a solid opaque colour, and serialize it without SVG markup. */
export function normaliseBackingColor(color: string): string {
  const rgb = colorString.get.rgb(color);
  if (!rgb || rgb[3] !== 1) {
    throw new TypeError("backingColor must be an opaque CSS colour");
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}
