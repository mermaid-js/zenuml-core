# Sequence Editor Interaction Polish Design

Date: 2026-04-02

## Goal

Polish the first batch of sequence editor interactions so they behave more like a coherent visual editor for non-DSL users.

This design covers only the next implementation slice:

1. Unify selected state for messages and participants
2. Improve discoverability of participant insert and message create
3. Make message create feedback spatially clearer without changing message insertion semantics yet

This design does not include:

- Cross-fragment move
- AST-backed structural editing
- Participant reorder
- Multi-select
- Full create-message row placement by drop Y

## Why This Slice

The current features work, but they still feel like separate utilities:

- participant insert uses hover-only gap buttons
- message create uses a different small handle
- message edit uses a floating toolbar with no persistent selection state
- reorder uses another handle style again

The shortest path to a better editor is not more features. It is making the existing P0/P1 interactions legible and consistent.

## Chosen Approach

Recommended approach: add a lightweight canvas interaction model on top of the current string-transform implementation.

Why:

- It improves user-facing behavior immediately.
- It does not force an AST refactor before we know the exact interaction language we want.
- It keeps the next code changes local to HTML interaction components and atoms.

Alternatives considered:

1. Full structural edit refactor first
   Too expensive for the current need. It hardens internals before the UX language settles.

2. Add only visual polish with no shared interaction state
   Faster short term, but it repeats the current problem: each feature keeps its own isolated rules.

## UX Design

### Selection Model

Messages:

- Clicking a message selects it.
- The selected message gets a visible outline or halo.
- The contextual toolbar anchors to the selected message.
- Clicking the same message again keeps selection; it does not toggle off.

Participants:

- Hovering a participant header reveals the create-message affordance.
- Selecting a participant header gives it a visible selected treatment.
- The selected participant is mainly for discoverability and future extensibility, not for a new toolbar in this slice.

Canvas dismissal:

- Clicking empty canvas clears selection.
- `Escape` clears selection and closes any floating interaction chrome that belongs to selection.

### Discoverability

Participant insert:

- Gap controls remain between lifelines and at both outer edges.
- Default state becomes faintly visible, not fully hidden.
- Hover and nearby participant selection strengthen visibility.
- Add a `title` tooltip: `Add participant`.

Message create:

- Header handle becomes larger and more legible.
- Handle is faintly visible by default and stronger on participant hover/selection.
- Add a `title` tooltip: `Drag to create message`.
- While dragging, valid target participants get a highlight.

### Message Create Feedback

The message will still append to the DSL in this slice, but the gesture needs to communicate state better:

- show a dashed preview line from source to pointer
- show highlighted valid targets while dragging
- show source participant as active
- support `Escape` to cancel the drag

No fake row preview will be shown yet. That would imply a placement model we are not implementing in this slice.

## State Changes

Add lightweight shared atoms for:

- selected message identity or code range
- selected participant id
- active create-message drag state

These atoms should live in `src/store/Store.ts` beside the existing click and pending-edit atoms.

Rules:

- message selection and participant selection are mutually exclusive
- starting create-message drag clears message selection
- successful message creation clears participant selection and enters label edit

## Component Changes

### `src/store/Store.ts`

- Add atoms for selected message, selected participant, and create drag state.
- Keep `pendingEditableRangeAtom` as the way to trigger edit mode after transform-based actions.

### `src/components/DiagramFrame/SeqDiagram/MessageLayer/StylePanel.tsx`

- Read and write the shared selected-message atom instead of treating click as purely transient.
- Close when selection clears.
- Keep existing rename and type-switch behavior unchanged in semantics.

### `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantInsertControls.tsx`

- Change gap button visibility from hidden-until-hover to soft-visible.
- Add tooltip/title.
- Optionally increase hit target slightly.

### `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/MessageCreateControls.tsx`

- Move drag state into shared atom or mirror it there.
- Add target highlighting during drag.
- Support `Escape` cancellation.
- Increase handle size and update visibility rules.
- Mark hovered/selected source participant while dragging.

### Message / participant rendered DOM

- Apply selected-state classes or data attributes so Playwright can assert them.
- Prefer stable attributes such as `data-selected="true"` instead of only testing CSS class names.

## Testing

### Unit

No new transform semantics are introduced in this slice, so transform unit tests should stay mostly unchanged.

### Playwright

Add or extend tests for:

1. Clicking a message sets selected state and shows the toolbar.
2. Clicking empty canvas clears selected state.
3. Participant insert affordance is visible without hover.
4. Message create handle is visible without hover.
5. Dragging from A highlights B as a valid target.
6. Pressing `Escape` during drag cancels creation and does not change DSL.

## Acceptance Criteria

1. A selected message is visually distinct and its toolbar remains stable until dismissed.
2. Insert and create affordances are discoverable without requiring perfect hover.
3. During message creation, valid targets are visibly highlighted.
4. `Escape` cancels message creation cleanly.
5. Existing participant insert, message create, rename, wrap, and reorder tests still pass or are updated intentionally.

## Risks

1. Selection state can fight existing outside-click logic if ownership is unclear.
2. DOM-query-based target detection may become flaky if highlight overlays intercept events.
3. Reorder and create handles can visually compete if spacing is not normalized.

## Implementation Order

1. Add shared selection and drag atoms.
2. Update message selection and toolbar behavior.
3. Update participant insert visibility rules.
4. Update message create affordance, drag highlighting, and `Escape` cancel.
5. Extend Playwright coverage.
