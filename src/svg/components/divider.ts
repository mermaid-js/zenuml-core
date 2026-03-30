import type { DividerGeometry } from "../geometry";
import { esc } from "./svgUtils";
import { resolveEmojiInText } from "@/emoji/resolveEmoji";

const PAD_X = 8;
const BOX_HEIGHT = 28;

export function renderDivider(d: DividerGeometry): string {
  const rawLabel = d.label.replace(/^=+\s*|\s*=+$/g, "").trim();
  const label = resolveEmojiInText(rawLabel);
  const centerX = d.width / 2;
  const textWidth = d.labelWidth ?? label.length * 8;
  // Match HTML box-sizing: border-box with 1px border.
  // Total visual width = textWidth + 2*padding + 2*border = textWidth + 18.
  // SVG stroke is centered on the rect edge (0.5px inside, 0.5px outside),
  // so the rect dimensions are the border-box dimensions minus the stroke overshoot.
  const borderWidth = 1;
  const totalWidth = textWidth + PAD_X * 2 + borderWidth * 2;
  const innerWidth = totalWidth - borderWidth; // rect width (stroke centered)
  const innerHeight = BOX_HEIGHT - borderWidth;
  const boxX = centerX - innerWidth / 2;
  const boxY = d.y - innerHeight / 2;
  const outerLeft = boxX - borderWidth / 2; // visual left edge of stroke
  const outerRight = boxX + innerWidth + borderWidth / 2; // visual right edge
  const textY = d.y;

  return `<g class="divider">
  <line x1="0" y1="${d.y}" x2="${outerLeft}" y2="${d.y}" class="divider-line"/>
  <line x1="${outerRight}" y1="${d.y}" x2="${d.width}" y2="${d.y}" class="divider-line"/>
  <rect x="${boxX}" y="${boxY}" width="${innerWidth}" height="${innerHeight}" rx="2" class="divider-bg"/>
  <text x="${centerX}" y="${textY}" text-anchor="middle" dominant-baseline="central" class="divider-label">${esc(label)}</text>
</g>`;
}
