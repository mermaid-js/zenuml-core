#!/usr/bin/env bun
/**
 * Regenerates the golden TEXT/COMMENT parity snapshots from the LIVE ANTLR parser.
 *
 * Usage:  bun scripts/parity/regen-text-goldens.mjs
 *
 * Writes one JSON file per corpus case to test/unit/parity/__golden__/text/<id>.json.
 * Goldens are committed; test/unit/parity/text-parity.spec.ts asserts the live
 * parser output equals these files byte-for-byte. Run with bun (the harness is
 * TypeScript and uses the repo's tsconfig "@/*" path alias transitively).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  collectTextFacetsWithAntlr,
  serializeGoldenCase,
} from "../../test/unit/parity/text-harness.ts";
import { textCorpus } from "../../test/unit/parity/corpus/text-corpus.ts";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const goldenDir = join(repoRoot, "test", "unit", "parity", "__golden__", "text");

mkdirSync(goldenDir, { recursive: true });

const ids = new Set();
for (const { id, code } of textCorpus) {
  if (ids.has(id)) {
    throw new Error(`Duplicate corpus case id: ${id}`);
  }
  ids.add(id);
  const facets = collectTextFacetsWithAntlr(code);
  const json = serializeGoldenCase(id, code, facets);
  const file = join(goldenDir, `${id}.json`);
  writeFileSync(file, json);
  const count = facets ? facets.length : 0;
  console.log(`wrote ${file} (${count} facets)`);
}

console.log(`\nRegenerated ${textCorpus.length} golden file(s) in ${goldenDir}`);
