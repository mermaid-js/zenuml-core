#!/usr/bin/env node
// Checks that each public @zenuml/core entry runs the npm latest version.
//
// Usage: node scripts/check-surfaces.mjs [--attempts 3] [--wait-seconds 60]
//          [--report report.md] [--add-script name=url]
//
// Exit codes: 0 all current, 1 an entry failed, 2 the check itself could not run.

import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "@playwright/test";
import {
  evaluateSurfaces,
  exitCodeFor,
  parseArgs,
  renderReport,
  SURFACES,
} from "./check-surfaces/core.mjs";

const REGISTRY_URL = "https://registry.npmjs.org/@zenuml%2fcore/latest";
const PROBE_ORIGIN = "https://probe.test";
const READ_TIMEOUT_MS = 30_000;

// Entries expose the library as the UMD global or as an app instance.
function readVersion() {
  const umd = window.zenuml;
  return umd?.default?.version ?? window.zenUml?.constructor?.version ?? null;
}

async function fetchLatest() {
  const response = await fetch(REGISTRY_URL, {
    headers: { "cache-control": "no-cache" },
  });
  if (!response.ok) throw new Error(`npm registry returned ${response.status}`);
  return (await response.json()).version;
}

async function readSurface(browser, surface) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    if (surface.url) {
      await page.goto(surface.url, {
        waitUntil: "load",
        timeout: READ_TIMEOUT_MS,
      });
    } else {
      await page.route(`${PROBE_ORIGIN}/**`, (route) =>
        route.fulfill({
          contentType: "text/html",
          body: "<!doctype html><body>",
        }),
      );
      await page.goto(`${PROBE_ORIGIN}/`);
      await page.addScriptTag({ url: surface.script });
    }
    const handle = await page.waitForFunction(readVersion, null, {
      timeout: READ_TIMEOUT_MS,
    });
    return { name: surface.name, runs: await handle.jsonValue() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      name: surface.name,
      runs: null,
      error: message.split("\n")[0].slice(0, 120),
    };
  } finally {
    await context.close();
  }
}

// Each attempt reads only the entries that failed the last one, so a new
// release can reach the CDNs without failing the check.
async function checkSurfaces(browser, surfaces, latest, options) {
  const rows = new Map();
  let pending = surfaces;
  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    if (attempt > 1) await sleep(options.waitSeconds * 1000);
    const readings = [];
    for (const surface of pending) {
      readings.push(await readSurface(browser, surface));
    }
    for (const row of evaluateSurfaces(readings, latest)) {
      rows.set(row.name, row);
    }
    pending = pending.filter((s) => rows.get(s.name).result === "FAIL");
    if (pending.length === 0) break;
  }
  return surfaces.map((surface) => rows.get(surface.name));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const latest = await fetchLatest();
  const browser = await chromium.launch();
  try {
    const rows = await checkSurfaces(
      browser,
      [...SURFACES, ...options.extraScripts],
      latest,
      options,
    );
    const report = renderReport(rows, latest);
    console.log(report);
    if (options.report) writeFileSync(options.report, report);
    return exitCodeFor(rows);
  } finally {
    await browser.close();
  }
}

try {
  process.exitCode = await main();
} catch (error) {
  console.error(
    `check-surfaces: ${error instanceof Error ? error.message : error}`,
  );
  process.exitCode = 2;
}
