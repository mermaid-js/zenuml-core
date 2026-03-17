import type { ReturnGeometry } from "../geometry";

export function renderReturn(r: ReturnGeometry): string {
  if (r.isSelf) {
    return renderSelfReturn(r);
  }

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

/**
 * Self-return: from === to (same participant). HTML renders a circular arrow
 * icon (12x12) + label text with no line/arrow. Match that layout.
 */
function renderSelfReturn(r: ReturnGeometry): string {
  // HTML: icon is w-3 h-3 (12x12) with m-1 (4px margin), then label text.
  // r.y includes a +16 offset (for non-self return line positioning).
  // HTML container top = r.y - 16. Icon is 4px below container top (m-1 margin).
  const iconSize = 12;
  const iconMargin = 4;
  const iconX = r.fromX + iconMargin;
  const iconY = r.y - 12; // container top + 4px margin = (r.y - 16) + 4
  const labelX = iconX + iconSize + iconMargin;
  const labelY = r.y - 1; // text baseline: vertically center with icon

  // Circular arrow icon — simplified from HTML's 512x512 SVG path, scaled to 12x12
  return `<g class="return return-self">
  <g transform="translate(${iconX},${iconY}) scale(${iconSize / 512})">
    <path d="M256 0C114.84 0 0 114.84 0 256s114.84 256 256 256 256-114.84 256-256S397.16 0 256 0Zm0 469.33c-117.63 0-213.33-95.7-213.33-213.33S138.37 42.67 256 42.67 469.33 138.37 469.33 256 373.63 469.33 256 469.33Z" class="return-icon"/>
    <path d="M288 192h-87.16l27.58-27.58a21.33 21.33 0 1 0-30.17-30.17l-64 64a21.33 21.33 0 0 0 0 30.17l64 64a21.33 21.33 0 0 0 30.17-30.17l-27.58-27.58H288a53.33 53.33 0 0 1 0 106.67h-32a21.33 21.33 0 0 0 0 42.66h32a96 96 0 0 0 0-192Z" class="return-icon"/>
  </g>
  <text x="${labelX}" y="${labelY}" text-anchor="start" class="return-label">${esc(r.label)}</text>
</g>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
