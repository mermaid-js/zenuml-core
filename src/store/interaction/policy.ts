import { RenderMode } from "@/store/Store";

/**
 * Diagram interaction policy (ADR 0002).
 *
 * The diagram is in exactly one primary interaction state. Each state allows
 * a fixed set of capabilities; every on-canvas control asks `can()` (through
 * `useCan`) instead of AND-ing its own subset of atoms.
 *
 * Embedder flags (`enable*Atom`) are orthogonal: a component still checks its
 * own flag, because one capability can span several flags (`createMessage`
 * covers message insertion and divider insertion).
 */

export const INTERACTION_KINDS = [
  "idle",
  "participantEditor",
  "messageMenu",
  "gapMenu",
  "createDrag",
  "reorderDrag",
] as const;
export type InteractionKind = (typeof INTERACTION_KINDS)[number];

export type InteractionState =
  | { kind: "idle" }
  | { kind: "participantEditor"; participant: string }
  | { kind: "messageMenu"; start: number; end: number }
  | { kind: "gapMenu" }
  | { kind: "createDrag"; source: string }
  | { kind: "reorderDrag"; key: string };

export const CAPABILITIES = [
  "select",
  "insertParticipant",
  "createMessage",
  "reorder",
  "collapse",
  "textEdit",
  "hoverAffordance",
] as const;
export type Capability = (typeof CAPABILITIES)[number];

type Row = Record<Capability, boolean>;

const row = (...allowed: Capability[]): Row =>
  Object.fromEntries(
    CAPABILITIES.map((cap) => [cap, allowed.includes(cap)]),
  ) as Row;

const ALL = row(...CAPABILITIES);

export const POLICY: Record<InteractionKind, Row> = {
  idle: ALL,
  // Click another participant to switch, click away to close. The editor's
  // own slots and pickers are its active surface and are not gated here.
  participantEditor: row("select"),
  // P1 derives this state from `selectedMessageAtom`, which stays set after
  // the message menu closes. Until P2 lifts the menu's real open state, a
  // selected message must not block anything, so this row equals idle.
  messageMenu: ALL,
  // Only the menu's own action (insert divider) stays live.
  gapMenu: row("createMessage"),
  // Each drag keeps its own capability so the drag can complete.
  createDrag: row("createMessage"),
  reorderDrag: row("reorder"),
};

/**
 * Capabilities that only change the view, never the code. They stay live in
 * `RenderMode.Static`: mermaid renders static diagrams and users collapse
 * fragments there today.
 */
const VIEW_ONLY: ReadonlySet<Capability> = new Set(["collapse"]);

export interface PolicyContext {
  mode: RenderMode;
  /** Overlay: a text editor is active somewhere in this diagram. */
  textEditing: boolean;
}

export const can = (
  state: InteractionState,
  cap: Capability,
  { mode, textEditing }: PolicyContext,
): boolean => {
  if (mode !== RenderMode.Dynamic && !VIEW_ONLY.has(cap)) return false;
  // Text editing nests inside any state: nothing outside the active editor.
  if (textEditing && cap !== "textEdit") return false;
  return POLICY[state.kind][cap];
};
