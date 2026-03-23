import type { ParticipantGeometry } from "../geometry";
import { getIcon } from "../icons";

/**
 * Stroke inset for SVG border-box emulation.
 * CSS border-box keeps the border INSIDE the element's width/height.
 * SVG centered stroke extends half the stroke width OUTSIDE the rect.
 * Inset the rect by half the stroke width on each side so the outer
 * stroke edge aligns with the CSS border outer edge.
 */
const STROKE_WIDTH = 2;
const HALF_STROKE = STROKE_WIDTH / 2; // 1px inset
const ICON_SIZE = 24;
const ICON_MARGIN_RIGHT = 4;
const ICON_PAINT_OFFSET_X = 4;
const LABEL_PAD_LEFT = 8;
const LABEL_HORIZONTAL_PADDING = 16;

export function renderParticipant(p: ParticipantGeometry): string {
  if (p.isStarter) return renderStarterParticipant(p);

  // rx=3 so that with stroke-width:2 centered, outer visible radius is 3+1=4, matching CSS border-radius:4
  const rx = 3;
  const x = p.x - p.width / 2 + HALF_STROKE;
  const rectY = p.y + HALF_STROKE;
  const rectW = p.width - STROKE_WIDTH;
  const rectH = p.height - STROKE_WIDTH;

  // Icon positioning (if present)
  const icon = getIcon(p.type);
  let iconSvg = "";
  let textX = p.x;

  if (icon) {
    const textWidth = p.labelWidth ?? 0;
    // HTML centers the whole icon+label row. The label glyphs sit inside a span
    // with 8px left/right inline padding, so SVG needs to place text from the
    // padded glyph origin rather than the visual center of the participant box.
    const groupWidth = ICON_SIZE + ICON_MARGIN_RIGHT + LABEL_HORIZONTAL_PADDING + textWidth;
    const groupX = p.x - groupWidth / 2;
    const iconX = groupX + ICON_PAINT_OFFSET_X;
    const iconY = p.y + (p.height - ICON_SIZE) / 2;
    textX = groupX + ICON_SIZE + ICON_MARGIN_RIGHT + LABEL_PAD_LEFT;

    const [, , vbW, vbH] = (icon.viewBox || "0 0 24 24").split(" ").map(Number);
    const scale = ICON_SIZE / Math.max(vbW, vbH);
    const iconAttrs = icon.attributes ? ` ${icon.attributes}` : "";

    iconSvg = `<g class="participant-icon" transform="translate(${iconX}, ${iconY}) scale(${scale})"${iconAttrs}>
    ${icon.content}
  </g>`;
  }

  const textY = p.y + p.height / 2 - 0.25;

  // Stereotype label (e.g., «BFF») — rendered above the main label in smaller font
  let stereotypeSvg = "";
  if (p.stereotype) {
    const stereoY = textY - 14;
    stereotypeSvg = `<text x="${textX}" y="${stereoY}" text-anchor="${icon ? 'start' : 'middle'}" dominant-baseline="central" class="stereotype-label" font-size="12" fill="#666">${esc("«" + p.stereotype + "»")}</text>`;
  }

  // Aliased labels (e.g. "b:B") — use textLength to pin the text extent to the
  // measured glyph width. HTML renders the label at natural glyph width with CSS
  // padding around it (not between characters). Setting textLength = glyphWidth
  // ensures SVG matches the HTML glyph rendering without artificial stretching.
  const useTextLength = p.labelWidth != null && p.name.includes(":");
  const textLengthAttr = useTextLength
    ? ` textLength="${p.labelWidth}" lengthAdjust="spacing"`
    : "";

  const { fillAttr, textFill } = colorAttrs(p.color);

  return `<g class="participant" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" class="participant-box"${fillAttr}/>
  ${iconSvg}
  ${stereotypeSvg}
  <text x="${textX}" y="${textY}" text-anchor="${icon ? 'start' : 'middle'}" dominant-baseline="central" class="participant-label"${textLengthAttr}${textFill}>${esc(p.label)}</text>
</g>`;
}

export function renderParticipantBottom(p: ParticipantGeometry, bottomY: number): string {
  if (!p.showBottom || p.isStarter) return "";
  const rx = 3;
  const x = p.x - p.width / 2 + HALF_STROKE;
  const rectY = bottomY + HALF_STROKE;
  const rectW = p.width - STROKE_WIDTH;
  const rectH = p.height - STROKE_WIDTH;
  const textX = p.x;
  const textY = bottomY + p.height / 2 - 0.25;

  const useTextLength = p.labelWidth != null && p.name.includes(":");
  const textLengthAttr = useTextLength
    ? ` textLength="${p.labelWidth}" lengthAdjust="spacing"`
    : "";

  const { fillAttr, textFill } = colorAttrs(p.color);

  return `<g class="participant participant-bottom" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" class="participant-box"${fillAttr}/>
  <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="central" class="participant-label"${textLengthAttr}${textFill}>${esc(p.label)}</text>
</g>`;
}

function renderStarterParticipant(p: ParticipantGeometry): string {
  const icon = getIcon("actor");
  if (!icon) {
    return "";
  }

  const rx = 3;
  const boxX = p.x - p.width / 2 + HALF_STROKE;
  const rectY = p.y + HALF_STROKE;
  const rectW = p.width - STROKE_WIDTH;
  const rectH = p.height - STROKE_WIDTH;

  // HTML renderer places icon 2px left of box center due to CSS box-model padding.
  const iconX = p.x - ICON_SIZE / 2 - 2;
  const iconY = p.y + (p.height - ICON_SIZE) / 2;
  const [, , vbW, vbH] = (icon.viewBox || "0 0 24 24").split(" ").map(Number);
  const scale = ICON_SIZE / Math.max(vbW, vbH);
  const iconAttrs = icon.attributes ? ` ${icon.attributes}` : "";

  return `<g class="participant participant-starter" data-participant="${esc(p.name)}">
  <rect x="${boxX}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" class="participant-box"/>
  <g class="participant-icon" transform="translate(${iconX}, ${iconY}) scale(${scale})"${iconAttrs}>
    ${icon.content}
  </g>
</g>`;
}

/**
 * Normalize a color string to a # prefixed hex value.
 * Parser may provide "FFEBE6" or "#FFEBE6".
 */
function normalizeHexColor(color: string): string {
  const c = color.startsWith("#") ? color : `#${color}`;
  return c;
}

/**
 * Compute perceived brightness from a hex color string.
 * Uses the same formula as the HTML renderer (Color.ts brightnessIgnoreAlpha):
 * (R*299 + G*587 + B*114) / 1000
 * Returns a value 0-255; > 128 means light background.
 */
function hexBrightness(hex: string): number {
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * Build fill and text-color style attributes for a participant with a background color.
 */
function colorAttrs(color: string | undefined): { fillAttr: string; textFill: string } {
  if (!color) {
    return { fillAttr: "", textFill: "" };
  }
  const hex = normalizeHexColor(color);
  const textColor = hexBrightness(hex) > 128 ? "#000" : "#fff";
  return {
    fillAttr: ` fill="${hex}"`,
    textFill: ` fill="${textColor}"`,
  };
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
