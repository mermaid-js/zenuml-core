import type { CreationGeometry } from "../geometry";

export function renderCreation(c: CreationGeometry): string {
  const m = c.message;
  const p = c.participant;

  // Arrow stops at participant box edge (not center)
  const isRTL = m.toX < m.fromX;
  const adjustedToX = isRTL
    ? p.x + p.width / 2
    : p.x - p.width / 2;

  const labelX = m.fromX + (adjustedToX - m.fromX) / 2;
  const labelY = m.y - 5;

  return `<g class="creation">
  <line x1="${m.fromX}" y1="${m.y}" x2="${adjustedToX}" y2="${m.y}" class="message-line" stroke-dasharray="6,4"/>
  ${renderOpenArrow(adjustedToX, m.y, isRTL)}
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="message-label">${esc(m.label)}</text>
</g>`;
}

function renderOpenArrow(tipX: number, tipY: number, pointsLeft: boolean): string {
  const size = 8;
  const dir = pointsLeft ? 1 : -1;
  const x1 = tipX + dir * size;
  const y1 = tipY - size / 2;
  const y2 = tipY + size / 2;
  return `<polyline points="${x1},${y1} ${tipX},${tipY} ${x1},${y2}" fill="none" class="arrow-head"/>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
