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

  const styleAttr = m.style ? ` style="${styleToAttr(m.style)}"` : "";

  return `<g class="creation">
  <line x1="${m.fromX}" y1="${m.y}" x2="${adjustedToX}" y2="${m.y}" class="message-line" stroke-dasharray="6,4"/>
  ${renderOpenArrow(adjustedToX, m.y, isRTL)}
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="message-label"${styleAttr}>${esc(m.label)}</text>
</g>`;
}

function renderOpenArrow(tipX: number, tipY: number, pointsLeft: boolean): string {
  // Match HTML renderer's ArrowHead.tsx path: M1,1.25 L6.15,4.5 L1,7.75
  const w = 5.15;
  const halfH = 3.25;
  const dir = pointsLeft ? 1 : -1;
  const x1 = tipX + dir * w;
  const y1 = tipY - halfH;
  const y2 = tipY + halfH;
  return `<polyline points="${x1},${y1} ${tipX},${tipY} ${x1},${y2}" fill="none" stroke-linecap="round" class="arrow-head arrow-open"/>`;
}

function styleToAttr(style: Record<string, string>): string {
  return Object.entries(style)
    .map(([k, v]) => `${esc(k)}: ${esc(v)}`)
    .join("; ");
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
