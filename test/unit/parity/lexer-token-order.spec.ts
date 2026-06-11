/**
 * Token-order pin (Stage 1, Chevrotain/Langium lexer).
 *
 * Chevrotain is first-match: the ORDER of the token list in
 * src/parser-langium/lexer/tokens.ts is load-bearing (see 01 §8). This spec
 * snapshots the ordered token-name list against a committed golden so any
 * reordering — accidental or intentional — shows up as an explicit diff.
 *
 * To intentionally change the order: update the golden alongside the change
 * and re-run the full lexer parity suite (lexer-parity-langium.spec.ts).
 */
import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { tokens } from "../../../src/parser-langium/lexer/tokens";

const GOLDEN_PATH = path.join(
  import.meta.dir,
  "__golden__",
  "lexer-token-order.json",
);

describe("lexer token order pin", () => {
  it("matches the committed token-name order byte-for-byte", () => {
    const golden = fs.readFileSync(GOLDEN_PATH, "utf8");
    const actual =
      JSON.stringify(
        tokens.map((t) => t.name),
        null,
        2,
      ) + "\n";
    expect(actual).toBe(golden);
  });
});
