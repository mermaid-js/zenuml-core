import type { CSSProperties } from "react";
import type { SvgPalette } from "@/svg/themes";

/** Six opaque #RRGGBB colours shared by the DOM and native SVG renderers. */
export interface DiagramPalette {
  canvas: string;
  content: string;
  pocket: string;
  border: string;
  text: string;
  secondaryText: string;
}

export interface CanvasSurface {
  backgroundColor: string;
}

export function validateDiagramPalette(p: DiagramPalette): void {
  for (const key of [
    "canvas",
    "content",
    "pocket",
    "border",
    "text",
    "secondaryText",
  ] as const) {
    if (typeof p[key] !== "string" || !/^#[0-9a-fA-F]{6}$/.test(p[key])) {
      throw new TypeError(
        `DiagramPalette.${key} must be an opaque #RRGGBB color`,
      );
    }
  }
}

/** A transparent CSS canvas needs an opaque export backing. */
export function opaqueCanvasColor(color: string | undefined): string {
  if (!color || color === "transparent") return "white";
  const rgba = color.match(
    /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/,
  );
  if (rgba) {
    const alpha = Math.max(0, Math.min(1, Number(rgba[4])));
    if (alpha === 0) return "white";
    if (alpha < 1) {
      const channels = rgba
        .slice(1, 4)
        .map((value) => Math.round(Number(value) * alpha + 255 * (1 - alpha)));
      return `rgb(${channels.join(", ")})`;
    }
  }
  return color;
}

/** Reads the visible canvas now. Call again after any host CSS change. */
export function readCanvasSurface(
  canvas: Element | null,
  fallback?: string,
): CanvasSurface {
  const color = canvas ? getComputedStyle(canvas).backgroundColor : "";
  return { backgroundColor: opaqueCanvasColor(color || fallback) };
}

/** Capture an offscreen copy with an opaque canvas, leaving the live DOM alone. */
export async function withOpaqueCanvasForExport<T>(
  root: HTMLElement,
  surface: CanvasSurface,
  exportImage: (node: HTMLElement, cloned: boolean) => Promise<T>,
): Promise<T> {
  const sourceCanvas = root.matches(".bg-skin-canvas")
    ? root
    : root.querySelector<HTMLElement>(".bg-skin-canvas");
  const sourceColor = sourceCanvas
    ? getComputedStyle(sourceCanvas).backgroundColor
    : "";
  if (!sourceCanvas || sourceColor === surface.backgroundColor) {
    return exportImage(root, false);
  }
  const copy = root.cloneNode(true) as HTMLElement;
  const box = root.getBoundingClientRect();
  copy.style.position = "fixed";
  copy.style.left = "-100000px";
  copy.style.top = "0";
  copy.style.width = `${Math.max(box.width, root.scrollWidth)}px`;
  copy.style.height = `${Math.max(box.height, root.scrollHeight)}px`;
  const canvas = copy.matches(".bg-skin-canvas")
    ? copy
    : copy.querySelector<HTMLElement>(".bg-skin-canvas");
  canvas?.style.setProperty(
    "background-color",
    surface.backgroundColor,
    "important",
  );
  root.parentElement?.append(copy);
  try {
    return await exportImage(copy, true);
  } finally {
    copy.remove();
  }
}

