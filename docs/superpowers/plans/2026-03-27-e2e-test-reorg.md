# E2E Test Reorganization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate massive duplication in E2E tests by consolidating DSL data into a single source of truth, making repetitive tests data-driven, and organizing tests into logical subdirectories.

**Architecture:** Replace 37 near-identical HTML fixture files with a single parameterized template (`e2e/fixtures/fixture.html`) that reads DSL from a query parameter or shared data module. Consolidate all DSL test data into `e2e/data/compare-cases.js` (already exists, already has ~50 cases). Convert repetitive spec files (vertical, creation, fragment, etc.) into data-driven loops like `svg-parity.spec.ts` already does. Group spec files into subdirectories by test type.

**Tech Stack:** Playwright, TypeScript, Vite dev server, existing `cy/` HTML infrastructure

---

## Current State Analysis

### Problems

1. **37 near-identical HTML files** — Each `e2e/**/*.html` is the same boilerplate with different DSL in a `<pre>` tag. Example: `vertical-1.html` through `vertical-11.html` differ only by 2-3 lines of DSL code.

2. **DSL duplicated 3 times** — The same diagram code exists in:
   - `e2e/**/*.html` files (for HTML renderer tests)
   - `svg-parity.spec.ts` inline array (for SVG parity tests)
   - `e2e/data/compare-cases.js` (for the compare-case viewer)

3. **Copy-paste spec files** — `vertical.spec.ts` has 11 identical test blocks differing only by number. `creation.spec.ts`, `fragment.spec.ts`, `return.spec.ts`, etc. are all the same 15-line pattern.

4. **Flat directory** — All 21 spec files sit in `tests/` with no grouping. Visual regression tests, interaction tests, and parity tests are mixed together.

5. **Inconsistent `describe` names** — "Smoke test", "Rendering", "SVG Parity Tests" — no convention.

### What Works Well (Keep)

- `svg-parity.spec.ts` — already data-driven with an inline array. Good pattern to extend.
- `fixtures.ts` — clean custom fixture with console logging. Keep as-is.
- `compare-cases.js` — central case registry. Promote to single source of truth.
- `editable-label.spec.ts`, `editable-span-escape.spec.ts` — interaction tests with unique logic. These stay as individual files.
- `width-provider-comparison.spec.ts` — measurement test with unique logic. Stays as-is.

## Target State

```
tests/
├── fixtures.ts                          # Shared fixture (unchanged)
├── test-cases.ts                        # Re-exports from e2e/data/compare-cases.js with types
├── visual/
│   ├── html-rendering.spec.ts           # Data-driven: all HTML renderer screenshot tests
│   └── svg-parity.spec.ts              # Data-driven: all SVG renderer screenshot tests (exists, move)
├── interaction/
│   ├── editable-label.spec.ts          # Keep as-is (move)
│   └── editable-span-escape.spec.ts    # Keep as-is (move)
├── regression/
│   └── defect-406.spec.ts             # Keep as-is (move)
├── measurement/
│   └── width-provider-comparison.spec.ts  # Keep as-is (move)
└── *.spec.ts-snapshots/                # Snapshot dirs (Playwright manages these)

cy/
├── fixture.html                         # Single parameterized HTML template
├── compare-cases.js                     # Single source of truth for ALL DSL cases
├── compare-case.html                    # Keep (compare viewer)
├── compare.html                         # Keep (index page)
├── svg-test.html                        # Keep (SVG render harness)
├── editable-span-test.html             # Keep (interaction test page)
├── smoke-editable-label.html           # Keep (interaction test page)
├── element-report.html                  # Keep (dev tool)
├── parity-test.html                     # Keep (dev tool)
├── legacy-vs-html.html                 # Keep (dev tool)
├── canonical-history.html              # Keep (dev tool)
├── svg-preview.html                    # Keep (dev tool)
├── icons-test.html                     # Keep (dev tool)
├── theme-default-test.html             # Keep (dev tool)
└── diff-algorithm.js                    # Keep (utility)
```

