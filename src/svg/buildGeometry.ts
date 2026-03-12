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
  OCCURRENCE_EMPTY_HEIGHT,
  FRAGMENT_MIN_WIDTH,
  MARGIN,
} from "@/positioning/Constants";

/**
 * SVG-specific participant top offset.
 * The HTML renderer's .life-line-layer has .pt-2 (8px) CSS padding that pushes
 * participants down. SVG has no such padding, so we add 8px to match the effective
 * HTML position and keep messages close to participant boxes.
 */
const PARTICIPANT_TOP_SPACE = _HTML_PARTICIPANT_TOP + 8;
import { TextType } from "@/positioning/Coordinate";

/** Visual height of participant box, matching HTML renderer's h-10 (40px) */
const PARTICIPANT_VISUAL_HEIGHT = 40;
import { _STARTER_, OrderedParticipants } from "@/parser/OrderedParticipants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { walkStatements } from "./walkStatements";
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

  const participants = buildParticipants(
    participantModels,
    coordinates,
    verticalCoordinates,
  );
  const lifelines = buildLifelines(
    participants,
    totalHeight,
  );

  const { messages, selfCalls, occurrences, creations, fragments, returns, dividers, comments } = buildMessages(
    rootContext,
    coordinates,
    verticalCoordinates,
    participants,
  );

  let diagramWidth = coordinates.getWidth();

  // Expand width to fit labels that extend beyond the rightmost participant
  if (measureText) {
    const SELF_CALL_LABEL_PAD = 10;
    for (const sc of selfCalls) {
      const labelWidth = measureText(sc.label, TextType.MessageContent);
      // Label is centered above the U-shape; check both right edge of U and right edge of label
      const labelMidX = sc.x + sc.width / 2;
      const rightExtent = Math.max(
        sc.x + sc.width + SELF_CALL_LABEL_PAD,
        labelMidX + labelWidth / 2 + SELF_CALL_LABEL_PAD,
      );
      if (rightExtent > diagramWidth) {
        diagramWidth = rightExtent;
      }
    }

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

  const diagramHeight = totalHeight + PARTICIPANT_VISUAL_HEIGHT; // keep lifeline area for parity

  return {
    width: diagramWidth,
    height: diagramHeight,
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
): ParticipantGeometry[] {
  return models
    .map((m) => {
      const centerX = coordinates.getPosition(m.name);
      const halfWidth = coordinates.half(m.name);
      const width = halfWidth * 2 - MARGIN; // visual box excludes positioning margin
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
  totalHeight: number,
): LifelineGeometry[] {
  return participants.map((p) => ({
    participantName: p.name,
    x: p.x,
    topY: p.y + p.height, // starts at bottom of visual participant box
    bottomY: totalHeight,
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

  for (const info of statements) {
    const coord = verticalCoordinates.getStatementCoordinate(info.key);
    if (!coord) continue;

    // --- Comments (inline, above the statement) ---
    if (info.comment) {
      const commentX = info.from
        ? coordinates.getPosition(info.from)
        : 10;
      comments.push({ x: commentX + 5, y: coord.top, text: info.comment });
    }

    // --- Sync / Async messages ---
    if (info.kind === "sync" || info.kind === "async") {
      let fromX = coordinates.getPosition(info.from);
      const toX = coordinates.getPosition(info.to);
      const messageHeight = info.isSelf ? 30 : 16;
      const messageY = coord.top + messageHeight;

      // D4: When sender has an active occurrence, arrow starts from its near edge
      if (info.senderHasOccurrence && !info.isSelf) {
        const isLTR = fromX < toX;
        fromX = isLTR ? fromX + OCCURRENCE_WIDTH / 2 : fromX - OCCURRENCE_WIDTH / 2;
      }

      if (info.isSelf) {
        selfCalls.push({
          x: fromX,
          y: coord.top,
          width: OCCURRENCE_WIDTH,
          height: messageHeight,
          label: info.label,
          arrowStyle: info.kind === "async" ? "open" : "solid",
        });
      } else {
        // For sync messages with occurrence, arrow tip stops at near edge of occurrence bar
        const isLTR = fromX < toX;
        const arrowToX =
          info.kind === "sync" && !info.isSelf
            ? isLTR
              ? toX - OCCURRENCE_WIDTH / 2
              : toX + OCCURRENCE_WIDTH / 2
            : toX;

        messages.push({
          fromX,
          toX: arrowToX,
          y: messageY,
          label: info.label,
          arrowStyle: info.kind === "async" ? "open" : "solid",
          isSelf: false,
          isReverse: arrowToX < fromX,
        });
      }

      // Occurrence: activation box centered on the target participant's lifeline
      if (info.kind === "sync") {
        const occX = toX - OCCURRENCE_WIDTH / 2;
        const occY = messageY - 2;
        const occHeight = coord.height - messageHeight + 2;
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
            const occBottom = occY + occHeight;
            returns.push({
              fromX: toX, toX: fromX, y: occBottom + 5,
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
      const fromX = coordinates.getPosition(info.from);
      const toX = coordinates.getPosition(info.to);

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
          returns.push({
            fromX: toX, toX: fromX, y: occBottom,
            label: creationAssign.assignee, isReverse: fromX < toX,
          });
        }
      }
      continue;
    }

    // --- Fragments ---
    if (info.kind === "fragment" && info.fragmentKind) {
      const fragmentGeom = buildFragmentGeometry(
        info,
        coord,
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
        y: coord.top + 10,
        label: info.label,
        isReverse: toX < fromX,
      });
      continue;
    }

    // --- Dividers ---
    if (info.kind === "divider") {
      dividers.push({
        y: coord.top + coord.height / 2,
        width: diagramWidth,
        label: info.label,
      });
      continue;
    }
  }

  // Separate overlapping return labels (minimum 32px gap, matching HTML's 16px margin-top + 16px margin-bottom)
  const MIN_RETURN_GAP = 32;
  returns.sort((a, b) => a.y - b.y);
  for (let i = 1; i < returns.length; i++) {
    if (returns[i].y - returns[i - 1].y < MIN_RETURN_GAP) {
      returns[i] = { ...returns[i], y: returns[i - 1].y + MIN_RETURN_GAP };
    }
  }

  return { messages, selfCalls, occurrences, creations, fragments, returns, dividers, comments };
}

function buildFragmentGeometry(
  info: ReturnType<typeof walkStatements>[number],
  coord: { top: number; height: number },
  coordinates: Coordinates,
  verticalCoordinates: VerticalCoordinates,
  allParticipants: string[],
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
      sections: [],
    };
  }

  // Compute fragment width from local participants
  const localNames = getLocalParticipantNames(fragmentCtx);
  const leftParticipant = allParticipants.find((p) => localNames.includes(p)) || "";
  const rightParticipant = allParticipants.slice().reverse().find((p) => localNames.includes(p)) || "";

  let fragWidth: number;
  let fragX: number;

  if (leftParticipant && rightParticipant) {
    const participantWidth =
      coordinates.distance(leftParticipant, rightParticipant) +
      coordinates.half(leftParticipant) +
      coordinates.half(rightParticipant);
    fragWidth = Math.max(participantWidth, FRAGMENT_MIN_WIDTH);
    fragX = coordinates.getPosition(leftParticipant) - coordinates.half(leftParticipant);
  } else {
    fragWidth = Math.max(FRAGMENT_MIN_WIDTH, coordinates.getWidth());
    fragX = 0;
  }

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
                sectionY = innerCoord.top - 20 - 8 - 1;
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
    sections,
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
