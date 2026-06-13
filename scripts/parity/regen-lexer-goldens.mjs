#!/usr/bin/env bun
/**
 * Regenerates the committed lexer token-stream goldens from the CURRENT ANTLR lexer.
 *
 * Usage: bun scripts/parity/regen-lexer-goldens.mjs
 *
 * Writes test/unit/parity/__golden__/lexer/<case-id>.json — one file per corpus
 * case in test/unit/parity/corpus/lexer-corpus.ts. Stale golden files (no longer
 * in the corpus) are deleted. Goldens are asserted byte-for-byte by
 * test/unit/parity/lexer-parity.spec.ts, and later by the Langium lexer
 * (Stage 1 gate) through the same harness interface.
 *
 * Requires bun (imports the TypeScript harness/corpus directly).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const { lexWithAntlr, serializeTokens } = await import(
  path.join(root, "test/unit/parity/lexer-harness.ts")
);
const { lexerCorpus, assertUniqueCorpusIds } = await import(
  path.join(root, "test/unit/parity/corpus/lexer-corpus.ts")
);

const goldenDir = path.join(root, "test/unit/parity/__golden__/lexer");

assertUniqueCorpusIds(lexerCorpus);
fs.mkdirSync(goldenDir, { recursive: true });

const expectedFiles = new Set(lexerCorpus.map(({ id }) => `${id}.json`));
let removed = 0;
for (const file of fs.readdirSync(goldenDir)) {
  if (!expectedFiles.has(file)) {
    fs.unlinkSync(path.join(goldenDir, file));
    removed += 1;
  }
}

for (const { id, code } of lexerCorpus) {
  fs.writeFileSync(path.join(goldenDir, `${id}.json`), serializeTokens(lexWithAntlr(code)));
}

console.log(
  `Wrote ${lexerCorpus.length} lexer goldens to ${path.relative(root, goldenDir)}` +
    (removed ? ` (removed ${removed} stale)` : ""),
);
