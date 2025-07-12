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

// AST-based atoms for decoupled rendering
import { messageTransformer } from "../parser/ast/MessageTransformer";
import { depthCalculator } from "../parser/ast/DepthCalculator";
import type { DocumentAST, MessageNode } from "../parser/ast/types";

// Transform ANTLR context to AST
export const astAtom = atom<DocumentAST>((get) => {
  const rootContext = get(rootContextAtom);
  if (!rootContext) {
    return {
      type: 'document',
      id: 'empty-document',
      sourceRange: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
        text: ''
      },
      statements: []
    };
  }
  
  const result = messageTransformer.transform(rootContext);
  return result.ast;
});

// Extract message nodes from AST
export const astMessagesAtom = atom<MessageNode[]>((get) => {
  const ast = get(astAtom);
  const messages: MessageNode[] = [];
  
  function collectMessages(statements: any[]): void {
    for (const stmt of statements) {
      if (stmt.type !== 'error') {
        const messageNode = stmt as MessageNode;
        messages.push(messageNode);
        if (messageNode.statements) {
          collectMessages(messageNode.statements);
        }
      }
    }
  }
  
  collectMessages(ast.statements);
  return messages;
});

// Lazy depth calculation atom - returns a function to get depth for specific node/participant
export const astDepthCalculatorAtom = atom(() => depthCalculator);

// Convenience atom to get depth for a specific message and participant
export const getMessageDepthAtom = atom(null, (get, set, nodeId: string, participant: string) => {
  const calculator = get(astDepthCalculatorAtom);
  const messages = get(astMessagesAtom);
  const node = messages.find(m => m.id === nodeId);
  
  return node ? calculator.getOccurrenceDepth(node, participant) : 0;
});

export default store;
