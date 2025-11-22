import { atom } from "jotai";
import { atomWithLocalStorage, atomWithFunctionValue } from "./utils.ts";
import { RootContext, Participants } from "@/parser";
import { AllMessages } from "@/parser/MessageCollector";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import WidthProviderOnBrowser from "../positioning/WidthProviderFunc";
import { Coordinates } from "../positioning/Coordinates";
import { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import { CodeRange } from "../parser/CodeRange";

type VerticalMode = "server" | "browser";

const resolveVerticalMode = (): VerticalMode => {
  if (typeof window !== "undefined") {
    const mode = (window as any).__ZEN_VERTICAL_MODE;
    if (mode === "browser") return "browser";
    if (mode === "server") return "server";
  }
  return import.meta.env.VITE_VERTICAL_MODE === "browser"
    ? "browser"
    : "server";
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
  (get) => new Coordinates(get(rootContextAtom), WidthProviderOnBrowser),
);

export const verticalModeAtom = atom<VerticalMode>(resolveVerticalMode());

export const verticalCoordinatesAtom = atom((get) => {
  if (get(verticalModeAtom) === "browser") {
    return null;
  }
  const rootContext = get(rootContextAtom);
  if (!rootContext) {
    return null;
  }
  const coordinates = get(coordinatesAtom);
  const theme = get(themeAtom);
  const participantOrder = coordinates.orderedParticipantNames();
  const ownableMessages = AllMessages(rootContext);
  const originParticipant =
    ownableMessages.length === 0
      ? _STARTER_
      : ownableMessages[0].from || _STARTER_;
  return new VerticalCoordinates({
    rootContext,
    theme,
    originParticipant,
    participantOrder,
  });
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

export const stickyOffsetAtom = atom(0);

export const diagramElementAtom = atom<HTMLElement | null>(null);

export const onElementClickAtom = atomWithFunctionValue(
  (codeRange: CodeRange) => {
    console.log("Element clicked", codeRange);
  },
);

export const onMessageClickAtom = atomWithFunctionValue<
  (context: any, element: HTMLElement) => void
>(() => {});

export const onContentChangeAtom = atomWithFunctionValue<
  (code: string) => void
>(() => {});

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
