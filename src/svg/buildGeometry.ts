/**
 * Builds DiagramGeometry from parser output + positioning engine.
 * Pure function — no DOM, no React, no side effects.
 *
 * This is the orchestrator — geometry construction for participants,
 * statements, and groups is delegated to focused modules.
 */
import type { Coordinates } from "@/positioning/Coordinates";
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import { FRAGMENT_PADDING_X } from "@/positioning/Constants";
import { TextType } from "@/positioning/Coordinate";
import { OrderedParticipants } from "@/parser/OrderedParticipants";
import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import type { DiagramGeometry, FragmentGeometry } from "./geometry";
import type { RootContextNode } from "@/parser/AntlrTypes";
import { PARTICIPANT_VISUAL_HEIGHT } from "./svgConstants";
import { buildParticipants, buildLifelines, buildGroups } from "./buildParticipantGeometry";
import { buildMessages } from "./buildStatementGeometry";

export interface BuildGeometryInput {
  rootContext: RootContextNode;
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
    measureText,
  );
  const { messages, selfCalls, occurrences, creations, fragments, returns, dividers, comments } = buildResult;

  // Compute diagram height from the positioning engine's totalHeight (primary) or
  // max rendered content Y (fallback). Returns need more bottom overhead than other elements
  // because their Y = coord.top + adjust + 16 represents the visual bottom of a 16px element,
  // and HTML's CSS adds ~60px of space below the last return. Empirically: +47 (= viewHeight
  // overhead) gives the right frame height matching HTML. Other content uses +13 (= SVG
  // bottom space = viewHeight_overhead(47) - headerLineY(34)).
  let maxOccBottom = 0;
  let maxOtherY = 0;
  for (const o of occurrences) maxOccBottom = Math.max(maxOccBottom, o.y + o.height);
  for (const m of messages) maxOtherY = Math.max(maxOtherY, m.y);
  for (const s of selfCalls) maxOtherY = Math.max(maxOtherY, s.y + s.height);
  for (const c of creations) maxOtherY = Math.max(maxOtherY, c.message.y + PARTICIPANT_VISUAL_HEIGHT);
  for (const f of fragments) maxOtherY = Math.max(maxOtherY, f.y + f.height);
  for (const d of dividers) maxOtherY = Math.max(maxOtherY, d.y);
  const diagramHeight = Math.max(
    totalHeight + 28,
    maxOccBottom + 13,
    maxOtherY + 13,
    buildResult.maxReturnBottom,
  );
  const lifelineBottom = diagramHeight + PARTICIPANT_VISUAL_HEIGHT - 28;

  // Build lifelines AFTER height adjustment so they extend to the correct bottom
  const lifelines = buildLifelines(
    participants,
    lifelineBottom,
  );

  // Diagram width is HTML's canonical TotalWidth (WidthOfContext.ts), which is
  // max(participantWidth, FRAGMENT_MIN_WIDTH) + border.left + border.right +
  // extraWidthDueToSelfMessage. The SVG path adds border.left/.right separately
  // during composition (see the fragment shifts below and composeSvg), so the
  // two border terms are subtracted back out here rather than threaded through
  // TotalWidth as a flag — `frameBorder` above is built from exactly the same
  // (rootContext, orderedParticipantNames) pair TotalWidth uses internally.
  let diagramWidth =
    TotalWidth(rootContext, coordinates) - frameBorder.left - frameBorder.right;

  // Expand width to fit labels that extend beyond
  if (measureText) {
    // Title does not expand diagramWidth. The HTML renderer does not expand the
    // sequence diagram width for the title — TotalWidth() is participant-based only.
    // The frame may expand via CSS whitespace-nowrap for very long titles, but the
    // old * 1.15 multiplier grossly over-corrected, causing 28px+ mismatches.

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
  // Also shift fragment-level comments by the same amount so they stay aligned.
  for (const f of fragments) {
    f.x -= frameBorder.left;
  }
  for (const c of comments) {
    if (c.fragmentComment) {
      c.x -= frameBorder.left;
    }
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

  // Build group geometry from participants that share a groupId
  const groups = buildGroups(participants, diagramHeight);

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
    groups,
  };
}
