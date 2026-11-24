/**
 * Snippet completions for the structures a newcomer reaches for first. The
 * language server offers bare keywords; these insert a whole block with tab
 * stops. `${n:default}` is CodeMirror's snippet template syntax.
 */
import {
  snippet,
  type Completion,
  type CompletionSource,
} from "@codemirror/autocomplete";

export interface SnippetDef {
  label: string;
  detail: string;
  template: string;
}

export const SNIPPETS: readonly SnippetDef[] = [
  {
    label: "message",
    detail: "A calls a method on B: A.method()",
    template: "${1:A}.${2:method}(${3})",
  },
  {
    label: "if",
    detail: "Do something only when a condition holds",
    template: "if (${1:condition}) {\n\t${2:A.method()}\n}",
  },
  {
    label: "alt",
    detail: "Two alternative paths: if / else",
    template:
      "if (${1:condition}) {\n\t${2:A.method()}\n} else {\n\t${3:B.method()}\n}",
  },
  {
    label: "opt",
    detail: "An optional step",
    template: "opt {\n\t${1:A.method()}\n}",
  },
  {
    label: "loop",
    detail: "Repeat steps while a condition holds",
    template: "loop (${1:condition}) {\n\t${2:A.method()}\n}",
  },
  {
    label: "par",
    detail: "Steps that happen at the same time",
    template: "par {\n\t${1:A.method()}\n\t${2:B.method()}\n}",
  },
  {
    label: "try",
    detail: "Try something, and handle a failure",
    template: "try {\n\t${1:A.method()}\n} catch {\n\t${2:B.handleError()}\n}",
  },
  {
    label: "return",
    detail: "Send a result back to the caller",
    template: "return ${1:result}",
  },
];

/** The method-name snippet offered right after `Name.`. */
export const METHOD_SNIPPET: SnippetDef = {
  label: "method()",
  detail: "Call a method on this participant",
  template: "${1:method}(${2})",
};

/** A template with every placeholder replaced by its default text. */
export function expandTemplate(template: string): string {
  return template.replace(/\$\{\d+(?::([^}]*))?\}/g, (_m, text) => text ?? "");
}

function toCompletion(def: SnippetDef, boost: number): Completion {
  return {
    ...snippet(def.template),
    label: def.label,
    detail: def.detail,
    type: "keyword",
    boost,
  };
}

const blockCompletions = SNIPPETS.map((s) => toCompletion(s, 1));
const methodCompletion = toCompletion(METHOD_SNIPPET, 99);

/** Labels the snippets replace, so the server's bare keywords are dropped. */
export const SNIPPET_LABELS: ReadonlySet<string> = new Set(
  SNIPPETS.map((s) => s.label),
);

/**
 * Offers block snippets where a statement can start, and a method-name snippet
 * after `Name.`.
 */
export const snippetSource: CompletionSource = (context) => {
  const afterDot = context.matchBefore(/[A-Za-z_][\w]*\.\w*/);
  if (afterDot) {
    const dot = afterDot.text.indexOf(".");
    return {
      from: afterDot.from + dot + 1,
      options: [methodCompletion],
      filter: false,
    };
  }
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  const line = context.state.doc.lineAt(word.from);
  const before = line.text.slice(0, word.from - line.from);
  if (before.trim() !== "") return null; // only at the start of a line
  return { from: word.from, options: blockCompletions };
};
