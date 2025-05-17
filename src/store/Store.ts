import { atom, createStore } from "jotai";
import { atomWithLocalStorage, atomWithFunctionValue } from "./utils.ts";
import { RootContext, Participants } from "../parser/index.js";
import WidthProviderOnBrowser from "../positioning/WidthProviderFunc";
import { Coordinates } from "../positioning/Coordinates";
import { CodeRange } from "../parser/CodeRange";

/*
 * RenderMode
 * Static: Compatible with Mermaid renderind which renders once and never update. It also disables sticky participants and hides the footer
 * Dynamic: Render once and update when code changes
 */
export const enum RenderMode {
  Static = "static",
  Dynamic = "dynamic",
}

const store = createStore();

export const codeAtom = atom("");

export const rootContextAtom = atom((get) => RootContext(get(codeAtom)));

export const titleAtom = atom<string | null>((get) =>
  get(rootContextAtom)?.title()?.content(),
);

export const participantsAtom = atom((get) =>
  Participants(get(rootContextAtom)),
);

export const coordinatesAtom = atom(
  (get) => new Coordinates(get(rootContextAtom), WidthProviderOnBrowser),
);

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
store.sub(codeAtom, () => {
  store.get(onContentChangeAtom)(store.get(codeAtom));
});

export const onThemeChangeAtom = atomWithFunctionValue<
  (data: { theme: string; scoped: boolean }) => void
>(() => {});

store.sub(themeAtom, () => {
  store.get(onThemeChangeAtom)({
    theme: store.get(themeAtom),
    scoped: store.get(enableScopedThemingAtom),
  });
});

export const onEventEmitAtom = atomWithFunctionValue<
  (name: string, data: any) => void
>(() => {});

export default store;
