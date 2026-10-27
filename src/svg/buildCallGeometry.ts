/**
 * Geometry for one sync or async message statement: the arrow (or self-call
 * loop), the target's occurrence bar, and the assignment return.
 */
import {
  OCCURRENCE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
  LIFELINE_WIDTH,
} from "@/positioning/Constants";
import {
  ASYNC_SELF_MESSAGE_HEIGHT,
  MESSAGE_HEIGHT,
  SELF_MESSAGE_HEIGHT,
} from "@/positioning/vertical/LayoutMetrics";
import Anchor from "@/positioning/Anchor";
import type {
  MessageGeometry,
  SelfCallGeometry,
  OccurrenceGeometry,
  ReturnGeometry,
} from "./geometry";
import type { StatementInfo } from "./walkStatements";
import type { StatementContext } from "./statementContext";

export interface CallGeometry {
  /** Set for a non-self call. */
  message?: MessageGeometry;
  /** Set for a self call. */
  selfCall?: SelfCallGeometry;
  /** Set for a sync call whose occurrence has height. */
  occurrence?: OccurrenceGeometry;
  /** Assignment return, e.g. `ret0 = C.method() { ... }`. */
  assignmentReturn?: ReturnGeometry;
  /** Lowest point the assignment return needs below it; unset without one. */
  returnBottom?: number;
}