**Deleted** (replaced by `fixture.html`): `smoke.html`, `smoke-creation.html`, `smoke-fragment.html`, `smoke-fragment-issue.html`, `smoke-interaction.html`, `creation-rtl.html`, `defect-406-alt-under-creation.html`, `fragment.html`, `fragments-with-return.html`, `if-fragment.html`, `return.html`, `self-sync-message-at-root.html`, `named-parameters.html`, `nested-interaction-with-fragment.html`, `nested-interaction-with-outbound.html`, `vertical-1.html` through `vertical-11.html`, `async-message-1.html` through `async-message-3.html`, `demo1.html`, `demo3.html`, `demo4.html`, `return-in-nested-if.html`.

**Deleted spec files** (merged into `html-rendering.spec.ts`): `smoke.spec.ts`, `creation.spec.ts`, `creation-rtl.spec.ts`, `fragment.spec.ts`, `fragments-with-return.spec.ts`, `if-fragment.spec.ts`, `interaction.spec.ts`, `nested-interactions.spec.ts`, `named-parameters.spec.ts`, `return.spec.ts`, `return-in-nested-if.spec.ts`, `self-sync-message-at-root.spec.ts`, `vertical.spec.ts`, `async-message.spec.ts`, `demo.spec.ts`, `style-panel.spec.ts`.

---

### Task 1: Create parameterized HTML fixture template

**Files:**
- Create: `e2e/fixtures/fixture.html`
- Reference: `cy/smoke.html` (pattern to generalize)

The new template reads a `?case=<name>` query parameter and looks up the DSL from the `compare-cases.js` registry.

