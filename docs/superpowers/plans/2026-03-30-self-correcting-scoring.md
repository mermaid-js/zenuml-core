# Self-Correcting Dia-Scoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a gap-detection and self-correction validation loop to the dia-scoring skill so it automatically detects and fixes analyzer blind spots during normal scoring runs.

**Architecture:** The entire change is a new section in `SKILL.md` — behavioral instructions that tell the agent to cross-reference the diff panel's pixel clusters against the analyzer's coverage map, triage unaccounted clusters, and fix `collect-data.mjs` when the gap is a selector/extraction miss. No new scripts or tooling.

**Tech Stack:** Markdown (SKILL.md), Playwright browser_evaluate (runtime), collect-data.mjs (runtime fixes)

---

### Task 1: Add "Gap Detection and Self-Correction" section to SKILL.md

**Files:**
- Modify: `/Users/pengxiao/.claude/skills/dia-scoring/SKILL.md` (append new section after the existing "Known Analyzer Internals" section, before "Commands")

- [ ] **Step 1: Add the new section**

Open `/Users/pengxiao/.claude/skills/dia-scoring/SKILL.md` and insert the following section between the "Known Analyzer Internals" section (line 167) and the "Commands" section (line 175):

```markdown
## Gap Detection and Self-Correction

After running the analyzer and producing the JSON report, **automatically validate** that the report covers all visible diff clusters. Do not wait for the user to request calibration.

### Step 1: Build a Coverage Map

Collect every fine-grained bounding box from the analyzer JSON:
- `html_box` / `svg_box` from labels, numbers, arrows
- `html_icon_box` / `svg_icon_box` from participant icons
- `label_box` from participant labels
- `stereotype_box`, `comment_box`, `divider_box`, occurrence boxes, etc.

Use the most specific boxes available (e.g., `icon_box` rather than the coarse `participant_box`) to avoid masking sub-element gaps.

### Step 2: Find Unaccounted Diff Clusters

Scan the `#diff-panel canvas` for connected clusters of red (HTML-only) or blue (SVG-only) pixels. Filter noise (clusters < 20 pixels). A cluster is **covered** when:

- The cluster's centroid falls inside a reported element's bounding box, OR
- The overlap between the cluster and a reported element's box is >= 30% of the cluster's area

Clusters meeting neither condition are **unaccounted** and trigger investigation.

`colorDiff` (purple) pixels within a covered region are expected and do not trigger investigation.

### Step 3: Verify Coordinate Mapping

Before inspecting the DOM at gap coordinates:

1. Derive an initial canvas-to-page mapping from frame/canvas geometry (canvas natural size / frame CSS size).
2. Probe a known anchor — pick a reported element with known page coordinates and verify the mapping lands on it via `document.elementFromPoint`.
3. If the probe hits the wrong panel, empty space, or an unrelated element, recalibrate once using the probe result.
4. If the mapping still fails after one recalibration, mark the cluster as `uncertain` and move on.

### Step 4: Inspect DOM at Gap Coordinates

For each unaccounted cluster with a verified mapping:

1. Use `document.elementFromPoint(x, y)` on both the HTML and SVG panels.
2. Walk up to the semantic parent (participant, message, fragment) to understand the element's role.
3. Classify: emoji icon, stereotype, arrow, label, or novel element.

### Step 5: Triage

Classify each gap before acting:

- **`likely_analyzer_gap`** — Element exists on both sides, belongs to an existing scoring category (icons, labels, stereotypes, etc.), but the collection logic missed it. Proceed to fix.
- **`likely_renderer_residual`** — Element exists on only one side, or the difference is a genuine rendering discrepancy. Report in scoring output but do not modify the analyzer.
- **`uncertain`** — Cannot determine cause confidently. Report with DOM context and coordinates for manual review.

Only `likely_analyzer_gap` triggers a self-fix.

### Step 6: Fix the Collection Logic

For `likely_analyzer_gap` clusters:

1. Read the relevant collection function in `collect-data.mjs` (e.g., `collectHtmlParticipants` for participant sub-elements).
2. Compare the function's selectors and extraction logic against the actual DOM element's tag, classes, and attributes.
3. Identify why it wasn't matched.
4. Fix the collection logic. This may include: adding selector patterns, adding fallback extraction paths, adjusting pairing logic, or modifying measurement paths. Keep changes targeted — no broad refactors.

This fixes the measurement tool, not the renderers.

### Step 7: Re-run and Verify

1. Re-run the analyzer on the target case. Confirm the previously-unaccounted cluster is now covered and semantically correct.
2. Run 1-2 sibling cases with the same element family and confirm: populated data, no regression in previously-working sections.

### Safety Limits

- Maximum **2 fix-and-rerun iterations** per scoring session.
- Only auto-fix `likely_analyzer_gap` that maps to an existing scoring category and collection function.
- Novel element types (no existing category): report as unresolved with element identity and coordinates.

