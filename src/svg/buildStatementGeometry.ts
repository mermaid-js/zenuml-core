/**
 * Builds message, occurrence, creation, fragment, return, divider, and comment
 * geometry from the statement tree walker output and positioning engine.
 */
import type { Coordinates } from "@/positioning/Coordinates";
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import {
  OCCURRENCE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
  LIFELINE_WIDTH,
  OCCURRENCE_EMPTY_HEIGHT,
} from "@/positioning/Constants";
import { TextType } from "@/positioning/Coordinate";
import { buildFragmentGeometry } from "./buildFragmentGeometry";
import { measureSvgFragmentLabelWidth } from "@/positioning/WidthProviderFunc";
import { walkStatements } from "./walkStatements";
import { computeReturnDebt } from "./computeReturnDebt";
import CommentClass from "@/components/Comment/Comment";
import type {
  ParticipantGeometry,
  MessageGeometry,
  SelfCallGeometry,
  OccurrenceGeometry,
  CreationGeometry,
  FragmentGeometry,
  ReturnGeometry,
  DividerGeometry,
  CommentGeometry,
} from "./geometry";
import { PARTICIPANT_VISUAL_HEIGHT, snapX, cssToSvgStyle } from "./svgConstants";
import type { RootContextNode } from "@/parser/AntlrTypes";

export interface BuildMessagesResult {
  messages: MessageGeometry[];
  selfCalls: SelfCallGeometry[];
  occurrences: OccurrenceGeometry[];
  creations: CreationGeometry[];
  fragments: FragmentGeometry[];
  returns: ReturnGeometry[];
  dividers: DividerGeometry[];
  comments: CommentGeometry[];
  totalReturnDebt: number;
  maxReturnBottom: number;
}

