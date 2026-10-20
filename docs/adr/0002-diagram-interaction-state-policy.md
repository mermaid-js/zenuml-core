# 0002 — One interaction state and a capability policy for on-canvas controls

Date: 2026-10-14
Status: Accepted (P1–P4 implemented; known gaps are listed under P4)

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
`enableDividerInsertionAtom` for dividers). P4 kept this split (see P4).

`hoverAffordance` covers hints that appear only on hover and only invite an
action: the gap handle and its tooltip, the reorder handle's hover reveal
and the occurrence create-drag hint (P4). A row that is part of the current
state keeps its hint: the moving message of a reorder and the selected
message of an open menu still reveal their own handle. The collapse
buttons' hover reveal follows `collapse`, not `hoverAffordance`, because
collapse is view-only and must stay live in `RenderMode.Static`.

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
- **B — input gate.** One capture-phase `pointerdown` listener reads the
  target's `data-cap`. When the current state does not allow it, the
  listener consumes the press and exits the state (R2). Implemented in P3
  (`src/store/interaction/InteractionController.tsx`); see P3 below for
  where the listener lives.

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
  - **`hoverAffordance` had no consumer.** P4 wired it.

- **P3 (done).** `InteractionController`, mounted once in `SeqDiagram`
  (Dynamic mode), owns all input that exits a state:

  ```
  document pointerdown (capture):
    clear the selected message unless the press is on it or in its menu
    clear a participant highlight (P4) unless a derived state owns it, or
      the press is outside the diagram or on a participant or a message
    if textEditing or state is idle / a drag: stop
    if target is inside [data-interaction-surface=<state.kind>]: stop
    cap = closest [data-cap] inside the diagram
    if cap and !can(state, cap): preventDefault, stopPropagation,
                                 swallow the press's click / contextmenu
    blur a focused element in the surface      // commits a draft
    exit(state, { type: "press", target })     // listeners, then model
  document keydown (bubble), Escape:
    if !textEditing: exit(state, { type: "escape" }); clear selected message
  store.sub(derivedInteractionAtom): drop a stored menu (yieldMenuAtom)
  ```

  `exit` runs the owners' `useInteractionExit` listeners, then
  `exitInteractionAtom` writes the model: the editor clears `selectedAtom`, a
  menu clears `openMenuAtom`, a create drag clears the drag and its
  participant selection, a reorder clears the pending, drag and drop atoms.

  `data-cap` targets: participants and messages (`select`), both collapse
  buttons (`collapse`, through `useCapClick`'s `pressProps`), gap zones and
  create-drag occurrences (`createMessage`), the reorder handle (`reorder`),
  the participant insert buttons (`insertParticipant`). Active surfaces
  (`data-interaction-surface`): the participant editor's root, the message
  menu (`#style-panel`), and a gap zone while its menu is open.

  Listeners removed, each covered by a controller test (component spec, and
  the E2E specs that already exercised it):

  | Removed                                           | Now                                      |
  | ------------------------------------------------- | ---------------------------------------- |
  | `ParticipantStylePanel` `document` pointerdown    | click-away; draft blur is central        |
  | `ParticipantStylePanel` `document` keydown        | Escape                                   |
  | `StylePanel` `useOutsideClick` (`document` click) | click-away, on `pointerdown`             |
  | `StylePanel` `window` keydown                     | Escape                                   |
  | `GapHandleZone` `document` pointerdown            | click-away; the open zone is the surface |
  | `Block` `window` keydown (reorder cancel)         | Escape                                   |
  | `MessageCreateControls` `window` keydown          | Escape                                   |

  `useOutsideClick`, `useDocumentEvent` and `useLatestValue` had no other
  users and are deleted.

  Listeners kept, because they are not exit handlers:

  - `ParticipantStylePanel` pending-reselect `pointerup` / `pointercancel` /
    `keydown` (capture). They follow one press to its end so that a
    participant node detached by a committed draft is still reselected. The
    trigger moved into the editor's `useInteractionExit` listener.
  - `Block` `window` pointercancel and the drag `pointermove` / `pointerup`
    in `Block` and `MessageCreateControls`: the drags' own pointer lifecycle.
  - `MessageReorderHandle` click suppressor: the browser retargets the
    click after a drag.
  - `GapHandleZone`'s `onKeyDown` Escape: an element handler that also
    returns the focus to the zone. The central Escape covers the menu when
    the focus is elsewhere.
  - `Debug` keydown: not an interaction.

  P3 decisions and deviations:

  - **The listener is on `document`, not on the diagram root.** The
    participant editor and the message menu render through
    `FloatingPortal`, outside the root, and click-away must also see presses
    on the host page. One capture listener on `document` per diagram does
    both: it gates only targets inside its own diagram and only exits for
    the rest. A capture listener on `document` also runs before React's
    root-container listeners, so `stopPropagation` stops every React
    handler on the path.
  - **Gate B decides on the primary state only.** The text-edit overlay is
    not gated: `preventDefault` on `pointerdown` would keep the focus, and an
    edit ends on blur. While a text editor is active the controller does
    nothing; the press ends the edit.
  - **`useCapClick` stays, for the overlay.** For a primary state gate B
    makes it redundant: a consumed press never reaches the control, and its
    click is swallowed. The press-time record still covers the text-edit
    overlay. `useCapClick` now also puts `data-cap` on `pressProps`, so a
    control declares its capability once.
  - **A consumed press swallows its `click` and `contextmenu`** until
    `pointerup` plus one task (`pointercancel` ends it at once):
    `preventDefault` on `pointerdown` does not cancel either.
  - **Any button.** A right-click is a press. With a gap menu open, a
    right-click on another gap only closes the menu; the next right-click
    opens that gap's menu. This replaces the P2 behaviour.
  - **Message click-away moved from `click` to `pointerdown`,** like the
    editor and the gap menu. The rule is the same: a press anywhere but on
    the selected message or in its menu clears the message selection, even
    when the menu is closed.
  - **A press on an allowed target still exits** but is not consumed: the
    target's own handler acts on the same press (another participant
    switches the editor, another message opens its menu).
  - **Drags ignore presses.** A drag owns the pointer; only Escape ends it.
    The drags' `pointerup` handlers now read the store, so a release that
    follows Escape before React re-renders does not drop or insert.
  - **R1 for derived states is structural.** `interactionAtom` now reads
    `derivedInteractionAtom` (drags, editor) before the stored menu. The
    controller subscribes to it and clears `openMenuAtom` when a derived
    state starts, whatever code path started it, so the menu does not come
    back when the drag or the editor ends.
  - **Owners keep side effects, not exits.** `useInteractionExit` listeners
    run before the model exit while the owner still sees its state. Only the
    participant editor registers one (pending reselect).
  - **No `textEdit` targets.** Labels sit inside messages and participants
    and take their `select` capability. P4 can tag them if a state needs to
    tell them apart.

