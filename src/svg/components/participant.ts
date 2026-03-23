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
const STEREOTYPE_VERTICAL_OFFSET = 8;
const STEREOTYPE_ICON_X_TWEAK = 1;
const STEREOTYPE_Y_TWEAK = 1;
const STEREOTYPE_FONT_SIZE = 16;
const BOUNDARY_ICON_VERTICAL_TWEAK = 2.75;
const PARTICIPANT_TEXT_FILL = "#222";

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
    const iconType = p.type?.toLowerCase();
    const iconY = p.y + (p.height - ICON_SIZE) / 2 + (iconType === "boundary" ? BOUNDARY_ICON_VERTICAL_TWEAK : 0);
    textX = groupX + ICON_SIZE + ICON_MARGIN_RIGHT + LABEL_PAD_LEFT;

    const [, , vbW, vbH] = (icon.viewBox || "0 0 24 24").split(" ").map(Number);
    const scale = ICON_SIZE / Math.max(vbW, vbH);
    const iconAttrs = icon.attributes ? ` ${icon.attributes}` : "";

    iconSvg = `<g class="participant-icon" transform="translate(${iconX}, ${iconY}) scale(${scale})"${iconAttrs}>
    ${icon.content}
  </g>`;
  }

  const textY = p.y + p.height / 2 - 0.25;
  const labelY = p.stereotype ? textY + STEREOTYPE_VERTICAL_OFFSET : textY;

  // Match the current HTML renderer: stereotypes inherit the same 16px text styling
  // and theme-default participant text color rather than SVG-side contrast heuristics.
  let stereotypeSvg = "";
  if (p.stereotype) {
    const stereoX = icon && p.labelWidth != null
      ? textX + p.labelWidth / 2 + STEREOTYPE_ICON_X_TWEAK
      : textX;
    const stereoAnchor = icon && p.labelWidth != null ? "middle" : icon ? "start" : "middle";
    const stereoY = textY - STEREOTYPE_VERTICAL_OFFSET + STEREOTYPE_Y_TWEAK;
    stereotypeSvg = `<text x="${stereoX}" y="${stereoY}" text-anchor="${stereoAnchor}" dominant-baseline="central" class="stereotype-label" font-size="${STEREOTYPE_FONT_SIZE}"${participantTextStyle()}>${esc("«" + p.stereotype + "»")}</text>`;
  }

  // Aliased labels (e.g. "b:B") — use textLength to pin the text extent to the
  // measured glyph width. HTML renders the label at natural glyph width with CSS
  // padding around it (not between characters). Setting textLength = glyphWidth
  // ensures SVG matches the HTML glyph rendering without artificial stretching.
  const useTextLength = p.labelWidth != null && p.name.includes(":");
  const textLengthAttr = useTextLength
    ? ` textLength="${p.labelWidth}" lengthAdjust="spacing"`
    : "";

  const { fillStyle, textStyle } = colorAttrs(p.color);

  return `<g class="participant" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" class="participant-box"${fillStyle}/>
  ${iconSvg}
  ${stereotypeSvg}
  <text x="${textX}" y="${labelY}" text-anchor="${icon ? 'start' : 'middle'}" dominant-baseline="central" class="participant-label"${textLengthAttr}${textStyle}>${esc(p.label)}</text>
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

  const { fillStyle, textStyle } = colorAttrs(p.color);

  return `<g class="participant participant-bottom" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" class="participant-box"${fillStyle}/>
  <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="central" class="participant-label"${textLengthAttr}${textStyle}>${esc(p.label)}</text>
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
 * Build fill and text-color style attributes for a participant with a background color.
 */
function colorAttrs(color: string | undefined): { fillStyle: string; textStyle: string } {
  if (!color) {
    return { fillStyle: "", textStyle: "" };
  }
  const hex = normalizeHexColor(color);
  return {
    fillStyle: ` style="fill:${hex};"`,
    textStyle: participantTextStyle(),
  };
}

function participantTextStyle(): string {
  return ` style="fill:${PARTICIPANT_TEXT_FILL};"`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
