# Components Module — Context

**Location**: `src/components/`

## Purpose

React components that render the ZenUML diagram as interactive HTML. Organized in a layered hierarchy: a frame container, two rendering layers (lifelines and messages), and individual statement components.

## Component Hierarchy

```
DiagramFrame                          ← outer container, theme, title, controls
└── SeqDiagram                        ← inner diagram: width/layout, layer orchestration
    ├── LifeLineLayer (×3)            ← renders lifelines, participant headers, insert controls
    │   ├── LifeLineGroup             ← grouped participants (group {...} block)
    │   └── LifeLine
    │       └── Participant           ← participant header box (name, icon, stereotype, color)
    └── MessageLayer                  ← z-30, pt-14 (top: 56px) — message rendering
        └── Block                     ← maps statement list, computes padding/translate
            └── Statement             ← dispatch to per-type components
                ├── Interaction       ← sync message + occurrence box
                │   ├── Message       ← arrow + label
                │   ├── SelfInvocation← self-message loop
                │   └── Occurrence    ← activation box on lifeline
                ├── InteractionAsync  ← async message (open arrowhead)
                ├── Creation          ← `new` constructor
                ├── Return            ← return arrow
                ├── Divider           ← `== text ==` separator
                ├── Comment           ← `//` comment note
                └── Fragment*         ← loop / alt / par / opt / section / critical / tcf / ref
                    └── Block         ← nested fragment body (recursive)
```

## State: Props vs. Store

**Store atoms** (Jotai, `src/store/Store.ts`) drive all rendering. Components read atoms with `useAtomValue()` and subscribe automatically.

| Atom | Type | Used By |
|---|---|---|
| `codeAtom` | `string` | Block, Statement |
| `rootContextAtom` | `ProgContext` | DiagramFrame, SeqDiagram |
| `participantsAtom` | `Participants` | SeqDiagram, LifeLineLayer |
| `coordinatesAtom` | `Coordinates` | SeqDiagram, Block, Message |
| `verticalCoordinatesAtom` | `VerticalCoordinates \| null` | Block (html mode) |
| `themeAtom` | `string` | DiagramFrame |
| `modeAtom` | `RenderMode` | SeqDiagram |
| `selectedAtom` | `string[]` | Participant |
| `selectedMessageAtom` | `{ start, end, token } \| null` | Message |
| `cursorAtom` | cursor info | Message (highlighting) |
| `enableNumberingAtom` | `boolean` | Statement |

## Key Components

### `DiagramFrame`

Top-level component. Sets up `JotaiProvider` with initial atom values from props. Renders title, theme selector, tips dialog, and `SeqDiagram`.

### `SeqDiagram`

Computes diagram width from `coordinatesAtom` (rightmost participant + padding). Renders `LifeLineLayer` and `MessageLayer` as sibling divs.

### `LifeLineLayer`

Renders three visual layers via `renderMode` prop:
1. **Lifeline lines** — vertical dashed lines per participant
2. **Participant boxes** — header boxes with name, icon, stereotype, color
3. **Insert controls** — participant insertion UI (feature flag gated)

### `Block`

Maps a statement list from the parse tree. In `html` vertical mode, reads `verticalCoordinatesAtom` to set `top` and `height` on each statement. In `legacy` mode, uses CSS flow layout.

### `Statement`

Dispatches to the correct statement component based on parse tree node type. Passes down `context`, `origin`, `comment`, `commentObj`, `number`, `className`.

### `Interaction` (sync message)

Reads `useArrow()` to compute arrow geometry. Renders `Comment` → `SelfInvocation` or `Message` + `Occurrence`. The occurrence box contains any nested `Block`.

### Fragment components

`Loop`, `Alt`, `Par`, `Opt`, `Section`, `Critical`, `Tcf`, `Ref` — all share a similar pattern: render a header strip + condition label + nested `Block`. Use `useFragmentData()` for border/style.

## Positioning Integration

The `useArrow()` hook (in `Interaction/useArrow.ts`) computes pixel layout from `coordinatesAtom`:

```typescript
const { translateX, interactionWidth } = useArrow(context)
```

This returns the arrow's starting x position and width, derived from the sender/receiver participant positions and occurrence widths.

## Render Modes

| Mode | Description |
|---|---|
| `RenderMode.Dynamic` (html) | Full interactive mode. Vertical coordinates computed from parse tree. Supports selection, highlighting, insertion controls. |
| `RenderMode.Static` (svg) | Minimal mode for SVG export. No interactive overlays. |

Vertical layout mode is resolved separately:
- `"html"` — uses `VerticalCoordinates` for absolute positioning (default)
- `"legacy"` — CSS flow layout (fallback)

## Feature Flags

Several features are gated behind atoms that default to `false`:

| Atom | Feature |
|---|---|
| `enableParticipantInsertionAtom` | Participant insertion controls |
| `enableMessageInsertionAtom` | Message insertion controls |
| `enableDividerInsertionAtom` | Divider insertion controls |
| `enableParticipantStyleEditingAtom` | Click-to-edit participant styles |
| `enableNumberingAtom` | Message numbering (persisted to localStorage, default `true`) |

## Adding a New Statement Component

1. Create `src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/<Name>/` directory
2. Export a React component accepting `{ context, origin, comment, commentObj, number, className }`
3. Register it in `Statement.tsx` dispatch
4. Add a VM class in `src/positioning/vertical/vm/` for height calculation
5. Register the VM in `BlockVM`'s statement dispatch
