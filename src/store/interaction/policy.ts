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
  | { kind: "gapMenu"; id: string }
  | { kind: "createDrag"; source: string }
  | { kind: "reorderDrag"; key: string };

/** The primary states that are stored, not derived (P2): open menus. */
export type MenuState = Extract<
  InteractionState,
  { kind: "messageMenu" } | { kind: "gapMenu" }
>;

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
  // The message style menu is open. Reorder is allowed for the selected
  // message only (`useCanReorderMessage`); rename and the other menu items
  // are the menu's own surface and are not gated here. A selected message
  // whose menu is closed is `idle`.
  messageMenu: row("select", "reorder", "textEdit"),
  // The gap's insert menu is open. Its own item (insert divider) is the
  // menu's surface and is not gated here; everything else waits.
  gapMenu: row(),
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
