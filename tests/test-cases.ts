// Re-export compare-cases with type safety for use in spec files.
// compare-cases.js is the single source of truth for all DSL test data.

import { CASES } from "../e2e/data/compare-cases.js";

export const TEST_CASES: Record<string, string> = CASES;

/**
 * Subset of cases used by the HTML renderer visual regression tests.
 * Each entry maps to a fixture.html?case=<key> URL.
 */
export const HTML_VISUAL_CASES: { name: string; threshold?: number }[] = [
  // Smoke / basics
  { name: "smoke", threshold: 0.012 },
  { name: "creation" },
  { name: "creation-rtl" },
  { name: "defect-406" },

  // Fragments
  { name: "fragment" },
  { name: "fragment-issue" },
  { name: "if-fragment" },
  { name: "fragments-return" },

  // Interactions
  { name: "interaction" },
  { name: "nested-fragment" },
  { name: "nested-outbound" },

  // Async messages
  { name: "async-1" },
  { name: "async-2" },
  { name: "async-3" },

  // Returns
  { name: "return" },
  { name: "return-in-nested-if" },

  // Self-calls
  { name: "self-sync" },

  // Named parameters
  { name: "named-params" },

  // Vertical layout
  { name: "vertical-1" },
  { name: "vertical-2" },
  { name: "vertical-3" },
  { name: "vertical-4" },
  { name: "vertical-5" },
  { name: "vertical-6" },
  { name: "vertical-7" },
  { name: "vertical-8" },
  { name: "vertical-9" },
  { name: "vertical-10" },
  { name: "vertical-11" },

  // Demos
  { name: "demo1-smoke" },
  { name: "demo3-nested-fragments" },
  { name: "demo4-fragment-span" },
];

/**
 * Subset of cases used by the SVG parity visual regression tests.
 * Each entry renders through renderToSvg() on svg-test.html.
 */
export const SVG_PARITY_CASES: string[] = [
  "smoke",
  "creation",
  "creation-rtl",
  "defect-406",
  "fragment",
  "fragment-issue",
  "if-fragment",
  "fragments-return",
  "interaction",
  "async-1",
  "async-2",
  "async-3",
  "return",
  "self-sync",
  "nested-fragment",
  "nested-outbound",
  "named-params",
  "vertical-1",
  "vertical-2",
  "vertical-3",
  "vertical-4",
  "vertical-5",
  "vertical-6",
  "vertical-7",
  "vertical-8",
  "vertical-9",
  "vertical-10",
  "vertical-11",
  "demo1-smoke",
  "demo3-nested-fragments",
  "demo4-fragment-span",
  "demo5-self-named",
  "demo6-async-styled",
];

/**
 * Default screenshot threshold for visual tests.
 */
export const DEFAULT_THRESHOLD = 0.02;
