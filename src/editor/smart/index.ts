/**
 * Smart editor: a CodeMirror 6 editor for people who have never seen ZenUML
 * syntax. Completion, hover and diagnostics come from the Langium language
 * server running in a Web Worker (`src/parser-langium/lsp/worker.ts`), reached
 * through `@codemirror/lsp-client` over a small worker transport.
 *
 * Dev and demo only: nothing in the published library imports this module.
 */
import {
  hoverTooltips,
  LSPClient,
  serverCompletionSource,
  serverDiagnostics,
} from "@codemirror/lsp-client";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import type { CompletionSource } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  HighlightStyle,
  StreamLanguage,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, tooltips } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { keywordHover } from "./keyword-help";
import { plainWords } from "./plain-words";
import { SNIPPET_LABELS, snippetSource } from "./snippets";
import { createWorkerTransport, type WorkerLike } from "./transport";

export { CHEAT_SHEET } from "./cheatsheet";
export { EXAMPLES } from "./examples";

const DOC_URI = "file:///smart-editor.zenuml";

export interface SmartEditorOptions {
  /** Starting text. Defaults to an empty document. */
  doc?: string;
  /** Called with the full text after every edit. */
  onChange?: (doc: string) => void;
  /** An already-started language server worker. Defaults to the bundled one. */
  worker?: WorkerLike & { terminate?: () => void };
}

export interface SmartEditor {
  view: EditorView;
  /** Resolves once the language server has answered `initialize`. */
  ready: Promise<void>;
  /** Replace the whole document, for example from the examples picker. */
  setDoc(doc: string): void;
  destroy(): void;
}

function createLspWorker(): Worker {
  return new Worker(
    new URL("../../parser-langium/lsp/worker.ts", import.meta.url),
    { type: "module" },
  );
}

const KEYWORDS = new Set([
  "if",
  "else",
  "loop",
  "while",
  "for",
  "foreach",
  "opt",
  "par",
  "try",
  "catch",
  "finally",
  "return",
  "new",
  "critical",
  "section",
  "group",
  "title",
  "ref",
]);

/** Just enough highlighting to tell keywords from names. */
const zenumlLanguage = StreamLanguage.define<null>({
  name: "zenuml",
  startState: () => null,
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }
    if (stream.match(/^"[^"]*"?/)) return "string";
    if (stream.match(/^\w+/)) {
      return KEYWORDS.has(stream.current()) ? "keyword" : null;
    }
    stream.next();
    return null;
  },
});

const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#1f4fd8", fontWeight: "600" },
  { tag: tags.comment, color: "#6b7580", fontStyle: "italic" },
  { tag: tags.string, color: "#0a7d4b" },
]);

const theme = EditorView.theme({
  "&": { height: "100%", fontSize: "14px" },
  ".cm-scroller": {
    fontFamily: "ui-monospace, Menlo, monospace",
    lineHeight: "1.5",
  },
  "&.cm-focused": { outline: "2px solid #1f4fd8" },
  ".cm-completionIcon": { display: "none" },
  ".cm-completionDetail": { marginLeft: "8px", color: "#5d6670" },
  "[aria-selected] .cm-completionDetail": { color: "inherit" },
});

export function createSmartEditor(
  parent: HTMLElement,
  options: SmartEditorOptions = {},
): SmartEditor {
  const worker = options.worker ?? createLspWorker();
  const diagnostics = serverDiagnostics();
  const showDiagnostics =
    diagnostics.notificationHandlers!["textDocument/publishDiagnostics"];

  const client = new LSPClient({
    rootUri: "file:///",
    timeout: 8000,
    extensions: [diagnostics],
    notificationHandlers: {
      // Same handler as the stock one, with messages put into plain words.
      "textDocument/publishDiagnostics": (c, params) =>
        showDiagnostics(c, {
          ...params,
          diagnostics: params.diagnostics.map((d: { message: string }) => ({
            ...d,
            message: plainWords(d.message),
          })),
        }),
    },
  });
  client.connect(createWorkerTransport(worker));

  // The server's bare keywords are replaced by our block snippets.
  const serverSource: CompletionSource = async (context) => {
    const result = await serverCompletionSource(context);
    if (!result) return result;
    return {
      ...result,
      options: result.options.filter((o) => !SNIPPET_LABELS.has(o.label)),
    };
  };

  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: options.doc ?? "",
      extensions: [
        zenumlLanguage,
        syntaxHighlighting(highlightStyle),
        history(),
        indentOnInput(),
        keymap.of([
          ...completionKeymap,
          ...historyKeymap,
          ...defaultKeymap,
          indentWithTab,
        ]),
        autocompletion({ override: [snippetSource, serverSource] }),
        hoverTooltips(),
        keywordHover(),
        client.plugin(DOC_URI, "zenuml"),
        // Tooltips live on <body> so a clipping parent cannot cut a list short.
        tooltips({ parent: document.body }),
        theme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged)
            options.onChange?.(update.state.doc.toString());
        }),
      ],
    }),
  });

  return {
    view,
    ready: client.initializing.then(() => undefined),
    setDoc(doc) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: doc },
      });
    },
    destroy() {
      view.destroy();
      client.disconnect();
      worker.terminate?.();
    },
  };
}
