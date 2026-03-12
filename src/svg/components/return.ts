import type { ReturnGeometry } from "../geometry";

export function renderReturn(r: ReturnGeometry): string {
  const minX = Math.min(r.fromX, r.toX);
  const labelX = minX + Math.abs(r.toX - r.fromX) / 2;
  const labelY = r.y - 5;

  // Open chevron arrowhead matching HTML renderer (7x10px)
  const arrowTipX = r.toX;
  const w = 7;
  const h = 10;
  const dir = r.isReverse ? -1 : 1;
  const ax1 = arrowTipX - dir * w;
  const ay1 = r.y - h / 2;
  const ay2 = r.y + h / 2;

  return `<g class="return">
  <line x1="${r.fromX}" y1="${r.y}" x2="${r.toX}" y2="${r.y}" class="return-line"/>
  <polyline points="${ax1},${ay1} ${arrowTipX},${r.y} ${ax1},${ay2}" fill="none" stroke-linecap="round" class="return-arrow"/>
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="return-label">${esc(r.label)}</text>
</g>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