- [ ] **Step 1: Create `e2e/fixtures/fixture.html`**

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>ZenUML Test Fixture</title>
    <style>
      body {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div id="diagram" class="diagram">
      <pre class="zenuml" style="margin: 0" id="zenuml-code"></pre>
    </div>
    <script type="module">
      import { CASES } from "./compare-cases.js";
      const params = new URLSearchParams(window.location.search);
      const caseName = params.get("case");
      if (caseName && CASES[caseName]) {
        document.getElementById("zenuml-code").textContent = CASES[caseName];
      } else {
        document.getElementById("zenuml-code").textContent =
          "// Case not found: " + caseName;
      }
    </script>
    <script type="module" src="/src/main-cy.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify the template loads correctly**

Start the dev server (`bun dev`) and open `http://localhost:8080/cy/fixture.html?case=smoke` in a browser. Verify the diagram renders identically to `http://localhost:8080/cy/smoke.html`.

- [ ] **Step 3: Commit**

```bash
git add cy/fixture.html
git commit -m "Add parameterized HTML fixture template for E2E tests"
```

---

### Task 2: Ensure all current HTML fixture DSL is in compare-cases.js

**Files:**
- Modify: `e2e/data/compare-cases.js`
- Reference: All `e2e/**/*.html` files (to extract DSL)

Some HTML fixture files have DSL that isn't in `compare-cases.js`. We need to add any missing cases.

- [ ] **Step 1: Audit missing cases**

Write a script or manually compare. The following cases from HTML fixtures must exist in `compare-cases.js`:

Check these exist (by name): `smoke`, `creation` (from `smoke-creation.html`), `creation-rtl`, `defect-406` (from `defect-406-alt-under-creation.html`), `fragment` (from `smoke-fragment.html`), `fragment-issue` (from `smoke-fragment-issue.html`), `if-fragment`, `fragments-return` (from `fragments-with-return.html`), `interaction` (from `smoke-interaction.html`), `async-1`, `async-2`, `async-3`, `return`, `self-sync` (from `self-sync-message-at-root.html`), `named-params` (from `named-parameters.html`), `nested-fragment` (from `nested-interaction-with-fragment.html`), `nested-outbound` (from `nested-interaction-with-outbound.html`), `vertical-1` through `vertical-11`, `demo1-smoke` (from `demo1.html`), `demo3-nested-fragments` (from `demo3.html`), `demo4-fragment-span` (from `demo4.html`), `return-in-nested-if`, `style-panel` (from `smoke-fragment.html` used by `style-panel.spec.ts`).

- [ ] **Step 2: Add any missing cases to `compare-cases.js`**

Extract the DSL from each HTML file's `<pre class="zenuml">` block. Add to the `CASES` object using the same name used in `svg-parity.spec.ts` where possible (for consistency).

For each missing case, add it in the appropriate category section with a comment:

```javascript
// --- Category ---
"case-name": `DSL code here`,
```

- [ ] **Step 3: Verify fixture.html works for all added cases**

Spot-check 3-4 newly added cases by loading `fixture.html?case=<name>` and comparing to the original HTML file.

- [ ] **Step 4: Commit**

```bash
git add e2e/data/compare-cases.js
git commit -m "Add all HTML fixture DSL cases to compare-cases.js"
```

---

### Task 3: Create typed test-cases module

**Files:**
- Create: `tests/test-cases.ts`

A thin TypeScript wrapper that imports from `compare-cases.js` and provides typed access for spec files.

- [ ] **Step 1: Create `tests/test-cases.ts`**

```typescript
// Re-export compare-cases with type safety for use in spec files.
// compare-cases.js is the single source of truth for all DSL test data.

// @ts-expect-error — JS module without types
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
 * Default screenshot threshold for visual tests.
 */
export const DEFAULT_THRESHOLD = 0.02;
```

- [ ] **Step 2: Verify import works**

```bash
cd /Users/pengxiao/workspaces/zenuml/native-svg-renderer/zenuml-core
bun -e "import { TEST_CASES, HTML_VISUAL_CASES } from './tests/test-cases.ts'; console.log(Object.keys(TEST_CASES).length, 'cases'); console.log(HTML_VISUAL_CASES.length, 'html visual cases')"
```

Expected: prints case counts without errors.

- [ ] **Step 3: Commit**

```bash
git add tests/test-cases.ts
git commit -m "Add typed test-cases module wrapping compare-cases.js"
```

---

### Task 4: Create directory structure and move unique test files

**Files:**
- Create dirs: `tests/visual/`, `tests/interaction/`, `tests/regression/`, `tests/measurement/`
- Move: `tests/editable-label.spec.ts` → `tests/interaction/editable-label.spec.ts`
- Move: `tests/editable-span-escape.spec.ts` → `tests/interaction/editable-span-escape.spec.ts`
- Move: `tests/defect-406.spec.ts` → `tests/regression/defect-406.spec.ts`
- Move: `tests/width-provider-comparison.spec.ts` → `tests/measurement/width-provider-comparison.spec.ts`
- Move: `tests/svg-parity.spec.ts` → `tests/visual/svg-parity.spec.ts`
- Modify: `playwright.config.ts` (update testDir if needed)

- [ ] **Step 1: Create directories**

```bash
mkdir -p tests/visual tests/interaction tests/regression tests/measurement
```

- [ ] **Step 2: Move unique test files**

```bash
git mv tests/editable-label.spec.ts tests/interaction/editable-label.spec.ts
git mv tests/editable-span-escape.spec.ts tests/interaction/editable-span-escape.spec.ts
git mv tests/defect-406.spec.ts tests/regression/defect-406.spec.ts
git mv tests/width-provider-comparison.spec.ts tests/measurement/width-provider-comparison.spec.ts
git mv tests/svg-parity.spec.ts tests/visual/svg-parity.spec.ts
```

- [ ] **Step 3: Update fixture imports in moved files**

Each moved file imports from `./fixtures`. Update to `../fixtures`:

In `tests/interaction/editable-label.spec.ts`:
```typescript
import { test, expect } from "../fixtures";
```

In `tests/interaction/editable-span-escape.spec.ts`:
```typescript
import { test, expect } from "../fixtures";
```

In `tests/regression/defect-406.spec.ts`:
```typescript
import { test, expect } from "../fixtures";
```

In `tests/measurement/width-provider-comparison.spec.ts`:
```typescript
import { test, expect } from "../fixtures";
```

In `tests/visual/svg-parity.spec.ts`:
```typescript
import { test, expect } from "../fixtures";
```

- [ ] **Step 4: Move snapshot directories alongside their spec files**

```bash
# Move snapshot dirs to match new spec locations
git mv tests/editable-label.spec.ts-snapshots tests/interaction/editable-label.spec.ts-snapshots
git mv tests/defect-406.spec.ts-snapshots tests/regression/defect-406.spec.ts-snapshots
git mv tests/svg-parity.spec.ts-snapshots tests/visual/svg-parity.spec.ts-snapshots
```

Note: `editable-span-escape.spec.ts` and `width-provider-comparison.spec.ts` don't have snapshot dirs (they don't use `toHaveScreenshot`).

