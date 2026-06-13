/**
 * Regenerate the golden tree-shape snapshots for the parity harness
 * (Stage 0 of the ANTLR4 -> Langium migration; see
 * docs/langium-migration/07-risk-map.md).
 *
 * Usage:  bun scripts/parity/regen-tree-goldens.mjs
 *
 * Writes test/unit/parity/__golden__/tree/<case-id>.json for every entry in
 * test/unit/parity/tree-corpus.ts, serialized by the live ANTLR parser via
 * test/unit/parity/tree-harness.ts. Stale .json files (ids no longer in the
 * corpus) are removed so the golden directory always mirrors the corpus.
 *
 * Goldens are committed; only regenerate them for a deliberate, reviewed
 * grammar/parser change — never to silence a failing parity spec.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TREE_CORPUS } from "../../test/unit/parity/tree-corpus.ts";
import {
  parseWithAntlr,
  serializeToGoldenJson,
} from "../../test/unit/parity/tree-harness.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const goldenDir = path.resolve(
  here,
  "../../test/unit/parity/__golden__/tree",
);

fs.mkdirSync(goldenDir, { recursive: true });

const expected = new Set(TREE_CORPUS.map((entry) => `${entry.id}.json`));

let removed = 0;
for (const file of fs.readdirSync(goldenDir)) {
  if (file.endsWith(".json") && !expected.has(file)) {
    fs.rmSync(path.join(goldenDir, file));
    removed += 1;
  }
}

let written = 0;
for (const entry of TREE_CORPUS) {
  const tree = parseWithAntlr(entry.code);
  const json = serializeToGoldenJson(tree);
  fs.writeFileSync(path.join(goldenDir, `${entry.id}.json`), json);
  written += 1;
}

console.log(
  `regen-tree-goldens: wrote ${written} golden(s) to ${path.relative(
    process.cwd(),
    goldenDir,
  )}${removed ? `, removed ${removed} stale file(s)` : ""}`,
);
