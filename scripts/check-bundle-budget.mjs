#!/usr/bin/env node
// Gate 7 of docs/ux-research/2026-10-19-open-claude-ui-v2-assessment.md:
// the gzip size of dist/zenuml.esm.mjs may grow by at most BUDGET bytes over the
// recorded baseline. Run `bun run build:lib` first.
//
// Usage: node scripts/check-bundle-budget.mjs [--budget 4500]

import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = "docs/ux-research/evidence/bundle-size-2026-10-19.json";
const TARGET = "dist/zenuml.esm.mjs";
const budgetArg = process.argv.indexOf("--budget");
const BUDGET = budgetArg > -1 ? Number(process.argv[budgetArg + 1]) : 4500;

const abs = join(ROOT, TARGET);
if (!existsSync(abs)) {
  console.error(`check-bundle-budget: ${TARGET} not found; run \`bun run build:lib\` first`);
  process.exit(2);
}
const baseline = JSON.parse(readFileSync(join(ROOT, BASELINE), "utf8"));
const base = baseline.files.find((f) => f.path === TARGET);
if (!base) {
  console.error(`check-bundle-budget: no baseline for ${TARGET} in ${BASELINE}`);
  process.exit(2);
}
const bytes = readFileSync(abs);
const gzip = gzipSync(bytes, { level: 9 }).length;
const delta = gzip - base.gzip_bytes;
const line = `${TARGET}: gzip ${gzip} B (baseline ${base.gzip_bytes} B at ${baseline.commit}, delta ${delta >= 0 ? "+" : ""}${delta} B, budget +${BUDGET} B)`;
if (delta > BUDGET) {
  console.error(`check-bundle-budget: over budget. ${line}`);
  process.exit(1);
}
console.log(`check-bundle-budget: ok. ${line}`);
