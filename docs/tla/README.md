# TLA+ models

`InteractionPolicy.tla` models the on-canvas interaction state of one diagram
from [ADR 0002](../adr/0002-diagram-interaction-state-policy.md): the atoms the
state is derived from, the capability table, the `InteractionController`'s
press and Escape handling, the drags, the text-edit overlay, and the React
effects that end a state when a text edit starts. Each action names the file
that runs it.

## Running

```bash
bun run tla
```

```bash
bun run tla gaps
```

Both need Java and `tla2tools.jar` (v1.8.0). The script does not download it;
it prints the pinned download command when the jar is missing, or reads
`TLA2TOOLS_JAR`.

| Config                      | Checks                                                | Expected                                |
| --------------------------- | ----------------------------------------------------- | --------------------------------------- |
| `InteractionPolicy.cfg`     | invariants that must hold                             | pass                                    |
| `InteractionPolicyGaps.cfg` | ADR 0002 P4 known gaps written as temporal properties | counterexample until each gap is closed |

`src/store/interaction/policy.tla.spec.ts` runs with the unit tests and keeps
the model's `Policy` table equal to `POLICY` in `policy.ts`.

## Properties

Must hold (`InteractionPolicy.cfg`):

- `OneDrag`: a create drag and a reorder never run together (R1).
- `MenuYieldsToDerived`: a stored menu never outlives a drag or the
  participant editor (P3 `yieldMenuAtom`).
- `StaticIsInert`: a static render stays idle and never edits text (R3).
- `EditNestsOnlyWhereAllowed`: once the per-owner effects have run, a text
  edit only overlays idle or the participant editor. This checks that the
  three effects cover every state an edit must end (P4 known gap
  "overlay-start transitions are per owner").
- `EditorHighlightsOne`: with the editor flag on, at most one participant is
  highlighted.

Known gaps (`InteractionPolicyGaps.cfg`):

- `CreateDragEndsCleanly`: every way a create drag ends drops the participant
  it selected.
- `EditorOpensOnlyOnClick`: the participant editor opens only when a
  participant is clicked.

Both fail on the same path. An occurrence create drag selects its source
participant. Escape and a release clear that selection, but when a text edit
starts during the drag, `MessageCreateControls`' lost-capability effect (and
its release branch without the capability) clears only the drag. With the
participant editor enabled, the leftover selection derives the
`participantEditor` state, and the editor opens on the source participant
when the edit ends, although nobody clicked it.

A text edit can start during a drag because labels decide editability by
mode only (P4 known gap "No `textEdit` targets") and the controller does not
gate presses during a drag. With a mouse this needs a second pointer, for
example a second finger on a touch screen.

## Status

TLC was not run when this model was written: the authoring environment did
not allow running the TLA+ tools. The policy table is checked against the
code by the unit test above, and the gap path was confirmed against the real
store with a component-level run (Escape ends in `idle` with no selection; a
text edit started mid-drag ends in `participantEditor` with the source
participant still selected). Run `bun run tla` and `bun run tla gaps` before
relying on the remaining properties.
