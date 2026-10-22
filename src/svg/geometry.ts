/**
 * Geometry IR — SVG-ready layout primitives.
 *
 * Built from Coordinates (horizontal) + VerticalCoordinates (vertical)
 * without any DOM dependency.
 */

// ─── Participant & Lifeline ────────────────────────────────────────

export interface ParticipantGeometry {
  name: string;
  label: string;
  x: number; // center x
  y: number; // top of participant box
  width: number;
  height: number;
  isStarter: boolean;
  /** Duplicate at diagram bottom for long diagrams */
  showBottom: boolean;
  /** Measured glyph-only label width (for textLength adjustment on aliased labels) */
  labelWidth?: number;
  /** Icon type (e.g., "aws", "database") if participant has an icon */
  type?: string;
  /** Stereotype label (e.g., "BFF") rendered as «BFF» above the name */
  stereotype?: string;
  /** Measured glyph width of the stereotype text (including «» guillemets) */
  stereotypeWidth?: number;
  /** Background color (hex string, e.g. "#FFEBE6") */
  color?: string;
  /** Emoji shortcode (e.g. "rocket") to render before participant name */
  emoji?: string;
  /** Group ID this participant belongs to (if any) */
  groupId?: string | number;
}

export interface LifelineGeometry {
  participantName: string;
  x: number; // center x (same as participant center)
  topY: number; // bottom of participant box (or creation-top)
  bottomY: number; // top of bottom participant box (or diagram bottom)
  dashed: boolean;
}

// ─── Messages ──────────────────────────────────────────────────────

export type ArrowStyle = "solid" | "dashed" | "open";

export interface MessageGeometry {
  fromX: number;
  toX: number;
  y: number;
  label: string;
  arrowStyle: ArrowStyle;
  isSelf: boolean;
  isReverse: boolean; // right-to-left
  number?: string; // sequence number for numbering mode
  /** Inline style from styling comments (e.g. // [red]) */
  style?: Record<string, string>;
}

export interface SelfCallGeometry {
  x: number; // left edge of U-shape
  y: number;
  width: number;
  height: number;
  label: string;
  arrowStyle: ArrowStyle;
  number?: string;
  /** Inline style from styling comments (e.g. // [red]) */
  style?: Record<string, string>;
}

// ─── Occurrences ───────────────────────────────────────────────────

export interface OccurrenceGeometry {
  x: number; // left edge
  y: number; // top
  width: number;
  height: number;
  participantName: string;
}

// ─── Creation ──────────────────────────────────────────────────────

export interface CreationGeometry {
  /** The created participant (rendered inline) */
  participant: ParticipantGeometry;
  /** Arrow from creator to created participant */
  message: MessageGeometry;
}

// ─── Fragments ─────────────────────────────────────────────────────

import type { FragmentKind } from "@/parser/fragmentOf";
export type { FragmentKind };

export interface FragmentSectionGeometry {
  /** if / else if / else (alt); try / catch / finally (tcf). Unset for par separators. */
  guardKeyword?: string;
  /** Guard text: the condition of if / else if, the exception of catch. */
  condition?: string;
  y: number; // top of this section (separator line y)
  height: number;
  /** Measured glyph width of the catch exception at 14px message-content font */
  conditionWidth?: number;
  /** Left inset for par separators (matches HTML paddingLeft on statement block) */
  contentInsetLeft?: number;
}

export interface FragmentGeometry {
  headerLabel?: string;
  kind: FragmentKind;
  label: string;
  guardKeyword?: string;
  /** Measured glyph width of the primary fragment condition label */
  labelWidth?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Y position of the fragment header (after any comment offset) */
  headerY: number;
  sections: FragmentSectionGeometry[];
  number?: string;
  /** Nesting depth (0 = root block, 1+ = inside a message block) */
  depth: number;
}

// ─── Divider ───────────────────────────────────────────────────────

export interface DividerGeometry {
  y: number;
  width: number;
  label: string;
  labelWidth?: number;
}

// ─── Return ────────────────────────────────────────────────────────

export interface ReturnGeometry {
  fromX: number;
  toX: number;
  y: number;
  label: string;
  isReverse: boolean;
  isSelf: boolean;
  number?: string;
}

// ─── Comment ──────────────────────────────────────────────────────

export interface CommentGeometry {
  x: number;
  y: number;
  text: string;
  /** Inline style from styling comments (e.g. // <red>) */
  style?: Record<string, string>;
  /** True for a comment drawn above a fragment, aligned with its left edge. */
  fragmentComment?: boolean;
}

// ─── Group ────────────────────────────────────────────────────────

export interface GroupGeometry {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Composed Diagram ──────────────────────────────────────────────

export interface DiagramGeometry {
  width: number;
  height: number;
  /** Extra left padding from fragment nesting (FrameBorder.left) */
  frameBorderLeft: number;
  /** Extra right padding from fragment nesting (FrameBorder.right) */
  frameBorderRight: number;
  title?: string;
  participants: ParticipantGeometry[];
  lifelines: LifelineGeometry[];
  messages: MessageGeometry[];
  selfCalls: SelfCallGeometry[];
  occurrences: OccurrenceGeometry[];
  creations: CreationGeometry[];
  fragments: FragmentGeometry[];
  dividers: DividerGeometry[];
  returns: ReturnGeometry[];
  comments: CommentGeometry[];
  groups: GroupGeometry[];
}
