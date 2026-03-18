/**
 * Builds DiagramGeometry from parser output + positioning engine.
 * Pure function — no DOM, no React, no side effects.
 */
import type { Coordinates } from "@/positioning/Coordinates";
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import type { IParticipantModel } from "@/parser/IParticipantModel";
import {
  PARTICIPANT_TOP_SPACE_FOR_GROUP as _HTML_PARTICIPANT_TOP,
  OCCURRENCE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
  LIFELINE_WIDTH,
  OCCURRENCE_EMPTY_HEIGHT,
  FRAGMENT_MIN_WIDTH,
  FRAGMENT_PADDING_X,
  MARGIN,
  MIN_PARTICIPANT_WIDTH,
} from "@/positioning/Constants";

/**
 * SVG-specific participant top offset.
 * The HTML renderer's .life-line-layer has .pt-2 (8px) CSS padding that pushes
 * participants down. SVG has no such padding, so we add 8px to match the effective
 * HTML position and keep messages close to participant boxes.
 */
const PARTICIPANT_TOP_SPACE = _HTML_PARTICIPANT_TOP + 8;

/**
 * Pass through X coordinate without rounding — sub-pixel precision improves
 * parity with the HTML renderer.
 */
function snapX(x: number): number {
  return x;
}

/**
 * Internal padding inside the HTML participant box that the positioning engine
 * does not account for. The engine's labelWidth is pure text width, but the HTML
 * box adds: 2×2px border + 2×2px padding + 2×4px inner text padding (px-1) = 16px.
 *
 * Assignee participants (e.g. "b:Type") render TWO EditableSpan components
 * in HTML, each with 4px left + 4px right padding (from EditableSpan.css
 * `.editable-span-base { padding: 0 4px }`). The extra span adds 8px.
 */
const PARTICIPANT_BOX_PADDING = 16;
const PARTICIPANT_BOX_PADDING_ASSIGNEE = 24;
import { TextType } from "@/positioning/Coordinate";

/** Visual height of participant box, matching HTML renderer's h-10 (40px) */
const PARTICIPANT_VISUAL_HEIGHT = 40;
/** Max visual width of participant box, matching HTML CSS max-width: 250px (SeqDiagram.css) */
const PARTICIPANT_MAX_WIDTH = 250;
import { _STARTER_, OrderedParticipants } from "@/parser/OrderedParticipants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { AllMessages } from "@/parser/MessageCollector";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { walkStatements } from "./walkStatements";
import CommentClass from "@/components/Comment/Comment";
import type {
  DiagramGeometry,
  ParticipantGeometry,
  LifelineGeometry,
  MessageGeometry,
  SelfCallGeometry,
  OccurrenceGeometry,
  CreationGeometry,
  FragmentGeometry,
  FragmentSectionGeometry,
  ReturnGeometry,
  DividerGeometry,
  CommentGeometry,
} from "./geometry";

export interface BuildGeometryInput {
  rootContext: any;
  coordinates: Coordinates;
  verticalCoordinates: VerticalCoordinates;
  title?: string;
  measureText?: (text: string, type: TextType) => number;
}

