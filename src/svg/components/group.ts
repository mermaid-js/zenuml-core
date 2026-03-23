import type { GroupGeometry } from "../geometry";

/**
 * Renders a participant group as a dashed outline with a title bar,
 * matching the HTML renderer's outline-dashed style on LifeLineGroup.
 */
export function renderGroup(g: GroupGeometry): string {
  const titleBarHeight = 20;
  return `<g class="participant-group">
  <rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" fill="none" stroke="#999" stroke-width="1" stroke-dasharray="4 2" rx="2"/>
  <rect x="${g.x}" y="${g.y}" width="${g.width}" height="${titleBarHeight}" fill="#f5f5f5" stroke="#999" stroke-width="1" rx="2"/>
  <text x="${g.x + g.width / 2}" y="${g.y + 14}" text-anchor="middle" font-size="12" font-weight="600" fill="#666">${escXml(g.name)}</text>
</g>`;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
