/**
 * Geometry for one creation statement (`new B`): the creation arrow, the
 * created participant's occurrence bar, and the assignment return.
 */
import {
  OCCURRENCE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
  OCCURRENCE_EMPTY_HEIGHT,
} from "@/positioning/Constants";
import { CREATION_MESSAGE_HEIGHT } from "@/positioning/vertical/LayoutMetrics";
import type {
  CreationGeometry,
  OccurrenceGeometry,
  ReturnGeometry,
} from "./geometry";
import { PARTICIPANT_VISUAL_HEIGHT } from "./svgConstants";
import type { StatementInfo } from "./walkStatements";
import type { StatementContext } from "./statementContext";

export interface CreationStatementGeometry {
  /** Unset when the created participant has no geometry. */
  creation?: CreationGeometry;
  occurrence?: OccurrenceGeometry;
  /** Assignment return, e.g. `b = new B()`. */
  assignmentReturn?: ReturnGeometry;
  /** Lowest point the assignment return needs below it; unset without one. */
  returnBottom?: number;
}

export function buildCreationGeometry(
  info: StatementInfo,
  ctx: StatementContext,
): CreationStatementGeometry {
  const { coord, messageStyle, coordinates, participants } = ctx;
  const result: CreationStatementGeometry = {};
  let fromX = coordinates.getPosition(info.from);
  const toX = coordinates.getPosition(info.to);

  // When sender has an active occurrence, arrow starts from its near edge
  // For nested occurrences, offset further by OCCURRENCE_BAR_SIDE_WIDTH per extra level
  if (info.senderOccurrenceDepth >= 1) {
    const occOffset =
      OCCURRENCE_BAR_SIDE_WIDTH +
      (info.senderOccurrenceDepth - 1) * OCCURRENCE_BAR_SIDE_WIDTH;
    const isLTR = fromX < toX;
    fromX = isLTR ? fromX + occOffset : fromX - occOffset;
  }

  // Find the already-built participant (buildParticipants handles creationTop)
  const targetParticipant = participants.find((p) => p.name === info.to);
  // Center the arrow on the participant box visual center (y + height/2).
  const messageY = targetParticipant
    ? targetParticipant.y + PARTICIPANT_VISUAL_HEIGHT / 2
    : coord.top + CREATION_MESSAGE_HEIGHT / 2;
  if (targetParticipant) {
    result.creation = {
      participant: targetParticipant,
      message: {
        fromX,
        toX,
        y: messageY,
        label: info.label, // already «guillemet-wrapped» from SignatureText()
        arrowStyle: "open",
        isSelf: false,
        isReverse: toX < fromX,
        number: info.number,
        style: messageStyle,
      },
    };
  }

  // Creation always reserves occurrence space
  const occX = toX - OCCURRENCE_BAR_SIDE_WIDTH;
  // -2px matches HTML's Occurrence mt-[-2px]
  const occY = targetParticipant
    ? targetParticipant.y + PARTICIPANT_VISUAL_HEIGHT - 2
    : coord.top + CREATION_MESSAGE_HEIGHT - 2;
  // Compute occurrence from its top to the bottom of the statement coordinate.
  // Align the bottom edge with HTML's CSS-computed occurrence bottom.
  const occHeight = Math.max(
    coord.top + coord.height - occY,
    OCCURRENCE_EMPTY_HEIGHT,
  );
  if (occHeight > 0) {
    result.occurrence = {
      x: occX,
      y: occY,
      width: OCCURRENCE_WIDTH,
      height: occHeight,
      participantName: info.to,
    };

    // Assignment return for creation: e.g. `b = new B()`
    // Creation occurrences have minimal extra height in HTML (no block content gap),
    // so the return line sits right at occurrence bottom — no +5 offset needed
    // (contrast with sync assignment returns which need +5 to compensate for
    // HTML occurrence being taller due to the return container's my-4 margins).
    const creationCtx = info.statNode?.creation?.();
    const creationAssign = creationCtx?.Assignment?.();
    if (creationAssign?.assignee) {
      // -2 aligns with HTML return position: -1 for SVG stroke inset (occurrence.ts),
      // -1 because HTML return sits 1px above occurrence bottom
      const occBottom = occY + occHeight - 2;
      // Compute both endpoints from raw lifeline centers.
      // HTML return line starts 1px beyond sender occurrence edge (CSS gap),
      // and ends at the created occurrence edge.
      const rawFromX = coordinates.getPosition(info.from);
      const isLTR = rawFromX < toX;
      const occHalf = OCCURRENCE_BAR_SIDE_WIDTH;
      // Sender (A) side: occurrence near edge facing the created participant.
      // LTR: sender's right edge = rawFromX + occHalf + 1 (center pixel).
      // RTL: sender's left edge = rawFromX - occHalf.
      const senderNest =
        Math.max(info.senderOccurrenceDepth - 1, 0) * OCCURRENCE_BAR_SIDE_WIDTH;
      const senderRetX =
        info.senderOccurrenceDepth >= 1
          ? rawFromX + senderNest + (isLTR ? occHalf + 2 : -occHalf)
          : rawFromX;
      // Created (B) side: occurrence near edge facing the sender.
      // LTR: created's left edge + 1 (HTML starts 1px past border).
      // RTL: created's right edge = toX + occHalf + 1 (center pixel).
      const createdRetX = isLTR ? toX - occHalf + 1 : toX + occHalf + 1;
      // fromX = line start (created side), toX = arrow tip (sender side)
      // renderReturn places arrow head at toX
      result.assignmentReturn = {
        fromX: createdRetX,
        toX: senderRetX,
        y: occBottom,
        label: creationAssign.assignee,
        isReverse: createdRetX > senderRetX,
        isSelf: false,
        number: info.number
          ? `${info.number}.${(ctx.blockChildCount.get(info.number) || 0) + 1}`
          : undefined,
      };
      result.returnBottom = occBottom + 46;
    }
  }
  return result;
}
