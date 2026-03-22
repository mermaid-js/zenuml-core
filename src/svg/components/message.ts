import type { MessageGeometry, SelfCallGeometry } from "../geometry";

export function renderMessage(m: MessageGeometry): string {
  // HTML arrow SVG container spans from left_lifeline_center+1 to right_lifeline_center.
  // Left endpoint = center+1 (right edge of 2px lifeline), right endpoint = center.
  const isLTR = m.fromX < m.toX;
  const fromX = isLTR ? m.fromX + 1 : m.fromX;
  const toX = isLTR ? m.toX : m.toX + 1;

  // HTML centers the label between source lifeline and arrowhead tip.
  // The arrowhead is 7px wide, so CSS centering excludes half the arrowhead (3.5px),
  // shifting the label center toward the source. +0.5 for lifeline width averaging.
  const direction = Math.sign(m.toX - m.fromX);
  const labelX = (m.fromX + m.toX) / 2 - direction * 3.5 + 0.5;
  const labelY = m.y - 3.5;

  const dashAttr = m.arrowStyle === "dashed" ? ' stroke-dasharray="6,4"' : "";
  const styleAttr = m.style ? ` style="${styleToAttr(m.style)}"` : "";

  // Sequence number: positioned to the LEFT of the message with 4px gap (matching HTML pr-1).
  const numberX = Math.min(fromX, toX) - 4;
  const numberSvg = m.number
    ? `<text x="${numberX}" y="${labelY}" text-anchor="end" class="seq-number">${esc(m.number)}</text>`
    : "";

  const lineY = m.y - 0.5;
  return `<g class="message">
  <line x1="${fromX}" y1="${lineY}" x2="${toX}" y2="${lineY}" class="message-line"${dashAttr}/>
  ${renderArrowHead(toX, lineY, m.isReverse, m.arrowStyle)}
  <text x="${labelX}" y="${labelY}" text-anchor="middle" class="message-label"${styleAttr}>${esc(m.label)}</text>
  ${numberSvg}
</g>`;
}

export function renderSelfCall(s: SelfCallGeometry): string {
  const x1 = s.x;
  // HTML SelfInvocation layout (flex-col): label on top, SVG arrow below.
  // s.y = coord.top = top of the self-invocation element.
  // Label: sync self calls sit 1px lower than async in the DOM.
  const isAsync = s.arrowStyle === "open";
  const labelX = x1 + 6;
  const labelY = s.y + (isAsync ? 15 : 12);

  // Sequence number: positioned to the left of the self-call origin.
  // HTML positions the number at the container top (flush), while the label is 2px below.
  // For async, labelY = s.y + 15, but number should be at s.y + 11 (4px higher).
  // For sync, labelY = s.y + 11, number at same Y (both flush with container).
  const numberY = s.y + 12;
  const numberSvg = s.number
    ? `<text x="${x1 - 3}" y="${numberY}" text-anchor="end" class="seq-number">${esc(s.number)}</text>`
    : "";

  // Reuse the exact same SVG structure as the HTML SelfInvocation component:
  //   <svg width="30" height="24">
  //     <path d="M0,2 L26,2 Q28,2 28,4 L28,13 Q28,15 26,15 L{1|14},15"/>
  //     <g transform="translate({0|7}, 10)"><ArrowHead {open|fill} rtl/></g>
  //   </svg>
  // Position: +1px right of s.x (matching HTML CSS border offset).
  // Browser-native screenshots show sync self-call arrows need to sit 2px lower
  // than the previous SVG placement, while async self-call arrows already match.
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
  // Filled sync arrowheads render slightly too far right at the shaft join if we
  // place them purely by mathematical tip alignment. Pull them left by 0.75px to
  // match the browser rasterization of the HTML renderer's absolutely positioned head.
  const joinAdjustX = isFilled ? -0.75 : 0;
  const svgX = tipX - tipDisplayX + joinAdjustX;
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
