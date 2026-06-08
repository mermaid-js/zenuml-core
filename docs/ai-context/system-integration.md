# System Integration

How the major subsystems connect and exchange data.

## Core Data Flow

```
User types DSL
      │
      ▼
codeAtom (Jotai)
      │
      ▼
RootContext(code)         ← src/parser/index.js
      │
      ├──▶ Participants     (src/parser/Participants.ts)
      ├──▶ OrderedParticipants (src/parser/OrderedParticipants.ts)
      ├──▶ AllMessages       (src/parser/MessageCollector.ts)
      └──▶ FrameBuilder      (src/parser/FrameBuilder.ts)
                │
                ▼
      coordinatesAtom (horizontal layout)     ← src/positioning/Coordinates.ts
      verticalCoordinatesAtom (vertical)      ← src/positioning/VerticalCoordinates.ts
                │
                ▼
      React components read atoms → render diagram
```

## Embedding the Library

### As an npm package

```typescript
import ZenUml from '@zenuml/core'
import '@zenuml/core/dist/style.css'

const diagram = new ZenUml(containerElement)
diagram.render(dslCode, { theme: 'theme-default' })
```

### As an iframe (embeddable widget)

```html
<iframe
  src="https://app.zenuml.com/embed"
  data-code="A.method()"
  data-theme="theme-default"
/>
```

See `TUTORIAL.md` for the full integration guide with event callbacks.

## Parser → Positioning Integration

`VerticalCoordinates` reads the parse tree directly. Key hand-off:

```typescript
// VerticalCoordinates.ts constructor:
const participants = OrderedParticipants(rootContext)
const messages = new MessageCollector(rootContext).AllMessages()
// ↓ builds BlockVM tree from rootContext.block()
const blockVM = new BlockVM(block, runtime)
blockVM.layout(originParticipant, 56)  // 56px = pt-14 on MessageLayer
```

`Coordinates.ts` (horizontal) uses the same participants + message list but solves a different problem: spacing columns wide enough for labels and arrows.

## Positioning → Components Integration

Components do not call the layout engines directly. They read atoms:

```typescript
// In a component:
const vc = useAtomValue(verticalCoordinatesAtom)
const coord = vc?.getStatementCoordinateFor(context)
// → { top: number, height: number, kind: string }
```

The `Block` component applies `top` / `height` as inline styles when in `html` vertical mode.

## Cross-Component Communication

All inter-component communication goes through Jotai atoms — there are no prop drilling chains beyond one level. Components call `useSetAtom` to update state; derived atoms recompute automatically.

Callback atoms (`onContentChangeAtom`, `onThemeChangeAtom`, `onEventEmitAtom`) let the embedding application subscribe to diagram events without tight coupling.

## Error Handling

The ANTLR parser uses `SeqErrorListener` to collect parse errors without throwing. `RootContext()` returns `null` on catastrophic failure; components handle `null` root gracefully (render empty diagram). Parser errors are available via `rootContext.errors` for display or logging.

## Testing Strategy

| Test type | Location | What it covers |
|---|---|---|
| Unit (Vitest) | `src/**/*.spec.ts`, `test/unit/` | Parser rules, positioning math, individual components |
| E2E (Playwright) | `tests/` | Full render pipeline, visual snapshots, interaction flows |

Unit tests import parser modules directly. E2E tests boot the full dev server and compare screenshots.

For visual regression: run `bun pw` and compare against committed snapshots. Only update snapshots when pixels changed intentionally — see `CLAUDE.md` § "E2E Screenshot Snapshot Updates".
