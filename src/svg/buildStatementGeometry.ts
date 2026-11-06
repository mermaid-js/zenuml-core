/**
 * Builds message, occurrence, creation, fragment, return, divider, and comment
 * geometry from the statement tree walker output and positioning engine.
 *
 * buildMessages walks the statements and dispatches each kind to its own
 * builder (buildCallGeometry, buildCreationGeometry, buildFragmentGeometry,
 * and the return / divider / comment builders below); two post-passes then
 * space returns and nest occurrences.
 */
import type { Coordinates } from "@/positioning/Coordinates";
import type { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import {
  OCCURRENCE_BAR_SIDE_WIDTH,
  LIFELINE_WIDTH,
} from "@/positioning/Constants";
import { COMMENT_LINE_HEIGHT } from "@/positioning/vertical/LayoutMetrics";
import { TextType } from "@/positioning/Coordinate";
import Anchor from "@/positioning/Anchor";
import { buildFragmentGeometry } from "./buildFragmentGeometry";
import { buildCallGeometry } from "./buildCallGeometry";
import type { CallGeometry } from "./buildCallGeometry";
import { buildCreationGeometry } from "./buildCreationGeometry";
import type { CreationStatementGeometry } from "./buildCreationGeometry";
import type { StatementContext } from "./statementContext";
import { measureSvgFragmentLabelWidth } from "@/positioning/WidthProviderFunc";
import { resolveEmojiInText } from "@/emoji/resolveEmoji";
import { walkStatements } from "./walkStatements";
import type { StatementInfo } from "./walkStatements";
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
import { cssToSvgStyle } from "./svgConstants";
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
  const out: BuildMessagesResult = {
    messages: [],
    selfCalls: [],
    occurrences: [],
    creations: [],
    fragments: [],
    returns: [],
    dividers: [],
    comments: [],
    maxReturnBottom: 0,
  };
  const allParticipants = coordinates.orderedParticipantNames();
  const blockChildCount = countBlockChildren(statements);

  // --- Scope-aware return height debt computation ---
  // ReturnStatementVM.measure() reports height=0 for non-self returns, but in HTML
  // the return element takes ~16px of visual space. This causes all subsequent
  // elements to be positioned too high. We compute a per-statement adjustment.
  const RETURN_VISUAL_HEIGHT = 16;
  const adjustMap = computeReturnDebt(
    statements,
    verticalCoordinates,
    RETURN_VISUAL_HEIGHT,
  );

  for (const info of statements) {
    const coord = verticalCoordinates.getStatementCoordinate(info.key);
    if (!coord) continue;

    // --- Parse styling comments (e.g. // [red] text) ---
    const commentObj = info.comment
      ? new CommentClass(info.comment)
      : undefined;
    const ctx: StatementContext = {
      coord,
      adjust: adjustMap.get(info.key) || 0,
      ...commentMetrics(info, commentObj),
      coordinates,
      participants,
      measureText,
      diagramWidth: coordinates.getWidth(),
      adjustMap,
      blockChildCount,
    };

    // --- Comments (inline, above the statement) ---
    // Fragment comments are positioned inside buildFragmentGeometry (at fragX, not sender lifeline).
    if (commentObj?.text && info.kind !== "fragment") {
      out.comments.push(buildInlineComment(info, commentObj, ctx));
    }

    switch (info.kind) {
      case "sync":
      case "async":
        addCall(out, buildCallGeometry(info, ctx));
        break;
      case "creation":
        addCreation(out, buildCreationGeometry(info, ctx));
        break;
      case "fragment":
        addFragment(
          out,
          info,
          ctx,
          verticalCoordinates,
          allParticipants,
          commentObj,
        );
        break;
      case "return": {
        const ret = buildReturnGeometry(info, ctx);
        out.returns.push(ret.geometry);
        out.maxReturnBottom = Math.max(out.maxReturnBottom, ret.bottom);
        break;
      }
      case "divider":
        out.dividers.push(buildDividerGeometry(info, ctx));
        break;
    }
  }

  enforceMinReturnGap(out.returns);
  offsetNestedOccurrences(out.occurrences);
  return out;
}

/** Message style and above-the-statement height from a styling comment. */
function commentMetrics(
  info: StatementInfo,
  commentObj: CommentClass | undefined,
): Pick<StatementContext, "messageStyle" | "commentHeight"> {
  return {
    // Applied to message/self-call/creation labels
    messageStyle: commentObj
      ? cssToSvgStyle(commentObj.messageStyle)
      : undefined,
    // HTML renders the comment above the statement, one COMMENT_LINE_HEIGHT
    // line box per line (the same arithmetic MarkdownMeasurer runs for the
    // vertical engine).
    commentHeight: commentObj?.text
      ? (info.comment?.trim().split("\n").length || 0) * COMMENT_LINE_HEIGHT
      : 0,
  };
}

