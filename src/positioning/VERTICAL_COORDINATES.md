# Server-Side Vertical Coordinates

This branch replaces browser-driven measurements with a deterministic, server-side pass that computes every vertical position in a sequence diagram. The goal is to make layout reproducible in CI without Playwright/Chromium while staying pixel‑aligned with the DOM renderer.

## Entry Point: `VerticalCoordinates`
- File: `src/positioning/VerticalCoordinates.ts`
- Inputs: `rootContext` (parser AST), optional `theme`, `originParticipant`, and `participantOrder` (for fragment-origin decisions).
- Outputs: `totalHeight` plus lookup helpers: `getStatementTop/Height/Anchors`, `getCreationTop`, `entries()`, and padding getters mirrored from theme metrics.
- Statement keys are stable `(start.stop)` ranges via `vertical/StatementIdentifier.ts`, so browser and server agree on lookups.

## Pipeline Overview
1) **Metrics** — `vertical/LayoutMetrics.ts` codifies every CSS dimension (margins, paddings, message heights, fragment gaps, etc.). Theme overrides (e.g., `theme-clean-light`) merge on top of the defaults.
2) **Markdown** — `vertical/MarkdownMeasurer.ts` tokenizes comments with `marked` and sums line heights (wrapping is ignored) using the same font metrics the renderer uses.
3) **VM Layer** — `src/vm/*` mirrors the renderer’s stacking rules. `createBlockVM` walks `stat` nodes, instantiates a `StatementVM` per construct, and accumulates cursor positions with small offsets to match DOM quirks.
4) **Recording** — Each `StatementVM.measure` returns a `StatementCoordinate` (top, height, anchors, meta). The runtime’s `recordCoordinate` stitches these into a map keyed by parser range; `updateCreationTop` captures the earliest creation anchor per participant for lifeline alignment.

## Per-Statement Behaviours (highlights)
- **Sync messages** (`SyncMessageStatementVM`): comment height first, then message height (self vs normal), then occurrence height (block content or min height). Adds `return` anchor/height when the message has an assignment target.
- **Async messages** (`AsyncMessageStatementVM`): comment + async height (self vs normal). No occurrences are added here by design.
- **Creations** (`CreationStatementVM`): fixed creation arrow + occurrence. Optionally appends return height when an assignment is present. Adjusts anchors for:
  - Alt branches (`creationAltBranchOffset`/`creationAltBranchInset`)
  - Try/catch segments (`creationTcfSegmentOffset`)
  - Section fragments (`creationSectionOffset`)
  - Subsequent siblings inside PAR (`creationParSiblingOffset`)
  The final anchor also updates `creationTopByParticipant` for lifeline starts.
- **Fragments** (`Fragment*VM`): shared header + optional condition line + body + padding. ALT/Try-catch add per-branch headers and gaps; PAR/LOOP/OPT/SECTION/CRITICAL reuse `FragmentSingleBlockVM`; REF is header-only.
- **Returns/Dividers/Empty**: simple fixed heights from metrics; returns also include optional comment height.
- **Block cursor tuning**: `BlockVM` applies small `cursorOffsets` and `heightOffsets` for loop/alt/par/opt/tcf to stay pixel-aligned with DOM stacking.

## Consuming the Coordinates
- Rendering: use anchors (`message | occurrence | comment | return`) to align message arrows, occurrences, comments, and return arrows between canvas/SVG layers.
- Lifelines: call `getCreationTop(participant)` to position lifeline start points based on the earliest creation anchor.
- Testing: `src/positioning/VerticalCoordinates.spec.ts` covers creation offsets, ALT alignment, try/catch adjustments, PAR sibling inset, and inline message/creation spacing.
- Snapshots: run Playwright with `VERTICAL_MODE=browser` to bypass server-side coordinates and let DOM measurements drive layout when regenerating screenshots (`playwright test --update-snapshots`). Default is `server`. Note: this is a runtime variable injected via `window.__ZEN_VERTICAL_MODE`, not a Vite build-time variable.

## Keeping It Accurate
- Any CSS/tailwind spacing change must update `LayoutMetrics` (and theme overrides) to keep server math in sync with the DOM.
- Comment heights assume no line wrapping; adjust `commentLineHeight`/`commentCodeLineHeight` in `LayoutMetrics` if fonts change.
- When adding a new statement type, implement a `StatementVM`, register it in `createStatementVM`, and extend `StatementTypes`/tests to lock the expected coordinates.

## What Changed From `main`
- Removed reliance on Playwright/Chromium for vertical measurements; all math now happens during AST traversal on the server.
- Introduced deterministic metrics + markdown measuring to reproduce DOM heights.
- Added VM layer and coordinate map so renderers/tests can query positions without loading a browser.