/** Paint SVG viewport corners outside html-to-image's foreignObject. */
export function paintSvgCanvas(
  dataUrl: string,
  surface: CanvasSurface,
): string {
  const prefix = "data:image/svg+xml;charset=utf-8,";
  if (!dataUrl.startsWith(prefix)) return dataUrl;
  const svg = decodeURIComponent(dataUrl.slice(prefix.length));
  const color = surface.backgroundColor.replace(
    /[&"<>]/g,
    (char) =>
      ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[char]!,
  );
  return `${prefix}${encodeURIComponent(svg.replace(/(<svg\b[^>]*>)/, `$1<rect width="100%" height="100%" fill="${color}"/>`))}`;
}

/** One semantic assignment feeds both CSS custom properties and SVG slots. */
export function mapDiagramPalette(p: DiagramPalette): {
  cssVariables: CSSProperties & Record<string, string>;
  svgColors: Omit<SvgPalette, "fontFamily">;
} {
  validateDiagramPalette(p);
  // Essential one-pixel strokes need secondaryText contrast against content
  // and pocket; border is retained for the decorative outer frame rule.
  const ink = p.text;
  const detail = p.secondaryText;
  const edge = p.border;
  const cssVariables = {
    "--color-bg-canvas": p.canvas,
    "--color-bg-base": p.content,
    "--color-bg-frame": p.content,
    "--color-bg-title": p.content,
    "--color-bg-participant": p.content,
    "--color-bg-occurrence": p.pocket,
    "--color-bg-fragment-header": p.pocket,
    "--color-bg-divider": p.pocket,
    "--color-bg-number": "transparent",
    "--color-bg-comment-code": "transparent",
    "--color-bg-comment-table-head": "transparent",
    "--color-text-base": ink,
    "--color-text-title": ink,
    "--color-text-participant": ink,
    "--color-text-message": ink,
    "--color-text-fragment-header": ink,
    "--color-text-fragment": ink,
    "--color-text-divider": ink,
    "--color-text-link": ink,
    "--color-text-http-get": ink,
    "--color-text-http-post": ink,
    "--color-text-http-delete": ink,
    "--color-message-arrow": ink,
    "--color-text-secondary": detail,
    "--color-text-comment": detail,
    "--color-text-control": detail,
    "--color-text-guard": detail,
    "--color-text-number": detail,
    "--color-text-fragment-number": detail,
    "--color-border-frame": edge,
    "--color-border-participant": detail,
    "--color-border-base": detail,
    "--color-border-fragment": detail,
    "--color-border-group": detail,
    "--color-border-occurrence": detail,
    "--color-border-fragment-separator": detail,
    "--color-border-fragment-header-rule": detail,
    "--color-border-divider": detail,
    "--color-border-comment-table": detail,
    "--color-outline-primary": detail,
    "--opacity-comment": "1",
    "--opacity-guard": "1",
  } as CSSProperties & Record<string, string>;
  const svgColors = {
    frameBorder: cssVariables["--color-border-frame"],
    frameBg: cssVariables["--color-bg-frame"],
    titleText: cssVariables["--color-text-title"],
    participantBg: cssVariables["--color-bg-participant"],
    participantBorder: cssVariables["--color-border-participant"],
    lifeline: cssVariables["--color-border-base"],
    participantText: cssVariables["--color-text-participant"],
    messageArrow: cssVariables["--color-message-arrow"],
    messageText: cssVariables["--color-text-message"],
    occurrenceBg: cssVariables["--color-bg-occurrence"],
    occurrenceBorder: cssVariables["--color-border-occurrence"],
    fragmentBorder: cssVariables["--color-border-fragment"],
    fragmentHeaderBg: cssVariables["--color-bg-fragment-header"],
    fragmentHeaderOpacity: "1",
    fragmentHeaderText: cssVariables["--color-text-fragment-header"],
    fragmentText: cssVariables["--color-text-fragment"],
    guardOpacity: cssVariables["--opacity-guard"],
    fragmentSeparator: cssVariables["--color-border-fragment-separator"],
    commentText: cssVariables["--color-text-comment"],
    commentOpacity: cssVariables["--opacity-comment"],
    groupOutline: cssVariables["--color-border-group"],
    dividerLine: cssVariables["--color-border-divider"],
    dividerBg: cssVariables["--color-bg-divider"],
    dividerText: cssVariables["--color-text-divider"],
    numberText: cssVariables["--color-text-number"],
    fragmentNumberText: cssVariables["--color-text-fragment-number"],
    numberBg: detail,
    numberBgOpacity: "0",
    guardText: cssVariables["--color-text-guard"],
  };
  return { cssVariables, svgColors };
}
