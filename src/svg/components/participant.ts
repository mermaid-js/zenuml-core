import { getEmojiUnicode } from "@/emoji/resolveEmoji";
import type { ParticipantGeometry } from "../geometry";
import { getIcon } from "../icons";
import { PARTICIPANT_EMOJI_WIDTH } from "../svgConstants";
import { esc } from "./svgUtils";

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

  const EMOJI_FONT_ATTRS = `font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Twemoji Mozilla',sans-serif"`;

  // Icon positioning (if present)
  const icon = getIcon(p.type);
  let iconSvg = "";
  let emojiIconSvg = "";
  let textX = p.x;
  let textAnchor: "start" | "middle" = "middle";

  const textY = p.y + p.height / 2 - 0.25;
  const labelY = p.stereotype ? textY + STEREOTYPE_VERTICAL_OFFSET : textY;

  if (icon) {
    const textWidth = p.labelWidth ?? 0;
    // HTML centers the whole icon+label row. The label glyphs sit inside a span
    // with 8px left/right inline padding, so SVG needs to place text from the
    // padded glyph origin rather than the visual center of the participant box.
    // When both a type icon and emoji are present, the emoji tspan is rendered
    // inside the <text> element but textWidth only covers the plain label.
    // Add PARTICIPANT_EMOJI_WIDTH to account for the emoji glyph + space.
    const emojiExtra = p.emoji ? PARTICIPANT_EMOJI_WIDTH : 0;
    const groupWidth = ICON_SIZE + ICON_MARGIN_RIGHT + LABEL_HORIZONTAL_PADDING + textWidth + emojiExtra;
    const groupX = p.x - groupWidth / 2;
    const iconX = groupX + ICON_PAINT_OFFSET_X;
    const iconType = p.type?.toLowerCase();
    const iconY = p.y + (p.height - ICON_SIZE) / 2 + (iconType === "boundary" ? BOUNDARY_ICON_VERTICAL_TWEAK : 0);
    textX = groupX + ICON_SIZE + ICON_MARGIN_RIGHT + LABEL_PAD_LEFT;
    textAnchor = "start";

    const [, , vbW, vbH] = (icon.viewBox || "0 0 24 24").split(" ").map(Number);
    const scale = ICON_SIZE / Math.max(vbW, vbH);
    const iconAttrs = icon.attributes ? ` ${icon.attributes}` : "";

    iconSvg = `<g class="participant-icon" transform="translate(${iconX}, ${iconY}) scale(${scale})"${iconAttrs}>
    ${icon.content}
  </g>`;
  } else if (p.emoji) {
    // Emoji-only participant (no SVG type icon): render emoji as a separate text element
    // positioned to the left of the label, matching HTML's flex row layout.
    // HTML layout: [emoji:16px][gap:4px][leftpad:4px][labelText][rightpad:4px]
    // PARTICIPANT_EMOJI_WIDTH (20) covers emoji(16) + gap(4).
    const textWidth = p.labelWidth ?? 0;
    const groupWidth = PARTICIPANT_EMOJI_WIDTH + 8 + textWidth; // 8 = leftpad(4) + rightpad(4)
    const groupX = p.x - groupWidth / 2;
    const emojiTextX = groupX;
    textX = groupX + PARTICIPANT_EMOJI_WIDTH + 4; // after emoji(16)+gap(4)=20, then leftpad(4)
    textAnchor = "start";

    emojiIconSvg = `<text x="${emojiTextX}" y="${labelY}" dominant-baseline="central" ${EMOJI_FONT_ATTRS} class="participant-emoji">${esc(getEmojiUnicode(p.emoji))}</text>`;
  }

  // Match the current HTML renderer: stereotypes inherit the same 16px text styling
  // and theme-default participant text color rather than SVG-side contrast heuristics.
  let stereotypeSvg = "";
  if (p.stereotype) {
    const stereoX = icon && p.labelWidth != null
      ? textX + p.labelWidth / 2
      : textX;
    const stereoAnchor = icon && p.labelWidth != null ? "middle" : icon ? "start" : "middle";
    const stereoY = textY - STEREOTYPE_VERTICAL_OFFSET;
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

  // When emoji is rendered as a separate element (emoji-only, no icon), do not
  // include it as a tspan inside the label text element. For icon+emoji cases,
  // the emoji tspan is still included in the label text.
  const emojiTspan = p.emoji && icon
    ? `<tspan ${EMOJI_FONT_ATTRS} dominant-baseline="central" dy="0.1em">${esc(getEmojiUnicode(p.emoji))}</tspan><tspan dy="-0.1em"> </tspan>`
    : "";

  return `<g class="participant" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" class="participant-box"${fillStyle}/>
  ${iconSvg}
  ${emojiIconSvg}
  ${stereotypeSvg}
  <text x="${textX}" y="${labelY}" text-anchor="${textAnchor}" dominant-baseline="central" class="participant-label"${textLengthAttr}${textStyle}>${emojiTspan}${esc(p.label)}</text>
</g>`;
}

export function renderParticipantBottom(p: ParticipantGeometry, bottomY: number): string {
  if (!p.showBottom || p.isStarter) return "";
  const rx = 3;
  const x = p.x - p.width / 2 + HALF_STROKE;
  const rectY = bottomY + HALF_STROKE;
  const rectW = p.width - STROKE_WIDTH;
  const rectH = p.height - STROKE_WIDTH;
  const textY = bottomY + p.height / 2 - 0.25;

  const useTextLength = p.labelWidth != null && p.name.includes(":");
  const textLengthAttr = useTextLength
    ? ` textLength="${p.labelWidth}" lengthAdjust="spacing"`
    : "";

  const { fillStyle, textStyle } = colorAttrs(p.color);

  const EMOJI_FONT_ATTRS = `font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Twemoji Mozilla',sans-serif"`;
  const icon = getIcon(p.type);

  // Emoji-only bottom participant: render emoji as separate element, same as top box
  if (p.emoji && !icon) {
    const textWidth = p.labelWidth ?? 0;
    const groupWidth = PARTICIPANT_EMOJI_WIDTH + 8 + textWidth;
    const groupX = p.x - groupWidth / 2;
    const emojiTextX = groupX;
    const textX = groupX + PARTICIPANT_EMOJI_WIDTH + 4;
    const emojiIconSvg = `<text x="${emojiTextX}" y="${textY}" dominant-baseline="central" ${EMOJI_FONT_ATTRS} class="participant-emoji">${esc(getEmojiUnicode(p.emoji))}</text>`;
    return `<g class="participant participant-bottom" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" class="participant-box"${fillStyle}/>
  ${emojiIconSvg}
  <text x="${textX}" y="${textY}" text-anchor="start" dominant-baseline="central" class="participant-label"${textLengthAttr}${textStyle}>${esc(p.label)}</text>
</g>`;
  }

  // Icon+emoji case: emoji as tspan in label text
  const emojiTspan = p.emoji && icon
    ? `<tspan ${EMOJI_FONT_ATTRS} dominant-baseline="central" dy="0.1em">${esc(getEmojiUnicode(p.emoji))}</tspan><tspan dy="-0.1em"> </tspan>`
    : "";

  return `<g class="participant participant-bottom" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" class="participant-box"${fillStyle}/>
  <text x="${p.x}" y="${textY}" text-anchor="middle" dominant-baseline="central" class="participant-label"${textLengthAttr}${textStyle}>${emojiTspan}${esc(p.label)}</text>
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

