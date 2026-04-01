# Self-Correcting Dia-Scoring Skill

## Problem

The dia-scoring skill's analyzer (`collect-data.mjs`) uses hardcoded CSS selectors and extraction heuristics to detect diagram elements (icons, labels, arrows, etc.). When the renderers introduce new patterns (e.g., emoji-based participant icons instead of SVG icons), the collection logic misses them. The analyzer returns empty data for those elements, and the scoring report has blind spots.

Today, the user must manually notice these gaps, invoke a separate "calibrate" session, and guide the agent through DOM inspection and selector diagnosis. This is unnecessary — all the information needed to detect and fix these gaps is available during a normal scoring run.

## Design

### Core Principle

The diff panel canvas is the source of truth for where HTML and SVG renderers differ. The analyzer report explains those differences element-by-element. When the diff panel shows pixel clusters that no reported element accounts for, that is an **investigation trigger** — not automatic proof of an analyzer bug. The cluster could be:

- A gap in the analyzer's collection logic (most common)
- A genuine renderer residual (real visual difference the analyzer already scored or intentionally doesn't cover)
- A novel element category the analyzer has no scoring support for

The agent must **triage** each unaccounted cluster before acting.

### Validation Loop (added to SKILL.md)

After the analyzer runs and produces its JSON report, the agent performs:

#### Step 1: Build a Coverage Map

Collect every **fine-grained** bounding box reported by the analyzer:
- `html_box` / `svg_box` from labels, numbers, arrows
- `html_icon_box` / `svg_icon_box` from participant icons
- `label_box` from participant labels
- `stereotype_box`, `comment_box`, `divider_box`, occurrence boxes, etc.

Use the most specific boxes available (e.g., `icon_box` rather than the coarse `participant_box`) to avoid masking sub-element gaps.

#### Step 2: Find Unaccounted Diff Clusters

Scan the diff panel canvas for connected clusters of red (HTML-only) or blue (SVG-only) pixels. Filter out noise (clusters < 20 pixels). For each cluster, check whether any coverage-map bounding box accounts for it. A cluster is **covered** when:

- The cluster's centroid falls inside a reported element's bounding box, OR
- The overlap between the cluster and a reported element's box is >= 30% of the cluster's area

Clusters that meet neither condition are **unaccounted** and trigger investigation.

Note: `colorDiff` (purple) pixels within a covered region are expected — they indicate the element was detected but renders differently. Only uncovered `htmlOnly`/`svgOnly` clusters trigger investigation.

#### Step 3: Verify Coordinate Mapping

Before inspecting the DOM at gap coordinates, verify the canvas-to-page mapping:

1. Derive an initial mapping from frame/canvas geometry (canvas natural size / frame CSS size).
2. Probe a known anchor — pick a reported element with known page coordinates and verify the mapping lands on it.
3. If the probe hits the wrong panel, empty space, or an unrelated element, recalibrate once using the probe result.
4. If the mapping still fails after one recalibration, mark the cluster as `uncertain` and move on.

#### Step 4: Inspect DOM at Gap Coordinates

For each unaccounted cluster with a verified mapping:

1. Use `document.elementFromPoint(x, y)` on both the HTML and SVG panels to identify what element lives at those coordinates.
2. Walk up to the semantic parent (participant, message, fragment) to understand the element's role.
3. Classify: emoji icon, stereotype, arrow, label, or novel element.

#### Step 5: Triage

Based on DOM inspection, classify each gap:

- **`likely_analyzer_gap`** — The element exists on both sides, belongs to an existing scoring category (icons, labels, stereotypes, etc.), but the collection logic missed it. Proceed to fix.
- **`likely_renderer_residual`** — The element exists on only one side, or the difference is a genuine rendering discrepancy (not a measurement miss). Report in the scoring output but do not modify the analyzer.
- **`uncertain`** — Cannot determine the cause confidently. Report with DOM context and coordinates for manual review.

Only `likely_analyzer_gap` triggers a self-fix.

#### Step 6: Fix the Collection Logic

For `likely_analyzer_gap` clusters:

1. Read the relevant collection function in `collect-data.mjs` (e.g., `collectHtmlParticipants` for participant sub-elements).
2. Compare the function's selectors and extraction logic against the actual DOM element's tag, classes, and attributes.
3. Identify why it wasn't matched (e.g., looks for `g[transform]` but the element is a `tspan`).
4. Fix the collection logic. This may include: adding selector patterns, adding fallback extraction paths, adjusting pairing logic, or modifying measurement paths. Keep changes targeted — no broad refactors.

This fixes the measurement tool, not the renderers.

#### Step 7: Re-run and Verify

Run the analyzer again on the target case. Confirm:
- The previously-unaccounted diff cluster is now covered by a reported element.
- The reported data is semantically correct (right element category, right participant, plausible box dimensions).

Then run 1-2 **sibling cases** that contain the same element family (e.g., other emoji compare cases) and confirm:
- The fix produces populated data on those cases too.
- No obvious regression in previously-working sections.

#### Safety Limits

- Maximum **2 fix-and-rerun iterations** per scoring session. If gaps persist after 2 rounds, report them as unresolved with the DOM context gathered.
- Only auto-fix gaps classified as `likely_analyzer_gap` that map to an existing scoring category and collection function.
- If an element is truly novel (no existing category in the analyzer), report it as an unresolved gap with element identity and coordinates rather than attempting to add a new scoring category.

### Where This Lives

This is **skill-level behavioral logic** in the dia-scoring `SKILL.md`. No new scripts or tooling. The instructions tell the agent to perform the validation loop using existing tools:
- Playwright `browser_evaluate` for canvas scanning and DOM inspection
- `Read` / `Edit` for diagnosing and fixing `collect-data.mjs`
- `Bash` to re-run the analyzer

### What Changes

- **`SKILL.md`**: Add a "Gap Detection and Self-Correction" section describing the validation loop above.
- **`collect-data.mjs`**: Receives incremental collection logic fixes as gaps are discovered. No broad structural changes.
- **No new scripts or files.**

## Limitations

- **Invisible diffs**: If a new element type renders identically in both HTML and SVG (no diff pixels), this loop cannot detect that the analyzer doesn't cover it. The loop is reactive to visible differences only.
- **Novel categories**: The loop can detect and report novel element types but does not attempt to create new scoring categories or collection functions autonomously.

## Success Criteria

- **Self-corrects existing categories**: When running `/dia-scoring` on a compare case with emoji participant icons, the agent detects that `participant_icons` has no coverage over the icon diff clusters, triages it as `likely_analyzer_gap`, fixes the collection logic, re-runs, and delivers a complete report — without the user saying "calibrate."
- **Surfaces novel elements**: When an unaccounted cluster belongs to an element type the analyzer has no category for, the agent reports it with DOM identity and coordinates rather than silently ignoring it.
- **Does not overclaim**: The design does not guarantee automatic correction for every future diff cluster. It handles existing scoring categories with clear DOM evidence; it surfaces everything else with diagnostics.

## Out of Scope

- Changing how the diff panel extension works.
- Fixing renderer parity issues (the skill measures, it doesn't fix renderers).
- Adding new scoring categories (that's a separate design decision if a truly novel element type is discovered).
