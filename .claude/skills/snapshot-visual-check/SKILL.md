---
name: snapshot-visual-check
description: Mandatory visual inspection before accepting any Playwright screenshot baseline in mermaid-js/zenuml-core. Use whenever you are about to update, regenerate, accept, overwrite, or commit a snapshot PNG — `bun pw:update`, `playwright test --update-snapshots` / `-u`, the `update-snapshots.yml` workflow, pulling auto-committed Linux baselines, resolving `*-snapshots/*.png` merge conflicts, or "just refresh the snapshots to make CI green". Also use when a `toHaveScreenshot` failure needs a verdict (regression vs. intended change vs. environment noise).
---

# Snapshot Visual Check

A snapshot update is a claim: "these pixels are the new correct rendering." Make that claim only after looking at the pixels. A green test after `--update-snapshots` proves nothing — it passes by construction.

## Hard rules

1. **Never update snapshots to make a failing test pass.** Update only when the changed pixels are an intended, correct consequence of the code change on this branch.
2. **Never update the whole suite.** Update the specific test files or test names you have inspected.
3. **Never generate baselines from a headed or UI-mode run.** Baselines are headless captures; headed Chrome antialiases text differently (seen on 2026-10-14: 86 headed-only failures, all font antialiasing). Run `bun pw` / `bunx playwright test` headless.
4. **Look at every changed PNG yourself** (Read the image files). A pixel count or a passing test is not inspection.
5. If you cannot inspect (no images, tool failure), stop and report `BLOCKED`, do not update.

## Procedure

### 1. Reproduce the failure headless, without updating

```bash
bunx playwright test <spec-file> --reporter=line
```

Playwright writes, per failing screenshot, under `test-results/<test-dir>/`:
`<name>-expected.png` (baseline), `<name>-actual.png` (this run), `<name>-diff.png`.

```bash
find test-results -name '*-actual.png'
```

### 2. Locate and magnify every diff cluster

```bash
node .claude/skills/snapshot-visual-check/scripts/diff-crops.mjs \
  test-results/<dir>/<name>-expected.png \
  test-results/<dir>/<name>-actual.png \
  <scratch-dir>/<name>
```

It prints JSON (sizes, `sizeChanged`, `diffPixels`, cluster boxes) and writes
`cluster-N.png` = **expected | actual | diff**, magnified 4×, largest clusters first, plus `diff-full.png`.

Read `diff-full.png` for the overall picture, then Read each `cluster-N.png`.

For compare-case pages (HTML vs SVG parity), also run the project analyzer — it is the source of truth for attribution there:

```bash
node scripts/analyze-compare-case.mjs --case <name> --json
```

### 3. Attribute each cluster

For every cluster, write one line:

| Field | Content |
|---|---|
| Where | box `x,y,w,h` and the nearest semantic element: participant box/label/icon/stereotype, message label/arrow/line, occurrence, fragment header/border, divider, comment, frame, group |
| What changed | moved N px / resized / new element / missing element / colour / antialias only |
| Why | the line(s) in this branch's diff that cause it, or "environment" |
| Verdict | `intended` · `regression` · `noise` |

Verdict rules:
- **intended** — the change is a direct, expected result of code on this branch, and the new rendering is correct (alignment, spacing, no clipping, no overlap).
- **regression** — the change is unexpected, or the new rendering is worse. Fix the code; do not update.
- **noise** — antialias-only speckle on glyph edges with no geometry change, typically from headed mode, a different OS, or a font cache. Re-run headless on a clean run; do not update for noise.

Any `regression` or unexplained cluster blocks the update for that snapshot.

### 4. Update only the inspected snapshots

```bash
bunx playwright test <spec-file> -g "<test name>" --update-snapshots --reporter=line
```

Then confirm what changed on disk:

```bash
git status --short -- '*-snapshots/*'
```

Every modified PNG must be one you inspected in step 2–3. Revert any other: `git checkout -- <path>`.

### 5. Verify after updating

- Re-run the same specs headless without `--update-snapshots`; they must pass.
- Compare old vs new baseline for each updated file:

```bash
git show HEAD:<path-to-png> > <scratch-dir>/old.png
node .claude/skills/snapshot-visual-check/scripts/diff-crops.mjs <scratch-dir>/old.png <path-to-png> <scratch-dir>/committed
```

Read the clusters again; they must match the clusters you approved in step 3.

### 6. Linux baselines (CI)

`-linux.png` baselines come from `.github/workflows/update-snapshots.yml`. After it auto-commits:

```bash
git pull
git diff --stat HEAD@{1} -- '*-linux.png'
```

For each changed Linux PNG, extract old and new with `git show <old-sha>:<path>` / `git show HEAD:<path>` and run steps 2–3 on the pair. The macOS clusters you approved should appear in the same places on Linux; anything else needs attribution before the PR merges.

### 7. Record the evidence

In the commit message or PR body, list per updated snapshot:

```
<snapshot file>: <element> <what changed> at (x,y) — <why, citing the code change>
```

Example (format only): `creation-basic-chromium-darwin.png: activation bar on A moved up 12px at (420,180) — creation top now includes the first-gap clearance (LifeLine.tsx).`

## Output to the user

Before updating, show the cluster table from step 3 with verdicts and attach the key `cluster-N.png` paths. State the exact command you will run. After updating, report which PNGs changed and that the headless re-run passed.
