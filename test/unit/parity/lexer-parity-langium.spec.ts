/**
 * Golden token-stream parity spec (Stage 1, Chevrotain/Langium lexer).
 *
 * Mirrors lexer-parity.spec.ts: each corpus case is lexed with the new
 * Chevrotain lexer (`lexWithLangium`) and compared BYTE-FOR-BYTE against the
 * SAME committed ANTLR goldens in __golden__/lexer/.
 */
import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { serializeTokens } from "./lexer-harness";
import { lexerCorpus } from "./corpus/lexer-corpus";
import { lexWithLangium } from "../../../src/parser-langium/lexer";

const GOLDEN_DIR = path.join(import.meta.dir, "__golden__", "lexer");

describe("lexer token-stream parity (Chevrotain vs ANTLR goldens)", () => {
  for (const { id, code } of lexerCorpus) {
    it(`matches golden byte-for-byte: ${id}`, () => {
      const goldenPath = path.join(GOLDEN_DIR, `${id}.json`);
      const golden = fs.readFileSync(goldenPath, "utf8");
      expect(serializeTokens(lexWithLangium(code))).toBe(golden);
    });
  }
});
