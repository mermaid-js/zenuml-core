# Store Module — Context

**Location**: `src/store/Store.ts` (and co-located atoms)

## Purpose

Manages all application state using Jotai atoms. A single reactive graph: code changes propagate through the parse tree, then to layout coordinates, then to all components automatically.

## State Flow

```
codeAtom (string)
  │
  ▼
rootContextAtom (ProgContext | null)    ← RootContext(code)
  │
  ├─▶ titleAtom (string | null)         ← rootContext.title()
  ├─▶ participantsAtom (Participants)   ← Participants(rootContext)
  ├─▶ coordinatesAtom (Coordinates)     ← new Coordinates(rootContext, widthProvider)
  └─▶ verticalCoordinatesAtom           ← new VerticalCoordinates(rootContext) | null
```

## Atom Catalogue

### Core AST

| Atom | Type | Description |
|---|---|---|
| `codeAtom` | `string` | User's DSL source code |
| `rootContextAtom` | `ProgContext \| null` | Parsed ANTLR tree |
| `titleAtom` | `string \| null` | Diagram title extracted from tree |
| `participantsAtom` | `Participants` | Participants map from ToCollector |
| `coordinatesAtom` | `Coordinates` | Horizontal layout |
| `verticalCoordinatesAtom` | `VerticalCoordinates \| null` | Vertical layout (null in legacy mode) |

### Rendering

| Atom | Type | Default | Description |
|---|---|---|---|
| `themeAtom` | `string` | `"theme-default"` | CSS theme class |
| `scaleAtom` | `number` | `1` | Zoom level |
| `modeAtom` | `RenderMode` | `Dynamic` | `Dynamic` (html) or `Static` (svg) |
| `verticalModeAtom` | `"html" \| "legacy"` | resolved | Vertical layout engine |
| `diagramElementAtom` | `HTMLElement \| null` | `null` | Ref to diagram DOM node |

### Selection / Interaction

| Atom | Type | Description |
|---|---|---|
| `selectedAtom` | `string[]` | Selected participant names |
| `selectedMessageAtom` | `{ start, end, token } \| null` | Currently selected message code range |
| `cursorAtom` | cursor state | Line cursor for message highlighting |
| `stickyOffsetAtom` | `number \| false` | Sticky participant header offset |

### Feature Flags

| Atom | Default | Description |
|---|---|---|
| `enableParticipantInsertionAtom` | `false` | Show participant insert controls |
| `enableMessageInsertionAtom` | `false` | Show message insert controls |
| `enableDividerInsertionAtom` | `false` | Show divider insert controls |
| `enableParticipantStyleEditingAtom` | `false` | Click-to-edit participant styles |
| `enableNumberingAtom` | `true` (localStorage) | Auto-number messages |
| `enableMultiThemeAtom` | `true` | Theme picker visible |
| `enableScopedThemingAtom` | `false` | Scoped CSS theming |
| `showTipsAtom` | `false` | Tutorial tips dialog |

### Drag & Drop

| Atom | Description |
|---|---|
| `createMessageDragAtom` | Drag state for creating a new message |
| `messageReorderDragAtom` | Currently dragged message key |
| `messageReorderPendingAtom` | Drag intent pending threshold |
| `messageReorderDropAtom` | Drop target |

### Event Callbacks

These atoms hold functions passed in from the embedding application:

| Atom | Signature | Description |
|---|---|---|
| `onContentChangeAtom` | `(code: string) => void` | Called when user edits DSL |
| `onThemeChangeAtom` | `(data: { theme, scoped }) => void` | Called on theme change |
| `onEventEmitAtom` | `(name, data) => void` | Generic event bus |
| `onElementClickAtom` | `(codeRange: CodeRange) => void` | Called on diagram element click |
| `onMessageClickAtom` | `(context, element) => void` | Called on message click |

### Lifecycle

| Atom | Description |
|---|---|
| `lifelineReadyAtom` | Names of lifelines that have rendered |
| `renderingReadyAtom` | `true` when all lifelines have rendered |

## Width Provider

The horizontal coordinate system needs to measure text. Two implementations:

```typescript
resolveWidthProvider()
// → WidthProviderOnBrowser  (default, uses DOM measurement)
// → WidthProviderOnCanvas   (URL param ?WIDTH_PROVIDER=canvas or env VITE_WIDTH_PROVIDER=canvas)
```

## Using Atoms in Components

```typescript
import { useAtomValue, useSetAtom } from 'jotai'
import { codeAtom, themeAtom } from '@/store/Store'

// Read
const code = useAtomValue(codeAtom)

// Write
const setCode = useSetAtom(codeAtom)
setCode(newCode)

// Read + write
const [theme, setTheme] = useAtom(themeAtom)
```

## Provider Setup

`DiagramFrame` wraps its subtree in a Jotai `Provider` with initial values from props:

```typescript
<Provider initialValues={[[codeAtom, initialCode], [themeAtom, theme], ...]}>
  <SeqDiagram />
</Provider>
```

This means each `DiagramFrame` instance is fully isolated — multiple diagrams on the same page have independent state.
