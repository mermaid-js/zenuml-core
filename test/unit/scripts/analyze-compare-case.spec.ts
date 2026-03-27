/*
 * What this file does:
 * Provides fast regression coverage for the refactored analyzer modules that do
 * not need a live browser page.
 *
 * High-level flow:
 * - Verifies CLI parsing behavior.
 * - Verifies native diff classification on tiny synthetic images.
 * - Verifies report assembly on minimal extracted inputs.
 * - Verifies stdout formatting for summary-only and JSON-only modes.
 *
 * These tests are meant to protect the SRP refactor without depending on a full
 * compare-case browser session.
 *
 * Example input:
 * Small synthetic images, tiny extracted-data fixtures, and CLI-like arg arrays.
 *
 * Example output:
 * Assertions that config parsing, diff stats, report assembly, and stdout output
 * still behave the same after refactors.
 */
import { describe, expect, it } from "bun:test";

import { main } from "../../../scripts/analyze-compare-case.mjs";
import { collectLabelData } from "../../../scripts/analyze-compare-case/collect-data.mjs";
import { buildDiffImageFromPanel } from "../../../scripts/analyze-compare-case/panel-diff.mjs";
import { parseArgs } from "../../../scripts/analyze-compare-case/config.mjs";
import { computeNativeDiff } from "../../../scripts/analyze-compare-case/native-diff.mjs";
import { writeReportOutput } from "../../../scripts/analyze-compare-case/output.mjs";
import { buildReport } from "../../../scripts/analyze-compare-case/report.mjs";

function makeImage(width: number, height: number, rgba: number[]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data.set(rgba, i * 4);
  }
  return { width, height, data };
}

function makeStdout() {
  const chunks: string[] = [];
  return {
    chunks,
    write(value: string) {
      chunks.push(value);
    },
  };
}

describe("analyze-compare-case/config", () => {
  it("parses defaults and named flags", () => {
    const parsed = parseArgs(["--case", "demo", "--json", "--output-dir", "tmp/out", "--luma", "200", "--ctol", "3", "--ptol", "2"]);

    expect(parsed.caseName).toBe("demo");
    expect(parsed.jsonOnly).toBe(true);
    expect(parsed.summaryOnly).toBe(false);
    expect(parsed.outputDir).toBe("tmp/out");
    expect(parsed.lumaThreshold).toBe(200);
    expect(parsed.channelTolerance).toBe(3);
    expect(parsed.positionTolerance).toBe(2);
    expect(parsed.viewport).toEqual({ width: 1600, height: 2200 });
  });

  it("parses persistent profile options", () => {
    const parsed = parseArgs([
      "--user-data-dir",
      "/tmp/pw-profile",
      "--profile-directory",
      "Profile 8",
      "--channel",
      "chrome",
      "--headed",
    ]);

    expect(parsed.userDataDir).toBe("/tmp/pw-profile");
    expect(parsed.profileDirectory).toBe("Profile 8");
    expect(parsed.browserChannel).toBe("chrome");
    expect(parsed.headless).toBe(false);
  });

  it("accepts a positional case name", () => {
    const parsed = parseArgs(["async-2a"]);
    expect(parsed.caseName).toBe("async-2a");
  });

  it("rejects a profile directory without a user data dir", async () => {
    await expect(main(["--profile-directory", "Profile 8"], makeStdout() as never)).rejects.toThrow(
      "--profile-directory requires --user-data-dir",
    );
  });
});

describe("analyze-compare-case/native-diff", () => {
  it("marks identical content as fully matched", () => {
    const htmlImage = makeImage(1, 1, [0, 0, 0, 255]);
    const svgImage = makeImage(1, 1, [0, 0, 0, 255]);

    const diff = computeNativeDiff(htmlImage, svgImage, {
      lumaThreshold: 240,
      channelTolerance: 12,
      positionTolerance: 0,
    });

    expect(diff.stats.total).toBe(1);
    expect(diff.stats.matched).toBe(1);
    expect(diff.stats.htmlOnly).toBe(0);
    expect(diff.stats.svgOnly).toBe(0);
    expect(diff.stats.colorDiff).toBe(0);
    expect(diff.stats.pixelPct).toBe(100);
  });

  it("detects html-only pixels", () => {
    const htmlImage = makeImage(1, 1, [0, 0, 0, 255]);
    const svgImage = makeImage(1, 1, [255, 255, 255, 255]);

    const diff = computeNativeDiff(htmlImage, svgImage, {
      lumaThreshold: 240,
      channelTolerance: 12,
      positionTolerance: 0,
    });

    expect(diff.stats.total).toBe(1);
    expect(diff.stats.matched).toBe(0);
    expect(diff.stats.htmlOnly).toBe(1);
    expect(diff.stats.svgOnly).toBe(0);
  });
});

describe("analyze-compare-case/panel-diff", () => {
  it("classifies panel colors into diff classes", () => {
    const diff = buildDiffImageFromPanel(4, 1, new Uint8ClampedArray([
      0, 100, 0, 255,
      255, 0, 0, 255,
      0, 0, 255, 255,
      255, 0, 255, 255,
    ]));

    expect(Array.from(diff.classData)).toEqual([1, 2, 3, 4]);
    expect(diff.stats.matched).toBe(1);
    expect(diff.stats.htmlOnly).toBe(1);
    expect(diff.stats.svgOnly).toBe(1);
    expect(diff.stats.colorDiff).toBe(1);
    expect(diff.stats.total).toBe(4);
    expect(diff.stats.posMatched).toBe(2);
  });
});

