/**
 * Builds FragmentGeometry from statement info + positioning engine.
 * Extracted from buildGeometry.ts for clarity and to enable
 * fragment-aware comment positioning.
 */
import type { Coordinates } from "@/positioning/Coordinates";
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import { measureSvgFragmentLabelWidth } from "@/positioning/WidthProviderFunc";
import {
  FRAGMENT_MIN_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";
import type { TextType } from "@/positioning/Coordinate";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { Participants } from "@/parser/index.js";
import { AllMessages } from "@/parser/MessageCollector";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import type { FragmentGeometry, FragmentSectionGeometry, CommentGeometry } from "./geometry";
import type { StatementInfo } from "./walkStatements";

export interface BuildFragmentResult {
  fragment: FragmentGeometry;
  comment?: CommentGeometry;
}

function snapX(x: number): number {
  return x;
}

const COMMENT_FONT_ASCENT = 15;

export function buildFragmentGeometry(
  info: StatementInfo,
  coord: { top: number; height: number },
  coordinates: Coordinates,
  verticalCoordinates: VerticalCoordinates,
  allParticipants: string[],
  measureText?: (text: string, type: TextType) => number,
  commentHeight: number = 0,
  commentText?: string,
  commentStyle?: Record<string, string>,
  commentYBase?: number,
): BuildFragmentResult | null {
  // Get the fragment's parse tree node to find local participants
  const statNode = info.statNode;
  if (!statNode) return null;

  // Find the fragment context node (loop, alt, opt, etc.)
  const fragmentCtx = findFragmentContext(statNode);
  if (!fragmentCtx) {
    // Fallback: use full diagram width
    return {
      fragment: {
        kind: info.fragmentKind!,
        label: info.fragmentLabel || "",
        labelWidth: info.fragmentLabel ? measureSvgFragmentLabelWidth(info.fragmentLabel) : undefined,
        x: 0,
        y: coord.top,
        width: coordinates.getWidth(),
        height: coord.height,
        headerY: coord.top + 1 + commentHeight,
        sections: [],
        number: info.number,
        depth: info.depth,
      },
      comment: commentText && commentYBase != null ? {
        x: 1,
        y: commentYBase + 1 + COMMENT_FONT_ASCENT,
        text: commentText,
        style: commentStyle,
        fragmentComment: true,
      } : undefined,
    };
  }

  // Compute fragment width from local participants, including nested fragments.
  // getLocalParticipantNames only does shallow extraction; we also walk inner
  // section blocks to capture participants inside nested par/alt/loop/etc.
  const localNames = getDeepParticipantNames(fragmentCtx, info.fragmentSections);
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
                // with label space (20px) and padding (8+8+1px border)
                sectionY = innerCoord.top - 20 - 8 - 8 - 1;
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
        labelWidth: section.label ? measureSvgFragmentLabelWidth(section.label) : undefined,
        innerLabel: /^\[\s*.*\s*\]$/.test(section.label) ? section.label.slice(1, -1).trim() : undefined,
        innerLabelWidth: /^\[\s*.*\s*\]$/.test(section.label)
          ? measureSvgFragmentLabelWidth(section.label.slice(1, -1).trim())
          : undefined,
        keyword: (() => {
          const spaceIdx = section.label.indexOf(" ");
          if (spaceIdx > 0 && !section.label.startsWith("finally") && !section.label.startsWith("[")) {
            return section.label.substring(0, spaceIdx);
          }
          return undefined;
        })(),
        keywordWidth: (() => {
          const spaceIdx = section.label.indexOf(" ");
          if (spaceIdx > 0 && !section.label.startsWith("finally") && !section.label.startsWith("[")) {
            return measureSvgFragmentLabelWidth(section.label.substring(0, spaceIdx));
          }
          return undefined;
        })(),
        detail: (() => {
          const spaceIdx = section.label.indexOf(" ");
          if (spaceIdx > 0 && !section.label.startsWith("finally") && !section.label.startsWith("[")) {
            return section.label.substring(spaceIdx + 1);
          }
          return undefined;
        })(),
        detailWidth: (() => {
          const spaceIdx = section.label.indexOf(" ");
          if (spaceIdx > 0 && !section.label.startsWith("finally") && !section.label.startsWith("[")) {
            return measureSvgFragmentLabelWidth(section.label.substring(spaceIdx + 1));
          }
          return undefined;
        })(),
      });
    }
  }

  // Par fragment dividers: HTML renders a 1px border-top between par child statements.
  // The par block has a flat list of statements; add separator sections so the renderer
  // draws lines between them. The renderer iterates from sections[1] onwards, drawing
  // a separator line at each section.y, so we need a dummy first section + one per divider.
  if (info.fragmentKind === "par" && sections.length === 0) {
    const parBlock = info.fragmentSections?.[0]?.blockNode;
    const innerStats = parBlock?.stat?.() || [];
    if (innerStats.length > 1) {
      // Dummy first section (renderer skips i=0)
      sections.push({ label: "", y: coord.top, height: 0 });
      for (let i = 1; i < innerStats.length; i++) {
        const statKey = createStatementKeyFromStat(innerStats[i]);
        if (!statKey) continue;
        const innerCoord = verticalCoordinates.getStatementCoordinate(statKey);
        if (!innerCoord) continue;
        // HTML par divider: border-top on .statement-container with .my-4 (16px margin).
        // CSS margin collapse makes the gap 16px between statements.
        // The border-top sits at the statement-container's top edge, which is
        // messageY - messageHeight/2 in the vertical coordinate system.
        // fragment.ts adds HALF_STROKE (+0.5) to separator Y for stroke centering.
        // Net Y = innerCoord.top - 1 + 0.5 = innerCoord.top - 0.5, which places
        // the stroke center 0.5px above the HTML border — matching the pixel row.
        const dividerY = innerCoord.top - 1;
        sections.push({
          label: "",
          y: dividerY,
          height: 0,
          contentInsetLeft: fragBorder.left + coordinates.half(leftParticipant),
        });
      }
    }
  }

  // Fragment comment: positioned at the fragment's left border edge (fragX),
  // not at the sender's lifeline. HTML renders fragment comments inside the
  // fragment container, aligned with its left edge.
  let fragmentComment: CommentGeometry | undefined;
  if (commentText && commentYBase != null) {
    fragmentComment = {
      x: fragX + 1,
      y: commentYBase + 1 + COMMENT_FONT_ASCENT,
      text: commentText,
      style: commentStyle,
      fragmentComment: true,
    };
  }

  return {
    fragment: {
      kind: info.fragmentKind!,
      label: info.fragmentLabel || "",
      labelWidth: info.fragmentLabel ? measureSvgFragmentLabelWidth(info.fragmentLabel) : undefined,
      x: fragX,
      y: coord.top,
      width: fragWidth,
      height: coord.height,
      headerY: coord.top + 1 + commentHeight,
      sections,
      number: info.number,
      depth: info.depth,
    },
    comment: fragmentComment,
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
 * Collects participants from the fragment context and recursively from
 * inner section blocks.  getLocalParticipantNames only does shallow
 * extraction, so nested fragments (e.g. par inside alt) are missed.
 */
function getDeepParticipantNames(
  fragmentCtx: any,
  sections?: { label: string; blockNode: any }[],
): string[] {
  const names = new Set(getLocalParticipantNames(fragmentCtx));

  // Walk each section's inner block to find participants in nested content
  if (sections) {
    for (const section of sections) {
      if (!section.blockNode) continue;
      const innerNames = Participants(section.blockNode).Names() as string[];
      for (const n of innerNames) names.add(n);
    }
  }

  return [...names];
}
