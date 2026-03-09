import type { MessageGeometry, SelfCallGeometry } from "../geometry";

export function renderMessage(m: MessageGeometry): string {
  const minX = Math.min(m.fromX, m.toX);
  const labelX = minX + Math.abs(m.toX - m.fromX) / 2;
  const labelY = m.y - 5;

  const dashAttr = m.arrowStyle === "dashed" ? ' stroke-dasharray="6,4"' : "";

  return `<g class="message">
  <line x1="${m.fromX}" y1="${m.y}" x2="${m.toX}" y2="${m.y}" class="message-line"${dashAttr}/>
  ${renderArrowHead(m.toX, m.y, m.isReverse, m.arrowStyle)}
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="message-label">${esc(m.label)}</text>
</g>`;
}

export function renderSelfCall(s: SelfCallGeometry): string {
  const x1 = s.x;
  const x2 = s.x + s.width;
  const y1 = s.y;
  const y2 = s.y + s.height;
  const labelX = x2 + 5;
  const labelY = s.y + s.height / 2;

  return `<g class="message self-call">
  <path d="M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2}" fill="none" class="message-line"/>
  ${renderArrowHead(x1, y2, true, s.arrowStyle)}
  <text x="${labelX}" y="${labelY}" text-anchor="start" dominant-baseline="central" class="message-label">${esc(s.label)}</text>
</g>`;
}

function renderArrowHead(
  tipX: number,
  tipY: number,
  pointsLeft: boolean,
  style: string,
): string {
  const size = 8;
  const dir = pointsLeft ? 1 : -1;
  const x1 = tipX + dir * size;
  const y1 = tipY - size / 2;
  const y2 = tipY + size / 2;

  if (style === "open") {
    return `<polyline points="${x1},${y1} ${tipX},${tipY} ${x1},${y2}" fill="none" class="arrow-head"/>`;
  }
  return `<polygon points="${tipX},${tipY} ${x1},${y1} ${x1},${y2}" class="arrow-head"/>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