export function buildCallGeometry(
  info: StatementInfo,
  ctx: StatementContext,
): CallGeometry {
  const { coord, adjust, messageStyle, coordinates, adjustMap } = ctx;
  const result: CallGeometry = {};
  let fromX = coordinates.getPosition(info.from);
  const toX = coordinates.getPosition(info.to);
  const isAsync = info.kind === "async";
  // Same three heights the VMs measure (SyncMessageStatementVM /
  // AsyncMessageStatementVM): a self sync call is the 30px looped arrow, a
  // self async call is label + 24px arrow SVG, everything else is 16px.
  const messageHeight = !info.isSelf
    ? MESSAGE_HEIGHT
    : isAsync
      ? ASYNC_SELF_MESSAGE_HEIGHT
      : SELF_MESSAGE_HEIGHT;
  // Comment height: HTML renders comment <p> above the message in CSS flow.
  // coord.top doesn't include comment height, so offset manually (same as fragments).
  const msgCommentHeight = ctx.commentHeight;
  const messageY = coord.top + adjust + msgCommentHeight + messageHeight - 0.5;

  // D4: When sender has an active occurrence, arrow starts from its near edge.
  // Same wall arithmetic the HTML path runs through Anchor:
  // LTR → rightEdgeOfRightWall (position + side*depth);
  // RTL → leftEdgeOfRightWall  (position + side*(depth-1) - side).
  if (info.senderOccurrenceDepth >= 1 && !info.isSelf) {
    const senderAnchor = new Anchor(fromX, info.senderOccurrenceDepth);
    const isLTR = fromX < toX;
    fromX = isLTR
      ? senderAnchor.rightEdgeOfRightWall()
      : senderAnchor.leftEdgeOfRightWall();
  }

  // When target already has active occurrences, the new occurrence is nested
  // (stacked inward by OCCURRENCE_BAR_SIDE_WIDTH per level). Arrow endpoints shift accordingly.
  const targetDepth =
    info.targetOccurrenceDepth || (info.targetHasOccurrence ? 1 : 0);
  const nestingOffset = targetDepth * OCCURRENCE_BAR_SIDE_WIDTH;

  if (info.isSelf) {
    // Async self-calls: HTML renders label (flex-col) then a 30×24 SVG arrow.
    // The label and arrow are laid out by renderSelfCall from s.y, so no Y offset
    // is needed here — otherwise the label height gets double-counted.
    const selfYOffset = 0;
    const selfWidth = isAsync ? 28 : OCCURRENCE_WIDTH;
    // For self-calls inside an occurrence, the HTML component renders
    // inside the occurrence div — starting at the occurrence's right edge,
    // i.e. Anchor's rightEdgeOfRightWall (position + side*depth), which
    // degenerates to the bare lifeline position at depth 0.
    const selfX = new Anchor(
      fromX,
      info.senderOccurrenceDepth,
    ).rightEdgeOfRightWall();
    result.selfCall = {
      x: selfX,
      y: coord.top + selfYOffset + msgCommentHeight,
      width: selfWidth,
      height: messageHeight,
      label: info.label,
      arrowStyle: isAsync ? "open" : "solid",
      number: info.number,
      style: messageStyle,
    };
  } else {
    // Arrow tip stops at near edge of target's occurrence bar.
    // Sync: creates new occ → toX ∓ OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset
    //   (points at inner edge where new occ starts)
    // Async with existing target occ → toX ∓ nestingOffset
    //   (points at outer edge of existing occ)
    const isLTR = fromX < toX;
    const syncOffset = info.kind === "sync" && !info.isSelf;
    const asyncTargetOcc =
      info.kind === "async" && !info.isSelf && targetDepth > 0;
    const arrowToX = syncOffset
      ? isLTR
        ? toX - OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset
        : toX + OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset
      : asyncTargetOcc
        ? isLTR
          ? toX - nestingOffset
          : toX + nestingOffset
        : toX;

    result.message = {
      fromX,
      toX: arrowToX,
      y: messageY,
      label: info.label,
      arrowStyle: info.kind === "async" ? "open" : "solid",
      isSelf: false,
      isReverse: arrowToX < fromX,
      number: info.number,
      style: messageStyle,
    };
  }

  // Occurrence: activation box centered on the target participant's lifeline
  if (info.kind === "sync") {
    const occX = toX - OCCURRENCE_BAR_SIDE_WIDTH;
    const occY = messageY - 1.5;
    // +2: SVG stroke extends 1px beyond rect on each side (centered model).
    // renderOccurrence insets by 1px, so fill area = geometry - 2 matches
    // HTML border-box height. Stroke extends to geometry size visually.
    // Subtract msgCommentHeight: coord.height includes the comment above the
    // message, but the occurrence starts BELOW the comment (at messageY - 1.5),
    // so the comment height must not inflate the occurrence bar.
    let occHeight = coord.height - messageHeight - msgCommentHeight + 2;

    // Adjust occurrence height for inner return debt.
    // The positioning engine underestimates block heights because non-self returns
    // have height=0. Each missing return adds exactly RETURN_VISUAL_HEIGHT (16px)
    // of visual space in HTML that the positioning engine doesn't account for.
    const innerDebtKey = `inner:${info.key}`;
    const innerDebt = adjustMap.get(innerDebtKey) || 0;
    if (innerDebt > 0) {
      occHeight += innerDebt;
    }

    const messageCtx = info.statNode?.message?.();
    const assignment = messageCtx?.Assignment?.();

    // Assignment return compensation: the positioning engine adds +12 for
    // assignee returns (SyncMessageStatementVM line 41), but HTML renders
    // the assignment return as ~16px inside the occurrence. Add the 4px
    // difference so the occurrence bar extends to match HTML.
    if (assignment?.assignee && !info.isSelf && info.hasBlock) {
      occHeight += 4;
    }

    // With cursor+=12, the positioning engine now correctly accounts for
    // the CSS border height in both mixed-content and non-block assignment
    // cases. No additional +1 corrections needed.

    // Assignment return Y: sits 2px above the occurrence bottom,
    // matching HTML's return position inside the CSS border.
    // Must be computed AFTER all height corrections so the gap is
    // consistently 2px from the final occurrence bottom.
    const returnArrowY = occY + occHeight - 2;

    if (occHeight > 0) {
      result.occurrence = {
        x: occX,
        y: occY,
        width: OCCURRENCE_WIDTH,
        height: occHeight,
        participantName: info.to,
      };

      // Assignment return: e.g. `ret0 = C.method() { ... }`
      if (assignment?.assignee && !info.isSelf) {
        // Return goes from target (toX) back to sender (fromX).
        // Target always has occurrence; start from its near edge toward sender.
        // When target has nested occurrence, shift by OCCURRENCE_BAR_SIDE_WIDTH.
        // +1: OCCURRENCE_WIDTH (15) = 2*OCCURRENCE_BAR_SIDE_WIDTH (14) + 1 center pixel.
        // The arrow starts from the occurrence edge (inner border in HTML, fill edge in SVG).
        const isLTR = fromX < toX;
        const retFromX = isLTR
          ? toX - OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset + 1
          : toX + OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset + 1;
        // Sender's fromX is D4-adjusted for its occurrence edge.
        // For bare lifelines (no occurrences), adjust to match HTML Anchor's
        // edge offset. HTML places the return endpoint at:
        //   rightEdgeOfRightWall + LIFELINE_WIDTH + 1 (LTR message → RTL return)
        //   position + LIFELINE_WIDTH (RTL message → LTR return)
        // For occupied senders, D4 positions at the fill edge; add +2 for the
        // center pixel + stroke that extends beyond the occurrence rect
        // (matching the keyword return's +1 at the right wall edge).
        let senderX = fromX;
        if (info.senderOccurrenceDepth === 0) {
          senderX += isLTR ? LIFELINE_WIDTH + 1 : LIFELINE_WIDTH;
        } else if (isLTR) {
          senderX += 2;
        }
        // Assignment return seq number: HTML numbers it as (blockChildCount + 1)
        // For non-block sync (e.g. `ret = B.method`), it's N.1 (no block children).
        // For block sync (e.g. `ret = B.method { ... }`), it's N.(children+1).
        const assignReturnNumber = info.number
          ? `${info.number}.${(ctx.blockChildCount.get(info.number) || 0) + 1}`
          : undefined;
        result.assignmentReturn = {
          fromX: retFromX,
          toX: senderX,
          y: returnArrowY,
          label: assignment.assignee,
          isReverse: fromX < toX,
          isSelf: false,
          number: assignReturnNumber,
        };
        result.returnBottom = returnArrowY + 46;
      }
    }
  }
  return result;
}
