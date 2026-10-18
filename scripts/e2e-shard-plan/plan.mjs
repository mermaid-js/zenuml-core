/*
 * What this file does:
 * Pure functions behind scripts/e2e-shard-plan.mjs. They turn a Playwright
 * `--list --reporter=json` inventory plus the checked-in timings file into a
 * deterministic, duration-balanced assignment of tests to shards.
 *
 * High-level flow:
 * 1. flattenInventory: walk the JSON reporter tree into one row per test
 *    (file relative to the Playwright rootDir, line, describe titles + title).
 * 2. estimateDurations: look every test up in the timings; a test without a
 *    timing gets the median of the known ones (1 s when nothing is known).
 * 3. planShards: longest-processing-time-first greedy binning. Every tie is
 *    broken by a fixed sort, so each shard computes the same plan on its own.
 * 4. formatTestList: render one shard's tests in the line format Playwright's
 *    --test-list parser expects, refusing any title that parser would split.
 *
 * Example input:
 * An inventory with 228 specs, a timings file with ~220 keys, total 14.
 *
 * Example output:
 * 14 bins whose estimated loads differ by under one second.
 */

export const DELIMITER = " › ";
export const DEFAULT_ESTIMATE_MS = 1000;

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** Flatten a Playwright JSON report into [{ file, line, titlePath }]. */
export function flattenInventory(report) {
  const rows = [];
  const walk = (suite, titles) => {
    for (const spec of suite.specs ?? []) {
      rows.push({
        file: spec.file ?? suite.file,
        line: Number.isFinite(spec.line) ? spec.line : 0,
        titlePath: [...titles, spec.title],
      });
    }
    for (const child of suite.suites ?? []) {
      walk(child, [...titles, child.title]);
    }
  };
  // The top level is one suite per file; its title is the file name and is
  // not part of the title path Playwright matches on.
  for (const fileSuite of report?.suites ?? []) {
    walk(fileSuite, []);
  }
  return rows;
}

/** The key used in the timings file: "file › describe › title". */
export function testKey(test) {
  return [test.file, ...test.titlePath].join(DELIMITER);
}

export function median(values) {
  if (!values.length) {
    return undefined;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Estimate each test's duration in ms. Returns { estimates: Map, unknown: key[], fallback }.
 * `timings` is the parsed timings file ({ tests: { key: ms } }) or null.
 */
export function estimateDurations(tests, timings) {
  const known = timings?.tests ?? {};
  const isValid = (ms) => Number.isFinite(ms) && ms > 0;
  const knownValues = tests.map((t) => known[testKey(t)]).filter(isValid);
  const fallback = knownValues.length
    ? median(knownValues)
    : DEFAULT_ESTIMATE_MS;
  const estimates = new Map();
  const unknown = [];
  for (const test of tests) {
    const key = testKey(test);
    const ms = known[key];
    if (isValid(ms)) {
      estimates.set(key, ms);
    } else {
      estimates.set(key, fallback);
      unknown.push(key);
    }
  }
  return { estimates, unknown, fallback };
}

const byPosition = (a, b) =>
  compare(a.file, b.file) || a.line - b.line || compare(testKey(a), testKey(b));

/**
 * Longest-processing-time-first greedy binning into `total` shards.
 * Deterministic: tests are sorted by estimate desc, then file, line, key;
 * ties between bins go to the lowest index. Returns [{ tests, estimatedMs }].
 */
export function planShards(tests, estimates, total) {
  if (!Number.isInteger(total) || total < 1) {
    throw new Error(`total must be a positive integer, got ${total}`);
  }
  const ordered = [...tests].sort(
    (a, b) =>
      estimates.get(testKey(b)) - estimates.get(testKey(a)) || byPosition(a, b),
  );
  const bins = Array.from({ length: total }, () => ({
    tests: [],
    estimatedMs: 0,
  }));
  for (const test of ordered) {
    let target = bins[0];
    for (const bin of bins) {
      if (bin.estimatedMs < target.estimatedMs) {
        target = bin;
      }
    }
    target.tests.push(test);
    target.estimatedMs += estimates.get(testKey(test));
  }
  for (const bin of bins) {
    bin.tests.sort(byPosition);
  }
  return bins;
}

/**
 * Render tests in Playwright's --test-list format, one per line:
 *   [project] › file › describe › title
 * Playwright splits each line on "›" (or ">" when no "›" is present) and
 * requires an exact title-path match, so a title containing either character
 * would silently match nothing. Refuse those instead of skipping tests.
 */
export function formatTestList(tests, { project } = {}) {
  const lines = [];
  for (const test of tests) {
    for (const token of [test.file, ...test.titlePath]) {
      if (token.includes("›") || token.includes(">")) {
        throw new Error(
          `Cannot express this test in --test-list format because a title contains "›" or ">": ${testKey(test)}`,
        );
      }
    }
    const prefix = project ? `[${project}]${DELIMITER}` : "";
    lines.push(prefix + testKey(test));
  }
  return lines.length ? `${lines.join("\n")}\n` : "";
}

/** Parse "3/14" into { index: 3, total: 14 }. */
export function parseShardArg(value) {
  const match = /^(\d+)\/(\d+)$/.exec(String(value ?? "").trim());
  if (!match) {
    throw new Error(`--shard must look like 3/14, got "${value}"`);
  }
  const index = Number(match[1]);
  const total = Number(match[2]);
  if (index < 1 || total < 1 || index > total) {
    throw new Error(
      `--shard index must be between 1 and total, got "${value}"`,
    );
  }
  return { index, total };
}
