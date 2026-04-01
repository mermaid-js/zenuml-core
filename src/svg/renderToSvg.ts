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
import { renderGroup } from "./components/group";
import { resolveEmojiInText } from "@/emoji/resolveEmoji";
import type { DiagramGeometry } from "./geometry";

export interface RenderOptions {
  theme?: "theme-default" | "theme-mermaid";
  /** Optional emoji shortcode-to-Unicode cache (for future use by Task 8) */
  emojiCache?: Map<string, string>;
}

export interface RenderResult {
  svg: string;
  /** Inner SVG content (defs + g) for embedding into an existing SVG container */
  innerSvg: string;
  width: number;
  height: number;
  viewBox: string;
  /** The geometry IR used to produce this SVG (undefined for empty input) */
  geometry?: DiagramGeometry;
}

const FRAME_HEADER_HEIGHT = 28;
const FRAME_BORDER_RADIUS = 4;

const DEFAULT_THEME_STYLES = `
  .frame-border-outer { fill: #666; }
  .frame-border-inner { fill: #ffffff; }
  .frame-header-bg { fill: #ffffff; }
  .frame-header-line { stroke: #666; stroke-width: 1; shape-rendering: crispEdges; }
  .frame-title { font-family: Helvetica, Verdana, serif; font-size: 16px; font-weight: 600; fill: #222; }
  .participant-box { fill: #ffffff; stroke: #666; stroke-width: 2; }
  .participant-label { font-family: Helvetica, Verdana, serif; font-size: 16px; fill: #222; }
  .participant-icon { color: #222; }
  .participant-icon [fill="currentColor"]:not([stroke]) { stroke: #666; stroke-width: 1; }
  .lifeline { stroke: #666; stroke-width: 1; }
  .message-line { stroke: #000; stroke-width: 2; shape-rendering: crispEdges; }
  .message-label { font-family: Helvetica, Verdana, serif; font-size: 14px; fill: #222; }
  .arrow-head { fill: #000; stroke: #000; stroke-width: 2; }
  .arrow-open { fill: none; }
  .occurrence { fill: #dedede; stroke: #666; stroke-width: 2; shape-rendering: crispEdges; }
  .fragment-border { fill: none; stroke: #666; stroke-width: 1; shape-rendering: crispEdges; }
  .fragment-header { fill: #dedede; fill-opacity: 0.498; stroke: none; shape-rendering: crispEdges; }
  .fragment-label { font-family: Helvetica, Verdana, serif; font-size: 14px; font-weight: 600; fill: #000; }
  .fragment-condition { font-family: Helvetica, Verdana, serif; font-size: 14px; fill: #000; }
  .fragment-separator { stroke: #e5e7eb; stroke-width: 1; shape-rendering: crispEdges; }
  .fragment-section-label { font-family: Helvetica, Verdana, serif; font-size: 14px; fill: #000; }
  .return-line { stroke: #000; stroke-width: 2; stroke-dasharray: 6,4; shape-rendering: crispEdges; }
  .return-arrow { stroke: #000; stroke-width: 2; fill: none; }
  .return-label { font-family: Helvetica, Verdana, serif; font-size: 14px; fill: #222; }
  .return-icon { fill: #222; }
  .divider-line { stroke: #aaaa33; stroke-width: 1; }
  .divider-bg { fill: #fff5ad; stroke: #aaaa33; stroke-width: 1; }
  .divider-label { font-family: Helvetica, Verdana, serif; font-size: 14px; fill: #333; }
  .comment-text { font-family: Helvetica, Verdana, serif; font-size: 14px; fill: #333; opacity: 0.5; }
  .seq-number { font-family: Helvetica, Verdana, serif; font-size: 12px; font-weight: 100; fill: #6b7280; }
  .group-outline { fill: none; stroke: #666; }
  .group-title-bg { fill: #ffffff; stroke: none; }
  .group-title-text { font-family: Helvetica, Verdana, serif; font-size: 13px; font-weight: 400; fill: #222; }
`;

