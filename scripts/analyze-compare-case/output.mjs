/*
 * What this file does:
 * Handles the analyzer's side effects after the report has been built.
 *
 * High-level flow:
 * - Optionally writes screenshot and diff artifacts plus report.json to disk.
 * - Renders report output in one of three modes: summary-only, JSON-only, or both.
 * - Keeps file IO and stdout formatting out of the entrypoint and scoring logic.
 *
 * Example input:
 * A finished report object, screenshot buffers, diff data, and CLI mode flags.
 *
 * Example output:
 * Either files on disk like `html.png`, `svg.png`, `diff.png`, `report.json`,
 * or text written to stdout in JSON-only, summary-only, or mixed mode.
 */
import fs from "node:fs/promises";
import path from "node:path";

import { buildPngBuffer } from "./native-diff.mjs";

export async function maybeWriteArtifacts(outputDir, htmlBuffer, svgBuffer, diffImage, report) {
  if (!outputDir) {
    return null;
  }

  await fs.mkdir(outputDir, { recursive: true });
  const paths = {
    html: path.join(outputDir, "html.png"),
    svg: path.join(outputDir, "svg.png"),
    diff: path.join(outputDir, "diff.png"),
    report: path.join(outputDir, "report.json"),
  };

  await Promise.all([
    fs.writeFile(paths.html, htmlBuffer),
    fs.writeFile(paths.svg, svgBuffer),
    fs.writeFile(paths.diff, buildPngBuffer(diffImage.width, diffImage.height, diffImage.diffData)),
    fs.writeFile(paths.report, JSON.stringify(report, null, 2)),
  ]);

  return paths;
}

export function writeReportOutput(stdout, report, options) {
  const summaryBlock = [
    report.summary,
    report.number_summary,
    report.arrow_summary,
    report.participant_label_summary,
    report.participant_stereotype_summary,
    report.participant_icon_summary,
    report.participant_box_summary,
    report.participant_color_summary,
    report.comment_summary,
    report.participant_group_summary,
    report.residual_scope_summary,
  ].flat().join("\n");

  if (options.summaryOnly) {
    stdout.write(`${summaryBlock}\n`);
    return;
  }

  if (!options.jsonOnly) {
    stdout.write(`${JSON.stringify(report, null, 2)}\n\n`);
    stdout.write(`${summaryBlock}\n`);
    return;
  }

  stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
