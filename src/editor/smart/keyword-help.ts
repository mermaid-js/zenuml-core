/**
 * Hover help for ZenUML keywords. The language server explains participants
 * and messages; it has nothing to say about `if` or `loop`, which is where a
 * newcomer needs help most. This is a small client-side table.
 */
import { hoverTooltip } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

export interface KeywordHelp {
  text: string;
  example: string;
}

const HELP: Record<string, KeywordHelp> = {
  if: {
    text: "Do the steps inside only when the condition is true.",
    example: "if (ok) { A.method() }",
  },
  else: {
    text: "The steps to do when the if condition was false.",
    example: "if (ok) { A.yes() } else { A.no() }",
  },
  loop: {
    text: "Repeat the steps inside while the condition holds.",
    example: "loop (more) { A.method() }",
  },
  opt: {
    text: "An optional step: it may or may not happen.",
    example: "opt { A.method() }",
  },
  par: {
    text: "The steps inside happen at the same time.",
    example: "par { A.one()  B.two() }",
  },
  try: {
    text: "Try the steps inside. Pair it with catch to handle a failure.",
    example: "try { A.method() } catch { B.fix() }",
  },
  catch: {
    text: "The steps to do when the try block fails.",
    example: "try { A.method() } catch { B.fix() }",
  },
  finally: {
    text: "Steps that always happen after try, whether it failed or not.",
    example: "try { A.method() } finally { A.cleanup() }",
  },
  return: {
    text: "Send a result back to whoever made the call.",
    example: "return result",
  },
};

export function keywordHelp(word: string): KeywordHelp | undefined {
  return Object.prototype.hasOwnProperty.call(HELP, word)
    ? HELP[word]
    : undefined;
}

/** A hover tooltip that explains a keyword under the pointer. */
export function keywordHover(): Extension {
  return hoverTooltip((view, pos) => {
    const word = view.state.wordAt(pos);
    if (!word) return null;
    const help = keywordHelp(view.state.sliceDoc(word.from, word.to));
    if (!help) return null;
    return {
      pos: word.from,
      end: word.to,
      above: true,
      create() {
        const dom = document.createElement("div");
        dom.className = "smart-keyword-help";
        dom.style.cssText = "padding:6px 10px;max-width:280px;font-size:13px";
        const text = document.createElement("div");
        text.textContent = help.text;
        const example = document.createElement("code");
        example.textContent = help.example;
        dom.append(text, example);
        return { dom };
      },
    };
  });
}
