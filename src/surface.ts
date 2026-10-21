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

/** The opaque base painted across the complete exported document bounds. */
export interface RenderSurface {
  backgroundColor: string;
}

/** Resolve an authored CSS color over the theme's declared opaque base. */
export function opaqueBackground(color: string, backing: string): string {
  const fallback = colorString.get.rgb(backing) ?? [255, 255, 255, 1];
  const base = fallback;
  const foreground = colorString.get.rgb(color);
  if (!foreground) return `rgb(${base[0]}, ${base[1]}, ${base[2]})`;
  const alpha = foreground[3] ?? 1;
  const channels = [0, 1, 2].map((i) =>
    Math.floor(foreground[i] * alpha + base[i] * (1 - alpha)),
  );
  return `rgb(${channels.join(", ")})`;
}

/** The backing layer under a canvas whose own colour may have alpha. */
export function canvasBackingColor(
  theme: string | undefined,
  palette?: DiagramPalette,
): string {
  const declared = palette?.canvasBg && colorString.get.rgb(palette.canvasBg);
  return declared?.[3] === 1 ? palette!.canvasBg! : themeBaseColor(theme);
}

/** Preserve an opaque colour; otherwise compose it over the theme once. */
export function nativeCanvasColor(
  theme: string | undefined,
  palette?: DiagramPalette,
): string {
  const color = palette?.canvasBg ?? themeBaseColor(theme);
  const parsed = colorString.get.rgb(color);
  return parsed?.[3] === 1
    ? color
    : opaqueBackground(color, themeBaseColor(theme));
}

export function themeBaseColor(theme: string | undefined): string {
  const bases: Record<string, string> = {
    "theme-dark": "#1f1f1f",
    "theme-clean-dark": "#1f1f1f",
    "theme-darcula": "#1f1f1f",
    "theme-neon": "#000000",
    "theme-idle-afternoon": "#d8dad9",
    "theme-woolworths": "#e6eaf0",
    "theme-creately": "#f6f0de",
    "theme-purple": "#fafafa",
  };
  return bases[theme ?? ""] ?? "#ffffff";
}
