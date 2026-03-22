import type { DividerGeometry } from "../geometry";
import { escXml as esc } from "../svg-utils";

export function renderDivider(d: DividerGeometry): string {
  const labelX = d.width / 2;
  const labelY = d.y - 4;

  return `<g class="divider">
  <line x1="0" y1="${d.y}" x2="${d.width}" y2="${d.y}" class="divider-line"/>
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="divider-label">${esc(d.label)}</text>
</g>`;
}

