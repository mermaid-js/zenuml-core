/**
 * Stage-2 statement-boundary offset parity — golden ANTLR trees vs Langium CST.
 *
 * For every corpus case, the top-level `StatContext` nodes are extracted from
 * the committed golden tree ({start, stop} with ANTLR's INCLUSIVE stop) and
 * compared against the Langium AST's top-level statements
 * (`value.block.stats[i].$cstNode`): identical start offsets and identical
 * inclusive stop offsets (`$cstNode.end - 1`, Langium `end` is exclusive).
 *
 * EVENT_END normalization (documented, deliberate): ANTLR's
 * `stat: asyncMessage EVENT_END?` / `ret: … EVENT_END?` consume the
 * EVENT-mode-popping NEWLINE into the statement, so the golden StatContext's
 * stop can sit ON the newline. This grammar drops EVENT_END by design (the
 * newline is a hidden terminal — task/07-risk-map L13), so when the LAST
 * terminal inside a golden stat subtree is EVENT_END (always a single \r or
 * \n directly adjacent to the payload/colon), the expected stop is
 * `stat.stop - 1`. No other adjustment is applied.
 *
 * Exclusions (each must cite why; target <10):
 *  - malformed-unclosed-brace-after-message (`A.m {`): ANTLR's
 *    DefaultErrorStrategy splits this into message(A.m) [0,2] + orphan
 *    anonymous section [4,4]; Chevrotain recovery instead attaches the
 *    recovered braceBlock to the message → one stat [0,4]. Legitimate
 *    recovery-shape difference (gap G7) — grammar-strict input.
 *  - malformed-unclosed-paren-in-creation (`new A(`): same mechanism — ANTLR
 *    yields creation [0,2] + orphan section-ish recovery [4,5]; Chevrotain
 *    keeps a single creation [0,5] with an inserted CPAR. Gap G7.
 */
import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import type { AstNode } from "langium";
import { parseZen } from "../../../src/parser-langium/services";
import { TREE_CORPUS } from "./tree-corpus";

const GOLDEN_DIR = path.join(import.meta.dir, "__golden__", "tree");

const EXCLUSIONS = new Map<string, string>([
  [
    "malformed-unclosed-brace-after-message",
    "G7 recovery shape: ANTLR splits `A.m {` into message + orphan section; Chevrotain attaches the recovered braceBlock to the message",
  ],
  [
    "malformed-unclosed-paren-in-creation",
    "G7 recovery shape: ANTLR splits `new A(` into creation + recovery artifact; Chevrotain inserts CPAR inside the single creation",
  ],
]);

interface GoldenNode {
  kind?: string;
  start?: number | null;
  stop?: number | null;
  children?: GoldenNode[];
  token?: string;
}

interface Boundary {
  start: number | null;
  stop: number | null;
}

/** Name of the last terminal token (document order) in a golden subtree. */
function lastTerminalToken(node: GoldenNode): string | undefined {
  if (!node.kind) return node.token;
  const children = node.children ?? [];
  for (let i = children.length - 1; i >= 0; i--) {
    const token = lastTerminalToken(children[i]);
    if (token !== undefined) return token;
  }
  return undefined;
}

function goldenStatBoundaries(golden: GoldenNode): Boundary[] {
  const block = (golden.children ?? []).find((c) => c.kind === "BlockContext");
  if (!block) return [];
  return (block.children ?? [])
    .filter((c) => c.kind === "StatContext")
    .map((stat) => ({
      start: stat.start ?? null,
      stop:
        lastTerminalToken(stat) === "EVENT_END" && stat.stop != null
          ? stat.stop - 1
          : (stat.stop ?? null),
    }));
}

function langiumStatBoundaries(value: AstNode): Boundary[] {
  const stats: AstNode[] = (value as any).block?.stats ?? [];
  return stats.map((stat) => {
    const cst = stat.$cstNode!;
    return { start: cst.offset, stop: cst.end - 1 };
  });
}

describe("grammar offsets — top-level statement boundaries vs ANTLR goldens", () => {
  for (const { id, code } of TREE_CORPUS) {
    if (EXCLUSIONS.has(id)) {
      it.skip(`EXCLUDED (${EXCLUSIONS.get(id)}): ${id}`, () => {});
      continue;
    }
    it(`statement boundaries match golden: ${id}`, () => {
      const golden: GoldenNode = JSON.parse(
        fs.readFileSync(path.join(GOLDEN_DIR, `${id}.json`), "utf8"),
      );
      const expected = goldenStatBoundaries(golden);
      const result = parseZen(code);
      const actual = langiumStatBoundaries(result.value);
      expect(actual).toEqual(expected);
    });
  }

  it("exclusion list stays under the documented budget", () => {
    expect(EXCLUSIONS.size).toBeLessThan(10);
  });
});
