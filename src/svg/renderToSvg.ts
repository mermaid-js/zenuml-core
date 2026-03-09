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
  .participant-box { fill: #e2e2f0; stroke: #333; stroke-width: 1; }
  .participant-label { font-family: Helvetica, Verdana, serif; font-size: 16px; fill: #333; }
  .lifeline { stroke: #999; stroke-width: 1; }
  .message-line { stroke: #333; stroke-width: 1; }
  .message-label { font-family: Helvetica, Verdana, serif; font-size: 14px; fill: #333; }
  .arrow-head { fill: #333; stroke: #333; stroke-width: 1; }
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

  // Bottom participants
  for (const p of g.participants) {
    parts.push(renderParticipantBottom(p, g.height));
  }

  // Messages
  for (const m of g.messages) {
    parts.push(renderMessage(m));
  }

  // Self-calls
  for (const s of g.selfCalls) {
    parts.push(renderSelfCall(s));
  }

  // TODO: occurrences, fragments, dividers, returns

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