- **P4 (done).** The ADR listed two items: replace the remaining ad-hoc
  predicates with `useCan`, and wire `hoverAffordance`. P4 also removed the
  second selection click-away owner. Nothing else was in P4's scope.

  Two read helpers were added next to `useCan` (`useCan.ts`):

  - `useActiveSurface()` (`activeSurfaceAtom`): the state whose own UI
    shows, or `null` while idle, in `RenderMode.Static` or under a text
    edit. The participant editor and the message menu render from it.
  - `useTextEditing()`: the text-edit overlay. Components read it only to
    step out of an active editor's way or to end a state when an edit
    starts; `can()` already folds it into every capability.

  Predicate sites replaced (`src/components/DiagramFrame/SeqDiagram/`):

  | Site                                                       | Was                                                                      | Now                                                             |
  | ---------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
  | `ParticipantInsertControls` render and `handleInsert`      | `textEditing`, `mode === Dynamic`, `selected.length === 1`               | `enabled && useCan("insertParticipant")`                        |
  | `ParticipantStylePanel` open effect and render guard       | `enabled`, `mode`, `selected.length === 1`, `!dragState`, `!textEditing` | `useActiveSurface()?.kind === "participantEditor"`              |
  | `MessageCreateControls` render, dataset flag, drag effects | `enabled && !textEditing && mode === Dynamic`                            | `enabled && useCan("createMessage")`; a drag that loses it ends |
  | `Block` reorder cancel on text edit                        | `textEditing`                                                            | a reorder that loses `reorder` ends                             |
  | `StylePanel` button row                                    | `isOpen && !textEditing`                                                 | `useActiveSurface()?.kind === "messageMenu"`                    |
  | `GapHandleZone` handle, hover enter, nearest participant   | `!dragState && !menuOpen`                                                | `useCan("hoverAffordance")`                                     |
  | `Participant` click and Enter                              | none (selected in any mode)                                              | `useCan("select")`                                              |
  | `Message`, `SelfInvocation` click                          | `mode !== Static`                                                        | `useCan("select")`                                              |
  | `SeqDiagram` root `onClick`                                | its own click-away                                                       | removed; `InteractionController` owns click-away                |

  Reads kept, because they are not gates: the selection ring and
  `data-selected` (`selectedAtom`, `selectedMessageAtom`), the drag ghost
  and drop indicator (`createMessageDragAtom`, the reorder atoms), the
  drags' own pointer lifecycle, the setters that start a drag, and
  `StylePanel`'s `store.get(textEditingAtom)` in the deferred message-click
  callback (a double click can start an edit before it runs). Mode reads
  kept as structural (R3): `SeqDiagram`'s Dynamic branch, `MessageLayer`'s
  `enableGapHandles`, `GapHandleZone`'s Static guard, `EmptyDiagramPrompt`,
  `LifeLineLayer`'s width, and the participant's sticky offset, cursor,
  role, tab stop and title.

  `hoverAffordance` consumers:

  - reorder handle hover reveal: `Block` sets `data-hover-reveal="off"` on
    rows that must not reveal it; `MessageLayer.scss` honours it. During a
    reorder only the moving row reveals its handle. Touch (`any-pointer:
coarse`) shows handles without hover and is unchanged.
  - occurrence create-drag hint (crosshair cursor and title): hidden while
    a create drag runs, which keeps `createMessage`.
  - gap handle and tooltip (no visible change; it replaced
    `!dragState && !menuOpen`).

  Considered and not wired: the participant insert `+` reveal (the whole
  control already needs `insertParticipant`, which only idle allows),
  label hover (`EditableSpan`; `messageMenu` allows `textEdit` but not
  `hoverAffordance`, so it is the wrong capability), and the collapse
  buttons (see the capability notes above). The occurrence collapse
  button's CSS reveal had no gate; it now carries `hover-reveal` only while
  `collapse` is allowed, like the fragment's `group-hover` class.

  P4 decisions:

  - **Embedder flags stay out of `can()`.** One capability still spans
    several flags (`createMessage`), and a flag is configuration, not
    interaction state. Components keep ANDing their flag.
  - **One selection click-away owner.** `SeqDiagram`'s root `onClick`
    cleared participant and message selection on `click`. The controller
    already cleared the message selection and closed the participant
    editor on `pointerdown`. The root `onClick` also cleared a participant
    highlight that is not the editor (editor flag off, or several
    participants toggled on); the controller now does that too, on a press
    inside the diagram that is not on a participant or a message. A derived
    state (the editor, a drag) owns its selection and is left alone. Host
    page presses do not clear a highlight, as before. The root `onClick` is
    removed. `SeqDiagram.selection.spec.tsx` pins the behaviour through the
    real diagram.
  - **Static renders do not select.** The controller mounts only in
    Dynamic, so without the root `onClick` nothing would clear a selection
    in `RenderMode.Static`. `select` is not view-only, so participant,
    message and self-invocation clicks now select through `useCan("select")`
    and a static render no longer highlights a clicked participant.

  Known gaps:

  - **No `textEdit` targets.** Labels still decide editability by mode
    (`ParticipantLabel`, `ConditionLabel`, `EditableLabelField`,
    `CreationMessageLabel`, `DiagramTitle`), and `EditableSpan`'s hover
    style is not gated. A state that must tell a label from its message or
    participant needs a `textEdit` tag first.
  - **Overlay-start transitions are per owner.** A text edit that starts
    ends a create drag (`MessageCreateControls`), a reorder (`Block`) and
    the message menu (`StylePanel`) from three effects, not from the
    controller. `exitInteractionAtom` is not a drop-in: its `createDrag`
    branch also clears the participant selection.
  - **A participant highlight is outside the union.** With the editor off,
    `selectedAtom` can hold several participants and is not a state; the
    controller clears it as a side rule.
  - **Touch reorder handles** are always visible on coarse pointers and do
    not follow `hoverAffordance`.

