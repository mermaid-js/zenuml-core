import type { GroupGeometry } from "../geometry";
import { esc } from "./svgUtils";

/**
 * Renders a participant group as a dashed outline with a title bar,
 * matching the HTML renderer's outline-dashed style on LifeLineGroup.
 */
export function renderGroup(g: GroupGeometry): string {
  const titleBarHeight = 20;
  const outlineStroke = "var(--color-outline-primary, #666)";
  const titleFill = "var(--color-bg-frame, #fff)";
  const titleTextFill = "var(--color-text-message, var(--color-text-base, #000))";
  const titleY = g.y + titleBarHeight / 2;
  const titleText = g.name ? esc(g.name) : "";
  return `<g class="participant-group">
  <rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" fill="none" stroke="${outlineStroke}" stroke-width="1" stroke-dasharray="4 2"/>
  ${titleText ? `<rect x="${g.x}" y="${g.y}" width="${g.width}" height="${titleBarHeight}" fill="${titleFill}" stroke="none"/>` : ""}
  ${titleText ? `<text x="${g.x + g.width / 2}" y="${titleY}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="600" fill="${titleTextFill}">${titleText}</text>` : ""}
</g>`;
}

