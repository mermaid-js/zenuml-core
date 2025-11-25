import { test as base } from "@playwright/test";

export type VerticalMode = "server" | "browser";

/**
 * Resolves the vertical mode from environment variable.
 * Use VERTICAL_MODE=browser to force browser-side measurements.
 * Default is "server" for deterministic server-side calculations.
 */
function resolveVerticalMode(): VerticalMode {
  const mode = process.env.VERTICAL_MODE;
  if (mode === "browser") return "browser";
  return "server";
}

/**
 * Extended test fixture that automatically injects vertical mode before each test.
 * The mode is controlled by the VERTICAL_MODE environment variable:
 *   - VERTICAL_MODE=browser: Use browser-side DOM measurements
 *   - VERTICAL_MODE=server (default): Use server-side calculations
 *
 * Usage:
 *   import { test, expect } from "./fixtures";
 *   // or
 *   import { test, expect } from "../fixtures";
 *
 *   test("my test", async ({ page }) => {
 *     await page.goto("/...");
 *   });
 */
export const test = base.extend({
  page: async ({ page }, uses) => {
    const mode = resolveVerticalMode();
    await page.addInitScript((injectedMode) => {
      (window as any).__ZEN_VERTICAL_MODE = injectedMode;
    }, mode);
    await uses(page);
  },
});

export { expect } from "@playwright/test";
