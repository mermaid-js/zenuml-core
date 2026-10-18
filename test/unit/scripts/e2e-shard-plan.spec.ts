/*
 * What this file does:
 * Pins the invariants of the duration-balanced e2e shard planner that CI relies
 * on: every test lands in exactly one shard, the plan is deterministic, unknown
 * tests still run, a missing timings file degrades to count balancing, and the
 * --test-list lines are ones Playwright's parser will match.
 *
 * High-level flow:
 * - Builds tiny synthetic inventories in the JSON reporter shape.
 * - Exercises plan.mjs, timings.mjs and the two CLI entry points on temp files.
 * - Checks the checked-in tests/shard-timings.json has the expected shape.
 *
 * Example input:
 * A 7-test inventory with two describe levels and a timings map for 5 of them.
 *
 * Example output:
 * Assertions on bin membership, bin loads, formatted lines and CLI summaries.
 */
import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { main as planMain } from "../../../scripts/e2e-shard-plan.mjs";
import {
  DEFAULT_ESTIMATE_MS,
  estimateDurations,
  flattenInventory,
  formatTestList,
  parseShardArg,
  planShards,
  testKey,
} from "../../../scripts/e2e-shard-plan/plan.mjs";
import {
  buildTimings,
  collectRunDurations,
} from "../../../scripts/e2e-shard-plan/timings.mjs";
import { main as timingsMain } from "../../../scripts/e2e-shard-timings.mjs";

type Spec = {
  title: string;
  line: number;
  results?: { duration: number; startTime: string }[];
};
type Suite = { title: string; file: string; specs?: Spec[]; suites?: Suite[] };

function withFile(file: string, suite: Omit<Suite, "file">): Suite {
  return {
    ...suite,
    file,
    specs: (suite.specs ?? []).map((s) => ({
      ...s,
      file,
      tests: [{ projectName: "chromium", results: s.results ?? [] }],
    })) as Spec[],
    suites: (suite.suites ?? []).map((s) => withFile(file, s)),
  };
}

function fileSuite(
  file: string,
  specs: Spec[],
  suites: Omit<Suite, "file">[] = [],
): Suite {
  return withFile(file, { title: file, specs, suites: suites as Suite[] });
}

function inventory(): { suites: Suite[] } {
  return {
    suites: [
      fileSuite("visual/a.spec.ts", [
        { title: "renders", line: 3 },
        { title: "renders again", line: 9 },
      ]),
      fileSuite(
        "interaction/b.spec.ts",
        [{ title: "top level", line: 2 }],
        [
          {
            title: "editor",
            specs: [
              { title: "opens", line: 10 },
              { title: "closes", line: 20 },
            ],
            suites: [
              {
                title: "nested",
                specs: [{ title: "deep", line: 30 }],
              },
            ],
          },
        ],
      ),
      fileSuite("regression/c.spec.ts", [{ title: "bug 406", line: 1 }]),
    ],
  };
}

