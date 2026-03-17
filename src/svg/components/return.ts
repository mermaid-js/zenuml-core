import type { ReturnGeometry } from "../geometry";

export function renderReturn(r: ReturnGeometry): string {
  const minX = Math.min(r.fromX, r.toX);
  // HTML centers the label text within a container that has 7px padding on the
  // arrow-tip side (for the arrowhead SVG). This shifts text center 3.5px away
  // from the tip. SVG has no such padding, so offset the label accordingly.
  const ARROW_PADDING_HALF = 3.5;
  const labelX = minX + Math.abs(r.toX - r.fromX) / 2
    + (r.isReverse ? ARROW_PADDING_HALF : -ARROW_PADDING_HALF);
  const labelY = r.y - 3;

  // Match HTML renderer's ArrowHead.tsx path: M1,1.25 L6.15,4.5 L1,7.75
  const arrowTipX = r.toX;
  const w = 5.15;
  const halfH = 3.25;
  const dir = r.isReverse ? -1 : 1;
  const ax1 = arrowTipX - dir * w;
  const ay1 = r.y - halfH;
  const ay2 = r.y + halfH;

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
