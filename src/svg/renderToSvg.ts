/**
 * renderToSvg — Renders ZenUML DSL to native SVG content.
 *
 * Pipeline: parse → layout → geometry IR → SVG primitives → compose
 */
import { RootContext } from "@/parser";
import { Coordinates } from "@/positioning/Coordinates";
import { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import { WidthProviderOnCanvas } from "@/positioning/WidthProviderFunc";
import { buildGeometry } from "./buildGeometry";
import { renderParticipant } from "./components/participant";
import { renderLifeline } from "./components/lifeline";
import { renderMessage, renderSelfCall } from "./components/message";
import { renderOccurrence } from "./components/occurrence";
import { renderFragment } from "./components/fragment";
import { renderCreation } from "./components/creation";
import { renderReturn } from "./components/return";
import { renderDivider } from "./components/divider";
import { renderComment } from "./components/comment";
import type { DiagramGeometry } from "./geometry";

export interface RenderOptions {
  theme?: "theme-default" | "theme-mermaid";
}

export interface RenderResult {
  svg: string;
  /** Inner SVG content (defs + g) for embedding into an existing SVG container */
  innerSvg: string;
  width: number;
  height: number;
  viewBox: string;
}

const FRAME_HEADER_HEIGHT = 28;
const FRAME_BORDER_RADIUS = 4;

const DEFAULT_THEME_STYLES = `
  .frame-border { fill: #ffffff; stroke: #666; stroke-width: 1; }
  .frame-header-bg { fill: #ffffff; }
  .frame-header-line { stroke: #666; stroke-width: 1; }
  .frame-title { font-family: Helvetica, Verdana, serif; font-size: 16px; font-weight: 600; fill: #222; }
  .participant-box { fill: #ffffff; stroke: #666; stroke-width: 2; }
  .participant-label { font-family: Helvetica, Verdana, serif; font-size: 16px; fill: #222; }
  .lifeline { stroke: #666; stroke-width: 1; }
  .message-line { stroke: #000; stroke-width: 2; }
  .message-label { font-family: Helvetica, Verdana, serif; font-size: 14px; fill: #222; }
  .arrow-head { fill: #000; stroke: #000; stroke-width: 2; }
  .arrow-open { fill: none; }
  .occurrence { fill: #dedede; stroke: #000; stroke-width: 2; rx: 2; }
  .fragment-border { fill: none; stroke: #666; stroke-width: 1; }
  .fragment-header { fill: #dedede7f; stroke: #666; stroke-width: 1; }
  .fragment-label { font-family: Helvetica, Verdana, serif; font-size: 12px; font-weight: bold; fill: #222; }
  .fragment-condition { font-family: Helvetica, Verdana, serif; font-size: 12px; fill: #222; }
  .fragment-separator { stroke: #666; stroke-width: 1; stroke-dasharray: 6,4; }
  .fragment-section-label { font-family: Helvetica, Verdana, serif; font-size: 12px; fill: #222; }
  .return-line { stroke: #000; stroke-width: 1; stroke-dasharray: 6,4; }
  .return-arrow { stroke: #000; stroke-width: 1; }
  .return-label { font-family: Helvetica, Verdana, serif; font-size: 14px; fill: #222; }
  .divider-line { stroke: #666; stroke-width: 1; stroke-dasharray: 4,4; }
  .divider-label { font-family: Helvetica, Verdana, serif; font-size: 12px; fill: #666; }
  .comment-text { font-family: Helvetica, Verdana, serif; font-size: 12px; font-style: italic; fill: #222; opacity: 0.5; }
`;

export function renderToSvg(code: string, options?: RenderOptions): RenderResult {
  // 1. Parse
  const rootContext = RootContext(code);
  if (!rootContext) {
    return { svg: "<svg></svg>", innerSvg: "", width: 0, height: 0, viewBox: "0 0 0 0" };
  }

  // 2. Layout (uses canvas provider — no DOM)
  const coordinates = new Coordinates(rootContext, WidthProviderOnCanvas);
  const verticalCoordinates = new VerticalCoordinates(rootContext);

  // 3. Extract title
  const titleContext = rootContext.title?.();
  const title =
    titleContext && typeof titleContext.content === "function"
      ? titleContext.content()
      : undefined;

  // 4. Build geometry IR
  const geometry = buildGeometry({
    rootContext,
    coordinates,
    verticalCoordinates,
    title,
    measureText: WidthProviderOnCanvas,
  });

  // 5. Render to SVG
  return composeSvg(geometry, options);
}

function composeSvg(g: DiagramGeometry, _options?: RenderOptions): RenderResult {
  const padding = 10;
  const headerH = FRAME_HEADER_HEIGHT;
  const viewWidth = g.width + padding * 2;
  const viewHeight = g.height + padding * 2 + headerH;

  const parts: string[] = [];

  // Lifelines (behind everything)
  for (const l of g.lifelines) {
    parts.push(renderLifeline(l));
  }

  // Participants (top)
  for (const p of g.participants) {
    parts.push(renderParticipant(p));
  }

  // Bottom participants removed — SVG output omits mirrored labels at the bottom

  // Messages
  for (const m of g.messages) {
    parts.push(renderMessage(m));
  }

  // Self-calls
  for (const s of g.selfCalls) {
    parts.push(renderSelfCall(s));
  }

  // Creation arrows (dashed line to newly created participant)
  for (const c of g.creations) {
    parts.push(renderCreation(c));
  }

  // Returns (dashed lines)
  for (const r of g.returns) {
    parts.push(renderReturn(r));
  }

  // Occurrences (activation boxes on lifelines)
  for (const o of g.occurrences) {
    parts.push(renderOccurrence(o));
  }

  // Fragments (on top of occurrences, below dividers/comments)
  for (const f of g.fragments) {
    parts.push(renderFragment(f));
  }

  // Dividers (full-width lines with labels)
  for (const d of g.dividers) {
    parts.push(renderDivider(d));
  }

  // Comments (inline text above statements)
  for (const c of g.comments) {
    parts.push(renderComment(c));
  }

  // Frame: border rect + header + title
  const r = FRAME_BORDER_RADIUS;
  const frameSvg = `<rect class="frame-border" x="0.5" y="0.5" width="${viewWidth - 1}" height="${viewHeight - 1}" rx="${r}"/>`;
  const headerLineSvg = `<line class="frame-header-line" x1="0.5" y1="${headerH}" x2="${viewWidth - 0.5}" y2="${headerH}"/>`;
  const titleSvg = g.title
    ? `<text x="${padding}" y="${headerH / 2 + 1}" dominant-baseline="central" class="frame-title">${escXml(g.title)}</text>`
    : "";

  const viewBox = `0 0 ${viewWidth} ${viewHeight}`;

  const defs = `<defs>\n  <style>${DEFAULT_THEME_STYLES}</style>\n</defs>`;
  const frame = `${frameSvg}\n${headerLineSvg}\n${titleSvg}`;
  const content = `<g transform="translate(${padding}, ${headerH + padding})">\n${parts.join("\n")}\n</g>`;
  const innerSvg = `${defs}\n${frame}\n${content}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewWidth}" height="${viewHeight}" viewBox="${viewBox}">\n${innerSvg}\n</svg>`;

  return { svg, innerSvg, width: viewWidth, height: viewHeight, viewBox };
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
