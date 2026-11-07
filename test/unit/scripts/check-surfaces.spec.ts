import { describe, expect, it } from "bun:test";
import {
  evaluateSurfaces,
  exitCodeFor,
  parseArgs,
  renderReport,
  SURFACES,
} from "../../../scripts/check-surfaces/core.mjs";

const LATEST = "4.13.0";

describe("evaluateSurfaces", () => {
  it.each([
    ["current entry", "4.13.0", undefined, "PASS", undefined],
    ["older entry", "4.1.0", undefined, "FAIL", "behind npm latest"],
    [
      "entry ahead of npm",
      "4.14.0",
      undefined,
      "FAIL",
      "differs from npm latest",
    ],
    ["no version found", null, undefined, "FAIL", "version not found"],
    ["page error", null, "net::ERR_FAILED", "FAIL", "net::ERR_FAILED"],
  ])("%s", (_case, runs, error, result, note) => {
    const [row] = evaluateSurfaces([{ name: "entry", runs, error }], LATEST);
    expect(row.result).toBe(result);
    expect(row.note).toBe(note);
    expect(row.latest).toBe(LATEST);
  });

  it("compares versions by number, not by text", () => {
    const [row] = evaluateSurfaces(
      [{ name: "entry", runs: "4.9.0" }],
      "4.13.0",
    );
    expect(row.note).toBe("behind npm latest");
  });
});

describe("exitCodeFor", () => {
  it("returns 0 when every entry passes", () => {
    expect(exitCodeFor([{ result: "PASS" }, { result: "PASS" }])).toBe(0);
  });

  it("returns 1 when one entry fails", () => {
    expect(exitCodeFor([{ result: "PASS" }, { result: "FAIL" }])).toBe(1);
  });
});

describe("renderReport", () => {
  it("lists each entry with its version and result", () => {
    const report = renderReport(
      [
        {
          name: "core.zenuml.com",
          runs: "4.1.0",
          latest: LATEST,
          result: "FAIL",
          note: "behind npm latest",
        },
        {
          name: "unpkg latest",
          runs: "4.13.0",
          latest: LATEST,
          result: "PASS",
        },
      ],
      LATEST,
    );
    expect(report).toContain(
      "| core.zenuml.com | 4.1.0 | 4.13.0 | FAIL | behind npm latest |",
    );
    expect(report).toContain("| unpkg latest | 4.13.0 | 4.13.0 | PASS |  |");
    expect(report).toContain("1 of 2 public entries");
  });

  it("shows a dash when no version was read", () => {
    const report = renderReport(
      [
        {
          name: "entry",
          runs: null,
          latest: LATEST,
          result: "FAIL",
          note: "version not found",
        },
      ],
      LATEST,
    );
    expect(report).toContain(
      "| entry | - | 4.13.0 | FAIL | version not found |",
    );
  });

  it("keeps a pipe in an error message from breaking the table", () => {
    const report = renderReport(
      [
        {
          name: "entry",
          runs: null,
          latest: LATEST,
          result: "FAIL",
          note: "a|b",
        },
      ],
      LATEST,
    );
    expect(report).toContain("a\\|b");
  });
});

describe("parseArgs", () => {
  it("uses one attempt and no extra entries by default", () => {
    expect(parseArgs([])).toEqual({
      attempts: 1,
      waitSeconds: 0,
      report: null,
      extraScripts: [],
    });
  });

  it("reads retry, report, and extra entry flags", () => {
    expect(
      parseArgs([
        "--attempts",
        "3",
        "--wait-seconds",
        "60",
        "--report",
        "out.md",
        "--add-script",
        "old=https://cdn.example/zenuml.js",
      ]),
    ).toEqual({
      attempts: 3,
      waitSeconds: 60,
      report: "out.md",
      extraScripts: [{ name: "old", script: "https://cdn.example/zenuml.js" }],
    });
  });

  it.each([
    [["--attempts", "0"]],
    [["--wait-seconds", "-1"]],
    [["--add-script", "no-url"]],
    [["--unknown"]],
  ])("rejects %j", (args) => {
    expect(() => parseArgs(args)).toThrow();
  });
});

describe("SURFACES", () => {
  it("covers the five public entries", () => {
    expect(SURFACES.map((s) => s.name)).toEqual([
      "core.zenuml.com",
      "Production workbench",
      "GitHub Pages demo",
      "jsDelivr latest",
      "unpkg latest",
    ]);
  });
});
