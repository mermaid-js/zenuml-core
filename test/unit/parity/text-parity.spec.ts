/**
 * Golden TEXT/COMMENT parity spec (Stage 0 of the ANTLR4 → Langium migration).
 *
 * Asserts that the LIVE ANTLR parser's getFormattedText/getText/getComment
 * output over the text corpus equals the committed golden JSON files
 * byte-for-byte. The future Langium facade must pass this exact assertion by
 * swapping collectTextFacetsWithAntlr for a facade-backed collector that walks
 * the same tree shape (see collectFacetsFromTree in text-harness.ts).
 *
 * Regenerate goldens (only when an intentional parser change is made):
 *   bun scripts/parity/regen-text-goldens.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  collectTextFacetsWithAntlr,
  serializeGoldenCase,
} from "./text-harness";
import { textCorpus } from "./corpus/text-corpus";

const goldenDir = join(import.meta.dirname, "__golden__", "text");

function readGolden(id: string): string {
  const file = join(goldenDir, `${id}.json`);
  try {
    return readFileSync(file, "utf8");
  } catch {
    throw new Error(
      `Missing golden file ${file}. Run: bun scripts/parity/regen-text-goldens.mjs`,
    );
  }
}

describe("text/comment golden parity (ANTLR baseline)", () => {
  for (const { id, description, code } of textCorpus) {
    it(`${id} — ${description}`, () => {
      const live = serializeGoldenCase(
        id,
        code,
        collectTextFacetsWithAntlr(code),
      );
      expect(live).toBe(readGolden(id));
    });
  }
});
