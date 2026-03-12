/**
 * Builds DiagramGeometry from parser output + positioning engine.
 * Pure function — no DOM, no React, no side effects.
 */
import type { Coordinates } from "@/positioning/Coordinates";
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import type { IParticipantModel } from "@/parser/IParticipantModel";
import {
  PARTICIPANT_TOP_SPACE_FOR_GROUP,
  OCCURRENCE_WIDTH,
  FRAGMENT_MIN_WIDTH,
  MARGIN,
} from "@/positioning/Constants";

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
} from "./geometry";

export interface BuildGeometryInput {
  rootContext: any;
  coordinates: Coordinates;
  verticalCoordinates: VerticalCoordinates;
  title?: string;
}

export function buildGeometry(input: BuildGeometryInput): DiagramGeometry {
  const { rootContext, coordinates, verticalCoordinates, title } = input;
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

  const { messages, selfCalls, occurrences, creations, fragments, returns, dividers } = buildMessages(
    rootContext,
    coordinates,
    verticalCoordinates,
    participants,
  );

  const diagramWidth = coordinates.getWidth();
  const diagramHeight = totalHeight + PARTICIPANT_VISUAL_HEIGHT; // bottom participant row

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
  };
}

function buildParticipants(
  models: IParticipantModel[],
  coordinates: Coordinates,
  verticalCoordinates: VerticalCoordinates,
): ParticipantGeometry[] {
  return models
    .filter((m) => m.name !== _STARTER_)
    .map((m) => {
      const centerX = coordinates.getPosition(m.name);
      const halfWidth = coordinates.half(m.name);
      const width = halfWidth * 2 - MARGIN; // visual box excludes positioning margin
      const creationTop = verticalCoordinates.getCreationTop(m.name);
      const y =
        creationTop != null
          ? Math.max(PARTICIPANT_TOP_SPACE_FOR_GROUP, creationTop)
          : PARTICIPANT_TOP_SPACE_FOR_GROUP;

      return {
        name: m.name,
        label: m.getDisplayName(),
        x: centerX,
        y,
        width,
        height: PARTICIPANT_VISUAL_HEIGHT,
        isStarter: false,
        showBottom: creationTop == null,
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
} {
  const statements = walkStatements(rootContext);
  const messages: MessageGeometry[] = [];
  const selfCalls: SelfCallGeometry[] = [];
  const occurrences: OccurrenceGeometry[] = [];
  const creations: CreationGeometry[] = [];
  const fragments: FragmentGeometry[] = [];
  const returns: ReturnGeometry[] = [];
  const dividers: DividerGeometry[] = [];

  const diagramWidth = coordinates.getWidth();
  const allParticipants = coordinates.orderedParticipantNames();

  for (const info of statements) {
    const coord = verticalCoordinates.getStatementCoordinate(info.key);
    if (!coord) continue;

    // --- Sync / Async messages ---
    if (info.kind === "sync" || info.kind === "async") {
      const fromX = coordinates.getPosition(info.from);
      const toX = coordinates.getPosition(info.to);
      const messageHeight = info.isSelf ? 30 : 16;
      const messageY = coord.top + messageHeight;

      if (info.isSelf) {
        selfCalls.push({
          x: fromX,
          y: coord.top,
          width: 40,
          height: messageHeight,
          label: info.label,
          arrowStyle: info.kind === "async" ? "open" : "solid",
        });
      } else {
        messages.push({
          fromX,
          toX,
          y: messageY,
          label: info.label,
          arrowStyle: info.kind === "async" ? "open" : "solid",
          isSelf: false,
          isReverse: toX < fromX,
        });
      }

      // Occurrence: activation box on the target participant's lifeline
      if (info.kind === "sync") {
        const occX = toX - OCCURRENCE_WIDTH / 2;
        const occY = messageY;
        const occHeight = coord.height - messageHeight;
        if (occHeight > 0) {
          occurrences.push({
            x: occX,
            y: occY,
            width: OCCURRENCE_WIDTH,
            height: occHeight,
            participantName: info.to,
          });
        }
      }
      continue;
    }

    // --- Creation arrows ---
    if (info.kind === "creation") {
      const CREATION_MSG_HEIGHT = 40; // from CreationStatementVM.ts
      const fromX = coordinates.getPosition(info.from);
      const toX = coordinates.getPosition(info.to);
      const messageY = coord.top + CREATION_MSG_HEIGHT / 2;

      // Find the already-built participant (buildParticipants handles creationTop)
      const targetParticipant = participants.find(p => p.name === info.to);
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
      const occY = coord.top + CREATION_MSG_HEIGHT;
      const occHeight = info.hasBlock
        ? coord.height - CREATION_MSG_HEIGHT
        : 22; // min-h-6 + mt-[-2px] from CreationStatementVM
      if (occHeight > 0) {
        occurrences.push({
          x: occX,
          y: occY,
          width: OCCURRENCE_WIDTH,
          height: occHeight,
          participantName: info.to,
        });
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

  return { messages, selfCalls, occurrences, creations, fragments, returns, dividers };
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
