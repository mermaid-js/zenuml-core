/**
 * Stage-2 corpus spec — the full 198-case tree corpus through the raw Langium
 * parser (no facade).
 *
 * Contracts:
 *  - EVERY case: parseZen never throws and returns a non-null AST value
 *    (recovery-enabled parse, P13).
 *  - Cases whose committed ANTLR golden contains NO `error: true` terminal
 *    AND parse without ANTLR recovery damage (all compare-* and tol-* cases
 *    except the recovery groups listed below): zero lexerErrors AND zero
 *    parserErrors — the grammar-encoded tolerance must carry them without
 *    recovery, exactly like ANTLR.
 *  - Recovery cases (malformed-* plus the golden-error cases): targeted
 *    assertions that the statements OUTSIDE the damage survive. Exact ANTLR
 *    tree equivalence is explicitly NOT required for these (gap G7: ANTLR's
 *    DefaultErrorStrategy vs Chevrotain re-sync produce different partial
 *    trees) — only the downstream renderability contract is asserted.
 *
 * The goldens in __golden__/tree are read as the oracle and never modified.
 */
import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { parseZen } from "../../../src/parser-langium/services";
import { TREE_CORPUS } from "./tree-corpus";

const GOLDEN_DIR = path.join(import.meta.dir, "__golden__", "tree");

interface GoldenNode {
  kind?: string;
  children?: GoldenNode[];
  token?: string;
  error?: true;
}

function goldenHasErrorNode(node: GoldenNode): boolean {
  if (node.kind) {
    return (node.children ?? []).some(goldenHasErrorNode);
  }
  return node.error === true;
}

function readGolden(id: string): GoldenNode {
  return JSON.parse(
    fs.readFileSync(path.join(GOLDEN_DIR, `${id}.json`), "utf8"),
  );
}

/**
 * Cases where the CURRENT ANTLR tree itself is a product of error recovery —
 * either the golden contains explicit error nodes, or the input is in the G7
 * malformed group (grammar-strict input; ANTLR's golden tree was produced by
 * DefaultErrorStrategy token insertion/deletion without error NODES).
 * Chevrotain recovers differently by design; each gets targeted assertions.
 */
const RECOVERY_CASES = new Set([
  // golden contains error:true nodes (ANTLR errored too):
  "compare-emoji-colon-override", // `[:red:]` — `:` enters EVENT mode; garbage in both engines
  "compare-emoji-in-conditions", // emoji inside if-conditions — not grammar-supported in ANTLR either
  "tol-09a-return-async-half-arrow", // `A ~>` — `~` has never been a lexer token
  "tol-09b-return-async-no-colon", // `A ~> B` — same
  // G7 malformed group (deliberate grammar strictness, recovery-only in ANTLR):
  "malformed-unclosed-brace-after-message", // `A.m {`
  "malformed-unclosed-paren-in-creation", // `new A(`
  "malformed-bare-try", // `try`
]);

describe("grammar corpus — all 198 tree-corpus cases (raw Langium AST)", () => {
  for (const { id, code } of TREE_CORPUS) {
    if (RECOVERY_CASES.has(id)) continue;
    it(`parses without errors: ${id}`, () => {
      // Sanity: this case must be recovery-free under ANTLR too.
      expect(goldenHasErrorNode(readGolden(id))).toBe(false);
      const result = parseZen(code);
      expect(result.value).toBeTruthy();
      expect(result.lexerErrors).toHaveLength(0);
      expect(result.parserErrors).toHaveLength(0);
    });
  }

  it("never throws and always yields an AST, including recovery cases", () => {
    for (const { id, code } of TREE_CORPUS) {
      const result = parseZen(code);
      expect(result.value).toBeTruthy();
      expect((result.value as any).$type).toBe("Prog");
      // keep id referenced for failure output
      expect(id).toBeTruthy();
    }
  });
});

describe("grammar corpus — recovery cases keep statements outside the damage", () => {
  it("malformed-unclosed-brace-after-message: `A.m {` keeps the message", () => {
    const result = parseZen("A.m {");
    const value = result.value as any;
    expect(result.parserErrors.length).toBeGreaterThan(0);
    // ANTLR golden: message(A.m) + orphan anonymous section. Chevrotain
    // attaches the recovered braceBlock to the message instead — the message
    // itself (from/to/method) must survive intact.
    const message = value.block.stats[0];
    expect(message.$type).toBe("Message");
    expect(message.body.fromTo.to.name).toBe("A");
    expect(message.body.func.signatures[0].methodName.name).toBe("m");
  });

  it("malformed-unclosed-paren-in-creation: `new A(` keeps the creation", () => {
    const result = parseZen("new A(");
    const value = result.value as any;
    expect(result.parserErrors.length).toBeGreaterThan(0);
    const creation = value.block.stats[0];
    expect(creation.$type).toBe("Creation");
    expect(creation.body.construct).toBe("A");
  });

  it("malformed-bare-try: `try` yields a Tcf with errors (deliberate non-tolerance)", () => {
    const result = parseZen("try");
    const value = result.value as any;
    expect(result.parserErrors.length).toBeGreaterThan(0);
    expect(value.block.stats[0].$type).toBe("Tcf");
  });

  it("malformed corpus: surrounding statements survive damage", () => {
    // Statement BEFORE and AFTER a damaged line stay intact siblings.
    const result = parseZen("B.before()\nA.m {\nC.after()");
    const value = result.value as any;
    const types = value.block.stats.map((s: any) => s.$type);
    expect(types[0]).toBe("Message");
    expect(value.block.stats[0].body.fromTo.to.name).toBe("B");
    // C.after() must still be present somewhere in the tree (sibling or
    // recovered into the open brace block — both keep it renderable).
    const text = JSON.stringify(value, (k, v) =>
      k.startsWith("$") ? undefined : v,
    );
    expect(text).toContain('"after"');
  });

  it("tol-09a/b: `A ~>` degrades like ANTLR (errors, non-null AST)", () => {
    for (const code of ["A ~>", "A ~> B"]) {
      const result = parseZen(code);
      expect(result.value).toBeTruthy();
      expect(result.parserErrors.length).toBeGreaterThan(0);
      // The leading participant name survives.
      const value = result.value as any;
      expect(value.headElements?.[0]?.name).toBe("A");
    }
  });

  it("compare-emoji-colon-override: errors in both engines, non-null AST", () => {
    const entry = TREE_CORPUS.find(
      (c) => c.id === "compare-emoji-colon-override",
    )!;
    expect(goldenHasErrorNode(readGolden(entry.id))).toBe(true);
    const result = parseZen(entry.code);
    expect(result.value).toBeTruthy();
    expect(result.parserErrors.length).toBeGreaterThan(0);
  });

  it("compare-emoji-in-conditions: alt survives, errors in both engines", () => {
    const entry = TREE_CORPUS.find(
      (c) => c.id === "compare-emoji-in-conditions",
    )!;
    expect(goldenHasErrorNode(readGolden(entry.id))).toBe(true);
    const result = parseZen(entry.code);
    const value = result.value as any;
    expect(result.parserErrors.length).toBeGreaterThan(0);
    // The if/else ladder is partially recovered; at least the Alt statement
    // and one undamaged message remain renderable.
    const types = value.block.stats.map((s: any) => s.$type);
    expect(types).toContain("Alt");
  });
});
