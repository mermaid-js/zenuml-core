/**
 * Builds participant, lifeline, and group geometry from parser models
 * and the positioning engine output.
 */
import type { Coordinates } from "@/positioning/Coordinates";
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import {
  measureSvgParticipantLabelWidth,
} from "@/positioning/WidthProviderFunc";
import type { IParticipantModel } from "@/parser/IParticipantModel";
import {
  MARGIN,
  MIN_PARTICIPANT_WIDTH,
} from "@/positioning/Constants";
import { TextType } from "@/positioning/Coordinate";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import type { ParticipantGeometry, LifelineGeometry, GroupGeometry } from "./geometry";
import {
  PARTICIPANT_TOP_SPACE,
  PARTICIPANT_BOX_PADDING,
  PARTICIPANT_BOX_PADDING_ASSIGNEE,
  PARTICIPANT_ICON_ROW_WIDTH,
  PARTICIPANT_EMOJI_WIDTH,
  PARTICIPANT_VISUAL_HEIGHT,
  PARTICIPANT_MAX_WIDTH,
  snapX,
} from "./svgConstants";

export function buildParticipants(
  models: IParticipantModel[],
  coordinates: Coordinates,
  verticalCoordinates: VerticalCoordinates,
  measureText?: (text: string, type: TextType) => number,
): ParticipantGeometry[] {
  return models
    .map((m) => {
      const centerX = snapX(coordinates.getPosition(m.name));
      const halfWidth = coordinates.half(m.name);
      // Compute visual box width from raw text measurement + CSS decorations.
      // The positioning engine clamps labelWidth to MIN_PARTICIPANT_WIDTH, losing
      // the actual text width.  Re-measure here to get the correct box size.
      // HTML box = max(textWidth + BOX_PADDING, MIN_PARTICIPANT_WIDTH).
      // Assignee participants (name contains ":") render two EditableSpan components
      // in HTML, each with 8px horizontal padding (EditableSpan.css .editable-span-base).
      const isAssignee = m.name.includes(":") && m.getDisplayName() === m.name;
      let width: number;
      let measuredTextWidth: number | undefined;
      let measuredStereotypeWidth: number | undefined;
      if (measureText && m.name !== _STARTER_) {
        const textWidth = measureSvgParticipantLabelWidth(m.getDisplayName());
        measuredTextWidth = textWidth;
        const padding = isAssignee ? PARTICIPANT_BOX_PADDING_ASSIGNEE : PARTICIPANT_BOX_PADDING;
        const iconWidth = m.hasIcon() ? PARTICIPANT_ICON_ROW_WIDTH : 0;
        const emojiWidth = m.emoji ? PARTICIPANT_EMOJI_WIDTH : 0;
        // When a stereotype is present, the participant box must be wide enough to fit the
        // stereotype text. HTML's box = max(contentRowWidth + padding, stereotypeGlyphWidth + 8, minWidth).
        // The +8 = 4px box padding (2px * 2) + 4px border (2px * 2), both included in border-box sizing.
        const STEREOTYPE_BOX_OVERHEAD = 8;
        if (m.stereotype) {
          measuredStereotypeWidth = measureSvgParticipantLabelWidth(`«${m.stereotype}»`);
        }
        const stereotypeBoxWidth = measuredStereotypeWidth != null
          ? measuredStereotypeWidth + STEREOTYPE_BOX_OVERHEAD
          : 0;
        width = Math.min(Math.max(textWidth + padding + iconWidth + emojiWidth, stereotypeBoxWidth, MIN_PARTICIPANT_WIDTH), PARTICIPANT_MAX_WIDTH);
      } else {
        width = Math.min(halfWidth * 2 - MARGIN, PARTICIPANT_MAX_WIDTH);
      }
      if (m.name === _STARTER_) width = Math.min(width, 80); // match HTML min-width: 80px
      const creationTop = verticalCoordinates.getCreationTop(m.name);
      const isStarter = m.name === _STARTER_;
      // updateCreationTop subtracts 8px for HTML CSS padding (.life-line-layer .pt-2);
      // SVG has no such padding, so add 8 back to recover the raw VM top, plus the
      // SVG stroke-model offset is already accounted for by PARTICIPANT_TOP_SPACE.
      const y =
        creationTop != null
          ? Math.max(PARTICIPANT_TOP_SPACE, creationTop + 8)
          : PARTICIPANT_TOP_SPACE;

      return {
        name: m.name,
        label: m.getDisplayName(),
        x: centerX,
        y,
        width,
        height: PARTICIPANT_VISUAL_HEIGHT,
        isStarter,
        showBottom: creationTop == null && !isStarter,
        labelWidth: measuredTextWidth,
        type: m.type,
        stereotype: m.stereotype,
        stereotypeWidth: measuredStereotypeWidth,
        color: m.color,
        emoji: m.emoji,
        groupId: m.groupId,
      };
    });
}

export function buildLifelines(
  participants: ParticipantGeometry[],
  diagramHeight: number,
): LifelineGeometry[] {
  return participants.map((p) => ({
    participantName: p.name,
    x: p.x, // align with occurrence bar center (same as participant center)
    topY: p.y + p.height, // starts at bottom of participant box (visible part)
    bottomY: diagramHeight,
    dashed: true,
  }));
}

/**
 * Build group geometry by grouping participants that share the same groupId.
 * Each group gets a bounding box from leftmost to rightmost participant,
 * with a small margin matching the HTML renderer's LIFELINE_GROUP_OUTLINE_MARGIN.
 */
export function buildGroups(
  participants: ParticipantGeometry[],
  diagramHeight: number,
): GroupGeometry[] {
  // HTML's outline-dashed extends 8px outside the participant bounding box.
  // Use negative margin to push SVG group outline outward to match.
  const GROUP_OUTLINE_MARGIN = -8;

  // Collect participants by groupId
  const groupMap = new Map<string | number, ParticipantGeometry[]>();
  for (const p of participants) {
    if (p.groupId != null) {
      const existing = groupMap.get(p.groupId);
      if (existing) {
        existing.push(p);
      } else {
        groupMap.set(p.groupId, [p]);
      }
    }
  }

  const groups: GroupGeometry[] = [];
  for (const [groupId, members] of groupMap) {
    if (members.length === 0) continue;

    // Find bounding box from leftmost to rightmost participant
    let minLeft = Infinity;
    let maxRight = -Infinity;
    let minY = Infinity;
    for (const m of members) {
      const left = m.x - m.width / 2;
      const right = m.x + m.width / 2;
      if (left < minLeft) minLeft = left;
      if (right > maxRight) maxRight = right;
      if (m.y < minY) minY = m.y;
    }

    // Group box: from leftmost participant left edge to rightmost participant right edge,
    // with a small margin inset (matching HTML's outline positioning).
    const x = minLeft + GROUP_OUTLINE_MARGIN;
    const width = maxRight - minLeft - 2 * GROUP_OUTLINE_MARGIN;
    // The HTML group container starts at the top of the content region and uses an
    // absolutely-positioned title strip, so the outer outline should stop at the
    // content bottom rather than adding a separate header band to its height.
    const y = minY - 20 + 0.75;
    // HTML group extends to the full diagram height plus bottom padding.
    // Add 12px to match HTML's h-full container which includes extra bottom space.
    const height = Math.max(0, diagramHeight - y + 12);

    // Use groupId as the display name (the parser sets groupId = group name from DSL)
    groups.push({
      name: String(groupId),
      x,
      y,
      width,
      height,
    });
  }

  return groups;
}
