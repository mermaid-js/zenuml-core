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
  // SVG stroke is centered on the rect boundary. To align the stroke's outer edge with
  // HTML's CSS outline outer edge (which is drawn outside the border-box), the SVG rect
  // must be shifted outward by sw2 on each side. This aligns visual strokes at the cost
  // of a 0.75px offset in the measured bounding box (dx=-0.75 in analyzer output).
  const rectX = g.x - sw2;
  const rectY = g.y - sw - 0.5;     // shift top up 0.5px to align with HTML outline outer edge
  const rectW = g.width + sw;
  const rectH = g.height + sw + 0.5; // compensate to keep bottom in place
  // Title text: g.y + titleBarHeight/2 gives the correct screen position because g.y
  // includes the +1.5 dominant-baseline correction.
  const titleY = g.y + titleBarHeight / 2;
  const titleText = g.name ? esc(g.name) : "";
  // Title background is inset by sw2 from the outline rect on all sides so the
  // full dashed border (including the inner half of the centered stroke) stays visible.
  const tbX = g.x + sw2;
  const tbY = rectY + sw2;      // inner edge of top stroke
  const tbWidth = g.width - sw;  // inset sw2 on each side
  const tbHeight = titleBarHeight + 0.5 + sw2; // cover through the title bar
  return `<g class="participant-group">
  <rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" class="group-outline" stroke-dasharray="4 3"/>
  ${titleText ? `<rect x="${tbX}" y="${tbY}" width="${tbWidth}" height="${tbHeight}" class="group-title-bg"/>` : ""}
  ${titleText ? `<text x="${g.x + g.width / 2}" y="${titleY}" text-anchor="middle" dominant-baseline="middle" class="group-title-text">${titleText}</text>` : ""}
</g>`;
}