export function buildGeometry(input: BuildGeometryInput): DiagramGeometry {
  const { rootContext, coordinates, verticalCoordinates, title, measureText } = input;
  const participantModels = OrderedParticipants(rootContext);
  const totalHeight = verticalCoordinates.getTotalHeight();

  // Compute FrameBorder — extra left/right padding from fragment nesting depth.
  // Matches HTML renderer's SeqDiagram.tsx frameBorderLeft calculation.
  const allParticipantNames = coordinates.orderedParticipantNames();
  const frameBuilder = new FrameBuilder(allParticipantNames as string[]);
  const frame = frameBuilder.getFrame(rootContext);
  const frameBorder = FrameBorder(frame);

  const participants = buildParticipants(
    participantModels,
    coordinates,
    verticalCoordinates,
    measureText,
  );
  const buildResult = buildMessages(
    rootContext,
    coordinates,
    verticalCoordinates,
    participants,
  );
  const { messages, selfCalls, occurrences, creations, fragments, returns, dividers, comments } = buildResult;

  // Compute diagram height from the positioning engine's totalHeight (primary) or
  // max rendered content Y (fallback). Returns need more bottom overhead than other elements
  // because their Y = coord.top + adjust + 16 represents the visual bottom of a 16px element,
  // and HTML's CSS adds ~60px of space below the last return. Empirically: +47 (= viewHeight
  // overhead) gives the right frame height matching HTML. Other content uses +13 (= SVG
  // bottom space = viewHeight_overhead(47) - headerLineY(34)).
  let maxOccBottom = 0;
  let maxReturnY = 0;
  let maxOtherY = 0;
  for (const o of occurrences) maxOccBottom = Math.max(maxOccBottom, o.y + o.height);
  for (const r of returns) maxReturnY = Math.max(maxReturnY, r.y);
  for (const m of messages) maxOtherY = Math.max(maxOtherY, m.y);
  for (const s of selfCalls) maxOtherY = Math.max(maxOtherY, s.y + s.height);
  for (const c of creations) maxOtherY = Math.max(maxOtherY, c.message.y + PARTICIPANT_VISUAL_HEIGHT);
  for (const f of fragments) maxOtherY = Math.max(maxOtherY, f.y + f.height);
  for (const d of dividers) maxOtherY = Math.max(maxOtherY, d.y);
  const diagramHeight = Math.max(
    totalHeight + 28,
    maxOccBottom + 13,
    maxOtherY + 13,
    maxReturnY + 47,
  );
  const lifelineBottom = diagramHeight + PARTICIPANT_VISUAL_HEIGHT - 28;

  // Build lifelines AFTER height adjustment so they extend to the correct bottom
  const lifelines = buildLifelines(
    participants,
    lifelineBottom,
  );

  // Compute diagramWidth matching HTML's TotalWidth formula (WidthOfContext.ts).
  // HTML uses participantWidth = distance(left, right) + half(left) + half(right),
  // NOT coordinates.getWidth() (which can include extra left(firstParticipant) offset).
  // In SVG, border.left/.right are added separately in composeSvg, so we include only
  // participantWidth + extraWidthDueToSelfMessage here.
  const localParticipants = getLocalParticipantNames(rootContext);
  const orderedNames = coordinates.orderedParticipantNames();
  const leftParticipant = orderedNames.find(p => localParticipants.includes(p)) || "";
  const rightParticipant = orderedNames.slice().reverse().find(p => localParticipants.includes(p)) || "";

  const participantWidth =
    coordinates.distance(leftParticipant, rightParticipant) +
    coordinates.half(leftParticipant) +
    coordinates.half(rightParticipant);

  const selfMessages = AllMessages(rootContext).filter(m => m.from === m.to);
  const extraWidths = selfMessages.map(m =>
    coordinates.getMessageWidth(m) -
    coordinates.distance(m.from || _STARTER_, rightParticipant) -
    coordinates.half(rightParticipant)
  );
  const extraWidthDueToSelfMessage = Math.max(0, ...extraWidths);

  let diagramWidth = Math.max(participantWidth, FRAGMENT_MIN_WIDTH) + extraWidthDueToSelfMessage;

  // Expand width to fit labels that extend beyond
  if (measureText) {
    // Expand width to fit title text
    if (title) {
      const titleWidth = measureText(title, TextType.ParticipantName) * 1.15;
      if (titleWidth > diagramWidth) {
        diagramWidth = titleWidth;
      }
    }

    // Expand for message labels extending beyond diagram edge
    const LABEL_PAD = 10;
    for (const msg of messages) {
      const labelW = measureText(msg.label, TextType.MessageContent);
      const midX = (msg.fromX + msg.toX) / 2;
      const rightExtent = midX + labelW / 2 + LABEL_PAD;
      if (rightExtent > diagramWidth) diagramWidth = rightExtent;
    }
    for (const ret of returns) {
      const labelW = measureText(ret.label, TextType.MessageContent);
      const midX = (ret.fromX + ret.toX) / 2;
      const rightExtent = midX + labelW / 2 + LABEL_PAD;
      if (rightExtent > diagramWidth) diagramWidth = rightExtent;
    }
    for (const cr of creations) {
      const labelW = measureText(cr.message.label, TextType.MessageContent);
      const midX = (cr.message.fromX + cr.message.toX) / 2;
      const rightExtent = midX + labelW / 2 + LABEL_PAD;
      if (rightExtent > diagramWidth) diagramWidth = rightExtent;
    }
  }

  // Shift fragment left edges into the diagram padding area (matching HTML CSS
  // where fragments use left: -frameBorderLeft). Position-only shift.
  for (const f of fragments) {
    f.x -= frameBorder.left;
  }

  // Compute spatial nesting depth for each fragment (how many other fragments
  // fully contain it). This is more accurate than info.depth which includes
  // message block nesting, not just fragment nesting.
  const nestDepths = new Map<FragmentGeometry, number>();
  for (const inner of fragments) {
    let nestDepth = 0;
    for (const outer of fragments) {
      if (outer === inner) continue;
      if (outer.x <= inner.x && outer.y <= inner.y &&
          outer.x + outer.width >= inner.x + inner.width &&
          outer.y + outer.height >= inner.y + inner.height) {
        nestDepth++;
      }
    }
    nestDepths.set(inner, nestDepth);
    inner.x += nestDepth * FRAGMENT_PADDING_X;
  }

  // Extend fragment right edges into the frameBorder area ONLY when the
  // fragment already spans (nearly) the full diagram width. Fragments whose
  // local participants are a subset of all participants should keep their
  // computed width — they don't stretch to the full diagram in HTML either.
  const contentRightEdge = diagramWidth + frameBorder.right;
  for (const f of fragments) {
    const nd = nestDepths.get(f) || 0;
    const targetRight = contentRightEdge - nd * FRAGMENT_PADDING_X;
    const currentRight = f.x + f.width;
    // Only extend if the fragment is already within 20px of the target
    // (i.e., it spans nearly all participants and just needs the frameBorder extension)
    if (currentRight >= targetRight - 20 && currentRight < targetRight) {
      f.width = targetRight - f.x;
    }
  }

  return {
    width: diagramWidth,
    height: diagramHeight,
    frameBorderLeft: frameBorder.left,
    frameBorderRight: frameBorder.right,
    title,
    participants,
    lifelines,
    messages,
    selfCalls,
    occurrences,
    creations,
    fragments,
    dividers,
    returns,
    comments,
  };
}