### Limitations

- **Invisible diffs**: If an element renders identically in both HTML and SVG (no diff pixels), this loop cannot detect that the analyzer doesn't cover it. The loop is reactive to visible differences only.
- **Novel categories**: The loop can detect and report novel element types but does not create new scoring categories autonomously.
```

- [ ] **Step 2: Update the participant icons scope line**

In the same file, find line 74:

```markdown
  - participant icons (actor, database, ec2, lambda, azurefunction, sqs, sns, iam, boundary, control, entity)
```

Replace with:

```markdown
  - participant icons (actor, database, ec2, lambda, azurefunction, sqs, sns, iam, boundary, control, entity, and emoji-based icons like 🌐, 🔒, 🗄️)
```

This documents that emoji icons are in scope, which the self-correction loop discovered.

- [ ] **Step 3: Verify the edit is well-formed**

Read the modified SKILL.md and confirm:
- The new section appears between "Known Analyzer Internals" and "Commands"
- No existing sections were accidentally modified
- The markdown renders correctly (no broken formatting)

Run: `cat /Users/pengxiao/.claude/skills/dia-scoring/SKILL.md | head -250`
Expected: The new "Gap Detection and Self-Correction" section is visible, followed by the existing "Commands" section.

- [ ] **Step 4: Commit**

```bash
cd /Users/pengxiao/workspaces/zenuml/mmd-zenuml-core
git add /Users/pengxiao/.claude/skills/dia-scoring/SKILL.md
git commit -m "feat(dia-scoring): add gap detection and self-correction validation loop"
```

---

### Task 2: Validate the self-correction loop on the emoji-async-return case

This task verifies the new skill instructions work end-to-end by running a scoring session on the case that originally exposed the gap.

**Files:**
- No files created or modified — this is a validation task

- [ ] **Step 1: Run the analyzer on emoji-async-return**

```bash
cd /Users/pengxiao/workspaces/zenuml/mmd-zenuml-core
node scripts/analyze-compare-case.mjs --case emoji-async-return --json 2>&1 | python3 -c "
import json, sys
data = json.load(sys.stdin)
icons = data.get('participant_icons', [])
print(f'participant_icons count: {len(icons)}')
for icon in icons:
    print(f'  {icon.get(\"name\", \"?\")} — presence html:{icon.get(\"presence\",{}).get(\"html\")} svg:{icon.get(\"presence\",{}).get(\"svg\")} status:{icon.get(\"status\")}')
"
```

Expected: `participant_icons count: 0` (the analyzer doesn't detect emoji icons yet — this confirms the gap exists before the self-correction loop runs).

- [ ] **Step 2: Navigate to the compare-case page and read the diff panel**

Using Playwright:
1. Navigate to `http://localhost:8080/e2e/tools/compare-case.html?case=emoji-async-return`
2. Wait for `[native-diff-ext] Done!` in console
3. Read the `#diff-panel canvas` pixel data via `browser_evaluate`
4. Identify unaccounted clusters in the participant icon region

Expected: The diff panel shows HTML-only and SVG-only pixel clusters around the emoji icons (🌐, 🔒, 🗄️) that are not covered by any reported element in the analyzer output.

- [ ] **Step 3: Follow the self-correction loop**

Execute steps 1-7 of the new "Gap Detection and Self-Correction" section:
1. Build coverage map from analyzer JSON
2. Find unaccounted clusters (the icon regions)
3. Verify coordinate mapping with a known anchor probe
4. Inspect DOM at gap coordinates — find `span.mr-1.flex-shrink-0` (HTML) and emoji `tspan` (SVG)
5. Triage as `likely_analyzer_gap` (element exists on both sides, belongs to participant icons category)
6. Fix `collect-data.mjs` — add emoji icon detection to both `collectHtmlParticipants` and `collectSvgParticipants`
7. Re-run analyzer, verify icons are now detected. Run 1-2 sibling emoji cases.

Expected: After the fix, `participant_icons count: 3` with all three emoji icons detected and scored.

- [ ] **Step 4: Commit the collect-data.mjs fix**

```bash
cd /Users/pengxiao/workspaces/zenuml/mmd-zenuml-core
git add scripts/analyze-compare-case/collect-data.mjs
git commit -m "fix(analyzer): detect emoji-based participant icons in collect-data"
```

---

### Task 3: Commit the design spec

**Files:**
- Stage: `docs/superpowers/specs/2026-03-30-self-correcting-scoring-design.md`

- [ ] **Step 1: Commit the spec**

```bash
cd /Users/pengxiao/workspaces/zenuml/mmd-zenuml-core
git add docs/superpowers/specs/2026-03-30-self-correcting-scoring-design.md
git commit -m "docs: add self-correcting dia-scoring design spec"
```
