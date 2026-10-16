# 0002 — One interaction state and a capability policy for on-canvas controls

Date: 2026-10-14
Status: Accepted (P1 and P2 implemented; P3–P4 are follow-ups)

## Context

On-canvas editing controls interfere with each other. No single value says
which interaction the diagram is in. Each control ANDs its own subset of
atoms from `src/store/Store.ts`, so a control that does not read an atom
ignores the interaction that atom represents.

Evidence on `main` at v4.7.0 (paths under
`src/components/DiagramFrame/SeqDiagram/`):

1. **Participant editor open.** The editor is open when `selectedAtom` has one
   entry, `enableParticipantStyleEditingAtom` is on, the mode is Dynamic, no
   create drag runs and no text editor is active
   (`LifeLineLayer/ParticipantStylePanel.tsx`, the effect that sets `isOpen`).
   Its mask is `pointer-events-none` so that click-away and reselect reach
   the diagram. Because of that, these controls stay live under the mask:

   - gap-handle message create and divider insert
     (`MessageLayer/GapHandleZone.tsx`, `canCreateMessage` /
     `canInsertDivider` check only `textEditingAtom`);
   - occurrence create-drag
     (`.../Interaction/Occurrence/Occurrence.tsx`, `dragEnabled`);
   - message reorder (`MessageLayer/Block/Block.tsx` `reorderEnabled`,
     `.../Message/Message.tsx`, `.../SelfInvocation/SelfInvocation.tsx`);
   - fragment and occurrence collapse.

   Only `ParticipantInsertControls.tsx` hides, with its own
   `selected.length === 1` check.

2. **Collapse has no gating.** `Fragment/CollapseButton.tsx` and
   `Interaction/Occurrence/CollapseButton.tsx` call `onClick` without any
   check. The collapsed flag is local `useState`
   (`Fragment/useFragmentData.ts`, `Occurrence.tsx`).
3. **Drags ignore each other.** `Block.tsx` reorder does not read
   `createMessageDragAtom`; `GapHandleZone.tsx` does not read
   `messageReorderDragAtom` or `messageReorderPendingAtom`.
4. **Open menus are local state.** `GapHandleZone` `menuOpen`, `StylePanel`
   `isOpen`, the participant editor's `openPicker`.
5. **Escape and click-away** are handled by about six separate `document` /
   `window` listeners (participant editor, `StylePanel`, `GapHandleZone`,
   `Block` reorder cancel, and others).
6. **The same predicate is copied.**
   `enabled && !textEditing && mode === RenderMode.Dynamic` appears in 7+
   files.

The lifeline create-drag named in early notes is the gap handle: the gap
zone draws its handle on the nearest lifeline. `MessageCreateControls.tsx`
only follows a drag that `GapHandleZone` or `Occurrence` started.

## Decision

### One primary interaction state

`interactionAtom` holds a discriminated union:

| Kind                | Meaning                                  |
| ------------------- | ---------------------------------------- |
| `idle`              | Nothing owns the diagram                 |
| `participantEditor` | The on-canvas participant editor is open |
| `messageMenu`       | A message's style menu is open           |
| `gapMenu`           | A gap's insert menu (divider) is open    |
| `createDrag`        | A create-message drag runs               |
| `reorderDrag`       | A message reorder is pending or running  |

Text editing (`activeTextEditorsAtom` / `textEditingAtom`) stays an
**overlay**, not a state: a text edit nests inside the editor or a menu.

### Capability policy

`src/store/interaction/policy.ts` holds a table from state to capability:

| Capability          | idle | participantEditor | messageMenu | gapMenu | createDrag | reorderDrag |
| ------------------- | :--: | :---------------: | :---------: | :-----: | :--------: | :---------: |
| `select`            |  ✓   |         ✓         |      ✓      |         |            |             |
| `insertParticipant` |  ✓   |                   |             |         |            |             |
| `createMessage`     |  ✓   |                   |             |         |     ✓      |             |
| `reorder`           |  ✓   |                   |     ✓¹      |         |            |      ✓      |
| `collapse`          |  ✓   |                   |             |         |            |             |
| `textEdit`          |  ✓   |                   |      ✓      |         |            |             |
| `hoverAffordance`   |  ✓   |                   |             |         |            |             |

