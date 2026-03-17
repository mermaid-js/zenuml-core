import type { MessageGeometry, SelfCallGeometry } from "../geometry";

export function renderMessage(m: MessageGeometry): string {
  // HTML centers the label between source lifeline and arrowhead (excluding arrow width).
  // Shift label center by half the arrowhead width (3.5px) toward the source participant.
  const arrowHalfW = 3.5;
  const direction = Math.sign(m.toX - m.fromX); // +1 right-pointing, -1 left-pointing
  const labelX = (m.fromX + m.toX) / 2 - direction * arrowHalfW + 0.5; // +0.5: match HTML label centering
  // HTML renders label as a block element ABOVE the border-bottom line.
  // SVG text y = baseline. For 14px Helvetica, getBBox().y ≈ y - 13.
  // HTML label top = m.y - 17 (content coords). Need bbox.y = m.y - 17, so y = m.y - 4.
  const labelY = m.y - 3.5; // -3.5 instead of -4: +0.5 to shift label down

  const dashAttr = m.arrowStyle === "dashed" ? ' stroke-dasharray="6,4"' : "";
  const styleAttr = m.style ? ` style="${styleToAttr(m.style)}"` : "";

  // Sequence number: positioned to the left of the message origin with 4px gap (matching HTML pr-1)
  const numberSvg = m.number
    ? `<text x="${m.fromX - 4}" y="${labelY}" text-anchor="end" class="seq-number">${esc(m.number)}</text>`
    : "";

  // -0.5px Y: align with HTML's border-bottom line rendering (CSS renders at half-pixel)
  // +0.5px X: shift line and head right to match HTML arrow position
  const lineY = m.y - 0.5;
  const fromX = m.fromX + 0.5;
  const toX = m.toX + 0.5;
  return `<g class="message">
  <line x1="${fromX}" y1="${lineY}" x2="${toX}" y2="${lineY}" class="message-line"${dashAttr}/>
  ${renderArrowHead(toX - 1, lineY, m.isReverse, m.arrowStyle)}
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="message-label"${styleAttr}>${esc(m.label)}</text>
  ${numberSvg}
</g>`;
}

export function renderSelfCall(s: SelfCallGeometry): string {
  const x1 = s.x;
  // HTML SelfInvocation layout (flex-col): label on top, SVG arrow below.
  // s.y = coord.top = top of the self-invocation element.
  // Label: 14px font, baseline ≈ 11px from top.
  // Native browser screenshot diff confirms same Y for both sync and async.
  const isAsync = s.arrowStyle === "open";
  const labelX = x1 + 6;
  const labelY = s.y + (isAsync ? 15 : 11);

  // Sequence number: positioned to the left of the self-call origin with 4px gap
  const numberSvg = s.number
    ? `<text x="${x1 - 4}" y="${labelY}" text-anchor="end" class="seq-number">${esc(s.number)}</text>`
    : "";

  // Reuse the exact same SVG structure as the HTML SelfInvocation component:
  //   <svg width="30" height="24">
  //     <path d="M0,2 L26,2 Q28,2 28,4 L28,13 Q28,15 26,15 L{1|14},15"/>
  //     <g transform="translate({0|7}, 10)"><ArrowHead {open|fill} rtl/></g>
  //   </svg>
  // Position: +1px right of s.x (matching HTML CSS border offset).
  // Async: HTML flex-col puts ~20px of label space above the arrow SVG.
  // Sync: label is more compact, arrow starts at s.y + 14.
  const svgX = x1 + 1;
  const svgY = s.y + (isAsync ? 20 : 14);

  // Async: open arrowhead at left edge (L1,15, translate(0,10), fill=none, no Z)
  // Sync: filled arrowhead at midpoint (L14,15, translate(7,10), fill=#000, Z)
  const pathEnd = isAsync ? "L1,15" : "L14,15";
  const arrowTx = isAsync ? 0 : 7;
  const arrowFill = isAsync ? "none" : "#000";
  const arrowPath = isAsync
    ? 'M1 1.25 L6.15 4.5 L1 7.75'
    : 'M1 1.25 L6.15 4.5 L1 7.75 Z';

  return `<g class="message self-call">
  <svg x="${svgX}" y="${svgY}" width="30" height="24">
    <path d="M0,2 L26,2 Q28,2 28,4 L28,13 Q28,15 26,15 ${pathEnd}" fill="none" stroke="#000" stroke-width="2"/>
    <g transform="translate(${arrowTx}, 10)">
      <svg height="10" width="7" viewBox="0 0 7 9">
        <g transform="scale(-1, 1) translate(-7, 0)">
          <path d="${arrowPath}" stroke="#000" stroke-linecap="round" fill="${arrowFill}" stroke-width="2"/>
        </g>
      </svg>
    </g>
  </svg>
  <text x="${labelX}" y="${labelY}" text-anchor="start" class="message-label"${s.style ? ` style="${styleToAttr(s.style)}"` : ""}>${esc(s.label.trim())}</text>
  ${numberSvg}
</g>`;
}

/**
 * Renders an arrowhead using the exact same structure as HTML's ArrowHead.tsx:
 * <svg width="7" height="10" viewBox="0 0 7 9"> with path M1,1.25 L6.15,4.5 L1,7.75
 * RTL uses scale(-1,1) translate(-7,0) to mirror.
 *
 * The viewBox 7x9 → display 7x10 creates a slight vertical stretch (10/9)
 * that matches HTML's rendering. The tip is at viewBox (6.15, 4.5).
 */
function renderArrowHead(
  tipX: number,
  tipY: number,
  pointsLeft: boolean,
  style: string,
): string {
  const isFilled = style !== "open" && style !== "dashed";
  const pathD = isFilled
    ? "M1 1.25 L6.15 4.5 L1 7.75 Z"
    : "M1 1.25 L6.15 4.5 L1 7.75";
  const fillAttr = isFilled ? "#000" : "none";

  // Arrow tip in display coords: LTR at (6.15, 5.0), RTL at (0.85, 5.0)
  // (viewBox y=4.5 scaled by 10/9 ≈ 5.0)
  const tipDisplayX = pointsLeft ? 0.85 : 6.15;
  const tipDisplayY = 5;
  const svgX = tipX - tipDisplayX;
  const svgY = tipY - tipDisplayY;
  const rtlTransform = pointsLeft ? ' transform="scale(-1, 1) translate(-7, 0)"' : "";

  return `<svg x="${svgX}" y="${svgY}" width="7" height="10" viewBox="0 0 7 9" overflow="visible" class="arrow-head${isFilled ? "" : " arrow-open"}">
    <g${rtlTransform}>
      <path d="${pathD}" stroke="#000" stroke-linecap="round" stroke-width="2" fill="${fillAttr}"/>
    </g>
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
