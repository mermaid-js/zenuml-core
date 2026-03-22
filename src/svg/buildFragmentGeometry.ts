/**
 * Builds FragmentGeometry from statement info and positioning data.
 * Extracted from buildGeometry.ts for single-responsibility.
 */
import type { Coordinates } from "@/positioning/Coordinates";
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import type { FragmentGeometry, FragmentSectionGeometry } from "./geometry";
import type { StatementInfo } from "./walkStatements";

export function buildFragmentGeometry(
  info: StatementInfo,
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
    fragWidth = Math.max(participantWidth, FRAGMENT_MIN_WIDTH) + fragBorder.left + fragBorder.right;
    fragX = coordinates.getPosition(leftParticipant) - coordinates.half(leftParticipant);
  } else {
    fragWidth = Math.max(FRAGMENT_MIN_WIDTH, coordinates.getWidth());
    fragX = 0;
  }

  // Build section geometry for multi-section fragments (alt, tcf)
  const sections: FragmentSectionGeometry[] = [];
  if (info.fragmentSections && info.fragmentSections.length > 1) {
    let sectionY = coord.top;
    for (let i = 0; i < info.fragmentSections.length; i++) {
      const section = info.fragmentSections[i];
      if (i > 0) {
        const sectionBlock = section.blockNode;
        if (sectionBlock) {
          const innerStats = sectionBlock.stat?.() || [];
          if (innerStats.length > 0) {
            const firstStatKey = createStatementKeyFromStat(innerStats[0]);
            if (firstStatKey) {
              const innerCoord = verticalCoordinates.getStatementCoordinate(firstStatKey);
              if (innerCoord) {
                sectionY = innerCoord.top - 20 - 8 - 1;
              }
            }
          }
        }
      }

      const sectionHeight = i < info.fragmentSections.length - 1
        ? 0
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
