/**
 * Renders every compare-case DSL via renderToSvg and dumps the SVG text to
 * OUT_DIR. Used to diff rendering output between two revisions.
 * Run: OUT_DIR=/tmp/svg-x bun test scripts/benchmark/svg-parity-dump.spec.tsx
 */
import { test } from "bun:test";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { CASES } from "../../e2e/data/compare-cases.js";
import { renderToSvg } from "@/svg/renderToSvg";

test("dump svg for all cases", () => {
  const outDir = process.env.OUT_DIR || "/tmp/svg-dump";
  mkdirSync(outDir, { recursive: true });
  let ok = 0;
  for (const [name, code] of Object.entries(CASES)) {
    try {
      const result = renderToSvg(code as string);
      writeFileSync(path.join(outDir, `${name}.svg`), result.svg || "EMPTY");
      ok++;
    } catch (e) {
      writeFileSync(path.join(outDir, `${name}.svg`), `ERROR: ${e}`);
    }
  }
  console.log(`dumped ${ok}/${Object.keys(CASES).length} cases to ${outDir}`);
}, 600000);