## Consequences

- While the participant editor is open, gap handles, the divider menu,
  occurrence create-drag, reorder handles and collapse buttons do not react.
  A press on them only closes the editor (gate B consumes it, P3).
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
  collapse button only closes the menu. After the menu closes — a style
  applied, Escape, a click elsewhere — the message can stay selected and
  nothing is blocked.
- While a gap's insert menu is open (P2), no other gap handle, occurrence
  create-drag, reorder handle, collapse button or participant insert button
  reacts. From P3 a press on a participant, a message or another gap
  (right-click included) only closes the menu; the next press acts.
- From P3, Escape closes whichever state is open — the participant editor,
  a menu, a create drag or a reorder — from one place. A control that must
  keep its own Escape (a picker, a text field, the gap zone) stops the
  event; the central handler is on `document` in the bubble phase.
- From P4, hover hints show only while idle: during a reorder only the
  moving message reveals its handle, and during a create drag occurrences
  show no create hint. The occurrence collapse button no longer appears on
  hover while another interaction owns the diagram.
- From P4, participant insert buttons stay available while a participant
  is only highlighted (editor flag off); before, any single highlighted
  participant hid them.
- From P4, a static render does not highlight a clicked participant.
- From P4, selection click-away runs on `pointerdown` from one owner. A
  press on empty canvas clears a participant highlight before its click,
  not after it.
- From 2026-10-20, a press on another participant while the participant
  editor is open does not exit the editor; the participant's click moves the
  selection and the editor follows it. Before, the press exited and the
  click reopened, which unmounted the editor (mask and row) between the two
  events and flashed. A press on the canvas, a message or outside the
  diagram still exits on `pointerdown`.
