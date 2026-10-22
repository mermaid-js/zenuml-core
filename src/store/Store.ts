import { atom } from "jotai";
import { atomWithLocalStorage, atomWithFunctionValue } from "./utils.ts";
import { RootContext, Participants } from "@/parser";
import WidthProviderOnBrowser, {
  WidthProviderOnCanvas,
} from "../positioning/WidthProviderFunc";
import type { WidthFunc } from "../positioning/Coordinate";
import { Coordinates } from "../positioning/Coordinates";
import { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import type { CodeRange } from "../parser/CodeRange";
import type { DiagramPalette } from "../surface";

export const resolveWidthProvider = (): WidthFunc => {
  const urlParam =
    typeof location !== "undefined"
      ? new URLSearchParams(location.search).get("WIDTH_PROVIDER")
      : null;
  const mode =
    (urlParam || import.meta.env.VITE_WIDTH_PROVIDER) === "canvas"
      ? "canvas"
      : "browser";
  return mode === "canvas" ? WidthProviderOnCanvas : WidthProviderOnBrowser;
};

/*
 * RenderMode
 * Static: Compatible with Mermaid which renders once and never updates. It also disables sticky participants.
 * Dynamic: Render once and update when code changes
 */
export const enum RenderMode {
  Static = "static",
  Dynamic = "dynamic",
}

export const codeAtom = atom("");
/** A monotonically increasing request id observed after React commits. */
export const renderRevisionAtom = atom(0);

export const rootContextAtom = atom((get) => {
  const code = get(codeAtom);
  if (!code.trim()) return null;
  return RootContext(code);
});

export const participantsAtom = atom((get) => {
  const rootContext = get(rootContextAtom);
  if (!rootContext) return Participants(null);
  return Participants(rootContext);
});

export const coordinatesAtom = atom(
  (get) => new Coordinates(get(rootContextAtom), resolveWidthProvider()),
);

export const verticalCoordinatesAtom = atom((get) => {
  const rootContext = get(rootContextAtom);
  if (!rootContext) {
    return null;
  }
  return new VerticalCoordinates(rootContext);
});

export const themeAtom = atom("theme-default");
export const paletteAtom = atom<DiagramPalette | undefined>(undefined);

export const enableScopedThemingAtom = atom<boolean>(false);

export const enableMultiThemeAtom = atom(true);

export const scaleAtom = atom(1);

export const selectedAtom = atom<string[]>([]);

export const onSelectAtom = atom(null, (get, set, payload: string) => {
  const selected = get(selectedAtom);
  if (selected.includes(payload)) {
    set(
      selectedAtom,
      selected.filter((item) => item !== payload),
    );
  } else {
    set(selectedAtom, [...selected, payload]);
  }
});

export const cursorAtom = atom<number | null | undefined>(null);

export const modeAtom = atom(RenderMode.Dynamic);

// Editing feature flags. Default off so embedders (e.g. mermaid) get safe behavior;
// embedders opt in per surface. The demo pages enable them via demoConfig() in src/config.ts.
export const enableParticipantInsertionAtom = atom(false);
export const enableMessageInsertionAtom = atom(false);
export const enableDividerInsertionAtom = atom(false);
export const enableParticipantStyleEditingAtom = atom(false);
export const enableMessageReorderAtom = atom(false);

// Each ZenUml instance has its own Jotai store, so text editing blocks only
// structural controls in that diagram. Tokens let multiple editors clean up
// independently if a component unmounts while editing.
export const activeTextEditorsAtom = atom<Set<symbol>>(new Set<symbol>());
export const textEditingAtom = atom(
  (get) => get(activeTextEditorsAtom).size > 0,
);

export const enableNumberingAtom = atomWithLocalStorage(
  () => `${location.hostname}-zenuml-numbering`,
  true,
);

export const stickyOffsetAtom = atom<number | false>(0);

export const diagramElementAtom = atom<HTMLElement | null>(null);

export const onElementClickAtom = atomWithFunctionValue<
  (codeRange: CodeRange) => void
>(() => {});

export const onMessageClickAtom = atomWithFunctionValue<
  (context: any, element: HTMLElement) => void
>(() => {});

export const selectedMessageAtom = atom<{
  start: number;
  end: number;
  token: number;
} | null>(null);

export const onContentChangeAtom = atomWithFunctionValue<
  (code: string) => void
>(() => {});

export const pendingEditableRangeAtom = atom<{
  start: number;
  end: number;
  token: number;
} | null>(null);

export const onThemeChangeAtom = atomWithFunctionValue<
  (data: { theme: string; scoped: boolean }) => void
>(() => {});

export const onEventEmitAtom = atomWithFunctionValue<
  (name: string, data: any) => void
>(() => {});

export const createMessageDragAtom = atom<{
  source: string;
  sourceX: number;
  sourceY: number;
  pointerX: number;
  pointerY: number;
  hoverTarget: string | null;
  insertIndex: number;
  blockContext: any | null;
  hostContext?: any;
} | null>(null);

export const messageReorderDragAtom = atom<string | null>(null);

export const messageReorderPendingAtom = atom<{
  key: string;
  startX: number;
  startY: number;
} | null>(null);

export const messageReorderDropAtom = atom<{
  key: string;
  place: "before" | "after";
} | null>(null);

export const lifelineReadyAtom = atom<string[]>([]);

export const renderingReadyAtom = atom((get) => {
  const lifeLineReady = get(lifelineReadyAtom);
  const participants = get(participantsAtom);
  return participants
    .Array()
    .every((participant) => lifeLineReady.includes(participant.name));
});

export { participantPreviewAtom } from "./participantPreviewAtom";