function addCall(out: BuildMessagesResult, call: CallGeometry): void {
  if (call.selfCall) out.selfCalls.push(call.selfCall);
  if (call.message) out.messages.push(call.message);
  if (call.occurrence) out.occurrences.push(call.occurrence);
  if (call.assignmentReturn) out.returns.push(call.assignmentReturn);
  if (call.returnBottom !== undefined) {
    out.maxReturnBottom = Math.max(out.maxReturnBottom, call.returnBottom);
  }
}

function addCreation(
  out: BuildMessagesResult,
  created: CreationStatementGeometry,
): void {
  if (created.creation) out.creations.push(created.creation);
  if (created.occurrence) out.occurrences.push(created.occurrence);
  if (created.assignmentReturn) out.returns.push(created.assignmentReturn);
  if (created.returnBottom !== undefined) {
    out.maxReturnBottom = Math.max(out.maxReturnBottom, created.returnBottom);
  }
}

function addFragment(
  out: BuildMessagesResult,
  info: StatementInfo,
  ctx: StatementContext,
  verticalCoordinates: VerticalCoordinates,
  allParticipants: string[],
  commentObj: CommentClass | undefined,
): void {
  if (!info.fragmentKind) return;
  const { coord, adjust } = ctx;
  const fragmentResult = buildFragmentGeometry(
    info,
    { top: coord.top + adjust, height: coord.height },
    ctx.coordinates,
    verticalCoordinates,
    allParticipants,
    ctx.measureText,
    ctx.commentHeight,
    commentObj?.text,
    commentObj?.commentStyle
      ? cssToSvgStyle(commentObj.commentStyle)
      : undefined,
    coord.top + adjust,
  );
  if (fragmentResult) {
    out.fragments.push(fragmentResult.fragment);
    if (fragmentResult.comment) out.comments.push(fragmentResult.comment);
  }
}

/**
 * Block child count: how many direct children each parent number has.
 * Used to compute assignment return seq numbers (e.g. block with 3 children → return is N.4)
 */
function countBlockChildren(statements: StatementInfo[]): Map<string, number> {
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
  return blockChildCount;
}

/** Inline comment drawn above any statement except a fragment. */
export function buildInlineComment(
  info: StatementInfo,
  commentObj: CommentClass,
  ctx: StatementContext,
): CommentGeometry {
  const { coord, adjust, coordinates } = ctx;
  // For RTL creation statements, HTML positions the comment at the target (left side).
  // For all other cases, the comment is at the sender's position.
  let commentParticipant = info.from;
  if (info.kind === "creation" && info.from && info.to) {
    const fX = coordinates.getPosition(info.from);
    const tX = coordinates.getPosition(info.to);
    if (fX > tX) commentParticipant = info.to;
  }
  const commentX = commentParticipant
    ? coordinates.getPosition(commentParticipant)
    : 10;
  // SVG text y = baseline; HTML positions by visual top. Add font ascent (~12px for 14px text).
  const COMMENT_FONT_ASCENT = 15;
  // Inside an occurrence, HTML positions the comment at the occurrence
  // bar's inner edge (OCCURRENCE_BAR_SIDE_WIDTH + 1). At the top level
  // (no active occurrence), the comment sits near the lifeline center.
  const commentXOffset =
    info.senderOccurrenceDepth >= 1 ? OCCURRENCE_BAR_SIDE_WIDTH + 1 : 1;
  // HTML wraps backtick text in <code> with padding:2px (Cosmetic.scss).
  // Add the same left-padding offset so SVG text aligns with HTML.
  const codeSpanPadding = commentObj.text.trimStart().startsWith("`") ? 2 : 0;
  return {
    x: commentX + commentXOffset + codeSpanPadding,
    y: coord.top + adjust + COMMENT_FONT_ASCENT,
    text: commentObj.text,
    style: cssToSvgStyle(commentObj.commentStyle),
  };
}

