/**
 * Golden token-stream parity spec (Stage 0, ANTLR baseline).
 *
 * Each corpus case is lexed live with the ANTLR lexer and compared
 * BYTE-FOR-BYTE against the committed golden JSON produced by
 * `bun scripts/parity/regen-lexer-goldens.mjs`.
 *
 * Stage 1 will run the identical corpus + goldens against the Chevrotain/
 * Langium lexer by swapping `lexWithAntlr` for a `lexWithLangium` of the same
 * `LexFunction` signature.
 */
import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { lexWithAntlr, serializeTokens } from "./lexer-harness";
import { assertUniqueCorpusIds, lexerCorpus } from "./corpus/lexer-corpus";

const GOLDEN_DIR = path.join(import.meta.dir, "__golden__", "lexer");

describe("lexer token-stream parity (ANTLR goldens)", () => {
  it("has unique corpus ids", () => {
    expect(() => assertUniqueCorpusIds(lexerCorpus)).not.toThrow();
  });

  it("has exactly one golden file per corpus case (no missing, no stale)", () => {
    const expected = lexerCorpus.map(({ id }) => `${id}.json`).sort();
    const actual = fs.readdirSync(GOLDEN_DIR).sort();
    expect(actual).toEqual(expected);
  });

  for (const { id, code } of lexerCorpus) {
    it(`matches golden byte-for-byte: ${id}`, () => {
      const goldenPath = path.join(GOLDEN_DIR, `${id}.json`);
      const golden = fs.readFileSync(goldenPath, "utf8");
      expect(serializeTokens(lexWithAntlr(code))).toBe(golden);
    });
  }
});
