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
  const compareUrl = `${args.baseUrl.replace(/\/$/, "")}/e2e/tools/compare-case.html?case=${encodeURIComponent(args.caseName)}`;
  const chromiumArgs = args.profileDirectory
    ? [`--profile-directory=${args.profileDirectory}`]
    : [];
  const launchOptions = {
    channel: args.browserChannel || undefined,
    headless: args.headless,
    viewport: args.viewport,
    deviceScaleFactor: 2,
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
    deviceScaleFactor: 2,
  });
  const page = persistentContext
    ? context.pages()[0] || await context.newPage()
    : await context.newPage();

  try {
    await page.goto(compareUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("#html-output .interaction, #html-output .frame, #html-output .sequence-diagram");
    await page.waitForSelector("#svg-output svg");

    const extracted = await collectLabelData(page);

    // Use CDP screenshots to match native-diff-ext (source of truth).
    // The extension uses DOM.getBoxModel border-box + Page.captureScreenshot
    // with clip and scale:1. Playwright's locator.screenshot() differs subtly
    // in how it clips elements, so we replicate the extension's exact logic.
    const cdpSession = await page.context().newCDPSession(page);
    async function cdpScreenshotElement(selector) {
      const { root } = await cdpSession.send("DOM.getDocument", {});
      const { nodeId } = await cdpSession.send("DOM.querySelector", {
        nodeId: root.nodeId,
        selector,
      });
      if (!nodeId) throw new Error(`Element not found: ${selector}`);
      const { model } = await cdpSession.send("DOM.getBoxModel", { nodeId });
      const border = model.border;
      const x = border[0];
      const y = border[1];
      const width = Math.ceil(border[2] - border[0]);
      const height = Math.ceil(border[5] - border[1]);
      const { data } = await cdpSession.send("Page.captureScreenshot", {
        format: "png",
        clip: { x, y, width, height, scale: 1 },
        captureBeyondViewport: true,
      });
      return Buffer.from(data, "base64");
    }

    const htmlBuffer = await cdpScreenshotElement(extracted.htmlRootSelector);
    const svgBuffer = await cdpScreenshotElement(extracted.svgRootSelector);
    await cdpSession.detach();

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
