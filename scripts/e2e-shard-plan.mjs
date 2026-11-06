#!/usr/bin/env node

/*
 * What this file does:
 * Writes the --test-list file for one CI shard so that the e2e job's shards
 * carry equal test time instead of equal test counts.
 *
 * High-level flow:
 * 1. Read the inventory produced by `playwright test --list --reporter=json`.
 * 2. Read tests/shard-timings.json (missing file: warn and balance by count).
 * 3. Plan all shards deterministically (scripts/e2e-shard-plan/plan.mjs).
 * 4. Write this shard's tests in --test-list format and print a summary.
 *
 * Every shard runs this with its own --shard value and gets the same plan,
 * because the plan depends only on the two input files.
 *
 * Example input:
 * `bun scripts/e2e-shard-plan.mjs --shard 3/14 --inventory e2e-inventory.json --out e2e-shard-tests.txt`
 *
 * Example output (stderr):
 * `shard 3/14: 17 tests, estimated 25.4 s; all shards 25.2–25.6 s; 14 of 228 tests had no timing`
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  estimateDurations,
  flattenInventory,
  formatTestList,
  parseShardArg,
  planShards,
} from "./e2e-shard-plan/plan.mjs";

const DEFAULTS = {
  timings: "tests/shard-timings.json",
  out: "e2e-shard-tests.txt",
};

export function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];
    switch (arg) {
      case "--shard":
      case "--inventory":
      case "--timings":
      case "--out":
      case "--project":
        if (value === undefined) {
          throw new Error(`${arg} needs a value`);
        }
        opts[arg.slice(2)] = value;
        i += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!opts.shard) {
    throw new Error("--shard i/n is required");
  }
  if (!opts.inventory) {
    throw new Error(
      "--inventory <playwright --list --reporter=json output> is required",
    );
  }
  return opts;
}

export function main(argv, { log = (line) => console.error(line) } = {}) {
  const opts = parseArgs(argv);
  const { index, total } = parseShardArg(opts.shard);

  const inventory = JSON.parse(fs.readFileSync(opts.inventory, "utf8"));
  const tests = flattenInventory(inventory);
  if (tests.length === 0) {
    throw new Error(`No tests found in inventory ${opts.inventory}`);
  }

  let timings = null;
  if (fs.existsSync(opts.timings)) {
    timings = JSON.parse(fs.readFileSync(opts.timings, "utf8"));
  } else {
    log(`warning: ${opts.timings} not found; balancing shards by test count`);
  }

  const { estimates, unknown } = estimateDurations(tests, timings);
  const bins = planShards(tests, estimates, total);
  const mine = bins[index - 1];
  if (mine.tests.length === 0 && total <= tests.length) {
    throw new Error(
      `Shard ${index}/${total} received no tests; the plan is broken`,
    );
  }

  fs.writeFileSync(
    opts.out,
    formatTestList(mine.tests, { project: opts.project }),
  );

  const loads = bins.map((bin) => bin.estimatedMs / 1000);
  const fmt = (s) => s.toFixed(1);
  log(
    `shard ${index}/${total}: ${mine.tests.length} tests, estimated ${fmt(mine.estimatedMs / 1000)} s; ` +
      `all shards ${fmt(Math.min(...loads))}–${fmt(Math.max(...loads))} s; ` +
      `${unknown.length} of ${tests.length} tests had no timing`,
  );
  return { index, total, bins, unknown, out: opts.out };
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
