# Keyboard-Only Editing on Diagram

**Date:** 2026-04-15
**Branch:** `feat/keyboard-editing` (based on `feat/sequence-editor-interactions-v3`)
**Status:** Design approved — ready for implementation plan

## Goal

Give power users a keyboard-only path to the four most-used edit-on-diagram operations, with the speed-of-flow feel of Miro's sticky workflow. Keyboard is additive to mouse; mouse editing continues to work unchanged.

## Scope

In scope (v1):

- Add participant (positional)
- Rename participant
- Add message
- Rename message

Out of scope (v1): delete, reorder, style panels, dividers, fragment creation, participant type/color.

## Audience

Power users who stay on the keyboard for speed. Not optimizing for screen readers in v1 (though the focus model is screen-reader-compatible as a side effect of following ARIA composite-widget conventions).

## Core principles

1. **Two focus rings** — participants and messages are separate navigation rings. They never collide, so the "Tab spawns sibling in edit mode" gesture always creates the right kind of thing.
2. **ARIA composite widget** — the entire diagram is one Tab stop from the page's perspective. Arrow keys navigate inside; Tab exits.
3. **Miro-style Tab-to-sibling** — inside edit mode, Tab saves and spawns a sibling, exactly like Miro sticky notes.
4. **Additive** — no mouse interaction is removed or changed. Keyboard is layered on via new atoms and a new hook.

## Interaction model

### Two focus rings

- **Participants ring** — cycles through `ParticipantLabel` elements in DSL order, skipping the implicit `_STARTER_`. Wraps N → 0.
- **Messages ring** — cycles through every focusable message label in DSL order, walking into fragments (`alt`, `loop`, `par`, etc.). Wraps.

Exactly one of `focusedParticipantAtom` / `focusedMessageAtom` is non-null at any time.

### Keymap

#### Navigation (outside edit mode)

| Key | Action |
|---|---|
| `↑` / `↓` | Previous / next message in DSL order (inside messages ring) |
| `←` / `→` | Previous / next participant (inside participants ring); no-op inside messages ring |
| `↓` on a participant | Drop into messages ring, focus first message |
| `↑` on the first message | Jump up to the focused message's `from` participant |
| `Enter` | Enter edit mode on the focused element |
| `Tab` / `Shift+Tab` | Exit the diagram widget (standard page Tab flow) |
| `Esc` | Blur the diagram (returns to page focus flow) |

#### Edit mode (participant or message label)

| Key | Action |
|---|---|
| `Tab` | Save current, create sibling **after** current, enter edit mode on the new one |
| `Shift+Tab` | Save current, create sibling **before** current, enter edit mode on the new one |
| `Enter` | Save and exit edit mode (focus stays on the just-edited element) |
| `Esc` | Cancel edit, revert to original text, exit edit mode |

Arrow keys inside edit mode go to the browser's caret (text cursor movement), not navigation.

### Sibling semantics

- **Participant Tab-sibling** — inserts a new participant in the DSL participant list adjacent to the current one. Name is blank; auto-generated via `generateName()` (reused from `ParticipantInsertControls`) if left empty. New participant auto-opens in edit mode.
- **Message Tab-sibling** — inserts a new message in the same `blockContext` at `insertIndex ± 1`, inheriting both `from` and `to` from the current message (optimizes for the "another call from A to B" case). Label is blank and auto-opens in edit mode.
- **Empty-text guard** — if the current label is empty when Tab is pressed, Tab is a no-op (does not spawn another blank sibling). Prevents infinite spawn when the user hesitates.

### Entry points

1. Browser Tab reaches the diagram container → first participant auto-focuses.
2. Empty diagram → focus lands on a phantom "Add participant" placeholder; Enter opens it as a blank editable participant.
3. No messages yet → `↓` from a participant is a no-op until the first message is created.

## Visual feedback

- **Focus ring (participants)** — 2px sky-blue ring around `.participant` plus a subtle background tint. Same blue as existing `focus-visible:ring-sky-300` in `ParticipantInsertControls`.
- **Focus ring (messages)** — 2px sky-blue outline on the message row; arrow line thickened slightly. Keyed off `focusedMessageAtom` so it does not clash with mouse `selectedMessageAtom`.
- **Edit mode** — reuses the existing `.editable-span-editing` class from `EditableSpan.css`. No new visual.
- **Empty-diagram placeholder** — dashed 1px outline box at participant-0 position, text "Add participant", focusable.

