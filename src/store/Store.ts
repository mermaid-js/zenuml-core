import { atom } from "jotai";
import { atomWithFunctionValue, atomWithLocalStorage } from "./utils.ts";
import { RootContext } from "@/parser";
import WidthProviderOnBrowser from "../positioning/WidthProviderFunc";
import DummyWidthProvider from "../positioning/DummyWidthProvider";
import { Coordinates } from "../positioning/Coordinates";
import { CodeRange } from "../parser/CodeRange";
import { _STARTER_ } from "@/constants";
import { createTreeBuilder } from "@/ir/tree-builder";
import { createTreeVMBuilder } from "@/vm/tree-vm-builder";

// Add imports for IR-driven coordinates

// Detect if running in browser environment
function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         typeof document.createElement === 'function';
}

// Choose the appropriate WidthProvider based on environment
const WidthProvider = isBrowserEnvironment() ? WidthProviderOnBrowser : DummyWidthProvider;

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

// Tree IR atom - builds hierarchical tree structure from parser context
export const treeIRAtom = atom((get) => {
  const rootContext = get(rootContextAtom);
  if (!rootContext) return null;

  const treeBuilder = createTreeBuilder();
  return treeBuilder.buildTree(rootContext);
});

/**
 * Program-based MessageLayer VM atom that considers all participants for accurate total width.
 * 
 * This atom uses the ProgVM approach to ensure that declared participants without messages
 * are still considered when calculating the total width of the diagram.
 * 
 * @returns {Object} MessageLayer VM containing:
 *   - origin: The starting participant for message positioning
 *   - paddingLeft: Left padding for the message layer
 *   - rootBlockVM: Complete block view model with accurate total width
 */
export const progVMAtom = atom((get) => {
  const rootContext = get(rootContextAtom);
  if (!rootContext) return null;

  const treeBuilder = createTreeBuilder();
  const progIR = treeBuilder.buildProg(rootContext);
    const coordinates = get(coordinatesAtom);

  if (!progIR) {
    return { 
      origin: _STARTER_, 
      paddingLeft: 0,
      rootBlockVM: { statements: [] } 
    };
  }

  // Build prog VM directly from prog IR - considers all participants!
  // Origin calculation moved to TreeVMBuilder.buildProgVM()
  const treeVMBuilder = createTreeVMBuilder();
  return treeVMBuilder.buildProgVM(progIR, coordinates);
});


export const coordinatesAtom = atom(
  (get) => {
    const rootCtx = get(rootContextAtom);
    if (!rootCtx) {
      // Handle null context gracefully - return a minimal coordinates instance
      return new Coordinates([], [], WidthProvider);
    }
    
    const treeBuilder = createTreeBuilder();
    const tree = treeBuilder.buildTree(rootCtx);
    const participants = tree.participants;
    const messages = treeBuilder.flattenMessages(tree);
    
    return new Coordinates(participants, messages, WidthProvider);
  },
);

export const themeAtom = atom("theme-default");

export const enableScopedThemingAtom = atom<boolean>(false);

export const themeIconDotAtom = atomWithLocalStorage(
  `${location.hostname}-zenuml-theme-icon-dot`,
  "1",
);

export const enableMultiThemeAtom = atom(true);

// Debug mode atom - controls whether debug information is shown
export const debugModeAtom = atomWithLocalStorage(
  "zenumlDebug",
  false,
);

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
  (codeRange: CodeRange, element: HTMLElement) => void
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

