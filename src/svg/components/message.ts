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
  const styleAttr = m.style ? ` style="${styleToAttr(m.style)}"` : "";

  // Sequence number: positioned to the left of the message origin with 4px gap (matching HTML pr-1)
  const numberSvg = m.number
    ? `<text x="${m.fromX - 4}" y="${labelY}" text-anchor="end" class="seq-number">${esc(m.number)}</text>`
    : "";

  return `<g class="message">
  <line x1="${m.fromX}" y1="${m.y}" x2="${m.toX}" y2="${m.y}" class="message-line"${dashAttr}/>
  ${renderArrowHead(m.toX, m.y, m.isReverse, m.arrowStyle)}
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="message-label"${styleAttr}>${esc(m.label)}</text>
  ${numberSvg}
</g>`;
}

export function renderSelfCall(s: SelfCallGeometry): string {
  const x1 = s.x;
  // HTML SelfInvocation layout (flex-col): label on top, SVG arrow below.
  // s.y = coord.top = top of the self-invocation element.
  // Label: 14px font, baseline ≈ 11px from top.
  const labelX = x1 + 6;
  const labelY = s.y + 11;

  // Sequence number: positioned to the left of the self-call origin with 4px gap
  const numberSvg = s.number
    ? `<text x="${x1 - 4}" y="${labelY}" text-anchor="end" class="seq-number">${esc(s.number)}</text>`
    : "";

  // Reuse the exact same SVG structure as the HTML SelfInvocation component:
  //   <svg width="30" height="24">
  //     <path d="M0,2 L26,2 Q28,2 28,4 L28,13 Q28,15 26,15 L14,15"/>
  //     <g transform="translate(7, 10)"><ArrowHead fill rtl/></g>
  //   </svg>
  // Position: +1px right of s.x (matching HTML CSS border offset).
  // SVG top = s.y + 14 (below the 14px label).
  const svgX = x1;
  const svgY = s.y + 14;

  return `<g class="message self-call">
  <svg x="${svgX}" y="${svgY}" width="30" height="24">
    <path d="M0,2 L26,2 Q28,2 28,4 L28,13 Q28,15 26,15 L14,15" fill="none" stroke="#000" stroke-width="2"/>
    <g transform="translate(7, 10)">
      <svg height="10" width="7" viewBox="0 0 7 9">
        <g transform="scale(-1, 1) translate(-7, 0)">
          <path d="M1 1.25 L6.15 4.5 L1 7.75 Z" stroke="#000" stroke-linecap="round" fill="#000" stroke-width="2"/>
        </g>
      </svg>
    </g>
  </svg>
  <text x="${labelX}" y="${labelY}" text-anchor="start" class="message-label"${s.style ? ` style="${styleToAttr(s.style)}"` : ""}>${esc(s.label.trim())}</text>
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