export function buildMessages(
  rootContext: RootContextNode,
  coordinates: Coordinates,
  verticalCoordinates: VerticalCoordinates,
  participants: ParticipantGeometry[],
  measureText?: (text: string, type: TextType) => number,
): BuildMessagesResult {
  const statements = walkStatements(rootContext);
  const messages: MessageGeometry[] = [];
  const selfCalls: SelfCallGeometry[] = [];
  const occurrences: OccurrenceGeometry[] = [];
  const creations: CreationGeometry[] = [];
  const fragments: FragmentGeometry[] = [];
  const returns: ReturnGeometry[] = [];
  const dividers: DividerGeometry[] = [];
  const comments: CommentGeometry[] = [];

  let maxReturnBottom = 0;
  const diagramWidth = coordinates.getWidth();
  const allParticipants = coordinates.orderedParticipantNames();

  // --- Block child count: how many direct children each parent number has ---
  // Used to compute assignment return seq numbers (e.g. block with 3 children → return is N.4)
  const blockChildCount = new Map<string, number>();
  for (const s of statements) {
    if (s.number) {
      const lastDot = s.number.lastIndexOf(".");
      const parent = lastDot >= 0 ? s.number.substring(0, lastDot) : "";
      const ordinal = parseInt(s.number.substring(lastDot + 1), 10);
      const prev = blockChildCount.get(parent) || 0;
      if (ordinal > prev) blockChildCount.set(parent, ordinal);
    }
  }

  // --- Scope-aware return height debt computation ---
  // ReturnStatementVM.measure() reports height=0 for non-self returns, but in HTML
  // the return element takes ~16px of visual space. This causes all subsequent
  // elements to be positioned too high. We compute a per-statement adjustment.
  const RETURN_VISUAL_HEIGHT = 16;
  const adjustMap = computeReturnDebt(statements, verticalCoordinates, RETURN_VISUAL_HEIGHT);

  for (const info of statements) {
    const coord = verticalCoordinates.getStatementCoordinate(info.key);
    if (!coord) continue;
    const adjust = adjustMap.get(info.key) || 0;

    // --- Parse styling comments (e.g. // [red] text) ---
    let commentObj: CommentClass | undefined;
    if (info.comment) {
      commentObj = new CommentClass(info.comment);
    }

    // --- Comments (inline, above the statement) ---
    // Fragment comments are positioned inside buildFragmentGeometry (at fragX, not sender lifeline).
    if (commentObj?.text && info.kind !== "fragment") {
      // For RTL creation statements, HTML positions the comment at the target (left side).
      // For all other cases, the comment is at the sender's position.
      let commentParticipant = info.from;
      if (info.kind === "creation" && info.from && info.to) {
        const fX = coordinates.getPosition(info.from);
        const tX = coordinates.getPosition(info.to);
        if (fX > tX) commentParticipant = info.to;
      }
      const commentX = commentParticipant
        ? snapX(coordinates.getPosition(commentParticipant))
        : 10;
      // SVG text y = baseline; HTML positions by visual top. Add font ascent (~12px for 14px text).
      const COMMENT_FONT_ASCENT = 15;
      // Inside an occurrence, HTML positions the comment at the occurrence
      // bar's inner edge (OCCURRENCE_BAR_SIDE_WIDTH + 1). At the top level
      // (no active occurrence), the comment sits near the lifeline center.
      const commentXOffset = info.senderOccurrenceDepth >= 1
        ? OCCURRENCE_BAR_SIDE_WIDTH + 1
        : 1;
      // HTML wraps backtick text in <code> with padding:2px (Cosmetic.scss).
      // Add the same left-padding offset so SVG text aligns with HTML.
      const codeSpanPadding = commentObj.text.trimStart().startsWith("`") ? 2 : 0;
      comments.push({
        x: commentX + commentXOffset + codeSpanPadding,
        y: coord.top + adjust + COMMENT_FONT_ASCENT,
        text: commentObj.text,
        style: cssToSvgStyle(commentObj.commentStyle),
      });
    }

    // Message style from styling comment (applied to message/self-call/creation labels)
    const messageStyle = commentObj ? cssToSvgStyle(commentObj.messageStyle) : undefined;

    // --- Sync / Async messages ---
    if (info.kind === "sync" || info.kind === "async") {
      let fromX = snapX(coordinates.getPosition(info.from));
      const toX = snapX(coordinates.getPosition(info.to));
      const messageHeight = info.isSelf ? 30 : 16;
      // Comment height: HTML renders comment <p> above the message in CSS flow.
      // coord.top doesn't include comment height, so offset manually (same as fragments).
      const msgCommentHeight = commentObj?.text
        ? (info.comment?.trim().split("\n").length || 0) * 20
        : 0;
      const messageY = coord.top + adjust + msgCommentHeight + messageHeight - 0.5;

      // D4: When sender has an active occurrence, arrow starts from its near edge
      // For nested occurrences (depth > 1), offset further by OCCURRENCE_BAR_SIDE_WIDTH per extra level
      if (info.senderOccurrenceDepth >= 1 && !info.isSelf) {
        const occOffset = OCCURRENCE_BAR_SIDE_WIDTH + (info.senderOccurrenceDepth - 1) * OCCURRENCE_BAR_SIDE_WIDTH;
        const isLTR = fromX < toX;
        fromX = isLTR ? fromX + occOffset : fromX - occOffset;
      }

      // When target already has active occurrences, the new occurrence is nested
      // (stacked inward by OCCURRENCE_BAR_SIDE_WIDTH per level). Arrow endpoints shift accordingly.
      const targetDepth = info.targetOccurrenceDepth || (info.targetHasOccurrence ? 1 : 0);
      const nestingOffset = targetDepth * OCCURRENCE_BAR_SIDE_WIDTH;

      if (info.isSelf) {
        // Async self-calls: HTML renders label (flex-col) then a 30×24 SVG arrow.
        // The label and arrow are laid out by renderSelfCall from s.y, so no Y offset
        // is needed here — otherwise the label height gets double-counted.
        const isAsync = info.kind === "async";
        const selfYOffset = 0;
        const selfWidth = isAsync ? 28 : OCCURRENCE_WIDTH;
        // Async: full visual extent = label(~20px) + arrow SVG(24px) = 44px
        const selfHeight = isAsync ? 44 : messageHeight;
        // For self-calls inside an occurrence, the HTML component renders
        // inside the occurrence div — starting at the occurrence's right edge.
        // For nested occurrences, offset further by OCCURRENCE_BAR_SIDE_WIDTH per extra level.
        const selfX = (info.senderOccurrenceDepth >= 1)
          ? fromX + OCCURRENCE_BAR_SIDE_WIDTH + (info.senderOccurrenceDepth - 1) * OCCURRENCE_BAR_SIDE_WIDTH
          : fromX;
        selfCalls.push({
          x: selfX,
          y: coord.top + selfYOffset + msgCommentHeight,
          width: selfWidth,
          height: selfHeight,
          label: info.label,
          arrowStyle: isAsync ? "open" : "solid",
          number: info.number,
          style: messageStyle,
        });
      } else {
        // Arrow tip stops at near edge of target's occurrence bar.
        // Sync: creates new occ → toX ∓ OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset
        //   (points at inner edge where new occ starts)
        // Async with existing target occ → toX ∓ nestingOffset
        //   (points at outer edge of existing occ)
        const isLTR = fromX < toX;
        const syncOffset = info.kind === "sync" && !info.isSelf;
        const asyncTargetOcc = info.kind === "async" && !info.isSelf && targetDepth > 0;
        const arrowToX =
          syncOffset
            ? isLTR
              ? toX - OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset
              : toX + OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset
          : asyncTargetOcc
            ? isLTR
              ? toX - nestingOffset
              : toX + nestingOffset
            : toX;

        messages.push({
          fromX,
          toX: arrowToX,
          y: messageY,
          label: info.label,
          arrowStyle: info.kind === "async" ? "open" : "solid",
          isSelf: false,
          isReverse: arrowToX < fromX,
          number: info.number,
          style: messageStyle,
        });
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
          occurrences.push({
            x: occX,
            y: occY,
            width: OCCURRENCE_WIDTH,
            height: occHeight,
            participantName: info.to,
          });

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
            // For bare lifelines (no occurrences), adjust to match HTML Anchor2's
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
              ? `${info.number}.${(blockChildCount.get(info.number) || 0) + 1}`
              : undefined;
            returns.push({
              fromX: retFromX, toX: senderX, y: returnArrowY,
              label: assignment.assignee, isReverse: fromX < toX, isSelf: false,
              number: assignReturnNumber,
            });
            maxReturnBottom = Math.max(maxReturnBottom, returnArrowY + 46);
          }
        }
      }
      continue;
    }

    // --- Creation arrows ---
    if (info.kind === "creation") {
      const CREATION_MSG_HEIGHT = 40; // from CreationStatementVM.ts
      let fromX = snapX(coordinates.getPosition(info.from));
      const toX = snapX(coordinates.getPosition(info.to));

      // When sender has an active occurrence, arrow starts from its near edge
      // For nested occurrences, offset further by OCCURRENCE_BAR_SIDE_WIDTH per extra level
      if (info.senderOccurrenceDepth >= 1) {
        const occOffset = OCCURRENCE_BAR_SIDE_WIDTH + (info.senderOccurrenceDepth - 1) * OCCURRENCE_BAR_SIDE_WIDTH;
        const isLTR = fromX < toX;
        fromX = isLTR ? fromX + occOffset : fromX - occOffset;
      }

      // Find the already-built participant (buildParticipants handles creationTop)
      const targetParticipant = participants.find(p => p.name === info.to);
      // Center the arrow on the participant box visual center (y + height/2).
      const messageY = targetParticipant
        ? targetParticipant.y + PARTICIPANT_VISUAL_HEIGHT / 2
        : coord.top + CREATION_MSG_HEIGHT / 2;
      if (targetParticipant) {
        creations.push({
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
        });
      }

      // Creation always reserves occurrence space
      const occX = toX - OCCURRENCE_BAR_SIDE_WIDTH;
      // -2px matches HTML's Occurrence mt-[-2px]
      const occY = targetParticipant
        ? targetParticipant.y + PARTICIPANT_VISUAL_HEIGHT - 2
        : coord.top + CREATION_MSG_HEIGHT - 2;
      // Compute occurrence from its top to the bottom of the statement coordinate.
      // Align the bottom edge with HTML's CSS-computed occurrence bottom.
      const occHeight = Math.max(
        (coord.top + coord.height) - occY,
        OCCURRENCE_EMPTY_HEIGHT,
      );
      if (occHeight > 0) {
        occurrences.push({
          x: occX,
          y: occY,
          width: OCCURRENCE_WIDTH,
          height: occHeight,
          participantName: info.to,
        });

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
          const rawFromX = snapX(coordinates.getPosition(info.from));
          const isLTR = rawFromX < toX;
          const occHalf = OCCURRENCE_BAR_SIDE_WIDTH;
          // Sender (A) side: occurrence near edge facing the created participant.
          // LTR: sender's right edge = rawFromX + occHalf + 1 (center pixel).
          // RTL: sender's left edge = rawFromX - occHalf.
          const senderNest = Math.max(info.senderOccurrenceDepth - 1, 0) * OCCURRENCE_BAR_SIDE_WIDTH;
          const senderRetX = info.senderOccurrenceDepth >= 1
            ? rawFromX + senderNest + (isLTR ? occHalf + 2 : -occHalf)
            : rawFromX;
          // Created (B) side: occurrence near edge facing the sender.
          // LTR: created's left edge + 1 (HTML starts 1px past border).
          // RTL: created's right edge = toX + occHalf + 1 (center pixel).
          const createdRetX = isLTR
            ? toX - occHalf + 1
            : toX + occHalf + 1;
          // fromX = line start (created side), toX = arrow tip (sender side)
          // renderReturn places arrow head at toX
          returns.push({
            fromX: createdRetX, toX: senderRetX, y: occBottom,
            label: creationAssign.assignee, isReverse: createdRetX > senderRetX, isSelf: false,
            number: info.number
              ? `${info.number}.${(blockChildCount.get(info.number) || 0) + 1}`
              : undefined,
          });
          maxReturnBottom = Math.max(maxReturnBottom, occBottom + 46);
        }
      }
      continue;
    }

    // --- Fragments ---
    if (info.kind === "fragment" && info.fragmentKind) {
      const adjustedCoord = { top: coord.top + adjust, height: coord.height };
      // Compute comment height: the HTML renderer places the header BELOW any
      // inline comment. MarkdownMeasurer uses lines * 20 for height.
      const fragmentCommentHeight = commentObj?.text
        ? (info.comment?.trim().split("\n").length || 0) * 20
        : 0;
      const fragmentResult = buildFragmentGeometry(
        info,
        adjustedCoord,
        coordinates,
        verticalCoordinates,
        allParticipants,
        measureText,
        fragmentCommentHeight,
        commentObj?.text,
        commentObj?.commentStyle ? cssToSvgStyle(commentObj.commentStyle) : undefined,
        coord.top + adjust,
      );
      if (fragmentResult) {
        fragments.push(fragmentResult.fragment);
        if (fragmentResult.comment) {
          comments.push(fragmentResult.comment);
        }
      }
      continue;
    }

    // --- Returns ---
    if (info.kind === "return") {
      const rawFromX = snapX(coordinates.getPosition(info.from));
      const rawToX = snapX(coordinates.getPosition(info.to));
      const isReverse = rawToX < rawFromX;
      // HTML Anchor2 positions return lines edge-to-edge between occurrence walls.
      // rightEdgeOfRightWall = position + BAR_SIDE_WIDTH * layers
      // leftEdgeOfRightWall  = layers === 0 ? position : centerOfRightWall - BAR_SIDE_WIDTH
      //   where centerOfRightWall = layers <= 1 ? position : position + BAR_SIDE_WIDTH * (layers - 1)
      // LTR: from.rightEdge → to;  RTL: to ← from.leftEdge
      const fromLayers = info.senderOccurrenceDepth;
      let fromX: number;
      if (isReverse) {
        // RTL: line starts from from's left edge of right wall
        fromX = fromLayers === 0
          ? rawFromX
          : (fromLayers <= 1 ? rawFromX : rawFromX + OCCURRENCE_BAR_SIDE_WIDTH * (fromLayers - 1)) - OCCURRENCE_BAR_SIDE_WIDTH;
      } else {
        // LTR: line starts from from's right edge of right wall.
        // +1: occurrence stroke extends 1px beyond fill area (stroke-width=2, centered).
        fromX = rawFromX + OCCURRENCE_BAR_SIDE_WIDTH * fromLayers + 1;
      }
      // Target also needs occurrence edge offset (Anchor2 uses the near edge facing the source)
      const toLayers = info.targetOccurrenceDepth || 0;
      let toX: number;
      if (isReverse) {
        // RTL: target is on the left, use its right edge
        toX = rawToX + OCCURRENCE_BAR_SIDE_WIDTH * toLayers;
      } else {
        // LTR: target is on the right, use its left edge
        toX = toLayers === 0
          ? rawToX
          : (toLayers <= 1 ? rawToX : rawToX + OCCURRENCE_BAR_SIDE_WIDTH * (toLayers - 1)) - OCCURRENCE_BAR_SIDE_WIDTH;
      }
      // HTML Anchor2.edgeOffset subtracts LIFELINE_WIDTH from the container width.
      // For RTL returns, add LIFELINE_WIDTH to reach the inner edge of the target.
      // For LTR returns, the +1 stroke correction on fromX (line 680) already
      // accounts for the Anchor2 LIFELINE_WIDTH subtraction — applying it again
      // on toX would double-count and shrink the arrow by 2px instead of 1px.
      if (isReverse) {
        toX += LIFELINE_WIDTH;
      }
      // Return Y positioning: subpixel browser measurement (scoring coord = attrY + 21)
      // shows the two sub-cases that the positioning engine distinguishes with 0 vs 16px:
      //   - sync-block return with coord.height=0: HTML collapses margin, SVG needs 16.5
      //   - all other returns (root, or height>0): SVG needs 15.5
      // These are +0.5 adjustments on the original 16/15 split, validated by
      // emoji-async-return (root returns: 87.4%->97%) and emoji-return-chain (block returns: 94.5%->98%).
      const returnOffset = (info.parentBlockKind === "sync" && coord.height === 0) ? 16.5 : 15.5;
      const returnY = coord.top + adjust + returnOffset;
      returns.push({
        fromX,
        toX,
        y: returnY,
        label: info.label,
        isReverse,
        isSelf: info.isSelf,
        number: info.number,
      });
      maxReturnBottom = Math.max(maxReturnBottom, returnY + (60 - returnOffset));
      continue;
    }

    // --- Dividers ---
    if (info.kind === "divider") {
      const cleanLabel = info.label.replace(/^=+\s*|\s*=+$/g, "").trim();
      dividers.push({
        y: coord.top + adjust + coord.height / 2,
        width: diagramWidth,
        label: info.label,
        labelWidth: measureSvgFragmentLabelWidth(cleanLabel),
      });
      continue;
    }
  }

  // With scope-aware return debt adjustments, returns are naturally spaced.
  // Only enforce minimum gap if returns genuinely overlap (e.g., assignment returns
  // at occurrence bottom that coincide with explicit returns).
  const MIN_RETURN_GAP = 16;
  returns.sort((a, b) => a.y - b.y);
  for (let i = 1; i < returns.length; i++) {
    if (returns[i].y - returns[i - 1].y < MIN_RETURN_GAP) {
      returns[i] = { ...returns[i], y: returns[i - 1].y + MIN_RETURN_GAP };
    }
  }

  // Offset nested occurrences: in HTML, inner occurrences on the same participant
  // are rendered inside the outer occurrence DOM element, offset right by
  // OCCURRENCE_BAR_SIDE_WIDTH (7px) per nesting level. Detect nesting by Y-range containment.
  for (let i = 0; i < occurrences.length; i++) {
    const inner = occurrences[i];
    let depth = 0;
    for (let j = 0; j < occurrences.length; j++) {
      if (i === j) continue;
      const outer = occurrences[j];
      if (outer.participantName === inner.participantName &&
          outer.y <= inner.y &&
          outer.y + outer.height >= inner.y + inner.height) {
        depth++;
      }
    }
    if (depth > 0) {
      occurrences[i] = { ...inner, x: inner.x + depth * OCCURRENCE_BAR_SIDE_WIDTH };
    }
  }

  const totalReturnDebt = adjustMap.get("__totalDebt__") || 0;
  return { messages, selfCalls, occurrences, creations, fragments, returns, dividers, comments, totalReturnDebt, maxReturnBottom };
}