- [ ] **Step 5: Verify Playwright finds all tests**

```bash
bun pw --list
```

Expected: All moved tests appear with their new paths. The `testDir: "./tests"` in `playwright.config.ts` already recurses into subdirectories by default, so no config change needed.

- [ ] **Step 6: Run the moved tests to verify snapshots still match**

```bash
bun pw tests/interaction/ tests/regression/ tests/measurement/ tests/visual/svg-parity.spec.ts
```

Expected: All pass (snapshots found in new locations).

- [ ] **Step 7: Commit**

```bash
git add -A tests/
git commit -m "Organize E2E tests into subdirectories by type"
```

---

### Task 5: Create data-driven HTML rendering test

**Files:**
- Create: `tests/visual/html-rendering.spec.ts`

This single file replaces 16 separate spec files by iterating over `HTML_VISUAL_CASES`.

- [ ] **Step 1: Create `tests/visual/html-rendering.spec.ts`**

```typescript
import { test, expect } from "../fixtures";
import { HTML_VISUAL_CASES, DEFAULT_THRESHOLD } from "../test-cases";

test.describe("HTML Rendering", () => {
  for (const { name, threshold } of HTML_VISUAL_CASES) {
    test(name, async ({ page }) => {
      await page.goto(`/cy/fixture.html?case=${name}`);

      // Wait for diagram to render
      await expect(page.locator(".privacy>span>svg")).toBeVisible({
        timeout: 5000,
      });

      await expect(page).toHaveScreenshot(`${name}.png`, {
        threshold: threshold ?? DEFAULT_THRESHOLD,
        fullPage: true,
      });
    });
  }
});
```

- [ ] **Step 2: Run the new test to generate initial snapshots**

```bash
bun pw tests/visual/html-rendering.spec.ts --update-snapshots
```

Expected: All cases generate snapshots. Verify a few match the old snapshots visually.

- [ ] **Step 3: Run without --update-snapshots to verify stability**

```bash
bun pw tests/visual/html-rendering.spec.ts
```

Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add tests/visual/html-rendering.spec.ts tests/visual/html-rendering.spec.ts-snapshots/
git commit -m "Add data-driven HTML rendering visual test"
```

---

### Task 6: Refactor svg-parity.spec.ts to use shared test data

**Files:**
- Modify: `tests/visual/svg-parity.spec.ts`

Remove the 540-line inline `SVG_PARITY_CASES` array and replace with imports from `test-cases.ts`. The SVG parity test uses the same case names but renders through `renderToSvg()` instead of the HTML renderer.

- [ ] **Step 1: Add SVG parity case list to `tests/test-cases.ts`**

Add after `HTML_VISUAL_CASES`:

```typescript
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
```

- [ ] **Step 2: Rewrite `tests/visual/svg-parity.spec.ts`**

```typescript
import { test, expect } from "../fixtures";
import { TEST_CASES, SVG_PARITY_CASES } from "../test-cases";

/**
 * SVG Parity Tests
 *
 * Renders every visual test fixture through renderToSvg() and captures
 * screenshot baselines. These verify structural/layout parity with the
 * React/HTML renderer — same elements, positions, and reading order.
 */
