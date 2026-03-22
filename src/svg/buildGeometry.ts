/**
 * Builds DiagramGeometry from parser output + positioning engine.
 * Pure function — no DOM, no React, no side effects.
 */

// ─── External imports ────────────────────────────────────────────────
import type { Coordinates } from "@/positioning/Coordinates";
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import type { IParticipantModel } from "@/parser/IParticipantModel";
import { TextType } from "@/positioning/Coordinate";
import {
  PARTICIPANT_TOP_SPACE_FOR_GROUP as _HTML_PARTICIPANT_TOP,
  OCCURRENCE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
  OCCURRENCE_EMPTY_HEIGHT,
  FRAGMENT_MIN_WIDTH,
  FRAGMENT_PADDING_X,
  MARGIN,
  MIN_PARTICIPANT_WIDTH,
} from "@/positioning/Constants";
import { _STARTER_, OrderedParticipants } from "@/parser/OrderedParticipants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { AllMessages } from "@/parser/MessageCollector";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import CommentClass from "@/components/Comment/Comment";

// ─── Local imports ───────────────────────────────────────────────────
import { walkStatements } from "./walkStatements";
import { computeReturnDebt } from "./computeReturnDebt";
import { cssToSvgStyle } from "./cssToSvgStyle";
import { buildFragmentGeometry } from "./buildFragmentGeometry";
import type {
  DiagramGeometry,
  ParticipantGeometry,
  LifelineGeometry,
  MessageGeometry,
  SelfCallGeometry,
  OccurrenceGeometry,
  CreationGeometry,
  FragmentGeometry,
  ReturnGeometry,
  DividerGeometry,
  CommentGeometry,
} from "./geometry";

// ─── SVG-specific constants ─────────────────────────────────────────

/**
 * SVG-specific participant top offset.
 * The HTML renderer's .life-line-layer has .pt-2 (8px) CSS padding that pushes
 * participants down. SVG has no such padding, so we add 8px to match the effective
 * HTML position and keep messages close to participant boxes.
 */
const PARTICIPANT_TOP_SPACE = _HTML_PARTICIPANT_TOP + 8;

/**
 * Internal padding inside the HTML participant box that the positioning engine
 * does not account for. The engine's labelWidth is pure text width, but the HTML
 * box adds: 2×2px border + 2×2px padding + 2×4px inner text padding (px-1) = 16px.
 */
const PARTICIPANT_BOX_PADDING = 16;

