import { getEmojiUnicode } from "@/emoji/resolveEmoji";
import type { ParticipantGeometry } from "../geometry";
import { getIcon } from "../icons";
import { PARTICIPANT_EMOJI_WIDTH } from "../svgConstants";
import { esc } from "./svgUtils";
import { participantTextColor } from "@/utils/Color";

/**
 * Stroke inset for SVG border-box emulation.
 * CSS border-box keeps the border INSIDE the element's width/height.
 * SVG centered stroke extends half the stroke width OUTSIDE the rect.
 * Inset the rect by half the stroke width on each side so the outer
 * stroke edge aligns with the CSS border outer edge.
 */
const STROKE_WIDTH = 1;
const HALF_STROKE = STROKE_WIDTH / 2; // 0.5px inset
const ICON_SIZE = 24;
const ICON_MARGIN_RIGHT = 4;
const ICON_PAINT_OFFSET_X = 4;
const LABEL_PAD_LEFT = 8;
const LABEL_HORIZONTAL_PADDING = 16;
const STEREOTYPE_VERTICAL_OFFSET = 8;
const STEREOTYPE_FONT_SIZE = 14;
const BOUNDARY_ICON_VERTICAL_TWEAK = 2.75;
const EMOJI_FONT_ATTRS = `font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Twemoji Mozilla',sans-serif"`;

interface ParticipantRowLayout {
  /** Left edge of the type icon; set only when the row reserves an icon slot. */
  iconX?: number;
  /** Left edge of the emoji glyph; set only when the participant has an emoji. */
  emojiX?: number;
  textX: number;
  textAnchor: "start" | "middle";
}

/**
 * Horizontal layout of the participant label row, shared by the top and bottom
 * boxes. `withIcon` reserves the type-icon slot ahead of the emoji and label.
 *
 * Without an icon or an emoji the label is centred on the participant.
 */
function layoutParticipantRow(
  p: ParticipantGeometry,
  { withIcon }: { withIcon: boolean },
): ParticipantRowLayout {
  const textWidth = p.labelWidth ?? 0;
  if (withIcon) {
    // HTML centers the whole icon+label row. The label glyphs sit inside a span
    // with 8px left/right inline padding, so SVG needs to place text from the
    // padded glyph origin rather than the visual center of the participant box.
    // When both a type icon and emoji are present, the emoji is drawn as its own
    // <text> element but textWidth only covers the plain label.
    // Add PARTICIPANT_EMOJI_WIDTH to account for the emoji glyph + space.
    const emojiExtra = p.emoji ? PARTICIPANT_EMOJI_WIDTH : 0;
    const groupWidth =
      ICON_SIZE +
      ICON_MARGIN_RIGHT +
      LABEL_HORIZONTAL_PADDING +
      textWidth +
      emojiExtra;
    const groupX = p.x - groupWidth / 2;
    const iconX = groupX + ICON_PAINT_OFFSET_X;
    if (p.emoji) {
      // When both type icon and emoji are present, the emoji sits immediately
      // after the type icon and the label text starts after the emoji + gap.
      // HTML layout: [4px iconOffset][icon 24px][4px iconMargin][emoji 16px][4px mr-1 margin][4px px-1 padding][labelText]
      const emojiX = iconX + ICON_SIZE + ICON_MARGIN_RIGHT;
      return {
        iconX,
        emojiX,
        textX: emojiX + PARTICIPANT_EMOJI_WIDTH + 4,
        textAnchor: "start",
      };
    }
    return {
      iconX,
      textX: groupX + ICON_SIZE + ICON_MARGIN_RIGHT + LABEL_PAD_LEFT,
      textAnchor: "start",
    };
  }
  if (p.emoji) {
    // Emoji-only participant (no SVG type icon): the emoji is a separate text
    // element to the left of the label, matching HTML's flex row layout.
    // HTML layout: [emoji:16px][gap:4px][leftpad:4px][labelText][rightpad:4px]
    // PARTICIPANT_EMOJI_WIDTH (20) covers emoji(16) + gap(4).
    // When a stereotype is present, the inner column width = max(emojiRowWidth, stereotypeGlyphWidth).
    // The entire inner column is centered at p.x: emojiX = p.x - innerColWidth/2.
    const groupWidth = PARTICIPANT_EMOJI_WIDTH + 8 + textWidth; // 8 = leftpad(4) + rightpad(4)
    const innerColWidth = Math.max(groupWidth, p.stereotypeWidth ?? 0);
    const emojiX = p.x - innerColWidth / 2;
    return {
      emojiX,
      textX: emojiX + PARTICIPANT_EMOJI_WIDTH + 4, // after emoji(16)+gap(4)=20, then leftpad(4)
      textAnchor: "start",
    };
  }
  return { textX: p.x, textAnchor: "middle" };
}

function renderEmojiText(x: number, y: number, emoji: string): string {
  return `<text x="${x}" y="${y}" dominant-baseline="central" ${EMOJI_FONT_ATTRS} class="participant-emoji">${esc(getEmojiUnicode(emoji))}</text>`;
}

// Aliased labels (e.g. "b:B") — use textLength to pin the text extent to the
// measured glyph width. HTML renders the label at natural glyph width with CSS
// padding around it (not between characters). Setting textLength = glyphWidth
// ensures SVG matches the HTML glyph rendering without artificial stretching.
function labelTextLengthAttr(p: ParticipantGeometry): string {
  const useTextLength = p.labelWidth != null && p.name.includes(":");
  return useTextLength
    ? ` textLength="${p.labelWidth}" lengthAdjust="spacing"`
    : "";
}

