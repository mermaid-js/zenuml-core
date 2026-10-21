import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runChecks } from "../../scripts/check-zu-tokens.mjs";

const css = readFileSync(join(__dirname, "../../src/assets/tailwind.css"), "utf8");

// The token set P1 promises (docs/ux-research/2026-10-19-open-claude-ui-v2-assessment.md, P1).
const REQUIRED: Record<string, string> = {
  "--zu-dur-fast": "60ms",
  "--zu-dur-snap": "120ms",
  "--zu-dur-base": "200ms",
  "--zu-dur-sheet": "300ms",
  "--zu-dur-slow": "450ms",
  "--zu-ease-out": "cubic-bezier(0.165, 0.84, 0.44, 1)",
  "--zu-ease-snap": "cubic-bezier(0.32, 0.72, 0, 1)",
  "--zu-ease-overshoot": "cubic-bezier(0.34, 1.3, 0.64, 1)",
  "--zu-ease-standard": "cubic-bezier(0.4, 0, 0.2, 1)",
  "--zu-radius-xs": "2px",
  "--zu-radius-sm": "4px",
  "--zu-radius-md": "6px",
  "--zu-radius-lg": "8px",
  "--zu-radius-panel": "10px",
  "--zu-radius-dialog": "16px",
  "--zu-h-control": "24px",
  "--zu-h-control-nested": "18px",
  "--zu-ring-hairline": "1px",
};

describe("--zu-* chrome tokens (ADR 0003)", () => {
  it("declares every P1 token with its documented value", () => {
    for (const [name, value] of Object.entries(REQUIRED)) {
      const re = new RegExp(`${name.replace(/[-]/g, "\\-")}:\\s*${value.replace(/[().,]/g, "\\$&")};`);
      expect(css, `${name}: ${value}`).toMatch(re);
    }
  });

  it("declares the 15-point spring easing exactly", () => {
    expect(css).toContain(
      "--zu-ease-spring: linear(0, 0.2459, 0.6526, 0.9468, 1.0764, 1.0915, 1.0585, 1.0219, 0.9993, 0.9914, 0.9921, 0.9957, 0.9988, 1.0004, 1);",
    );
  });

  it("declares the focus ring and host reduce-motion tokens", () => {
    expect(css).toMatch(/--zu-focus-ring:\s*0 0 0 1px var\(--zu-page\)/);
    expect(css).toMatch(/--zu-ring-focus:\s*#475569;/);
    expect(css).toMatch(/\[data-reduce-motion="true"\] \.zenuml/);
  });

  it("never declares a token on :root", () => {
    const rootBlocks = css.match(/:root\s*\{[^}]*\}/g) ?? [];
    for (const block of rootBlocks) expect(block).not.toMatch(/--zu-/);
  });

  it("passes the token and one-off gates", () => {
    expect(runChecks()).toEqual([]);
  });
});
