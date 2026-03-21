import type { CreationGeometry } from "../geometry";

export function renderCreation(c: CreationGeometry): string {
  const m = c.message;
  const p = c.participant;

  // Arrow stops at participant box edge (not center)
  const isRTL = m.toX < m.fromX;
  const adjustedToX = isRTL
    ? p.x + p.width / 2
    : p.x - p.width / 2;

  // fromX: +1 on left endpoint (matching message.ts lifeline offset convention).
  // toX: stop AT the participant rect edge — no +1, because SVG has no
  // z-ordering to hide arrowhead overlap like CSS does in HTML.
  const fromX = isRTL ? m.fromX : m.fromX + 1;
  const toX = isRTL ? adjustedToX : adjustedToX;

  const labelX = fromX + (toX - fromX) / 2 - 3.5;
  const labelY = m.y - 3;

  const styleAttr = m.style ? ` style="${styleToAttr(m.style)}"` : "";

  // Sequence number: always to the left of the message
  const numberX = Math.min(fromX, toX) - 3;
  const numberSvg = m.number
    ? `<text x="${numberX}" y="${labelY}" text-anchor="end" class="seq-number">${esc(m.number)}</text>`
    : "";

  return `<g class="creation">
  <line x1="${fromX}" y1="${m.y}" x2="${toX}" y2="${m.y}" class="message-line" stroke-dasharray="6,4"/>
  ${renderOpenArrow(toX, m.y, isRTL)}
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="message-label"${styleAttr}>${esc(m.label)}</text>
  ${numberSvg}
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
