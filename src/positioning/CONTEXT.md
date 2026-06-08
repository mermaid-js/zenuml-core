# Positioning Module — Context

**Location**: `src/positioning/`

## Purpose

Computes the 2D pixel coordinates of every element in the diagram — participant positions, message arrows, fragment borders, and lifeline extents. Separates layout math from rendering so the same algorithm works in browser, canvas, and server-side contexts.

## Two Axes

| Axis | Module | Input | Output |
|---|---|---|---|
| Horizontal | `Coordinates.ts` | Participant list, message list | Each participant's `left` (px) and message widths |
| Vertical | `VerticalCoordinates.ts` | Parse tree (all statements) | Each statement's `top` + `height` (px) |

## Key Files

| File | Role |
|---|---|
| `Coordinates.ts` | Horizontal layout. Builds a pairwise distance matrix from text widths, solves optimal spacing via `david/DavidEisenstat.ts`. Caches results. |
| `VerticalCoordinates.ts` | Vertical layout. Creates a `BlockVM` tree from the parse tree, calls `layout()`, returns a map of statement key → `StatementCoordinate`. |
| `FrameBorder.ts` | Computes fragment bounding box (left, right, top, bottom) by walking the `Frame` tree from `FrameBuilder`. |
| `LocalParticipants.ts` | Returns participant names scoped to a given context (for fragment-local layouts). |
| `Anchor2.ts` | Models a participant's visual anchor point. `centerToEdge()` and `edgeOffset()` compute `translateX`/`width` for arrows. |
| `Constants.ts` | Dimension constants: `ARROW_HEAD_WIDTH`, `OCCURRENCE_WIDTH`, `MIN_PARTICIPANT_WIDTH`, `LIFELINE_WIDTH`, `MESSAGE_HEIGHT`, `CREATION_MESSAGE_HEIGHT`, `FRAGMENT_HEADER_HEIGHT`, etc. |
| `vertical/vm/` | VM layer — one VM class per statement type. See sub-section below. |

## Vertical Layout Entry Point

```typescript
const vc = new VerticalCoordinates(rootContext)

// Look up a statement's position
vc.getStatementCoordinateFor(statementContext)  // { top, height, kind }
vc.getStatementCoordinate(key)

// Lifeline start position for a created participant
vc.getCreationTop(participantName)

// Total diagram height
vc.getTotalHeight()

// All coordinates
vc.entries()
```

The layout starts at y=56px (`pt-14` on `.message-layer`) and measures each statement via its VM class.

## VM Layer (`vertical/vm/`)

Each statement type has a corresponding VM class that implements `measure()`:

| VM Class | Statement | Height Formula |
|---|---|---|
| `SyncMessageStatementVM` | Sync message | comment + 16px arrow + occurrence height (min 24px) + optional return |
| `AsyncMessageStatementVM` | Async message | comment + 16px arrow |
| `CreationStatementVM` | `new` | 62px arrow + occurrence height. Updates `creationTops` map. |
| `ReturnStatementVM` | `return` | 16px |
| `DividerStatementVM` | `==divider==` | Fixed height from `Constants` |
| `EmptyStatementVM` | Error-recovery empty | 0px |
| `AltFragmentVM` | `if/else` | header (25px) + condition + each branch body + padding |
| `LoopFragmentVM` | `while/loop` | header + condition + body |
| `ParFragmentVM` | `par` | header + body |
| `OptFragmentVM` | `opt` | header + condition + body |
| `SectionFragmentVM` | `section/frame` | header + body |
| `CriticalFragmentVM` | `critical` | header + condition + body |
| `TcfFragmentVM` | try/catch/finally | try block + each catch + optional finally |
| `RefFragmentVM` | `ref` | header only |

All VMs inherit from `NodeVM` which provides:
- `measureComment()` — tokenizes comment via `marked`, sums line heights (20px/line)
- `layoutBlock(block, origin, startY)` — recursively lays out a statement block
- `resolveFragmentOrigin(context)` — finds the origin participant for a fragment

## Horizontal Layout

`Coordinates.ts` measures participant widths using a `WidthProvider`:

```typescript
// Width provider resolution (browser or canvas)
resolveWidthProvider()
  → WidthProviderOnBrowser | WidthProviderOnCanvas
  // Controlled by URL param ?WIDTH_PROVIDER=canvas or env VITE_WIDTH_PROVIDER
```

Participant width = `labelWidth + iconWidth (40px if typed) + emojiWidth (24px) + margin (20px)`, minimum 80px.

## Anchor Model

`Anchor2` computes arrow geometry given a sender and receiver participant:

```typescript
anchor.centerToEdge()   // half-width from center to lifeline edge
anchor.edgeOffset()     // x offset from edge to arrow start/end
```

Used by the `useArrow()` hook in `Interaction` components to compute `translateX` and `interactionWidth`.

## See Also

- `VERTICAL_COORDINATES.md` — detailed vertical pipeline overview
- `vertical/vm/README.md` — VM layer class diagram and design rationale
- `Constants.ts` — all magic numbers in one place
