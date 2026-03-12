import type { MessageGeometry, SelfCallGeometry } from "../geometry";

export function renderMessage(m: MessageGeometry): string {
  const minX = Math.min(m.fromX, m.toX);
  const labelX = minX + Math.abs(m.toX - m.fromX) / 2;
  const labelY = m.y - 3;

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
  const labelX = (x1 + x2) / 2;
  const labelY = y1 - 3;
  // Rounded corners matching HTML renderer's Q curves (radius 2px)
  const r = 2;

  return `<g class="message self-call">
  <path d="M ${x1} ${y1} L ${x2 - r} ${y1} Q ${x2} ${y1}, ${x2} ${y1 + r} L ${x2} ${y2 - r} Q ${x2} ${y2}, ${x2 - r} ${y2} L ${x1} ${y2}" fill="none" class="message-line"/>
  ${renderArrowHead(x1, y2, true, s.arrowStyle)}
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="message-label">${esc(s.label)}</text>
</g>`;
}

function renderArrowHead(
  tipX: number,
  tipY: number,
  pointsLeft: boolean,
  style: string,
): string {
  // Match HTML renderer's ArrowHead.tsx path: M1,1.25 L6.15,4.5 L1,7.75
  // dx = 6.15 - 1 = 5.15, dy = 4.5 - 1.25 = 3.25
  const w = 5.15;
  const halfH = 3.25;
  const dir = pointsLeft ? 1 : -1;
  const baseX = tipX + dir * w;
  const y1 = tipY - halfH;
  const y2 = tipY + halfH;

  if (style === "open") {
    // Async: open chevron (stroke-only, no fill)
    return `<polyline points="${baseX},${y1} ${tipX},${tipY} ${baseX},${y2}" fill="none" stroke-linecap="round" class="arrow-head arrow-open"/>`;
  }
  // Sync: filled triangle matching HTML renderer's ArrowHead(fill=true)
  return `<polygon points="${baseX},${y1} ${tipX},${tipY} ${baseX},${y2}" class="arrow-head"/>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