¹ Only the selected message (the one the menu belongs to):
`useCanReorderMessage(isSelected)` in `useCan.ts`.

An open menu's own items (style, rename, type, wrap; "Insert divider") are
its active surface and are not gated, the same as the participant editor's
slots and pickers.

`createMessage` covers gap/occurrence create-drag and divider insert.

```
can(cap) = POLICY[state][cap]
           && (mode === Dynamic || cap is view-only)
           && (!textEditing || cap === "textEdit")
```

Components still AND their own embedder flag (`enable*Atom`). The flag is
not in the table because one capability spans several flags
(`createMessage` = `enableMessageInsertionAtom` for drags and
`enableDividerInsertionAtom` for dividers).

Notes on the table:

- **Each drag keeps its own capability.** `createDrag` allows
  `createMessage` and `reorderDrag` allows `reorder`; otherwise the drag that
  owns the diagram could not finish (`Block.tsx` stops promoting a pending
  reorder when reorder is not allowed).
- **`messageMenu` means the menu is open, not that a message is
  selected (P2).** In P1 this column equalled idle, because P1 derived the
  state from `selectedMessageAtom`, which stays set after `StylePanel`
  closes its menu. P2 stores the menu's real open state, so the column is
  strict. A selected message whose menu is closed is `idle` and blocks
  nothing; `Occurrence.spec.tsx` still starts a create-drag in that case.
- **`gapMenu` allows nothing (P2).** P1 allowed `createMessage` so that the
  menu's "Insert divider" item worked, but that also left every other gap
  handle and occurrence create-drag live while a gap menu was open. The
  item is now the menu's ungated active surface, and the column is empty.
- **`collapse` is view-only.** It changes the view, never the code.
  `RenderMode.Static` (mermaid) renders `MessageLayer` and users collapse
  fragments there today, so `collapse` skips the mode check. This amends R3
  below.

### Rules

- **R1.** The diagram has one primary state, entered through one `enter()`
  path.
- **R2.** A press on a target the current state does not allow only exits the
  current state. The press is consumed; it does not also start the target's
  action.
- **R3.** Embedder flags and interaction state are orthogonal. In
  `RenderMode.Static` nothing that edits the diagram is allowed; view-only
  capabilities (`collapse`) stay live.
- **R4.** A new interaction adds a policy column (and, from P3, a `data-cap`
  attribute on its targets). It does not add another ad-hoc predicate.
- **R5.** Local menu state merges into the interaction state (done in P2).
  `selectedAtom`, `selectedMessageAtom` and the drag atoms merge only when a
  column needs them; P2 found none that does.

### Two enforcement gates

- **A — render gate.** `useCan(cap)` (`src/store/interaction/useCan.ts`)
  hides or disables the affordance. Implemented in P1. Click-activated
  controls use `useCapClick(cap, onClick)`, which decides on the state at
  `pointerdown`: the editor's click-away closes it on `pointerdown`, so a
  check at `click` time would let the same press also run the control.
- **B — input gate.** One capture-phase `pointerdown` listener on the diagram
  root reads the target's `data-cap`. When the current state does not allow
  it, the listener consumes the event and exits the state (R2). P3.

### Phases

- **P1 (done).** `policy.ts` with `can()`, `interactionAtom` derived
  from the existing atoms, `useCan`. Wired into both `CollapseButton`s,
  `GapHandleZone`, `Occurrence` create-drag, and `Block` / `Message` /
  `SelfInvocation` reorder. Fixes problems 1–3. Storage does not move.
  Derivation order: `createMessageDragAtom` → reorder drag or pending →
  participant editor (`enableParticipantStyleEditingAtom` and one selected
  participant) → `selectedMessageAtom` → idle. A drag wins because an
  occurrence create-drag also selects its participant.