test.describe("SVG Parity Tests", () => {
  for (const name of SVG_PARITY_CASES) {
    test(`svg-${name}`, async ({ page }) => {
      const code = TEST_CASES[name];
      if (!code) throw new Error(`Missing test case: ${name}`);

      await page.goto("/cy/svg-test.html");
      await page.evaluate((c) => (window as any).__renderSvg(c), code);
      await expect(page.locator("#svg-output > svg")).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveScreenshot(`svg-${name}.png`, {
        threshold: 0.02,
        fullPage: true,
      });
    });
  }
});
```

- [ ] **Step 3: Run to verify snapshots still match**

```bash
bun pw tests/visual/svg-parity.spec.ts
```

Expected: All pass with existing snapshots (screenshot names unchanged).

- [ ] **Step 4: Commit**

```bash
git add tests/visual/svg-parity.spec.ts tests/test-cases.ts
git commit -m "Refactor svg-parity.spec.ts to use shared test-cases module"
```

---

### Task 7: Delete replaced spec files and HTML fixtures

**Files:**
- Delete: 16 spec files (replaced by `html-rendering.spec.ts`)
- Delete: ~27 HTML fixture files (replaced by `fixture.html`)

- [ ] **Step 1: Verify the new data-driven tests cover all old tests**

Run both old and new tests, compare test counts:

```bash
# Count old individual tests
bun pw tests/smoke.spec.ts tests/creation.spec.ts tests/creation-rtl.spec.ts tests/fragment.spec.ts tests/fragments-with-return.spec.ts tests/if-fragment.spec.ts tests/interaction.spec.ts tests/nested-interactions.spec.ts tests/named-parameters.spec.ts tests/return.spec.ts tests/return-in-nested-if.spec.ts tests/self-sync-message-at-root.spec.ts tests/vertical.spec.ts tests/async-message.spec.ts tests/demo.spec.ts tests/style-panel.spec.ts --list 2>/dev/null | wc -l

# Count new data-driven tests
bun pw tests/visual/html-rendering.spec.ts --list 2>/dev/null | wc -l
```

The new test count should be >= old test count.

- [ ] **Step 2: Delete old spec files**

```bash
git rm tests/smoke.spec.ts
git rm tests/creation.spec.ts
git rm tests/creation-rtl.spec.ts
git rm tests/fragment.spec.ts
git rm tests/fragments-with-return.spec.ts
git rm tests/if-fragment.spec.ts
git rm tests/interaction.spec.ts
git rm tests/nested-interactions.spec.ts
git rm tests/named-parameters.spec.ts
git rm tests/return.spec.ts
git rm tests/return-in-nested-if.spec.ts
git rm tests/self-sync-message-at-root.spec.ts
git rm tests/vertical.spec.ts
git rm tests/async-message.spec.ts
git rm tests/demo.spec.ts
git rm tests/style-panel.spec.ts
```

- [ ] **Step 3: Delete old snapshot directories for removed specs**

```bash
git rm -r tests/smoke.spec.ts-snapshots
git rm -r tests/creation.spec.ts-snapshots
git rm -r tests/creation-rtl.spec.ts-snapshots
git rm -r tests/fragment.spec.ts-snapshots
git rm -r tests/fragments-with-return.spec.ts-snapshots
git rm -r tests/if-fragment.spec.ts-snapshots
git rm -r tests/interaction.spec.ts-snapshots
git rm -r tests/nested-interactions.spec.ts-snapshots
git rm -r tests/named-parameters.spec.ts-snapshots
git rm -r tests/return.spec.ts-snapshots
git rm -r tests/return-in-nested-if.spec.ts-snapshots
git rm -r tests/self-sync-message-at-root.spec.ts-snapshots
git rm -r tests/vertical.spec.ts-snapshots
git rm -r tests/async-message.spec.ts-snapshots
git rm -r tests/demo.spec.ts-snapshots
git rm -r tests/style-panel.spec.ts-snapshots
```

- [ ] **Step 4: Delete replaced HTML fixtures**

```bash
git rm cy/smoke.html
git rm cy/smoke-creation.html
git rm cy/smoke-fragment.html
git rm cy/smoke-fragment-issue.html
git rm cy/smoke-interaction.html
git rm cy/creation-rtl.html
git rm cy/defect-406-alt-under-creation.html
git rm cy/fragment.html
git rm cy/fragments-with-return.html
git rm cy/if-fragment.html
git rm cy/return.html
git rm cy/return-in-nested-if.html
git rm cy/self-sync-message-at-root.html
git rm cy/named-parameters.html
git rm cy/nested-interaction-with-fragment.html
git rm cy/nested-interaction-with-outbound.html
git rm cy/vertical-1.html cy/vertical-2.html cy/vertical-3.html cy/vertical-4.html
git rm cy/vertical-5.html cy/vertical-6.html cy/vertical-7.html cy/vertical-8.html
git rm cy/vertical-9.html cy/vertical-10.html cy/vertical-11.html
git rm cy/async-message-1.html cy/async-message-2.html cy/async-message-3.html
git rm cy/demo1.html cy/demo3.html cy/demo4.html
```

- [ ] **Step 5: Run full test suite to verify nothing is broken**

```bash
bun pw
```

Expected: All tests pass. No tests reference deleted files.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Remove replaced spec files and HTML fixtures"
```

