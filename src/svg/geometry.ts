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

export type FragmentKind =
  | "loop"
  | "alt"
  | "par"
  | "opt"
  | "section"
  | "critical"
  | "tcf"
  | "ref";

export interface FragmentSectionGeometry {
  label: string;
  y: number; // top of this section (separator line y)
  height: number;
}

export interface FragmentGeometry {
  kind: FragmentKind;
  label: string;
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
}

// ─── Return ────────────────────────────────────────────────────────

export interface ReturnGeometry {
  fromX: number;
  toX: number;
  y: number;
  label: string;
  isReverse: boolean;
  isSelf: boolean;
}

// ─── Comment ──────────────────────────────────────────────────────

export interface CommentGeometry {
  x: number;
  y: number;
  text: string;
  /** Inline style from styling comments (e.g. // <red>) */
  style?: Record<string, string>;
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
}
