#!/usr/bin/env node

/*
 * What this file does:
 * Regenerates tests/shard-timings.json from the Playwright JSON reports that CI
 * uploads with every e2e shard (test-results/report.json inside each
 * playwright-report-shard-N artifact).
 *
 * High-level flow:
 * 1. Walk the given directories for files named report.json.
 * 2. Build the timings (scripts/e2e-shard-plan/timings.mjs).
 * 3. Write the file with sorted keys and print a summary.
 *
 * Refresh procedure (any green main run will do; several runs give medians):
 *   gh run download <run-id> --repo mermaid-js/zenuml-core --pattern 'playwright-report-shard-*' --dir /tmp/shards
 *   bun scripts/e2e-shard-timings.mjs /tmp/shards --source "run <run-id>"
 *
 * Example output (stderr):
 * `wrote tests/shard-timings.json: 214 tests from 14 reports (14 first-of-shard samples dropped)`
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildTimings } from "./e2e-shard-plan/timings.mjs";

const DEFAULT_OUT = "tests/shard-timings.json";

export function parseArgs(argv) {
  const opts = { dirs: [], out: DEFAULT_OUT, source: undefined };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out" || arg === "--source") {
      const value = argv[i + 1];
      if (value === undefined) {
        throw new Error(`${arg} needs a value`);
      }
      opts[arg.slice(2)] = value;
      i += 1;
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown argument: ${arg}`);
    } else {
      opts.dirs.push(arg);
    }
  }
  if (!opts.dirs.length) {
    throw new Error("Pass at least one directory containing report.json files");
  }
  return opts;
}

export function findReports(dir) {
  const found = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name === "report.json") {
        found.push(full);
      }
    }
  };
  walk(dir);
  return found.sort();
}

export function main(argv, { log = (line) => console.error(line) } = {}) {
  const opts = parseArgs(argv);
  const files = opts.dirs.flatMap(findReports);
  if (!files.length) {
    throw new Error(`No report.json found under: ${opts.dirs.join(", ")}`);
  }
  const reports = files.map((file) =>
    JSON.parse(fs.readFileSync(file, "utf8")),
  );
  const { timings, runs, dropped } = buildTimings(reports, {
    source: opts.source,
  });
  fs.writeFileSync(opts.out, `${JSON.stringify(timings, null, 2)}\n`);
  log(
    `wrote ${opts.out}: ${Object.keys(timings.tests).length} tests from ${runs} reports ` +
      `(${dropped} first-of-shard samples dropped)`,
  );
  return { out: opts.out, files, timings };
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