export function renderParticipant(p: ParticipantGeometry): string {
  if (p.isStarter) return renderStarterParticipant(p);

  // Keep the visible outer radius at 4px, matching the CSS border-radius.
  const rx = 4 - HALF_STROKE;
  const x = p.x - p.width / 2 + HALF_STROKE;
  const rectY = p.y + HALF_STROKE;
  const rectW = p.width - STROKE_WIDTH;
  const rectH = p.height - STROKE_WIDTH;

  // Icon positioning (if present)
  const icon = getIcon(p.type);
  let iconSvg = "";
  let emojiIconSvg = "";

  const textY = p.y + p.height / 2 - 0.25;
  const labelY = p.stereotype ? textY + STEREOTYPE_VERTICAL_OFFSET : textY;

  const { iconX, emojiX, textX, textAnchor } = layoutParticipantRow(p, {
    withIcon: !!icon,
  });
  if (icon && iconX != null) {
    const iconType = p.type?.toLowerCase();
    const iconY =
      p.y +
      (p.height - ICON_SIZE) / 2 +
      (iconType === "boundary" ? BOUNDARY_ICON_VERTICAL_TWEAK : 0);
    const [, , vbW, vbH] = (icon.viewBox || "0 0 24 24").split(" ").map(Number);
    const scale = ICON_SIZE / Math.max(vbW, vbH);
    const iconAttrs = icon.attributes ? ` ${icon.attributes}` : "";

    iconSvg = `<g class="participant-icon" transform="translate(${iconX}, ${iconY}) scale(${scale})"${p.color ? ` style="color:${participantTextColor(normalizeHexColor(p.color))};"` : ""}${iconAttrs}>
    ${icon.content}
  </g>`;
  }
  if (p.emoji && emojiX != null) {
    emojiIconSvg = renderEmojiText(emojiX, labelY, p.emoji);
  }

  // An authored fill uses the same explicit black/white contrast as the HTML renderer.
  let stereotypeSvg = "";
  if (p.stereotype) {
    // Stereotype is always centered over the full participant box (text-anchor="middle").
    // When a type icon is present, center over the label portion only.
    // When no icon (plain or emoji-only), center at p.x (participant center).
    const stereoX =
      icon && p.labelWidth != null ? textX + p.labelWidth / 2 : p.x;
    const stereoAnchor = "middle";
    const stereoY = textY - STEREOTYPE_VERTICAL_OFFSET;
    // The label colour comes from the palette unless the author set a fill.
    const { textStyle: stereoTextStyle } = colorAttrs(p.color);
    stereotypeSvg = `<text x="${stereoX}" y="${stereoY}" text-anchor="${stereoAnchor}" dominant-baseline="central" class="stereotype-label" font-size="${STEREOTYPE_FONT_SIZE}"${stereoTextStyle}>${esc("«" + p.stereotype + "»")}</text>`;
  }

  const textLengthAttr = labelTextLengthAttr(p);

  const { fillStyle, textStyle } = colorAttrs(p.color);

  return `<g class="participant" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" class="participant-box"${fillStyle}/>
  ${iconSvg}
  ${emojiIconSvg}
  ${stereotypeSvg}
  <text x="${textX}" y="${labelY}" text-anchor="${textAnchor}" dominant-baseline="central" class="participant-label"${textLengthAttr}${textStyle}>${esc(p.label)}</text>
</g>`;
}

export function renderParticipantBottom(
  p: ParticipantGeometry,
  bottomY: number,
): string {
  if (!p.showBottom || p.isStarter) return "";
  const rx = 4 - HALF_STROKE;
  const x = p.x - p.width / 2 + HALF_STROKE;
  const rectY = bottomY + HALF_STROKE;
  const rectW = p.width - STROKE_WIDTH;
  const rectH = p.height - STROKE_WIDTH;
  const textY = bottomY + p.height / 2 - 0.25;

  const textLengthAttr = labelTextLengthAttr(p);
  const { fillStyle, textStyle } = colorAttrs(p.color);

  // The bottom box draws no type icon and no stereotype. It reserves the icon
  // slot only when an emoji follows it, so a plain-icon label stays centred.
  const { emojiX, textX, textAnchor } = layoutParticipantRow(p, {
    withIcon: !!getIcon(p.type) && !!p.emoji,
  });
  const emojiSvg =
    p.emoji && emojiX != null
      ? `\n  ${renderEmojiText(emojiX, textY, p.emoji)}`
      : "";

  return `<g class="participant participant-bottom" data-participant="${esc(p.name)}">
  <rect x="${x}" y="${rectY}" width="${rectW}" height="${rectH}" rx="${rx}" class="participant-box"${fillStyle}/>${emojiSvg}
  <text x="${textX}" y="${textY}" text-anchor="${textAnchor}" dominant-baseline="central" class="participant-label"${textLengthAttr}${textStyle}>${esc(p.label)}</text>
</g>`;
}

function renderStarterParticipant(p: ParticipantGeometry): string {
  const icon = getIcon("actor");
  if (!icon) {
    return "";
  }

  const rx = 4 - HALF_STROKE;
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
function colorAttrs(color: string | undefined): {
  fillStyle: string;
  textStyle: string;
} {
  if (!color) {
    return { fillStyle: "", textStyle: "" };
  }
  const hex = normalizeHexColor(color);
  return {
    fillStyle: ` style="fill:${hex};"`,
    textStyle: ` style="fill:${participantTextColor(hex)};"`,
  };
}
