/*
 * What this file does:
 * Owns the analyzer's command-line contract and default runtime settings.
 *
 * High-level flow:
 * - Defines the default case, base URL, diff tolerances, and viewport.
 * - Parses CLI flags into a normalized options object used by the entrypoint.
 * - Keeps argument handling separate so it can be tested without Playwright.
 *
 * Example input:
 * `["--case", "async-2a", "--user-data-dir", "/Users/pengxiao/Library/Application Support/Google/Chrome", "--profile-directory", "Profile 8", "--json"]`
 *
 * Example output:
 * `{ caseName: "async-2a", userDataDir: "/Users/.../Chrome", profileDirectory: "Profile 8", jsonOnly: true, ... }`
 */
export const DEFAULTS = {
  caseName: "async-2a",
  baseUrl: "http://localhost:4000",
  lumaThreshold: 240,
  channelTolerance: 12,
  positionTolerance: 0,
  viewport: { width: 1600, height: 2200 },
  userDataDir: process.env.PLAYWRIGHT_USER_DATA_DIR || null,
  profileDirectory: process.env.PLAYWRIGHT_PROFILE_DIRECTORY || null,
  browserChannel: process.env.PLAYWRIGHT_CHANNEL || null,
  headless: process.env.PLAYWRIGHT_HEADLESS === "1",
};

export function parseArgs(argv) {
  const args = { ...DEFAULTS, jsonOnly: false, summaryOnly: false, outputDir: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if ((arg === "--case" || arg === "-c") && next) {
      args.caseName = next;
      i++;
      continue;
    }
    if ((arg === "--base-url" || arg === "-b") && next) {
      args.baseUrl = next;
      i++;
      continue;
    }
    if (arg === "--user-data-dir" && next) {
      args.userDataDir = next;
      i++;
      continue;
    }
    if (arg === "--profile-directory" && next) {
      args.profileDirectory = next;
      i++;
      continue;
    }
    if (arg === "--channel" && next) {
      args.browserChannel = next;
      i++;
      continue;
    }
    if (arg === "--json") {
      args.jsonOnly = true;
      continue;
    }
    if (arg === "--summary-only") {
      args.summaryOnly = true;
      continue;
    }
    if (arg === "--output-dir" && next) {
      args.outputDir = next;
      i++;
      continue;
    }
    if (arg === "--luma" && next) {
      args.lumaThreshold = Number(next);
      i++;
      continue;
    }
    if (arg === "--ctol" && next) {
      args.channelTolerance = Number(next);
      i++;
      continue;
    }
    if (arg === "--ptol" && next) {
      args.positionTolerance = Number(next);
      i++;
      continue;
    }
    if (arg === "--headed") {
      args.headless = false;
      continue;
    }
    if (arg === "--headless") {
      args.headless = true;
      continue;
    }
    if (!arg.startsWith("-") && args.caseName === DEFAULTS.caseName) {
      args.caseName = arg;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}