const timings = {
  tests: {
    "visual/a.spec.ts › renders": 9000,
    "visual/a.spec.ts › renders again": 1000,
    "interaction/b.spec.ts › editor › opens": 4000,
    "interaction/b.spec.ts › editor › closes": 3000,
    "interaction/b.spec.ts › editor › nested › deep": 2000,
  },
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = (i * 7919 + 13) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

describe("flattenInventory", () => {
  it("yields one row per spec with describe titles in the title path", () => {
    const rows = flattenInventory(inventory());
    expect(rows).toHaveLength(7);
    expect(rows.map(testKey)).toContain(
      "interaction/b.spec.ts › editor › nested › deep",
    );
    expect(
      rows.find((r) => r.titlePath.join("/") === "editor/opens")?.line,
    ).toBe(10);
  });
});

describe("estimateDurations", () => {
  it("gives unknown tests the median of the known ones", () => {
    const rows = flattenInventory(inventory());
    const { estimates, unknown, fallback } = estimateDurations(rows, timings);
    expect(fallback).toBe(3000);
    expect(unknown.sort()).toEqual([
      "interaction/b.spec.ts › top level",
      "regression/c.spec.ts › bug 406",
    ]);
    expect(estimates.get("regression/c.spec.ts › bug 406")).toBe(3000);
    expect(estimates.get("visual/a.spec.ts › renders")).toBe(9000);
  });

  it("falls back to one second when nothing is known", () => {
    const rows = flattenInventory(inventory());
    const { estimates, unknown } = estimateDurations(rows, null);
    expect(unknown).toHaveLength(7);
    for (const value of estimates.values())
      expect(value).toBe(DEFAULT_ESTIMATE_MS);
  });
});

describe("planShards", () => {
  it("places every test in exactly one non-empty shard and balances the load", () => {
    const rows = flattenInventory(inventory());
    const { estimates } = estimateDurations(rows, timings);
    const bins = planShards(rows, estimates, 3);
    const keys = bins.flatMap((b) => b.tests.map(testKey));
    expect(keys.sort()).toEqual(rows.map(testKey).sort());
    expect(new Set(keys).size).toBe(rows.length);
    for (const bin of bins) expect(bin.tests.length).toBeGreaterThan(0);
    const loads = bins.map((b) => b.estimatedMs);
    expect(Math.max(...loads) - Math.min(...loads)).toBeLessThanOrEqual(9000);
    expect(loads.reduce((a, b) => a + b, 0)).toBe(25000);
  });

  it("is deterministic regardless of inventory order", () => {
    const rows = flattenInventory(inventory());
    const { estimates } = estimateDurations(rows, timings);
    const plan = (input: typeof rows) =>
      planShards(input, estimates, 3).map((b) => b.tests.map(testKey));
    expect(plan(shuffle(rows))).toEqual(plan(rows));
    expect(plan([...rows].reverse())).toEqual(plan(rows));
  });

  it("rejects a non-positive shard count", () => {
    expect(() => planShards([], new Map(), 0)).toThrow();
  });
});

describe("formatTestList", () => {
  it("writes file › describe › title lines", () => {
    const rows = flattenInventory(inventory()).filter(
      (r) => r.file === "interaction/b.spec.ts",
    );
    const text = formatTestList(rows);
    expect(text.split("\n").filter(Boolean)).toEqual([
      "interaction/b.spec.ts › top level",
      "interaction/b.spec.ts › editor › opens",
      "interaction/b.spec.ts › editor › closes",
      "interaction/b.spec.ts › editor › nested › deep",
    ]);
    expect(formatTestList(rows.slice(0, 1), { project: "chromium" })).toBe(
      "[chromium] › interaction/b.spec.ts › top level\n",
    );
    expect(formatTestList([])).toBe("");
  });

  it("refuses titles Playwright's parser would split", () => {
    expect(() =>
      formatTestList([{ file: "x.spec.ts", line: 1, titlePath: ["a › b"] }]),
    ).toThrow(/delimiter|›/);
    expect(() =>
      formatTestList([{ file: "x.spec.ts", line: 1, titlePath: ["a > b"] }]),
    ).toThrow();
  });
});

describe("parseShardArg", () => {
  it("accepts i/n and rejects everything else", () => {
    expect(parseShardArg("3/14")).toEqual({ index: 3, total: 14 });
    for (const bad of ["0/14", "15/14", "3", "a/b", "", undefined]) {
      expect(() => parseShardArg(bad)).toThrow();
    }
  });
});

describe("buildTimings", () => {
  const at = (s: number) =>
    new Date(Date.UTC(2026, 9, 18, 0, 0, s)).toISOString();
  const report = (offset: number) => ({
    suites: [
      fileSuite("visual/a.spec.ts", [
        {
          title: "renders",
          line: 3,
          results: [{ duration: 9000 + offset, startTime: at(0) }],
        },
        {
          title: "renders again",
          line: 9,
          results: [
            { duration: 30000, startTime: at(10) },
            { duration: 1200 + offset, startTime: at(41) },
          ],
        },
      ]),
      fileSuite("regression/c.spec.ts", [
        {
          title: "bug 406",
          line: 1,
          results: [{ duration: 700 + offset, startTime: at(50) }],
        },
      ]),
    ],
  });

  it("uses the fastest attempt and names the earliest-starting test", () => {
    const { rows, firstKey } = collectRunDurations(report(0));
    expect(firstKey).toBe("visual/a.spec.ts › renders");
    expect(
      rows.find((r) => r.key === "visual/a.spec.ts › renders again")?.ms,
    ).toBe(1200);
  });

  it("drops the first test of each report, takes the median across runs, sorts keys", () => {
    const {
      timings: built,
      dropped,
      runs,
    } = buildTimings([report(0), report(100), report(400)], {
      source: "run 1",
      generatedAt: "2026-10-18T00:00:00.000Z",
    });
    expect(runs).toBe(3);
    expect(dropped).toBe(3);
    expect(built.tests["visual/a.spec.ts › renders"]).toBeUndefined();
    expect(built.tests["visual/a.spec.ts › renders again"]).toBe(1300);
    expect(built.tests["regression/c.spec.ts › bug 406"]).toBe(800);
    expect(Object.keys(built.tests)).toEqual(
      [...Object.keys(built.tests)].sort(),
    );
    expect(built.unit).toBe("ms");
    expect(built.source).toBe("run 1");
  });
});

describe("CLI entry points", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-shard-plan-"));
  const inventoryPath = path.join(tmp, "inventory.json");
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory()));
  const timingsPath = path.join(tmp, "timings.json");
  fs.writeFileSync(timingsPath, JSON.stringify(timings));

  it("writes this shard's list and reports the plan", () => {
    const logs: string[] = [];
    const out = path.join(tmp, "shard-1.txt");
    const result = planMain(
      [
        "--shard",
        "1/3",
        "--inventory",
        inventoryPath,
        "--timings",
        timingsPath,
        "--out",
        out,
      ],
      {
        log: (line: string) => logs.push(line),
      },
    );
    expect(result.bins).toHaveLength(3);
    expect(fs.readFileSync(out, "utf8").trim().split("\n")).toEqual(
      result.bins[0].tests.map(testKey),
    );
    expect(logs.join("\n")).toMatch(/^shard 1\/3: \d+ tests, estimated/);
    expect(logs.join("\n")).toContain("2 of 7 tests had no timing");
  });

  it("warns and balances by count when the timings file is missing", () => {
    const logs: string[] = [];
    const out = path.join(tmp, "shard-2.txt");
    const result = planMain(
      [
        "--shard",
        "2/3",
        "--inventory",
        inventoryPath,
        "--timings",
        path.join(tmp, "missing.json"),
        "--out",
        out,
      ],
      { log: (line: string) => logs.push(line) },
    );
    expect(logs[0]).toMatch(/not found; balancing shards by test count/);
    const sizes = result.bins.map((b) => b.tests.length).sort();
    expect(sizes).toEqual([2, 2, 3]);
  });

  it("fails on an empty inventory or a bad shard argument", () => {
    const emptyPath = path.join(tmp, "empty.json");
    fs.writeFileSync(emptyPath, JSON.stringify({ suites: [] }));
    expect(() =>
      planMain(["--shard", "1/2", "--inventory", emptyPath], { log: () => {} }),
    ).toThrow(/No tests/);
    expect(() =>
      planMain(["--shard", "9/2", "--inventory", inventoryPath], {
        log: () => {},
      }),
    ).toThrow(/--shard/);
    expect(() =>
      planMain(["--inventory", inventoryPath], { log: () => {} }),
    ).toThrow(/--shard/);
  });

  it("regenerates a timings file from report.json files under a directory", () => {
    const reportsDir = path.join(
      tmp,
      "artifacts",
      "playwright-report-shard-1",
      "test-results",
    );
    fs.mkdirSync(reportsDir, { recursive: true });
    const at = (s: number) =>
      new Date(Date.UTC(2026, 9, 18, 0, 0, s)).toISOString();
    fs.writeFileSync(
      path.join(reportsDir, "report.json"),
      JSON.stringify({
        suites: [
          fileSuite("visual/a.spec.ts", [
            {
              title: "renders",
              line: 3,
              results: [{ duration: 9000, startTime: at(0) }],
            },
            {
              title: "renders again",
              line: 9,
              results: [{ duration: 1234, startTime: at(10) }],
            },
          ]),
        ],
      }),
    );
    const out = path.join(tmp, "shard-timings.json");
    const logs: string[] = [];
    timingsMain(
      [path.join(tmp, "artifacts"), "--out", out, "--source", "test"],
      { log: (line: string) => logs.push(line) },
    );
    const written = JSON.parse(fs.readFileSync(out, "utf8"));
    expect(written.tests).toEqual({ "visual/a.spec.ts › renders again": 1234 });
    expect(logs[0]).toContain(
      "1 tests from 1 reports (1 first-of-shard samples dropped)",
    );
  });
});

describe("tests/shard-timings.json", () => {
  it("has the shape the planner reads", () => {
    const file = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "tests/shard-timings.json"),
        "utf8",
      ),
    );
    expect(file.unit).toBe("ms");
    expect(typeof file.source).toBe("string");
    const keys = Object.keys(file.tests);
    expect(keys.length).toBeGreaterThan(100);
    expect(keys).toEqual([...keys].sort());
    for (const key of keys) {
      expect(key).toMatch(/\.spec\.ts › /);
      expect(Number.isInteger(file.tests[key]) && file.tests[key] > 0).toBe(
        true,
      );
    }
  });
});
