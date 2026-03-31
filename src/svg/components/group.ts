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
  const rectY = g.y - sw;            // g.y - 1.5: aligns rendered top with HTML group top
  const rectW = g.width + sw;
  const rectH = g.height + sw;
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

