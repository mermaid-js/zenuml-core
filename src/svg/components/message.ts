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
  // Match HTML renderer's open chevron: 7x10px, stroke-only, round linecap
  const w = 7;   // chevron width (horizontal extent)
  const h = 10;  // chevron height (vertical extent)
  const dir = pointsLeft ? 1 : -1;
  const baseX = tipX + dir * w;
  const y1 = tipY - h / 2;
  const y2 = tipY + h / 2;

  if (style === "open") {
    // Async: open chevron, same shape but thinner stroke (via class)
    return `<polyline points="${baseX},${y1} ${tipX},${tipY} ${baseX},${y2}" fill="none" stroke-linecap="round" class="arrow-head arrow-open"/>`;
  }
  // Sync: open chevron matching HTML renderer (stroke-only, no fill)
  return `<polyline points="${baseX},${y1} ${tipX},${tipY} ${baseX},${y2}" fill="none" stroke-linecap="round" class="arrow-head"/>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