function buildParticipants(
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
      let width: number;
      if (measureText && m.name !== _STARTER_) {
        const textWidth = measureText(m.getDisplayName(), TextType.ParticipantName);
        // Assignee participants (name contains ":") render two EditableSpan components
        // in HTML, each with 8px horizontal padding (EditableSpan.css .editable-span-base).
        const isAssignee = m.name.includes(":") && m.getDisplayName() === m.name;
        const padding = isAssignee ? PARTICIPANT_BOX_PADDING_ASSIGNEE : PARTICIPANT_BOX_PADDING;
        width = Math.min(Math.max(textWidth + padding, MIN_PARTICIPANT_WIDTH), PARTICIPANT_MAX_WIDTH);
      } else {
        width = Math.min(halfWidth * 2 - MARGIN, PARTICIPANT_MAX_WIDTH);
      }
      if (m.name === _STARTER_) width = Math.min(width, 80); // match HTML min-width: 80px
      const creationTop = verticalCoordinates.getCreationTop(m.name);
      const isStarter = m.name === _STARTER_;
      // updateCreationTop subtracts 7px for HTML CSS padding (.life-line-layer .pt-2);
      // SVG has no such padding, so add 8 back (7 + 1 for SVG centered stroke model:
      // the renderer insets the fill rect by HALF_STROKE, so p.y+1 becomes the fill top,
      // and the visual top = fill - halfStroke = p.y. With +8, visual top = creationTop+8,
      // matching HTML border-box top).
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
      };
    });
}