describe("analyze-compare-case/report", () => {
  it("builds an empty report for empty extracted data", () => {
    const extracted = {
      htmlFrameBox: { x: 0, y: 0, w: 100, h: 40 },
      svgFrameBox: { x: 0, y: 0, w: 100, h: 40 },
      htmlHeaderBox: null,
      svgHeaderBox: null,
      svgHeaderLineBox: null,
      htmlTitle: null,
      svgTitle: null,
      htmlLabels: [],
      svgLabels: [],
      htmlNumbers: [],
      svgNumbers: [],
      htmlArrows: [],
      svgArrows: [],
      htmlParticipants: [],
      svgParticipants: [],
      htmlComments: [],
      svgComments: [],
      htmlGroups: [],
      svgGroups: [],
      htmlRootBox: { x: 0, y: 0, w: 100, h: 40 },
      svgRootBox: { x: 0, y: 0, w: 100, h: 40 },
      svgFrameBorderBox: null,
    };

    const diffImage = {
      width: 1,
      height: 1,
      diffData: new Uint8ClampedArray(4),
      classData: new Uint8Array(1),
      stats: {
        matched: 0,
        total: 0,
        htmlOnly: 0,
        svgOnly: 0,
        colorDiff: 0,
        pixelPct: 100,
      },
    };

    const report = buildReport("demo", extracted, diffImage);

    expect(report.case).toBe("demo");
    expect(report.frames).toEqual([
      {
        name: "frame",
        status: "ok",
        dx: 0,
        dy: 0,
        dw: 0,
        dh: 0,
        html_box: { x: 0, y: 0, w: 100, h: 40 },
        svg_box: { x: 0, y: 0, w: 100, h: 40 },
      },
    ]);
    expect(report.headers).toEqual([{ name: "header", status: "ambiguous", reason: "header missing on one side" }]);
    expect(report.titles).toEqual([]);
    expect(report.labels).toEqual([]);
    expect(report.numbers).toEqual([]);
    expect(report.arrows).toEqual([]);
    expect(report.participant_labels).toEqual([]);
    expect(report.participant_stereotypes).toEqual([]);
    expect(report.participant_icons).toEqual([]);
    expect(report.participant_boxes).toEqual([]);
    expect(report.participant_colors).toEqual([]);
    expect(report.comments).toEqual([]);
    expect(report.participant_groups).toEqual([]);
    expect(report.residual_scopes).toEqual([]);
  });

  it("exports collectLabelData as a callable function", () => {
    expect(typeof collectLabelData).toBe("function");
  });
});

describe("analyze-compare-case/output", () => {
  const report = {
    case: "demo",
    frame_summary: ["frame:frame -> dx=0.00px dy=0.00px dw=0.00px dh=0.00px"],
    header_summary: ["header:header -> dx=0.00px dy=0.00px dw=0.00px dh=0.00px line_dy=0.00px"],
    title_summary: ["title:title:Demo -> D: dx=0.00px dy=0.00px"],
    summary: ["label:message:ok -> A: dx=0.00px dy=0.00px"],
    number_summary: ["number:message:1 -> 1: dx=0.00px dy=0.00px"],
    arrow_summary: ["arrow:1 -> left_dx=0.00px right_dx=0.00px width_dx=0.00px"],
    participant_label_summary: ["participant-label:participant:User -> U: dx=0.00px dy=0.00px"],
    participant_stereotype_summary: ["participant-stereotype:participant-stereotype:«BFF» -> B: dx=0.00px dy=0.00px"],
    participant_icon_summary: ["icon:User -> icon_dx=0.00px icon_dy=0.00px relative_dx=0.00px relative_dy=0.00px"],
    participant_box_summary: ["participant-box:User -> dx=0.00px dy=0.00px dw=0.00px dh=0.00px"],
    participant_color_summary: ["participant-color:User -> bg(html=#fff svg=#fff) text(html=#222 svg=#222) stereotype(html=#222 svg=#222)"],
    comment_summary: ["comment:comment:// note -> n: dx=0.00px dy=0.00px"],
    participant_group_summary: ["participant-group:Services -> dx=0.00px dy=0.00px dw=0.00px dh=0.00px name_dx=0.00px name_dy=0.00px"],
    residual_scope_summary: ["html-only:3px @ (1.0,2.0) -> html=label:A svg=label:A"],
  };

  it("writes only summary lines in summary-only mode", () => {
    const stdout = makeStdout();
    writeReportOutput(stdout, report, { summaryOnly: true, jsonOnly: false });

    expect(stdout.chunks.join("")).toContain("label:message:ok");
    expect(stdout.chunks.join("")).toContain("frame:frame");
    expect(stdout.chunks.join("")).not.toContain("\"case\"");
  });

  it("writes only json in json mode", () => {
    const stdout = makeStdout();
    writeReportOutput(stdout, report, { summaryOnly: false, jsonOnly: true });

    const output = stdout.chunks.join("");
    expect(output).toContain("\"case\": \"demo\"");
    expect(() => JSON.parse(output)).not.toThrow();
    expect(output).not.toContain("\n\nlabel:message:ok");
  });
});
