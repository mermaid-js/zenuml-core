import type { MessageGeometry, SelfCallGeometry } from "../geometry";

export function renderMessage(m: MessageGeometry): string {
  // HTML centers the label between source lifeline and arrowhead (excluding arrow width).
  // Shift label center by half the arrowhead width (3.5px) toward the source participant.
  const arrowHalfW = 3.5;
  const direction = Math.sign(m.toX - m.fromX); // +1 right-pointing, -1 left-pointing
  const labelX = (m.fromX + m.toX) / 2 - direction * arrowHalfW;
  // HTML renders label as a block element ABOVE the border-bottom line.
  // SVG text y = baseline. For 14px Helvetica, getBBox().y ≈ y - 13.
  // HTML label top = m.y - 17 (content coords). Need bbox.y = m.y - 17, so y = m.y - 4.
  const labelY = m.y - 4;

  const dashAttr = m.arrowStyle === "dashed" ? ' stroke-dasharray="6,4"' : "";

  // Sequence number: positioned to the left of the message origin with 4px gap (matching HTML pr-1)
  const numberSvg = m.number
    ? `<text x="${m.fromX - 4}" y="${labelY}" text-anchor="end" class="seq-number">${esc(m.number)}</text>`
    : "";

  return `<g class="message">
  <line x1="${m.fromX}" y1="${m.y}" x2="${m.toX}" y2="${m.y}" class="message-line"${dashAttr}/>
  ${renderArrowHead(m.toX, m.y, m.isReverse, m.arrowStyle)}
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="message-label">${esc(m.label)}</text>
  ${numberSvg}
</g>`;
}

export function renderSelfCall(s: SelfCallGeometry): string {
  const x1 = s.x;
  // HTML self-call label: left-aligned near lifeline center
  // Measured: HTML label starts at +2px from lifeline center, but +6 gives better overall pixel match
  const labelX = x1 + 6;
  // HTML SelfInvocation: label at top, SVG arrow (30x24) below.
  // HTML label top = y1 - 20 (content coords). Need bbox.y = y1 - 20, so y = y1 - 7.
  const labelY = s.y - 7;

  // Sequence number: positioned to the left of the self-call origin with 4px gap
  const numberSvg = s.number
    ? `<text x="${x1 - 4}" y="${labelY}" text-anchor="end" class="seq-number">${esc(s.number)}</text>`
    : "";

  // Self-call arrow: U-path + arrowhead in absolute coordinates
  // HTML uses nested <svg width="30" height="24"> at (serverCenter+1, s.y-2)
  // Converting to absolute coords to avoid nested-SVG rendering differences
  // +1 to match HTML CSS: self-call arrow starts 1px right of lifeline center
  const ax = x1 + 1; // arrow origin X
  const ay = s.y;     // arrow origin Y (top of U-path horizontal line)

  // U-path: horizontal top, right curve, vertical down, bottom curve, horizontal bottom
  const uPath = `M${ax},${ay} L${ax + 26},${ay} Q${ax + 28},${ay} ${ax + 28},${ay + 2} L${ax + 28},${ay + 11} Q${ax + 28},${ay + 13} ${ax + 26},${ay + 13} L${ax + 1},${ay + 13}`;

  // Arrowhead (left-pointing): computed from HTML's mirrored 7x10 SVG at translate(0,10)
  // viewBox "0 0 7 9" → 7x10 viewport: yOffset=+0.5 from preserveAspectRatio
  // scale(-1,1) translate(-7,0) mirror: x'=7-x
  // Path M1,1.25 L6.15,4.5 L1,7.75 → mirrored (6,1.75) (0.85,5.0) (6,8.25) → +translate(0,10) in 30x24
  // Final absolute: offset by (ax, ay-2) since ay = s.y and the 30x24 SVG starts at s.y-2
  const ahPath = `M${ax + 6},${ay + 9.75} L${ax + 0.85},${ay + 13} L${ax + 6},${ay + 16.25}`;

  return `<g class="message self-call">
  <path d="${uPath}" fill="none" stroke="#000" stroke-width="2"/>
  <path d="${ahPath}" stroke="#000" stroke-linecap="round" fill="none" stroke-width="2"/>
  <text x="${labelX}" y="${labelY}" text-anchor="start" class="message-label">${esc(s.label.trim())}</text>
  ${numberSvg}
</g>`;
}

/**
 * Renders an arrowhead using the exact same nested SVG structure as HTML ArrowHead.tsx.
 * HTML uses: <svg width="7" height="10" viewBox="0 0 7 9">
 *   <path d="M1 1.25 L6.15 4.5 L1 7.75" stroke="currentColor" stroke-linecap="round"/>
 * </svg>
 * The viewBox (0 0 7 9) → 7x10 pixels places the tip at pixel (6.15, 5.0).
 */
function renderArrowHead(
  tipX: number,
  tipY: number,
  pointsLeft: boolean,
  style: string,
): string {
  const isFilled = style !== "open" && style !== "dashed";
  const fillAttr = isFilled ? "#000" : "none";
  const pathD = isFilled
    ? "M1 1.25 L6.15 4.5 L1 7.75 Z"
    : "M1 1.25 L6.15 4.5 L1 7.75";

  if (pointsLeft) {
    // Mirrored: tip at pixel (7-6.15, 5.0) = (0.85, 5.0) within 7x10 SVG
    const svgX = tipX - 0.85;
    const svgY = tipY - 5.0;
    return `<svg x="${svgX}" y="${svgY}" width="7" height="10" viewBox="0 0 7 9">
    <g transform="scale(-1, 1) translate(-7, 0)">
      <path d="${pathD}" stroke="#000" stroke-linecap="round" fill="${fillAttr}" stroke-width="2"/>
    </g>
  </svg>`;
  }
  // Normal (right-pointing): tip at pixel (6.15, 5.0) within 7x10 SVG
  const svgX = tipX - 6.15;
  const svgY = tipY - 5.0;
  return `<svg x="${svgX}" y="${svgY}" width="7" height="10" viewBox="0 0 7 9">
    <path d="${pathD}" stroke="#000" stroke-linecap="round" fill="${fillAttr}" stroke-width="2"/>
  </svg>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