- **P2 (done).** Open menus are stored, not derived. `openMenuAtom` holds
  `messageMenu` (`StylePanel` open) or `gapMenu` (one `GapHandleZone`'s
  insert menu, keyed by `useId()`). Owners write it only through
  `enterMenuAtom` and `exitMenuAtom`. Entering a menu replaces the open menu
  (R1). An exit names its menu and closes it only if it is still the open
  one, so a late close from an old owner cannot close a newer menu.
  Derivation order: create drag → reorder drag or pending → participant
  editor → stored menu → idle. `messageMenu` and `gapMenu` get the columns
  above. `ParticipantInsertControls` ANDs `useCan("insertParticipant")` so
  that the open message menu hides participant insertion.

  P2 decisions and deviations from the original P2 scope:

  - **Selection stays separate.** `selectedAtom` and `selectedMessageAtom`
    do not move into the union. The `messageMenu` column needs only the
    menu's open state, and selection is not one primary state: a message
    stays selected after its menu closes, and the participant editor is
    already derived from `selectedAtom`. Moving selection would touch every
    selection writer for no change in behaviour.
  - **Drag state stays derived.** `createMessageDragAtom` and the reorder
    atoms already hold one value each and win the derivation. A drag can
    start only from a state that allows it, and the reorder press calls
    `exitMenuAtom` before it starts (R1).
  - **The participant editor's `openPicker` stays local.** The pickers are
    the editor's active surface, and no capability differs between "editor
    open" and "editor open with a picker". Lifting it would change nothing
    the policy can read.
  - **A stored menu yields to a derived state.** If a drag or the
    participant editor starts while a menu is stored, the derived state wins
    and the menu hides. Today every path into those states closes the menu
    first (the gap menu's `pointerdown` click-away, `StylePanel`'s
    click-away and its `!selectedMessage` effect, the reorder press). P3's
    root gate makes this structural.
  - **The P1 note on the participant editor without an anchor still
    applies.** The editor state is still derived from `selectedAtom`.
  - **`hoverAffordance` has no consumer yet.** The column is set; P4 wires
    it.

- **P3 (follow-up).** Root capture gate (B) with `data-cap` attributes;
  delete the scattered Escape / click-away listeners.
- **P4 (follow-up).** Replace the remaining ad-hoc predicates (for example
  `ParticipantInsertControls`, `ParticipantStylePanel`,
  `MessageCreateControls`) with `useCan`.

## Consequences

- While the participant editor is open, gap handles, the divider menu,
  occurrence create-drag, reorder handles and collapse buttons do not react.
  A press on them still reaches the editor's click-away listener, which
  closes the editor; the press itself does nothing.
- While a create drag runs, reorder does not start and collapse does nothing.
  While a reorder is pending or running, gap handles do not show.
- In P1 the participant editor state is derived without the editor's anchor
  element. If the selected participant has no DOM node, controls stay
  blocked although no editor shows. This matches the click-away behaviour
  and ends in P2.
- A new on-canvas control must read `useCan` instead of combining atoms. A
  review that sees `!textEditing && mode === RenderMode.Dynamic` in new code
  should ask for a capability instead.
- While a label is in edit mode, a press on a collapse button only ends the
  edit (the text-edit overlay); a second press collapses. Before P1 the same
  press ended the edit and collapsed.
- Collapse keeps working in `RenderMode.Static`.
- While a message's style menu is open (P2): gap handles, the divider menu,
  occurrence create-drag, collapse buttons and participant insertion do not
  react, and only the selected message shows a reorder handle. A press on a
  collapse button only closes the menu (its click-away runs on `click`;
  the collapse decides on `pointerdown`). After the menu closes — a style
  applied, Escape, a click elsewhere — the message can stay selected and
  nothing is blocked.
- While a gap's insert menu is open (P2), no other gap handle, occurrence
  create-drag, reorder handle, collapse button or participant insert button
  reacts. A press elsewhere closes the menu first (its `pointerdown`
  click-away), so a right-click on another gap closes the open menu and
  opens that gap's menu.