/** Visual height of participant box, matching HTML renderer's h-10 (40px) */
const PARTICIPANT_VISUAL_HEIGHT = 40;

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
  let diagramHeight = Math.max(
    totalHeight + 28,
    maxOccBottom + 13,
    maxOtherY + 13,
    maxReturnY + 47,
  );
  let lifelineBottom = diagramHeight + PARTICIPANT_VISUAL_HEIGHT - 28;

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
      const centerX = coordinates.getPosition(m.name);
      const halfWidth = coordinates.half(m.name);
      // Compute visual box width from raw text measurement + CSS decorations.
      // The positioning engine clamps labelWidth to MIN_PARTICIPANT_WIDTH, losing
      // the actual text width.  Re-measure here to get the correct box size.
      // HTML box = max(textWidth + BOX_PADDING, MIN_PARTICIPANT_WIDTH).
      let width: number;
      if (measureText && m.name !== _STARTER_) {
        const textWidth = measureText(m.getDisplayName(), TextType.ParticipantName);
        width = Math.max(textWidth + PARTICIPANT_BOX_PADDING, MIN_PARTICIPANT_WIDTH);
      } else {
        width = halfWidth * 2 - MARGIN;
      }
      if (m.name === _STARTER_) width = Math.min(width, 80); // match HTML min-width: 80px
      const creationTop = verticalCoordinates.getCreationTop(m.name);
      const isStarter = m.name === _STARTER_;
      // updateCreationTop subtracts 7px for HTML CSS padding (.life-line-layer .pt-2);
      // SVG has no such padding, so add it back to close the gap between participant and occurrence
      const y =
        creationTop != null
          ? Math.max(PARTICIPANT_TOP_SPACE, creationTop + 7)
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
  const adjustMap = computeReturnDebt(statements, RETURN_VISUAL_HEIGHT);

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
      const commentX = info.from
        ? coordinates.getPosition(info.from)
        : 10;
      comments.push({
        x: commentX + 5,
        y: coord.top + adjust,
        text: commentObj.text,
        style: cssToSvgStyle(commentObj.commentStyle),
      });
    }

    // Message style from styling comment (applied to message/self-call/creation labels)
    const messageStyle = commentObj ? cssToSvgStyle(commentObj.messageStyle) : undefined;

    // --- Sync / Async messages ---
    if (info.kind === "sync" || info.kind === "async") {
      let fromX = coordinates.getPosition(info.from);
      const toX = coordinates.getPosition(info.to);
      const messageHeight = info.isSelf ? 30 : 16;
      const messageY = coord.top + adjust + messageHeight;

      // D4: When sender has an active occurrence, arrow starts from its near edge
      // For nested occurrences (depth > 1), offset further by OCCURRENCE_BAR_SIDE_WIDTH per extra level
      if (info.senderOccurrenceDepth >= 1 && !info.isSelf) {
        const occOffset = OCCURRENCE_WIDTH / 2 + (info.senderOccurrenceDepth - 1) * OCCURRENCE_BAR_SIDE_WIDTH;
        const isLTR = fromX < toX;
        fromX = isLTR ? fromX + occOffset : fromX - occOffset;
      }

      // When target already has an active occurrence, the new occurrence is nested
      // (stacked inward by OCCURRENCE_BAR_SIDE_WIDTH). Arrow endpoints shift accordingly.
      const nestingOffset = info.targetHasOccurrence ? OCCURRENCE_BAR_SIDE_WIDTH : 0;

      if (info.isSelf) {
        // Async self-calls: HTML renders label (20px) then a 30×24 SVG with internal
        // U-shape path at M0,2→28,15 (width=28, height=13, radius=2).
        // Match these exact dimensions: offset by label(20)+padding(2)=22, w=28, h=13.
        const isAsync = info.kind === "async";
        const selfYOffset = isAsync ? 22 : 0;
        const selfWidth = isAsync ? 28 : OCCURRENCE_WIDTH;
        const selfHeight = isAsync ? 13 : messageHeight;
        // For sync self-calls inside an occurrence, the HTML component renders
        // inside the occurrence div — starting at the occurrence's right edge.
        // For nested occurrences, offset further by OCCURRENCE_BAR_SIDE_WIDTH per extra level.
        const selfX = (!isAsync && info.senderOccurrenceDepth >= 1)
          ? fromX + OCCURRENCE_WIDTH / 2 + (info.senderOccurrenceDepth - 1) * OCCURRENCE_BAR_SIDE_WIDTH
          : fromX;
        selfCalls.push({
          x: selfX,
          y: coord.top + selfYOffset,
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
              ? toX - OCCURRENCE_WIDTH / 2 + nestingOffset
              : toX + OCCURRENCE_WIDTH / 2 + nestingOffset
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
        const occX = toX - OCCURRENCE_WIDTH / 2;
        const occY = messageY - 2;
        let occHeight = coord.height - messageHeight + 2;

        // Adjust occurrence height for inner return debt.
        // The positioning engine underestimates block heights because non-self returns
        // have height=0. Scale by 0.75 (calibrated against HTML CSS layout, accounting
        // for the 0.75 debt propagation factor in computeReturnDebt).
        // Only apply for blocks with ≥2 inner returns (debt >= 24) — single-return
        // blocks are already close to HTML sizes and the factor overcorrects them.
        const innerDebtKey = `inner:${info.key}`;
        const innerDebt = adjustMap.get(innerDebtKey) || 0;
        if (innerDebt >= RETURN_VISUAL_HEIGHT * 1.5) {
          occHeight += Math.round(innerDebt * 0.75);
        }

        const returnArrowY = occY + occHeight;

        if (occHeight > 0) {
          occurrences.push({
            x: occX,
            y: occY,
            width: OCCURRENCE_WIDTH,
            height: occHeight,
            participantName: info.to,
          });

          // Assignment return: e.g. `ret0 = C.method() { ... }`
          const messageCtx = info.statNode?.message?.();
          const assignment = messageCtx?.Assignment?.();
          if (assignment?.assignee && !info.isSelf) {
            // Return goes from target (toX) back to sender (fromX).
            // Target always has occurrence; start from its near edge toward sender.
            // When target has nested occurrence, shift by OCCURRENCE_BAR_SIDE_WIDTH.
            const isLTR = fromX < toX;
            const retFromX = isLTR
              ? toX - OCCURRENCE_WIDTH / 2 + nestingOffset
              : toX + OCCURRENCE_WIDTH / 2 + nestingOffset;
            // Sender's fromX is already D4-adjusted for its occurrence edge.
            // Use returnArrowY (pre-depth-correction) to match HTML return arrow position.
            returns.push({
              fromX: retFromX, toX: fromX, y: returnArrowY,
              label: assignment.assignee, isReverse: fromX < toX,
            });
          }
        }
      }
      continue;
    }

    // --- Creation arrows ---
    if (info.kind === "creation") {
      const CREATION_MSG_HEIGHT = 40; // from CreationStatementVM.ts
      let fromX = coordinates.getPosition(info.from);
      const toX = coordinates.getPosition(info.to);

      // When sender has an active occurrence, arrow starts from its near edge
      // For nested occurrences, offset further by OCCURRENCE_BAR_SIDE_WIDTH per extra level
      if (info.senderOccurrenceDepth >= 1) {
        const occOffset = OCCURRENCE_WIDTH / 2 + (info.senderOccurrenceDepth - 1) * OCCURRENCE_BAR_SIDE_WIDTH;
        const isLTR = fromX < toX;
        fromX = isLTR ? fromX + occOffset : fromX - occOffset;
      }

      // Find the already-built participant (buildParticipants handles creationTop)
      const targetParticipant = participants.find(p => p.name === info.to);
      // Center the arrow on the participant box; coord.top doesn't include
      // comment height, but targetParticipant.y does.
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
            style: messageStyle,
          },
        });
      }

      // Creation always reserves occurrence space
      const occX = toX - OCCURRENCE_WIDTH / 2;
      // -2px matches HTML's Occurrence mt-[-2px] (same adjustment as sync messages)
      const occY = targetParticipant
        ? targetParticipant.y + PARTICIPANT_VISUAL_HEIGHT - 2
        : coord.top + CREATION_MSG_HEIGHT - 2;
      // Compute occurrence from its top to the bottom of the statement coordinate.
      // This correctly excludes comment height (which is above the participant box).
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
          const occBottom = occY + occHeight;
          // Return goes from created (toX) back to sender (fromX).
          // Created participant always has occurrence; start from its near edge.
          const isLTR = fromX < toX;
          const retFromX = isLTR ? toX - OCCURRENCE_WIDTH / 2 : toX + OCCURRENCE_WIDTH / 2;
          // Sender has occurrence if senderOccurrenceDepth >= 1; end at its near edge.
          // fromX is already adjusted for occurrence depth, so use it directly.
          const retToX = fromX;
          returns.push({
            fromX: retFromX, toX: retToX, y: occBottom,
            label: creationAssign.assignee, isReverse: fromX < toX,
          });
        }
      }
      continue;
    }

    // --- Fragments ---
    if (info.kind === "fragment" && info.fragmentKind) {
      const adjustedCoord = { top: coord.top + adjust, height: coord.height };
      const fragmentGeom = buildFragmentGeometry(
        info,
        adjustedCoord,
        coordinates,
        verticalCoordinates,
        allParticipants,
      );
      if (fragmentGeom) {
        fragments.push(fragmentGeom);
      }
      continue;
    }

    // --- Returns ---
    if (info.kind === "return") {
      const fromX = coordinates.getPosition(info.from);
      const toX = coordinates.getPosition(info.to);
      returns.push({
        fromX,
        toX,
        y: coord.top + adjust + 16,
        label: info.label,
        isReverse: toX < fromX,
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
  // OCCURRENCE_BAR_SIDE_WIDTH (7px). Detect nesting by Y-range containment.
  for (let i = 0; i < occurrences.length; i++) {
    const inner = occurrences[i];
    for (let j = 0; j < occurrences.length; j++) {
      if (i === j) continue;
      const outer = occurrences[j];
      if (outer.participantName === inner.participantName &&
          outer.y <= inner.y &&
          outer.y + outer.height >= inner.y + inner.height) {
        // inner is nested inside outer — shift right
        occurrences[i] = { ...inner, x: inner.x + OCCURRENCE_BAR_SIDE_WIDTH };
        break;
      }
    }
  }

  return { messages, selfCalls, occurrences, creations, fragments, returns, dividers, comments };
}


