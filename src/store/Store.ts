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
import logger from "@/logger/logger";

type VerticalMode = "html" | "legacy";
const resolveVerticalMode = (): VerticalMode => {
  const mode = import.meta.env.VITE_VERTICAL_MODE === "legacy"
    ? "legacy"
    : "html";
  logger.info(`[VerticalMode] resolved="${mode}" (VITE_VERTICAL_MODE="${import.meta.env.VITE_VERTICAL_MODE}")`);
  return mode;
};

export const resolveWidthProvider = (): WidthFunc => {
  const urlParam = typeof location !== "undefined"
    ? new URLSearchParams(location.search).get("WIDTH_PROVIDER")
    : null;
  const mode = (urlParam || import.meta.env.VITE_WIDTH_PROVIDER) === "canvas" ? "canvas" : "browser";
  logger.debug(`[ZenUML] WidthProvider: ${mode}`);
  return mode === "canvas" ? WidthProviderOnCanvas : WidthProviderOnBrowser;
};

/*
 * RenderMode
 * Static: Compatible with Mermaid which renders once and never update. It also disables sticky participants and hides the footer
 * Dynamic: Render once and update when code changes
 */
export const enum RenderMode {
  Static = "static",
  Dynamic = "dynamic",
}

export const codeAtom = atom("");

export const rootContextAtom = atom((get) => RootContext(get(codeAtom)));

export const titleAtom = atom<string | undefined>((get) => {
  const titleContext = get(rootContextAtom)?.title();
  if (!titleContext || typeof (titleContext as any).content !== "function") {
    return undefined;
  }
  return (titleContext as any).content();
});

export const participantsAtom = atom((get) =>
  Participants(get(rootContextAtom)),
);

export const coordinatesAtom = atom(
  (get) => new Coordinates(get(rootContextAtom), resolveWidthProvider()),
);

export const verticalModeAtom = atom<VerticalMode>(resolveVerticalMode());

export const verticalCoordinatesAtom = atom((get) => {
  if (get(verticalModeAtom) === "legacy") {
    return null;
  }
  const rootContext = get(rootContextAtom);
  if (!rootContext) {
    return null;
  }
  return new VerticalCoordinates(rootContext);
});

export const themeAtom = atom("theme-default");

export const enableScopedThemingAtom = atom<boolean>(false);

export const themeIconDotAtom = atomWithLocalStorage(
  `${location.hostname}-zenuml-theme-icon-dot`,
  "1",
);

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

export const showTipsAtom = atom(false);

export const modeAtom = atom(RenderMode.Dynamic);

export const enableNumberingAtom = atomWithLocalStorage(
  `${location.hostname}-zenuml-numbering`,
  true,
);

export const stickyOffsetAtom = atom<number | false>(0);

export const diagramElementAtom = atom<HTMLElement | null>(null);

export const onElementClickAtom = atomWithFunctionValue(
  (codeRange: CodeRange) => {
    logger.debug("Element clicked", codeRange);
  },
);

export const onMessageClickAtom = atomWithFunctionValue<
  (context: any, element: HTMLElement) => void
>(() => {});

export const selectedMessageAtom = atom<{
  start: number;
  end: number;
  token: number;
} | null>(null);

export const createMessageDragAtom = atom<{
  source: string;
  sourceX: number;
  sourceY: number;
  pointerX: number;
  pointerY: number;
  hoverTarget: string | null;
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

export const lifelineReadyAtom = atom<string[]>([]);

export const renderingReadyAtom = atom((get) => {
  const lifeLineReady = get(lifelineReadyAtom);
  const { participants } = get(participantsAtom);
  return lifeLineReady.length === Array.from(participants).length;
});