## Architecture

### New files

- `src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.ts` — top-level hook installed on `SeqDiagram`. Owns the global keydown listener. Reads focus atoms and ring lists; dispatches navigation, Enter, Esc, Tab-escape. Delegates edit-mode Tab to element-level handler.
- `src/components/DiagramFrame/SeqDiagram/keyboard/rings.ts` — pure functions `buildParticipantRing(rootContext)` and `buildMessageRing(rootContext)`. Walk the parse tree in DSL order, return navigable elements with `blockContext` / `insertIndex` coordinates. Unit-tested against fixture DSLs including nested fragments.
- `src/components/DiagramFrame/SeqDiagram/keyboard/EmptyDiagramPlaceholder.tsx` — the focusable "Add participant" phantom. Reuses `EmptyDiagramPrompt` from the base branch if it exists.

### Modified files

- `src/store/Store.ts`
  - `focusedParticipantAtom: atom<string | null>`
  - `focusedMessageAtom: atom<{ blockContext: any; insertIndex: number } | null>`
  - Paired setter atoms that ensure only one is non-null.
- `src/components/common/EditableSpan/EditableSpan.tsx` — new optional prop `onTabCreateSibling?: (direction: "before" | "after") => void`. When provided and Tab/Shift+Tab is pressed in edit mode, `preventDefault()`, save current text, call the callback.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.tsx` — wire `onTabCreateSibling` to `insertParticipantIntoDsl()` (already exists) at `currentIndex ± 1`, then set `focusedParticipantAtom` + `pendingEditableRangeAtom` so the new one auto-opens in edit mode. Add focus-ring rendering keyed off `focusedParticipantAtom`.
- `src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.tsx` — same pattern: wire `onTabCreateSibling` to `insertMessageInDsl()` with inherited `from` / `to` from the current message's context.
- `src/components/DiagramFrame/SeqDiagram/SeqDiagram.tsx` — install `useDiagramKeyboard`, set `tabIndex={0}` on the container, auto-focus first participant on container focus.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx` and message components — render focus-ring CSS when their id matches the focused atom.

### Not touched

- `GapHandleZone`, `ParticipantInsertControls`, `MessageCreateControls`, `StylePanel`, `ParticipantStylePanel` — all mouse interactions untouched.
- `selectedAtom` / `selectedMessageAtom` — remain mouse-only; keyboard uses its own focus atoms.

## Testing

- **Unit (Vitest)**
  - `rings.spec.ts` — ring builders handle top-level messages, messages inside `alt` / `loop` / `par`, self-invocations, empty diagrams.
  - `useDiagramKeyboard.spec.ts` — fires synthetic keyboard events at a mounted `SeqDiagram`, asserts focus atom transitions for each key.
- **E2E (Playwright)**
  - `e2e/fixtures/keyboard-editing.html` — fixture with a small seeded diagram.
  - Spec flow: Tab in → Enter → type → Tab-to-sibling participant → `↓` into messages → Enter → type → Tab-to-sibling message → Esc → arrow nav → Tab-out.

## Rationale: why arrow keys for navigation (not Tab)

Early in the design we considered using Tab as primary navigation, matching the literal Miro gesture. Research on the W3C WAI-ARIA Authoring Practices Guide (APG) and on shipping diagramming tools (Figma, Excel, Google Sheets, Miro, Excalidraw, Lucidchart, VS Code) showed:

1. **APG composite widget rule** — any complex widget should be one Tab stop; arrow keys navigate inside. Making Tab the primary navigation would have trapped users inside the diagram and made it hard to reach the rest of the page.
2. **Miro itself** uses arrow keys for primary navigation. Tab in Miro is *only* the "create sibling while editing a sticky" gesture.
3. **Every comparable tool** uses arrow keys for in-canvas navigation.

The final design keeps the Miro Tab-to-sibling gesture exactly where Miro has it — in edit mode — and uses arrows for navigation per ARIA and tool conventions.

## Open questions (deferred)

- Delete keyboard gesture (v2): probably `Cmd+Backspace` on focused element.
- Reorder keyboard gesture (v2): probably `Alt+↑` / `Alt+↓` on focused message.
- Keyboard invocation of `StylePanel` / `ParticipantStylePanel` (v2).
- `Home` / `End` / `PgUp` / `PgDn` support (v2).