/** A `return` statement, plus the lowest point it needs below it. */
export function buildReturnGeometry(
  info: StatementInfo,
  ctx: StatementContext,
): { geometry: ReturnGeometry; bottom: number } {
  const { coord, adjust, coordinates } = ctx;
  const rawFromX = coordinates.getPosition(info.from);
  const rawToX = coordinates.getPosition(info.to);
  const isReverse = rawToX < rawFromX;
  // Return lines run edge-to-edge between occurrence walls; reuse the very
  // same wall arithmetic the HTML path uses (src/positioning/Anchor.ts).
  // LTR: from.rightEdge → to.leftEdge;  RTL: to.rightEdge ← from.leftEdge
  const fromAnchor = new Anchor(rawFromX, info.senderOccurrenceDepth);
  const toAnchor = new Anchor(rawToX, info.targetOccurrenceDepth || 0);
  // +1: occurrence stroke extends 1px beyond fill area (stroke-width=2,
  // centered). Not part of Anchor — kept as a separate addition.
  const RETURN_STROKE_OFFSET = 1;
  const fromX = isReverse
    ? fromAnchor.leftEdgeOfRightWall()
    : fromAnchor.rightEdgeOfRightWall() + RETURN_STROKE_OFFSET;
  // HTML Anchor.edgeOffset subtracts LIFELINE_WIDTH from the container width.
  // For RTL returns, add LIFELINE_WIDTH to reach the inner edge of the target.
  // For LTR returns, the +1 stroke correction on fromX already accounts for
  // the Anchor LIFELINE_WIDTH subtraction — applying it again on toX would
  // double-count and shrink the arrow by 2px instead of 1px. Neither term is
  // part of Anchor, so both stay outside the accessor call.
  const toX = isReverse
    ? toAnchor.rightEdgeOfRightWall() + LIFELINE_WIDTH
    : toAnchor.leftEdgeOfRightWall();
  // Return Y positioning: subpixel browser measurement (scoring coord = attrY + 21)
  // shows the two sub-cases that the positioning engine distinguishes with 0 vs 16px:
  //   - return with coord.height=0: HTML collapses margin (CSS margin-bottom:-16px on
  //     last child inside occurrence), SVG needs 16.5. This applies to returns inside
  //     sync blocks AND returns inside fragment sections that are themselves inside an
  //     occurrence (e.g. Alt inside a sync method call).
  //   - all other returns (root/async, or height>0): SVG needs 15.5
  // These are +0.5 adjustments on the original 16/15 split, validated by
  // emoji-async-return (root returns: 87.4%->97%) and emoji-return-chain (block returns: 94.5%->98%).
  const returnOffset = coord.height === 0 ? 16.5 : 15.5;
  const returnY = coord.top + adjust + returnOffset;
  const returnBottomPad = coord.height === 0 ? 45.5 : 44.5;
  return {
    geometry: {
      fromX,
      toX,
      y: returnY,
      label: info.label,
      isReverse,
      isSelf: info.isSelf,
      number: info.number,
    },
    bottom: returnY + returnBottomPad,
  };
}

/** A `==== label ====` divider spanning the diagram width. */
export function buildDividerGeometry(
  info: StatementInfo,
  ctx: StatementContext,
): DividerGeometry {
  const { coord, adjust, diagramWidth } = ctx;
  const cleanLabel = info.label.replace(/^=+\s*|\s*=+$/g, "").trim();
  return {
    y: coord.top + adjust + coord.height / 2,
    width: diagramWidth,
    label: info.label,
    labelWidth: measureSvgFragmentLabelWidth(resolveEmojiInText(cleanLabel)),
  };
}

/**
 * With scope-aware return debt adjustments, returns are naturally spaced.
 * Only enforce minimum gap if returns genuinely overlap (e.g., assignment returns
 * at occurrence bottom that coincide with explicit returns).
 */
export function enforceMinReturnGap(returns: ReturnGeometry[]): void {
  const MIN_RETURN_GAP = 16;
  returns.sort((a, b) => a.y - b.y);
  for (let i = 1; i < returns.length; i++) {
    if (returns[i].y - returns[i - 1].y < MIN_RETURN_GAP) {
      returns[i] = { ...returns[i], y: returns[i - 1].y + MIN_RETURN_GAP };
    }
  }
}

/**
 * Offset nested occurrences: in HTML, inner occurrences on the same participant
 * are rendered inside the outer occurrence DOM element, offset right by
 * OCCURRENCE_BAR_SIDE_WIDTH (7px) per nesting level. Detect nesting by Y-range containment.
 */
export function offsetNestedOccurrences(
  occurrences: OccurrenceGeometry[],
): void {
  for (let i = 0; i < occurrences.length; i++) {
    const inner = occurrences[i];
    let depth = 0;
    for (let j = 0; j < occurrences.length; j++) {
      if (i === j) continue;
      const outer = occurrences[j];
      if (
        outer.participantName === inner.participantName &&
        outer.y <= inner.y &&
        outer.y + outer.height >= inner.y + inner.height
      ) {
        depth++;
      }
    }
    if (depth > 0) {
      occurrences[i] = {
        ...inner,
        x: inner.x + depth * OCCURRENCE_BAR_SIDE_WIDTH,
      };
    }
  }
}