function buildLifelines(
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

function buildMessages(
  rootContext: any,
  coordinates: Coordinates,
  verticalCoordinates: VerticalCoordinates,
  participants: ParticipantGeometry[],
): {
  messages: MessageGeometry[];
  selfCalls: SelfCallGeometry[];
  occurrences: OccurrenceGeometry[];
  creations: CreationGeometry[];
  fragments: FragmentGeometry[];
  returns: ReturnGeometry[];
  dividers: DividerGeometry[];
  comments: CommentGeometry[];
  totalReturnDebt: number;
} {
  const statements = walkStatements(rootContext);
  const messages: MessageGeometry[] = [];
  const selfCalls: SelfCallGeometry[] = [];
  const occurrences: OccurrenceGeometry[] = [];
  const creations: CreationGeometry[] = [];
  const fragments: FragmentGeometry[] = [];
  const returns: ReturnGeometry[] = [];
  const dividers: DividerGeometry[] = [];
  const comments: CommentGeometry[] = [];

  const diagramWidth = coordinates.getWidth();
  const allParticipants = coordinates.orderedParticipantNames();

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
    if (commentObj?.text) {
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
      comments.push({
        x: commentX + OCCURRENCE_BAR_SIDE_WIDTH,
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
        // For sync messages with occurrence, arrow tip stops at near edge of occurrence bar.
        const isLTR = fromX < toX;
        const arrowToX =
          info.kind === "sync" && !info.isSelf
            ? isLTR
              ? toX - OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset
              : toX + OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset
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
        let occHeight = coord.height - messageHeight + 2;

        // Adjust occurrence height for inner return debt.
        // The positioning engine underestimates block heights because non-self returns
        // have height=0. Each missing return adds exactly RETURN_VISUAL_HEIGHT (16px)
        // of visual space in HTML that the positioning engine doesn't account for.
        const innerDebtKey = `inner:${info.key}`;
        const innerDebt = adjustMap.get(innerDebtKey) || 0;
        if (innerDebt > 0) {
          occHeight += innerDebt;
        }

        // Assignment return Y uses the pre-compensation occurrence height.
        // The occurrence bar needs to be taller than where the return arrow sits.
        const messageCtx = info.statNode?.message?.();
        const assignment = messageCtx?.Assignment?.();
        const returnArrowY = occY + occHeight;

        // Assignment return compensation: the positioning engine adds +11 for
        // assignee returns (SyncMessageStatementVM line 41), but HTML renders
        // the assignment return as ~16px inside the occurrence. Add the 5px
        // difference so the occurrence bar extends to match HTML.
        if (assignment?.assignee && !info.isSelf) {
          occHeight += 5;
        }

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
            const isLTR = fromX < toX;
            const retFromX = isLTR
              ? toX - OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset
              : toX + OCCURRENCE_BAR_SIDE_WIDTH + nestingOffset;
            // Sender's fromX is already D4-adjusted for its occurrence edge.
            // Use returnArrowY (pre-depth-correction) to match HTML return arrow position.
            returns.push({
              fromX: retFromX, toX: fromX, y: returnArrowY,
              label: assignment.assignee, isReverse: fromX < toX, isSelf: false,
            });
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
      // Center the arrow on the participant box visual center.
      // targetParticipant.y includes the +1 stroke offset for SVG rendering;
      // subtract 1 so the arrow center aligns with the visual center
      // (which is the same as HTML's border-box center).
      const messageY = targetParticipant
        ? targetParticipant.y - 1 + PARTICIPANT_VISUAL_HEIGHT / 2
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
            style: messageStyle,
          },
        });
      }

      // Creation always reserves occurrence space
      const occX = toX - OCCURRENCE_BAR_SIDE_WIDTH;
      // -3px matches HTML's Occurrence mt-[-2px] plus 1px CSS rounding (same as sync messages)
      const occY = targetParticipant
        ? targetParticipant.y + PARTICIPANT_VISUAL_HEIGHT - 3
        : coord.top + CREATION_MSG_HEIGHT - 3;
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
          // Sender (A) side: occurrence edge + LIFELINE_WIDTH CSS gap
          const senderNest = Math.max(info.senderOccurrenceDepth - 1, 0) * OCCURRENCE_BAR_SIDE_WIDTH;
          const senderRetX = info.senderOccurrenceDepth >= 1
            ? rawFromX + senderNest + (isLTR ? occHalf + LIFELINE_WIDTH : -(occHalf + LIFELINE_WIDTH))
            : rawFromX;
          // Created (B) side: occurrence edge + LIFELINE_WIDTH CSS gap (into occ)
          const createdRetX = isLTR
            ? toX - occHalf + LIFELINE_WIDTH
            : toX + occHalf - LIFELINE_WIDTH;
          // fromX = line start (created side), toX = arrow tip (sender side)
          // renderReturn places arrow head at toX
          returns.push({
            fromX: createdRetX, toX: senderRetX, y: occBottom,
            label: creationAssign.assignee, isReverse: createdRetX > senderRetX, isSelf: false,
          });
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
      const fragmentGeom = buildFragmentGeometry(
        info,
        adjustedCoord,
        coordinates,
        verticalCoordinates,
        allParticipants,
        fragmentCommentHeight,
      );
      if (fragmentGeom) {
        fragments.push(fragmentGeom);
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
        // LTR: line starts from from's right edge of right wall
        fromX = rawFromX + OCCURRENCE_BAR_SIDE_WIDTH * fromLayers;
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
      // For RTL returns, shift the arrow tip (toX) right by LIFELINE_WIDTH to match
      // the HTML positioning where the container left edge is 1px past the occurrence.
      // For LTR returns, shrink the right edge.
      if (isReverse) {
        toX += LIFELINE_WIDTH;  // RTL: move arrow tip right
      } else {
        toX -= LIFELINE_WIDTH;  // LTR: shrink right edge
      }
      // First return inside a sync block renders 1px higher in HTML due to
      // the occurrence's border-top offsetting the content area.
      const returnOffset = (info.parentBlockKind === "sync" && adjust === 0) ? 15 : 16;
      returns.push({
        fromX,
        toX,
        y: coord.top + adjust + returnOffset,
        label: info.label,
        isReverse,
        isSelf: info.isSelf,
      });
      continue;
    }

    // --- Dividers ---
    if (info.kind === "divider") {
      dividers.push({
        y: coord.top + adjust + coord.height / 2,
        width: diagramWidth,
        label: info.label,
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
  return { messages, selfCalls, occurrences, creations, fragments, returns, dividers, comments, totalReturnDebt };
}

/**
 * Compute per-statement Y adjustment to compensate for ReturnStatementVM.height=0.
 *
 * In the positioning engine, non-self return statements have height=0, but in HTML
 * they render as ~16px elements. This function walks the DFS-ordered statement list
 * and computes how much each statement's coord.top should be increased.
 *
 * The debt is scoped per block (identified by depth). When a block ends (depth decreases),
 * its accumulated debt propagates to the parent block — because the parent sync/creation
 * statement's coord.height is underestimated by the same amount.
 *
 * Returns a Map with:
 *   key -> adjustment for coord.top
 *   "inner:key" -> total inner debt for sync/creation statements (for occurrence height)
 */
function computeReturnDebt(
  statements: ReturnType<typeof walkStatements>,
  _verticalCoordinates: VerticalCoordinates,
  returnHeight: number,
): Map<string, number> {
  const result = new Map<string, number>();

  // Stack tracks per-depth cumulative debt. Index = depth.
  const debtByDepth: number[] = [0];
  // Track only direct returns at each depth (excludes child-propagated debt)
  const directDebtByDepth: number[] = [0];
  let maxDepth = 0;

  // Track which sync/creation statements own each depth level
  // so we can assign inner debt when closing their blocks
  const blockOwnerKeys: (string | null)[] = [null]; // depth 0 = root (no owner)
  const blockOwnerKinds: (string | null)[] = [null]; // "sync" | "creation" | null
  // Track whether each block has non-return children (for mixed-content detection)
  const hasNonReturnChild: boolean[] = [false];

  for (const info of statements) {
    const depth = info.depth;

    // When depth decreases, close child blocks and propagate debt upward
    while (maxDepth > depth) {
      const closedDebt = debtByDepth[maxDepth] || 0;
      const ownerKey = blockOwnerKeys[maxDepth];
      const ownerKind = blockOwnerKinds[maxDepth];
      const directDebt = directDebtByDepth[maxDepth] || 0;
      // Record inner debt on the block owner (for occurrence height).
      // Two components:
      // 1. nestedDebt: debt propagated from child blocks (closedDebt - directDebt).
      //    The parent occurrence must grow to contain child content that the
      //    positioning engine underestimates.
      // 2. directShift: when 2+ direct returns exist at the same depth, each
      //    return's debt shifts the NEXT return down via the adjust mechanism.
      //    The last return is shifted by (N-1)*returnHeight = directDebt - returnHeight.
      //    The occurrence must grow to contain this shifted last return.
      // A single direct return has directShift=0 (its own debt doesn't shift itself).
      const nestedDebt = closedDebt - directDebt;
      const directShift = Math.max(directDebt - returnHeight, 0);
      const occInnerDebt = nestedDebt + directShift;
      if (ownerKey && occInnerDebt > 0) {
        result.set(`inner:${ownerKey}`, occInnerDebt);
      }
      debtByDepth.pop();
      directDebtByDepth.pop();
      blockOwnerKeys.pop();
      blockOwnerKinds.pop();
      hasNonReturnChild.pop();
      maxDepth--;
      // Propagate only DIRECT return debt (not child-cascaded debt) to parent
      // depth so subsequent statements are shifted down to match HTML CSS layout.
      // Using directDebt prevents double-counting from recursive propagation.
      if (ownerKey && ownerKind === "sync") {
        debtByDepth[maxDepth] += directDebt;
      }
    }

    // When depth increases, start fresh debt tracking for new block
    while (maxDepth < depth) {
      maxDepth++;
      debtByDepth.push(0);
      directDebtByDepth.push(0);
      blockOwnerKeys.push(null);
      blockOwnerKinds.push(null);
      hasNonReturnChild.push(false);
    }

    // Fragment section boundary: reset debt at this depth.
    // Each fragment section (if/else, try/catch/finally) is independent in HTML CSS.
    // Without reset, returns in earlier sections inflate Y positions of later sections.
    if (info.sectionReset && depth < debtByDepth.length) {
      debtByDepth[depth] = 0;
      directDebtByDepth[depth] = 0;
    }

    // Total adjustment = sum of all debt across all depths
    let totalDebt = 0;
    for (let d = 0; d <= depth; d++) {
      totalDebt += debtByDepth[d] || 0;
    }
    result.set(info.key, totalDebt);

    // Non-self returns add debt at their depth
    if (info.kind === "return" && !info.isSelf) {
      debtByDepth[depth] += returnHeight;
      directDebtByDepth[depth] += returnHeight;
    } else if (info.kind !== "return") {
      // Track that this block has non-return children
      if (depth < hasNonReturnChild.length) {
        hasNonReturnChild[depth] = true;
      }
    }

    // Sync/creation with blocks: the NEXT statement in the flat list at depth+1
    // belongs to this statement's block. Record owner for debt propagation.
    if ((info.kind === "sync" || info.kind === "creation") && info.hasBlock) {
      // The next depth level's block belongs to this statement
      if (depth + 1 > maxDepth) {
        maxDepth = depth + 1;
        debtByDepth.push(0);
        directDebtByDepth.push(0);
        blockOwnerKeys.push(info.key);
        blockOwnerKinds.push(info.kind);
        hasNonReturnChild.push(false);
      } else {
        blockOwnerKeys[depth + 1] = info.key;
        blockOwnerKinds[depth + 1] = info.kind;
        debtByDepth[depth + 1] = 0; // reset for new block
        directDebtByDepth[depth + 1] = 0;
        hasNonReturnChild[depth + 1] = false;
      }
    }
  }

  // Close remaining open blocks (same propagation rules as main loop)
  while (maxDepth > 0) {
    const closedDebt = debtByDepth[maxDepth] || 0;
    const ownerKey = blockOwnerKeys[maxDepth];
    const ownerKind = blockOwnerKinds[maxDepth];
    const directDebtEnd = directDebtByDepth[maxDepth] || 0;
    const nestedDebtEnd = closedDebt - directDebtEnd;
    const directShiftEnd = Math.max(directDebtEnd - returnHeight, 0);
    const occInnerDebtEnd = nestedDebtEnd + directShiftEnd;
    if (ownerKey && occInnerDebtEnd > 0) {
      result.set(`inner:${ownerKey}`, occInnerDebtEnd);
    }
    debtByDepth.pop();
    directDebtByDepth.pop();
    blockOwnerKeys.pop();
    blockOwnerKinds.pop();
    hasNonReturnChild.pop();
    maxDepth--;
    // Propagate only direct debt — see main loop comment
    if (ownerKey && ownerKind === "sync") {
      debtByDepth[maxDepth] += directDebtEnd;
    }
  }

  // Store total root debt for diagram height adjustment
  result.set("__totalDebt__", debtByDepth[0] || 0);

  return result;
}

function buildFragmentGeometry(
  info: ReturnType<typeof walkStatements>[number],
  coord: { top: number; height: number },
  coordinates: Coordinates,
  verticalCoordinates: VerticalCoordinates,
  allParticipants: string[],
  commentHeight: number = 0,
): FragmentGeometry | null {
  // Get the fragment's parse tree node to find local participants
  const statNode = info.statNode;
  if (!statNode) return null;

  // Find the fragment context node (loop, alt, opt, etc.)
  const fragmentCtx = findFragmentContext(statNode);
  if (!fragmentCtx) {
    // Fallback: use full diagram width
    return {
      kind: info.fragmentKind!,
      label: info.fragmentLabel || "",
      x: 0,
      y: coord.top,
      width: coordinates.getWidth(),
      height: coord.height,
      headerY: coord.top + 1 + commentHeight,
      sections: [],
      number: info.number,
      depth: info.depth,
    };
  }

  // Compute fragment width from local participants, matching HTML's TotalWidth:
  //   TotalWidth = max(participantWidth, FRAGMENT_MIN_WIDTH) + border.left + border.right
  const localNames = getLocalParticipantNames(fragmentCtx);
  const leftParticipant = allParticipants.find((p) => localNames.includes(p)) || "";
  const rightParticipant = allParticipants.slice().reverse().find((p) => localNames.includes(p)) || "";

  // Fragment's own border — use statNode (not fragmentCtx) to match HTML's
  // TotalWidth which receives the stat context containing the fragment.
  const frameBuilder = new FrameBuilder(allParticipants as string[]);
  const frame = frameBuilder.getFrame(statNode);
  const fragBorder = FrameBorder(frame);

  let fragWidth: number;
  let fragX: number;

  if (leftParticipant && rightParticipant) {
    const participantWidth =
      coordinates.distance(leftParticipant, rightParticipant) +
      coordinates.half(leftParticipant) +
      coordinates.half(rightParticipant);
    // Self-call extra width — matches HTML's TotalWidth (WidthOfContext.ts)
    const selfMessages = AllMessages(statNode).filter((m: any) => m.from === m.to);
    const extraWidths = selfMessages.map(
      (m: any) =>
        coordinates.getMessageWidth(m) -
        coordinates.distance(m.from || _STARTER_, rightParticipant) -
        coordinates.half(rightParticipant),
    );
    const extraWidth = Math.max(0, ...extraWidths);
    fragWidth = Math.max(participantWidth, FRAGMENT_MIN_WIDTH) + fragBorder.left + fragBorder.right + extraWidth;
    fragX = snapX(coordinates.getPosition(leftParticipant)) - coordinates.half(leftParticipant);
  } else {
    fragWidth = Math.max(FRAGMENT_MIN_WIDTH, coordinates.getWidth());
    fragX = 0;
  }

  // No explicit nesting indent needed — fragBorder.left/right from FrameBorder
  // already accounts for inner nesting depth, matching HTML's TotalWidth formula.

  // Build section geometry for multi-section fragments (alt, tcf)
  const sections: FragmentSectionGeometry[] = [];
  if (info.fragmentSections && info.fragmentSections.length > 1) {
    // For multi-section fragments, compute section positions from inner block coordinates
    let sectionY = coord.top;
    for (let i = 0; i < info.fragmentSections.length; i++) {
      const section = info.fragmentSections[i];
      // First section starts at fragment top (no separator line)
      // Subsequent sections need separator lines
      if (i > 0) {
        // Find the first statement key in this section's block to determine the divider Y
        const sectionBlock = section.blockNode;
        if (sectionBlock) {
          const innerStats = sectionBlock.stat?.() || [];
          if (innerStats.length > 0) {
            const firstStatKey = createStatementKeyFromStat(innerStats[0]);
            if (firstStatKey) {
              const innerCoord = verticalCoordinates.getStatementCoordinate(firstStatKey);
              if (innerCoord) {
                // Section separator is positioned above the first inner statement
                // with header height (25px) and label space (20px)
                sectionY = innerCoord.top - 20 - 8 - 8;
              }
            }
          }
        }
      }

      const sectionHeight = i < info.fragmentSections.length - 1
        ? 0  // Height computed by renderer from next section's Y
        : coord.top + coord.height - sectionY;

      sections.push({
        label: section.label,
        y: sectionY,
        height: sectionHeight,
      });
    }
  }

  return {
    kind: info.fragmentKind!,
    label: info.fragmentLabel || "",
    x: fragX,
    y: coord.top,
    width: fragWidth,
    height: coord.height,
    headerY: coord.top + 1 + commentHeight,
    sections,
    number: info.number,
    depth: info.depth,
  };
}

function findFragmentContext(stat: any): any {
  for (const kind of ["loop", "opt", "par", "critical", "section"] as const) {
    const frag = stat[kind]?.();
    if (frag) return frag;
  }
  const alt = stat.alt?.();
  if (alt) return alt;
  const tcf = stat.tcf?.();
  if (tcf) return tcf;
  const ref = stat.ref?.();
  if (ref) return ref;
  return null;
}

/** Inline version of createStatementKey to avoid circular import issues */
function createStatementKeyFromStat(statement: any): string {
  if (!statement?.start || !statement?.stop) return "";
  return `${statement.start.start}-${statement.stop.stop}`;
}

/**
 * Convert React CSSProperties to SVG-compatible style record.
 * Maps CSS property names to SVG equivalents (e.g., `color` → `fill` for text).
 * Returns undefined if the style is empty.
 */
function cssToSvgStyle(css: import("react").CSSProperties): Record<string, string> | undefined {
  const result: Record<string, string> = {};
  let hasKeys = false;
  for (const [key, value] of Object.entries(css)) {
    if (value == null) continue;
    hasKeys = true;
    // SVG text uses `fill` for color, not CSS `color`
    if (key === "color") {
      result["fill"] = String(value);
    } else {
      // Convert camelCase to kebab-case for SVG style attribute
      const svgKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      result[svgKey] = String(value);
    }
  }
  return hasKeys ? result : undefined;
}
