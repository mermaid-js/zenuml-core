import { atom } from "jotai";
import { atomWithLocalStorage, atomWithFunctionValue } from "./utils.ts";
import { RootContext } from "@/parser";
import WidthProviderOnBrowser from "../positioning/WidthProviderFunc";
import { Coordinates } from "../positioning/Coordinates";
import { CodeRange } from "../parser/CodeRange";
import { buildMessagesModel } from "@/ir/messages";
import { buildParticipantsModel } from "@/ir/participants";
import { _STARTER_ } from "@/parser/OrderedParticipants";

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

export const titleAtom = atom<string | null>((get) =>
  get(rootContextAtom)?.title()?.content(),
);

export const coordinatesAtom = atom(
  (get) => new Coordinates(get(rootContextAtom), WidthProviderOnBrowser),
);

// Thin messages model atom (used incrementally)
export const messagesModelAtom = atom((get) => {
  const ctx = get(rootContextAtom);
  return ctx ? buildMessagesModel(ctx) : [];
});

// Participants IR is the canonical source of participants
export const participantsAtom = atom((get) => {
  const ctx = get(rootContextAtom);
  return ctx ? buildParticipantsModel(ctx) : [];
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
  const names = get(coordinatesAtom).orderedParticipantNames();
  const expected = names.filter((n) => n !== _STARTER_).length;
  return lifeLineReady.length === expected;
});