export function renderToSvg(code: string, options?: RenderOptions): RenderResult {
  // 1. Parse
  const rootContext = RootContext(code);
  if (!rootContext) {
    return { svg: "<svg></svg>", innerSvg: "", width: 0, height: 0, viewBox: "0 0 0 0", geometry: undefined };
  }

  // 2. Layout (uses canvas provider — no DOM)
  const coordinates = new Coordinates(rootContext, WidthProviderOnCanvas);
  const verticalCoordinates = new VerticalCoordinates(rootContext);

  // 3. Extract title (resolve emoji shortcodes)
  const titleContext = rootContext.title?.();
  const rawTitle =
    titleContext && typeof (titleContext as any).content === "function"
      ? (titleContext as any).content()
      : undefined;
  const title = rawTitle ? resolveEmojiInText(rawTitle) : undefined;

  // 4. Build geometry IR
  const geometry = buildGeometry({
    rootContext,
    coordinates,
    verticalCoordinates,
    title,
    measureText: WidthProviderOnCanvas,
  });

  // 5. Render to SVG
  return { ...composeSvg(geometry, options), geometry };
}

function composeSvg(g: DiagramGeometry, options?: RenderOptions): RenderResult {
  void options;
  const padding = 10;
  const headerH = FRAME_HEADER_HEIGHT;
  // Content left offset = 1 (frame border) + 10 (seq-diagram px-2.5 padding) + frameBorderLeft
  // This matches the HTML layout: .frame(1px border) > .sequence-diagram(px-2.5) > div(paddingLeft:frameBorderLeft) > content
  const contentLeftMargin = 1 + padding + g.frameBorderLeft;
  const viewWidth = g.width + contentLeftMargin + padding + g.frameBorderRight + 1;
  const viewHeight = g.height + padding * 2 + headerH - 1; // -1 to match HTML CSS border-box visual height

  const parts: string[] = [];

  // Groups (behind everything, dashed outline containers)
  for (const grp of g.groups) {
    parts.push(renderGroup(grp));
  }

  // Lifelines (behind everything except groups)
  for (const l of g.lifelines) {
    parts.push(renderLifeline(l));
  }

  // Participants — split into non-creation (painted before occurrences) and
  // creation (painted after occurrences so the participant box covers the bar)
  const creationNames = new Set(g.creations.map(c => c.participant.name));
  for (const p of g.participants) {
    if (!creationNames.has(p.name)) {
      parts.push(renderParticipant(p));
    }
  }

  // Occurrences (activation boxes on lifelines — before messages so arrows paint on top)
  for (const o of g.occurrences) {
    parts.push(renderOccurrence(o));
  }

  // Creation participants (painted after occurrences so they appear on top of bars)
  for (const p of g.participants) {
    if (creationNames.has(p.name)) {
      parts.push(renderParticipant(p));
    }
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

  // Frame: border as two nested rects (matches CSS border-box rendering)
  const r = FRAME_BORDER_RADIUS;
  const frameSvg = [
    `<rect class="frame-border-outer" x="0" y="0" width="${viewWidth}" height="${viewHeight}" rx="${r}" fill="#666"/>`,
    `<rect class="frame-border-inner" x="1" y="1" width="${viewWidth - 2}" height="${viewHeight - 2}" rx="${Math.max(0, r - 1)}" fill="#fff"/>`,
  ].join("\n");
  const contentPaddingTop = 6; // tuned to match HTML content Y offset (~34px below frame top)
  const headerLineY = headerH + contentPaddingTop; // 34 — content group Y offset
  const headerLineDrawY = headerLineY - 0.5; // 33.5 — half-pixel for crisp 1px line at pixel row 33, matching HTML header border-bottom
  const headerLineSvg = `<line class="frame-header-line" x1="1" y1="${headerLineDrawY}" x2="${viewWidth - 1}" y2="${headerLineDrawY}"/>`;
  const titleSvg = g.title
    ? `<text x="5" y="${headerLineDrawY / 2}" dominant-baseline="central" class="frame-title">${escXml(g.title)}</text>`
    : "";

  const viewBox = `0 0 ${viewWidth} ${viewHeight}`;

  const defs = `<defs>\n  <style>${DEFAULT_THEME_STYLES}</style>\n</defs>`;
  const frame = `${frameSvg}\n${headerLineSvg}\n${titleSvg}`;
  const content = `<g transform="translate(${contentLeftMargin}, ${headerLineY})">\n${parts.join("\n")}\n</g>`;
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
