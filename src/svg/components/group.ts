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
  const titleY = g.y + titleBarHeight / 2;
  const titleText = g.name ? esc(g.name) : "";
  // The title background rect must cover the stroke's outer edges (stroke-width=1.5 → 0.75 on each side).
  // Extend 0.75px beyond the rect boundary on all sides to ensure the dashed stroke is hidden
  // behind the white title bar, matching the HTML renderer where the title div covers the outline.
  const sw2 = 0.75; // half of stroke-width (1.5)
  const tbX = g.x - sw2;
  const tbY = g.y - sw2;
  const tbWidth = g.width + 2 * sw2;
  const tbHeight = titleBarHeight + sw2; // extend top but not bottom (bottom edge intentionally dashed)
  return `<g class="participant-group">
  <rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" class="group-outline" stroke-dasharray="4 3"/>
  ${titleText ? `<rect x="${tbX}" y="${tbY}" width="${tbWidth}" height="${tbHeight}" class="group-title-bg"/>` : ""}
  ${titleText ? `<text x="${g.x + g.width / 2}" y="${titleY}" text-anchor="middle" dominant-baseline="middle" class="group-title-text">${titleText}</text>` : ""}
</g>`;
}

