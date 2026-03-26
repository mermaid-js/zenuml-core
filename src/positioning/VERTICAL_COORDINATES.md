# Server-Side Vertical Coordinates

This module replaces browser-driven measurements with a deterministic, server-side pass that computes every vertical position in a sequence diagram. The goal is to make layout reproducible without Playwright/Chromium while staying pixel-aligned with the DOM renderer.

## Entry Point: `VerticalCoordinates`

- **File**: `src/positioning/VerticalCoordinates.ts`
- **Input**: `rootContext` (parser AST root)
- **Constructor**: Parses participants and messages from the AST, then runs the VM layout pass starting at `top=56` (matching `.message-layer .pt-14`).

### Public API

| Method | Returns | Description |
|--------|---------|-------------|
| `getCreationTop(participant)` | `number \| undefined` | Earliest creation anchor for a participant (used for lifeline start positioning) |
| `getStatementCoordinate(key)` | `StatementCoordinate \| undefined` | Lookup by statement key string |
| `getStatementCoordinateFor(statement)` | `StatementCoordinate \| undefined` | Lookup by parser statement context (avoids key-format coupling) |
| `entries()` | `Array<[string, StatementCoordinate]>` | Snapshot of all statement coordinates |
| `getTotalHeight()` | `number` | Total layout height (from `BlockVM.layout()` return value) |

### StatementCoordinate

```typescript
{ top: number; height: number; kind: StatementKind }
```

Where `StatementKind` is one of: `sync`, `async`, `creation`, `return`, `divider`, `empty`, `alt`, `loop`, `opt`, `par`, `critical`, `section`, `tcf`, `ref`.

### Statement Keys

Keys are `(start.stop)` token ranges via `vertical/StatementIdentifier.ts`, ensuring browser and server agree on lookups.

## Pipeline Overview

1. **Metrics** — `vertical/LayoutMetrics.ts` codifies every CSS dimension (margins, paddings, message heights, fragment gaps). Theme overrides merge on top of defaults.
2. **Markdown** — `vertical/MarkdownMeasurer.ts` tokenizes comments with `marked` and sums line heights (wrapping is ignored).
3. **VM Layer** — `vertical/vm/` mirrors the renderer's stacking rules. `createStatementVM` walks `stat` nodes, instantiates a `StatementVM` per construct, and accumulates cursor positions.
4. **Recording** — Each `StatementVM.measure(top, origin)` returns a `StatementCoordinate`. The runtime's `recordCoordinate` stitches these into a map; `updateCreationTop` captures creation anchors per participant.

## Per-Statement Behaviours

- **Sync messages** (`SyncMessageStatementVM`): comment height + message height (self vs normal) + occurrence height (block content or min height). Assignment adds return height.
- **Async messages** (`AsyncMessageStatementVM`): comment + async height. No occurrences.
- **Creations** (`CreationStatementVM`): fixed creation arrow + occurrence. Assignment appends return height. Updates `creationTopByParticipant` for lifeline starts.
- **Fragments** (`Fragment*VM`): header + optional condition + body + padding. ALT/TCF add per-branch headers; PAR/LOOP/OPT/SECTION/CRITICAL use `FragmentSingleBlockVM`; REF is header-only.
- **Returns/Dividers/Empty**: simple fixed heights from metrics.

## Consuming the Coordinates

- **Rendering**: Use `getStatementCoordinateFor(statement)` to position elements.
- **Lifelines**: Call `getCreationTop(participant)` for lifeline start points.
- **Total sizing**: Use `getTotalHeight()` for diagram height.
- **Testing**: `src/positioning/VerticalCoordinates.spec.ts` covers crash regression and API contract.
- **Vertical mode**: Set `VITE_VERTICAL_MODE` to `"legacy"` to bypass pre-computed coordinates and use DOM measurement (for Playwright snapshot regeneration). Default is `"html"`.

## Keeping It Accurate

- Any CSS/Tailwind spacing change must update `LayoutMetrics` to keep html mode math in sync with DOM.
- Comment heights assume no line wrapping; adjust `commentLineHeight`/`commentCodeLineHeight` in `LayoutMetrics` if fonts change.
- When adding a new statement type: implement a `StatementVM`, register in `createStatementVM`, extend `StatementTypes`, and add tests.
