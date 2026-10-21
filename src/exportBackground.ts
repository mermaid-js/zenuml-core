import * as htmlToImage from "html-to-image";
import { normaliseBackingColor } from "./surface";

export interface ExportOptions {
  /** Opaque colour painted behind the diagram once. Omit to preserve alpha. */
  backingColor?: string;
}

const filter = (node: HTMLElement) => !node?.classList?.contains("hide-export");

/** html-to-image's backgroundColor overwrites the cloned node; paint below it instead. */
export async function exportCanvas(
  node: HTMLElement,
  options?: ExportOptions,
): Promise<HTMLCanvasElement> {
  const backing = options?.backingColor !== undefined
    ? normaliseBackingColor(options.backingColor)
    : undefined;
  const canvas = await htmlToImage.toCanvas(node, { filter });
  if (backing) {
    const context = canvas.getContext("2d")!;
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = backing;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = "source-over";
  }
  return canvas;
}

export async function exportSvg(
  node: HTMLElement,
  options?: ExportOptions,
): Promise<string> {
  const backing = options?.backingColor !== undefined
    ? normaliseBackingColor(options.backingColor)
    : undefined;
  const dataUrl = await htmlToImage.toSvg(node, { filter });
  if (!backing) return dataUrl;

  const comma = dataUrl.indexOf(",");
  const svg = decodeURIComponent(dataUrl.slice(comma + 1));
  const beforeContent = svg.indexOf("<foreignObject");
  if (beforeContent < 0) throw new Error("SVG export has no diagram content");
  const rect = `<rect class="export-backing" x="0" y="0" width="100%" height="100%" style="fill: ${backing} !important"/>`;
  return `${dataUrl.slice(0, comma + 1)}${encodeURIComponent(svg.slice(0, beforeContent) + rect + svg.slice(beforeContent))}`;
}
