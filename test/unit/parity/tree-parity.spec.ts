/**
 * Golden tree-shape parity spec (Stage 0 of the ANTLR4 -> Langium migration).
 *
 * Asserts that the live ANTLR parser's serialized tree for every corpus entry
 * is byte-for-byte identical to the committed golden JSON under
 * test/unit/parity/__golden__/tree/. A future Langium-backed parser must be
 * asserted against the SAME goldens via the TreeParityParser interface in
 * tree-harness.ts.
 *
 * If a golden is missing or stale, run: bun scripts/parity/regen-tree-goldens.mjs
 * Never regenerate goldens just to make this spec pass — see the snapshot
 * policy in CLAUDE.md and docs/langium-migration/07-risk-map.md (G7).
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TREE_CORPUS } from "./tree-corpus";
import { parseWithAntlr, serializeToGoldenJson } from "./tree-harness";

const GOLDEN_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "__golden__",
  "tree",
);

function readGolden(id: string): string {
  const goldenPath = path.join(GOLDEN_DIR, `${id}.json`);
  if (!fs.existsSync(goldenPath)) {
    throw new Error(
      `Missing golden file ${goldenPath} — run: bun scripts/parity/regen-tree-goldens.mjs`,
    );
  }
  return fs.readFileSync(goldenPath, "utf8");
}

describe("tree-shape parity goldens (ANTLR baseline)", () => {
  for (const entry of TREE_CORPUS) {
    it(`serializes ${entry.id} byte-for-byte equal to its golden`, () => {
      const actual = serializeToGoldenJson(parseWithAntlr(entry.code));
      expect(actual).toBe(readGolden(entry.id));
    });
  }

  it("has no stale golden files (golden dir mirrors the corpus)", () => {
    const onDisk = fs
      .readdirSync(GOLDEN_DIR)
      .filter((file) => file.endsWith(".json"))
      .sort();
    const expected = TREE_CORPUS.map((entry) => `${entry.id}.json`).sort();
    expect(onDisk).toEqual(expected);
  });
});
