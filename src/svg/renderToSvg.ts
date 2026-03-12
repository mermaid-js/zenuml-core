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
import { renderParticipant, renderParticipantBottom } from "./components/participant";
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
  width: number;
  height: number;
}

const DEFAULT_THEME_STYLES = `
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
    return { svg: "<svg></svg>", width: 0, height: 0 };
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
  const svg = composeSvg(geometry, options);

  return {
    svg,
    width: geometry.width,
    height: geometry.height,
  };
}

function composeSvg(g: DiagramGeometry, _options?: RenderOptions): string {
  const padding = 10;
  const viewWidth = g.width + padding * 2;
  const viewHeight = g.height + padding * 2;

  const parts: string[] = [];

  // Lifelines (behind everything)
  for (const l of g.lifelines) {
    parts.push(renderLifeline(l));
  }

  // Participants (top)
  for (const p of g.participants) {
    parts.push(renderParticipant(p));
  }

  // Bottom participants (placed at bottom of lifeline area, inside viewport)
  for (const p of g.participants) {
    parts.push(renderParticipantBottom(p, g.height - p.height));
  }

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

  const titleSvg = g.title
    ? `<text x="${viewWidth / 2}" y="15" text-anchor="middle" class="diagram-title" font-size="18" font-weight="bold">${escXml(g.title)}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewWidth}" height="${viewHeight}" viewBox="0 0 ${viewWidth} ${viewHeight}">
<defs>
  <style>${DEFAULT_THEME_STYLES}</style>
</defs>
<g transform="translate(${padding}, ${padding})">
${titleSvg}
${parts.join("\n")}
</g>
</svg>`;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
