#!/usr/bin/env node

/*
 * What this file does:
 * Runs the compare-case analyzer end to end from the command line.
 *
 * High-level flow:
 * 1. Parse CLI flags such as case name and diff tolerances.
 * 2. Open compare-case.html in Playwright.
 * 3. Extract semantic geometry from the live HTML and SVG renderers.
 * 4. Capture native screenshots of both sides and build the analyzer's local diff.
 * 5. Build a structured report and optionally write artifacts to disk.
 * 6. Print either JSON, summaries, or both.
 *
 * This file is intentionally thin. The detailed work lives in focused modules:
 * config, browser extraction, diffing, scoring, residual attribution, and output.
 *
 * Example input:
 * `node scripts/analyze-compare-case.mjs --case async-2a --user-data-dir "/Users/pengxiao/Library/Application Support/Google/Chrome" --profile-directory "Profile 8" --channel chrome --headed --json`
 *
 * Example output:
 * A report object printed as JSON, with top-level sections such as `labels`,
 * `numbers`, `arrows`, `participant_labels`, `participant_icons`,
 * `participant_boxes`, `residual_scopes`, `diff`, and `capture`.
 */

import process from "node:process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";

import { parseArgs } from "./analyze-compare-case/config.mjs";
import { collectLabelData } from "./analyze-compare-case/collect-data.mjs";
import { maybeWriteArtifacts, writeReportOutput } from "./analyze-compare-case/output.mjs";
import { renderAndReadDiffPanel } from "./analyze-compare-case/panel-diff.mjs";
import { buildReport } from "./analyze-compare-case/report.mjs";

export async function main(argv = process.argv.slice(2), stdout = process.stdout) {
  const args = parseArgs(argv);
  if (args.profileDirectory && !args.userDataDir) {
    throw new Error("--profile-directory requires --user-data-dir");
  }
  const compareUrl = `${args.baseUrl.replace(/\/$/, "")}/cy/compare-case.html?case=${encodeURIComponent(args.caseName)}`;
  const chromiumArgs = args.profileDirectory
    ? [`--profile-directory=${args.profileDirectory}`]
    : [];
  const launchOptions = {
    channel: args.browserChannel || undefined,
    headless: args.headless,
    viewport: args.viewport,
    deviceScaleFactor: 1,
    args: chromiumArgs,
  };
  const persistentContext = args.userDataDir
    ? await chromium.launchPersistentContext(args.userDataDir, launchOptions)
    : null;
  const browser = persistentContext ? null : await chromium.launch({
    channel: args.browserChannel || undefined,
    headless: args.headless,
    args: chromiumArgs,
  });
  const context = persistentContext || await browser.newContext({
    viewport: args.viewport,
    deviceScaleFactor: 1,
  });
  const page = persistentContext
    ? context.pages()[0] || await context.newPage()
    : await context.newPage();

  try {
    await page.goto(compareUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("#html-output .interaction, #html-output .frame, #html-output .sequence-diagram");
    await page.waitForSelector("#svg-output svg");

    const extracted = await collectLabelData(page);
    const htmlLocator = page.locator(extracted.htmlRootSelector);
    const svgLocator = page.locator(extracted.svgRootSelector);
    const [htmlBuffer, svgBuffer] = await Promise.all([
      htmlLocator.screenshot({ type: "png", animations: "disabled" }),
      svgLocator.screenshot({ type: "png", animations: "disabled" }),
    ]);
    await page.evaluate(() => {
      if (typeof window.restoreHtmlAfterCapture === "function") {
        window.restoreHtmlAfterCapture();
      }
    });

    const diffImage = await renderAndReadDiffPanel(page, htmlBuffer, svgBuffer);
    const report = buildReport(extracted.caseName || args.caseName, extracted, diffImage);
    report.diff = diffImage.stats;
    report.capture = {
      url: compareUrl,
      html_root: extracted.htmlRoot,
      svg_root: extracted.svgRoot,
      diff_badge: diffImage.badgeText,
      panel_stats: diffImage.panelStats,
    };

    const artifactPaths = await maybeWriteArtifacts(args.outputDir, htmlBuffer, svgBuffer, diffImage, report);
    if (artifactPaths) {
      report.artifacts = artifactPaths;
    }

    writeReportOutput(stdout, report, args);
    return report;
  } finally {
    await context.close();
    if (browser) {
      await browser.close();
    }
  }
}

const isDirectRun = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
  : false;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
}