---

### Task 8: Final verification and cleanup

**Files:**
- Verify: All tests pass
- Verify: No dead references

- [ ] **Step 1: Run the full test suite**

```bash
bun pw --reporter=list
```

Expected: All tests pass.

- [ ] **Step 2: Verify test count**

```bash
bun pw --list | wc -l
```

Expected: Should be roughly the same as before (the data-driven tests cover all the old individual tests plus SVG parity tests).

- [ ] **Step 3: Check for dead HTML references**

```bash
grep -r "cy/smoke\.html\|cy/vertical-\|cy/creation-rtl\|cy/fragment\.html\|cy/demo[134]\.html" tests/
```

Expected: No matches (no spec files reference deleted HTML fixtures).

- [ ] **Step 4: Verify directory structure matches target**

```bash
find tests -name "*.spec.ts" | sort
```

Expected output:
```
tests/interaction/editable-label.spec.ts
tests/interaction/editable-span-escape.spec.ts
tests/measurement/width-provider-comparison.spec.ts
tests/regression/defect-406.spec.ts
tests/visual/html-rendering.spec.ts
tests/visual/svg-parity.spec.ts
```

- [ ] **Step 5: Commit (if any cleanup needed)**

```bash
git add -A
git commit -m "Final cleanup after E2E test reorganization"
```

---

## Summary of Changes

| Metric | Before | After |
|--------|--------|-------|
| Spec files | 21 | 6 |
| HTML fixtures | 37 | ~14 (unique pages only) |
| Lines in `vertical.spec.ts` | 147 (11 copy-paste blocks) | 0 (absorbed into html-rendering.spec.ts) |
| Lines in `svg-parity.spec.ts` | 553 (inline DSL) | ~25 (imports from test-cases) |
| DSL source of truth | 3 places | 1 (`compare-cases.js`) |
| Test organization | Flat | 4 subdirectories by type |

## Risk Mitigation

- **Snapshot names change** — The new `html-rendering.spec.ts` uses `${name}.png` naming. Old snapshots used various names like `should-load-the-home-page.png`, `creation.png`, etc. We generate fresh snapshots in Task 5 and verify they match visually.
- **fixture.html rendering differs from dedicated HTML** — The `main-cy.ts` script renders `<pre class="zenuml">` content. The parameterized template sets `textContent` before `main-cy.ts` runs (script is `type="module"`, deferred). Test in Task 1 confirms this.
- **CI snapshot mismatch** — Linux snapshots will need regenerating. Run `bun pw:update` in CI or update manually after merge.
