import type { DividerGeometry } from "../geometry";
import { esc } from "./svgUtils";

const PAD_X = 8;
const BOX_HEIGHT = 28;

export function renderDivider(d: DividerGeometry): string {
  const label = d.label.replace(/^=+\s*|\s*=+$/g, "").trim();
  const centerX = d.width / 2;
  const textWidth = label.length * 8;
  const boxWidth = textWidth + PAD_X * 2;
  const boxX = centerX - boxWidth / 2;
  const boxY = d.y - BOX_HEIGHT / 2;
  const textY = d.y;

  return `<g class="divider">
  <line x1="0" y1="${d.y}" x2="${boxX}" y2="${d.y}" class="divider-line"/>
  <line x1="${boxX + boxWidth}" y1="${d.y}" x2="${d.width}" y2="${d.y}" class="divider-line"/>
  <rect x="${boxX}" y="${boxY}" width="${boxWidth}" height="${BOX_HEIGHT}" rx="2" class="divider-bg"/>
  <text x="${centerX}" y="${textY}" text-anchor="middle" dominant-baseline="central" class="divider-label">${esc(label)}</text>
</g>`;
}

