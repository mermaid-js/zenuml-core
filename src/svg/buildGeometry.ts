/**
 * Builds DiagramGeometry from parser output + positioning engine.
 * Pure function — no DOM, no React, no side effects.
 */
import type { Coordinates } from "@/positioning/Coordinates";
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import {
  PARTICIPANT_HEIGHT,
  PARTICIPANT_TOP_SPACE_FOR_GROUP,
} from "@/positioning/Constants";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { walkStatements } from "./walkStatements";
import type {
  DiagramGeometry,
  ParticipantGeometry,
  LifelineGeometry,
  MessageGeometry,
  SelfCallGeometry,
} from "./geometry";

export interface BuildGeometryInput {
  rootContext: any;
  coordinates: Coordinates;
  verticalCoordinates: VerticalCoordinates;
  title?: string;
}

export function buildGeometry(input: BuildGeometryInput): DiagramGeometry {
  const { rootContext, coordinates, verticalCoordinates, title } = input;
  const participantNames = coordinates.orderedParticipantNames();
  const totalHeight = verticalCoordinates.getTotalHeight();

  const participants = buildParticipants(
    participantNames,
    coordinates,
    verticalCoordinates,
  );
  const lifelines = buildLifelines(
    participants,
    totalHeight,
  );

  const { messages, selfCalls } = buildMessages(
    rootContext,
    coordinates,
    verticalCoordinates,
  );

  const diagramWidth = coordinates.getWidth();
  const diagramHeight = totalHeight + PARTICIPANT_HEIGHT; // bottom participant row

  return {
    width: diagramWidth,
    height: diagramHeight,
    title,
    participants,
    lifelines,
    messages,
    selfCalls,
    occurrences: [],
    creations: [],
    fragments: [],
    dividers: [],
    returns: [],
  };
}

function buildParticipants(
  names: string[],
  coordinates: Coordinates,
  verticalCoordinates: VerticalCoordinates,
): ParticipantGeometry[] {
  return names
    .filter((name) => name !== _STARTER_)
    .map((name) => {
      const centerX = coordinates.getPosition(name);
      const halfWidth = coordinates.half(name);
      const width = halfWidth * 2;
      const creationTop = verticalCoordinates.getCreationTop(name);
      const y =
        creationTop != null
          ? Math.max(PARTICIPANT_TOP_SPACE_FOR_GROUP, creationTop)
          : PARTICIPANT_TOP_SPACE_FOR_GROUP;

      return {
        name,
        label: name,
        x: centerX,
        y,
        width,
        height: PARTICIPANT_HEIGHT,
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
    topY: p.y + p.height,
    bottomY: totalHeight,
    dashed: true,
  }));
}

function buildMessages(
  rootContext: any,
  coordinates: Coordinates,
  verticalCoordinates: VerticalCoordinates,
): { messages: MessageGeometry[]; selfCalls: SelfCallGeometry[] } {
  const statements = walkStatements(rootContext);
  const messages: MessageGeometry[] = [];
  const selfCalls: SelfCallGeometry[] = [];

  for (const info of statements) {
    if (info.kind !== "sync" && info.kind !== "async") continue;

    const coord = verticalCoordinates.getStatementCoordinate(info.key);
    if (!coord) continue;

    const fromX = coordinates.getPosition(info.from);
    const toX = coordinates.getPosition(info.to);
    const messageY = coord.top + 16; // approximate message line position within statement

    if (info.isSelf) {
      selfCalls.push({
        x: fromX,
        y: messageY,
        width: 40,
        height: 30,
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
  }

  return { messages, selfCalls };
}
