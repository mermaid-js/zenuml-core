import type { GroupGeometry } from "../geometry";
import { esc } from "./svgUtils";

/**
 * Renders a participant group as a dashed outline with a title bar,
 * matching the HTML renderer's outline-dashed style on LifeLineGroup.
 * Uses CSS classes defined in DEFAULT_THEME_STYLES for color/stroke parity
 * with the HTML renderer's theme-default variables.
 */
export function renderGroup(g: GroupGeometry): string {
  const titleBarHeight = 18.5;
  const sw = 1.5;   // stroke-width
  const sw2 = sw / 2; // 0.75 — half stroke-width
  // g.y includes a +1.5 offset (vs the HTML div top) that corrects for SVG text rendering.
  // The HTML div top is at g.y - 1.5 (in SVG content coords). CSS outline is drawn
  // OUTSIDE the div, so HTML outline center is at (g.y - 1.5) - sw2 = g.y - 2.25.
  // To align the SVG stroke center with the HTML outline center: rectY = g.y - 2.25.
  // Equivalently: move rect left/up by (sw + sw2 = 2.25) to compensate for both the
  // +1.5 geometry offset and the sw2 stroke centering.
  const rectX = g.x - sw2;           // align horizontal stroke center with HTML outline center
  const rectY = g.y - sw - sw2;      // = g.y - 2.25: align vertical stroke with HTML outline
  const rectW = g.width + sw;
  const rectH = g.height + sw + sw2; // extend bottom (clipped by viewBox)
  // Title text: g.y + titleBarHeight/2 gives the correct screen position because g.y
  // includes the +1.5 dominant-baseline correction.
  const titleY = g.y + titleBarHeight / 2;
  const titleText = g.name ? esc(g.name) : "";
  // Title background covers the interior of the group rect, from the HTML div top
  // (= g.y - 1.5, the inner stroke edge) through the title bar height.
  // This matches HTML where the title div is inside the group div from y=g.y-1.5.
  const tbX = g.x;
  const tbY = g.y - sw;      // = HTML div top = inner stroke top edge
  const tbWidth = g.width;
  const tbHeight = titleBarHeight + sw2; // cover through the title bar plus a bit extra for the stroke
  return `<g class="participant-group">
  <rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" class="group-outline" stroke-dasharray="4 3"/>
  ${titleText ? `<rect x="${tbX}" y="${tbY}" width="${tbWidth}" height="${tbHeight}" class="group-title-bg"/>` : ""}
  ${titleText ? `<text x="${g.x + g.width / 2}" y="${titleY}" text-anchor="middle" dominant-baseline="middle" class="group-title-text">${titleText}</text>` : ""}
</g>`;
}

