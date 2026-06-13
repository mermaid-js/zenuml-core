/**
 * Golden TREE-SHAPE parity harness — Stage 0 of the ANTLR4 -> Langium migration.
 *
 * See docs/langium-migration/07-risk-map.md (Stage 0, gap G7) and
 * docs/langium-migration/02-parser-rules.md §8/§9.
 *
 * serializeTree() walks an ANTLR parse tree (as returned by RootContext(code)
 * from src/parser/index.js) and dumps a plain-JSON shape:
 *
 *   rule node:     { kind: <context class name>, start: <char offset of first
 *                    token (ctx.start.start)>, stop: <inclusive char offset of
 *                    last token (ctx.stop.stop) or null>, children: [...] }
 *   terminal node: { token: <symbolic token name>, text: <token text> }
 *                  (+ "error": true for ANTLR recovery artifacts — error nodes
 *                   from token insertion/deletion, e.g. "<missing ID>")
 *
 * The serialized shape is deliberately token-index-free and engine-neutral:
 * a future Langium-backed parser only has to produce the same plain objects
 * (via its facade) to be asserted against the SAME committed goldens.
 *
 * Contract for an alternative engine:
 *   implement TreeParityParser — (code) => SerializedRuleNode | null — and run
 *   it over test/unit/parity/tree-corpus.ts, comparing serializeToGoldenJson()
 *   output byte-for-byte with test/unit/parity/__golden__/tree/<case-id>.json.
 */
import antlr4 from "antlr4";

import sequenceParser from "../../../src/generated-parser/sequenceParser";
// Side-effectful import only: installs the prototype augmentations. The
// harness is the ANTLR BASELINE serializer by definition, so it builds the
// ANTLR pipeline directly instead of going through the (engine-flag-aware)
// RootContext export.
import "../../../src/parser/index";
import sequenceLexer from "../../../src/generated-parser/sequenceLexer";

function antlrRootContext(code: string) {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  parser.removeErrorListeners();
  return parser.prog();
}

export interface SerializedRuleNode {
  kind: string;
  start: number | null;
  stop: number | null;
  children: SerializedNode[];
}

export interface SerializedTerminalNode {
  token: string;
  text: string;
  error?: true;
}

export type SerializedNode = SerializedRuleNode | SerializedTerminalNode;

/** The engine-neutral entry point a Langium implementation must also satisfy. */
export type TreeParityParser = (code: string) => SerializedRuleNode | null;

const symbolicNames: (string | null)[] = sequenceParser.symbolicNames;
const literalNames: (string | null)[] = sequenceParser.literalNames;

function tokenName(type: number): string {
  if (type === antlr4.Token.EOF) {
    return "EOF";
  }
  return symbolicNames[type] ?? literalNames[type] ?? `<type:${type}>`;
}

interface AntlrTerminalLike {
  symbol: { type: number; text: string };
  isErrorNode?: () => boolean;
}

/**
 * Serialize one ANTLR parse-tree node (rule context or terminal) into the
 * engine-neutral golden shape. Key order is fixed (kind/start/stop/children,
 * token/text/error) so JSON.stringify output is deterministic.
 */
export function serializeTree(node: unknown): SerializedNode {
  if (node instanceof antlr4.ParserRuleContext) {
    const ctx = node as antlr4.ParserRuleContext & {
      children: unknown[] | null;
      start: { start: number } | null;
      stop: { stop: number } | null;
    };
    return {
      kind: ctx.constructor.name,
      start: ctx.start ? ctx.start.start : null,
      stop: ctx.stop ? ctx.stop.stop : null,
      children: (ctx.children ?? []).map(serializeTree),
    };
  }
  const terminal = node as AntlrTerminalLike;
  if (!terminal || !terminal.symbol) {
    throw new Error(`serializeTree: unexpected node ${String(node)}`);
  }
  const serialized: SerializedTerminalNode = {
    token: tokenName(terminal.symbol.type),
    text: terminal.symbol.text,
  };
  if (typeof terminal.isErrorNode === "function" && terminal.isErrorNode()) {
    serialized.error = true;
  }
  return serialized;
}

/** Parse with the live ANTLR parser and serialize. Implements TreeParityParser. */
export const parseWithAntlr: TreeParityParser = (code: string) => {
  const ctx = antlrRootContext(code);
  return ctx ? (serializeTree(ctx) as SerializedRuleNode) : null;
};

/** Canonical golden-file rendering: 2-space JSON + trailing newline. */
export function serializeToGoldenJson(tree: SerializedRuleNode | null): string {
  return JSON.stringify(tree, null, 2) + "\n";
}
