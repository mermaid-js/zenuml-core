# 0002 — One interaction state and a capability policy for on-canvas controls

Date: 2026-10-14
Status: Accepted (P1 implemented; P2–P4 are follow-ups)

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

| Kind                | Meaning                                     |
| ------------------- | ------------------------------------------- |
| `idle`              | Nothing owns the diagram                    |
| `participantEditor` | The on-canvas participant editor is open    |
| `messageMenu`       | A message is selected and its menu can show |
| `gapMenu`           | A gap's insert menu (divider) is open       |
| `createDrag`        | A create-message drag runs                  |
| `reorderDrag`       | A message reorder is pending or running     |

Text editing (`activeTextEditorsAtom` / `textEditingAtom`) stays an
**overlay**, not a state: a text edit nests inside the editor or a menu.

### Capability policy

`src/store/interaction/policy.ts` holds a table from state to capability:

| Capability          | idle | participantEditor | messageMenu (P1) | gapMenu | createDrag | reorderDrag |
| ------------------- | :--: | :---------------: | :--------------: | :-----: | :--------: | :---------: |
| `select`            |  ✓   |         ✓         |        ✓         |         |            |             |
| `insertParticipant` |  ✓   |                   |        ✓         |         |            |             |
| `createMessage`     |  ✓   |                   |        ✓         |    ✓    |     ✓      |             |
| `reorder`           |  ✓   |                   |        ✓         |         |            |      ✓      |
| `collapse`          |  ✓   |                   |        ✓         |         |            |             |
| `textEdit`          |  ✓   |                   |        ✓         |         |            |             |
| `hoverAffordance`   |  ✓   |                   |        ✓         |         |            |             |

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
- **`messageMenu` equals idle in P1.** P1 derives it from
  `selectedMessageAtom`, which stays set after `StylePanel` closes its menu
  (`handleClick` closes the menu but keeps the selection), and
  `Occurrence.spec.tsx` expects a create-drag to start while a message is
  selected. A restrictive column would block every drag until the user
  clicks away, and R2 (consume-and-exit) does not exist until P3. The target
  column — `select`, `reorder` of the selected message, rename via the menu
  — applies once P2 lifts the menu's real open state into the atom.
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
- **R5.** Later, `selectedAtom`, `selectedMessageAtom`, the drag atoms and
  local menu state merge into `interactionAtom`.

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

- **P1 (this change).** `policy.ts` with `can()`, `interactionAtom` derived
  from the existing atoms, `useCan`. Wired into both `CollapseButton`s,
  `GapHandleZone`, `Occurrence` create-drag, and `Block` / `Message` /
  `SelfInvocation` reorder. Fixes problems 1–3. Storage does not move.
  Derivation order: `createMessageDragAtom` → reorder drag or pending →
  participant editor (`enableParticipantStyleEditingAtom` and one selected
  participant) → `selectedMessageAtom` → idle. A drag wins because an
  occurrence create-drag also selects its participant.
- **P2 (follow-up).** Move selection, drag and local menu state
  (`GapHandleZone` `menuOpen`, `StylePanel` `isOpen`, editor `openPicker`)
  into `interactionAtom`. Give `messageMenu` its target column.
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
- Collapse keeps working in `RenderMode.Static`.
