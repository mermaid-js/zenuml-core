/*
 * What this file does:
 * Pure functions behind scripts/e2e-shard-timings.mjs. They turn Playwright
 * JSON reporter outputs (one per shard, from one or more CI runs) into the
 * timings file that scripts/e2e-shard-plan.mjs balances shards with.
 *
 * High-level flow:
 * 1. collectRunDurations: one report -> one row per test with the fastest
 *    attempt's duration and the earliest start time.
 * 2. buildTimings: across reports, drop the first test of each report (its
 *    duration includes the dev server's cold compile, a cost the shard pays
 *    whichever test runs first), take the median per test, sort the keys so
 *    diffs stay small, and record provenance.
 *
 * Example input:
 * 14 report.json files from one run, `source: "run 39168073343"`.
 *
 * Example output:
 * { source, generatedAt, unit: "ms", tests: { "file › title": 1234, ... } }
 */

import { DELIMITER, median } from "./plan.mjs";

/** One report -> { rows: [{ key, ms, start }], firstKey }. */
export function collectRunDurations(report) {
  const rows = [];
  const walk = (suite, titles) => {
    for (const spec of suite.specs ?? []) {
      const key = [spec.file ?? suite.file, ...titles, spec.title].join(
        DELIMITER,
      );
      for (const test of spec.tests ?? []) {
        const results = (test.results ?? []).filter((r) =>
          Number.isFinite(r.duration),
        );
        if (!results.length) {
          continue;
        }
        const ms = Math.min(...results.map((r) => r.duration));
        const starts = results
          .map((r) => Date.parse(r.startTime))
          .filter(Number.isFinite);
        rows.push({
          key,
          ms,
          start: starts.length ? Math.min(...starts) : NaN,
        });
      }
    }
    for (const child of suite.suites ?? []) {
      walk(child, [...titles, child.title]);
    }
  };
  for (const fileSuite of report?.suites ?? []) {
    walk(fileSuite, []);
  }
  const first = rows
    .filter((r) => Number.isFinite(r.start))
    .sort((a, b) => a.start - b.start || (a.key < b.key ? -1 : 1))[0];
  return { rows, firstKey: first?.key ?? null };
}

/** Reports from one or more runs -> { timings, runs, dropped }. */
export function buildTimings(
  reports,
  { source, generatedAt = new Date().toISOString() } = {},
) {
  const samples = new Map();
  let dropped = 0;
  for (const report of reports) {
    const { rows, firstKey } = collectRunDurations(report);
    for (const row of rows) {
      if (row.key === firstKey) {
        dropped += 1;
        continue;
      }
      if (!samples.has(row.key)) {
        samples.set(row.key, []);
      }
      samples.get(row.key).push(row.ms);
    }
  }
  const tests = {};
  for (const key of [...samples.keys()].sort()) {
    tests[key] = Math.round(median(samples.get(key)));
  }
  return {
    timings: {
      source: source ?? "unknown",
      generatedAt,
      unit: "ms",
      note: "Fastest attempt per run, median across runs; the first test of each shard is dropped because it carries the dev server's cold compile. Refresh with scripts/e2e-shard-timings.mjs.",
      tests,
    },
    runs: reports.length,
    dropped,
  };
}
