import { atom, createStore } from "jotai";
import { atomWithLocalStorage, atomWithFunctionValue } from "./utils.ts";
import { RootContext, Participants } from "../parser/index.js";
import WidthProviderOnBrowser from "../positioning/WidthProviderFunc";
import { Coordinates } from "../positioning/Coordinates";
import { CodeRange } from "../parser/CodeRange";
import { diagramLayoutAtom } from "../domain/DomainModelStore";
import { LayoutComparison } from "../utils/LayoutComparison";

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

// Layout comparison atom - runs comparison when both architectures have data
export const layoutComparisonAtom = atom((get) => {
  const coordinates = get(coordinatesAtom);
  const newLayout = get(diagramLayoutAtom);
  const enabled = get(enableLayoutComparisonAtom);
  
  // Only run comparison if enabled
  if (enabled) {
    return LayoutComparison.compare(coordinates, newLayout);
  }
  return null;
});

// Enable/disable layout comparison - enabled by default in development
export const enableLayoutComparisonAtom = atom(
  process.env.NODE_ENV === 'development'
);

store.sub(enableLayoutComparisonAtom, () => {
  const enabled = store.get(enableLayoutComparisonAtom);
  if (enabled) {
    LayoutComparison.enable();
    console.log('[LayoutComparison] Enabled by default in development mode');
  } else {
    LayoutComparison.disable();
  }
});

// Initialize comparison on startup if enabled
if (store.get(enableLayoutComparisonAtom)) {
  LayoutComparison.enable();
}

// Subscribe to comparison results when enabled
store.sub(layoutComparisonAtom, () => {
  if (store.get(enableLayoutComparisonAtom)) {
    const comparison = store.get(layoutComparisonAtom);
    if (comparison) {
      // Log the raw comparison object for easy sharing
      console.log('📊 Layout Comparison Result:', JSON.stringify(comparison, null, 2));
      
      // Also provide a summary
      const maxPosDiff = Math.max(...Object.values(comparison.participantPositions).map(d => d.diff));
      const maxWidthDiff = Math.max(...Object.values(comparison.participantWidths).map(d => d.diff));
      
      if (maxPosDiff > 5 || maxWidthDiff > 5) {
        console.warn('⚠️ Significant layout differences detected! Max position diff:', maxPosDiff.toFixed(0) + 'px');
      } else {
        console.log('✅ Layout differences within acceptable range (≤5px)');
      }
    }
  }
});

// Expose store and atoms globally for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__ZENUML_STORE__ = store;
  (window as any).__ZENUML_COORDINATES_ATOM__ = coordinatesAtom;
  (window as any).__ZENUML_LAYOUT_ATOM__ = diagramLayoutAtom;
}

export default store;
