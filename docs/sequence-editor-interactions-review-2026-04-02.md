# Sequence Editor Interactions Review

Date: 2026-04-02

## Scope

This note records the current implementation and interaction model for the five sequence editor interactions introduced from the `2026-04-01-sequence-editor-top5` requirement, then reviews them against the product intent and common interaction patterns used by modern visual editors.

Covered features:

1. Insert participant between lifelines
2. Drag from A to B to create a message
3. Select a message and rename or switch type
4. Select a message and wrap with `alt / loop / opt / par`
5. Reorder top-level messages

## Current Record

### 1. Insert participant between lifelines

Implementation:

- UI entry lives in `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantInsertControls.tsx`.
- Gap anchors are derived from participant geometry using `OrderedParticipants(rootContext)` and `coordinates`.
- The control renders one hover target per gap, including the left edge and right edge.
- Clicking the `+` opens an inline popover with `name` and `type`.
- Submission rewrites the participant declaration block via `insertParticipantIntoDsl` in `src/utils/participantInsertTransform.ts`.

Interaction:

- User hovers the gap between two lifelines.
- A circular `+` button fades in.
- User clicks the button, fills participant name, optionally picks a type, then clicks `Insert`.
- The DSL is rewritten immediately, the diagram rerenders, and the new participant appears in the selected slot.

Observed design choice:

- This implementation rebuilds the participant declaration section from the parsed participant list instead of applying a minimal textual insertion.

### 2. Drag from A to B to create a message

Implementation:

- UI entry lives in `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/MessageCreateControls.tsx`.
- Each participant gets a drag handle rendered near its header.
- Drag state is tracked in component state and a temporary SVG line is drawn during the gesture.
- On pointer up, the code uses `elementFromPoint(...).closest("[data-participant-id]")` to determine the drop target.
- If the target differs from the source, `createSyncMessageInDsl` appends a new sync message line to the DSL.
- The new label range is pushed into `pendingEditableRangeAtom` so the message label enters edit mode immediately.

Interaction:

- User presses the handle on participant `A`.
- A dashed preview line follows the pointer.
- User releases over participant `B`.
- A sync message is appended to the DSL and the message label immediately becomes editable.

Observed design choice:

- Message creation is append-only in v1; it does not infer vertical insertion position from the drag endpoint.

### 3. Select a message and rename or switch type

Implementation:

- UI entry lives in `src/components/DiagramFrame/SeqDiagram/MessageLayer/StylePanel.tsx`.
- The panel is opened through `onMessageClickAtom`.
- The panel reads the selected message line and surrounding context from raw code positions.
- `messageTypeTransform.ts` converts between `sync`, `async`, and `return`.
- `pendingEditableRangeAtom` is reused to auto-open inline editing for the selected label.
- Actual label editing is handled by `EditableLabelField.tsx`.

Interaction:

- User clicks a message.
- A floating mini toolbar appears.
- User can click `Rename` to focus inline label editing.
- User can click `Sync`, `Async`, or `Return` to rewrite the current line.

Observed design choice:

- The panel is attached to the clicked DOM element, but the selection model is effectively implicit; there is no persistent selected state rendered on the message itself.

### 4. Select a message and wrap with `alt / loop / opt / par`

Implementation:

- Wrap actions also live in `StylePanel.tsx`.
- `wrapMessageInFragment` in `src/utils/messageWrapTransform.ts` replaces the current message line with a fragment header, indented message body, and closing brace.
- The inserted placeholder condition is exposed through `conditionPosition`.
- `ConditionLabel.tsx` consumes `pendingEditableRangeAtom` so the newly inserted condition enters edit mode immediately.

Interaction:

- User clicks a message.
- User clicks one of the wrap actions: `Alt`, `Loop`, `Opt`, or `Par`.
- The message is wrapped as a single-statement fragment.
- The condition field immediately becomes editable.

Observed design choice:

- V1 wraps only the current message, matching the requirement note.

### 5. Reorder top-level messages

Implementation:

- Reorder lives in `src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Block.tsx`.
- Top-level statements receive a drag handle.
- While dragging, `onPointerMove` over each statement container calculates whether the drop is `before` or `after`.
- `messageReorderTransform.ts` moves the whole source line above or below the target line by string slicing.

Interaction:

- User drags the reorder handle on one top-level message.
- A horizontal blue line previews the insertion point before or after another statement.
- On release, the source message line is moved in the DSL.

Observed design choice:

- This is intentionally limited to same-layer reorder. Cross-fragment movement is not implemented.

## Review Findings

### 1. The interaction language is split across unrelated affordances

Severity: High

The five gestures do not yet feel like one editing system. Participant insertion uses hover-only plus buttons, message creation uses a tiny top handle, message edit uses click-to-open floating chrome, and reorder uses a separate side handle. Modern editors usually standardize around a clearer selection model plus a small set of repeated affordances: visible selection, contextual toolbar, and drag handles that appear in predictable places.

Impact:

- Higher learning cost for new users.
- Users have to rediscover a new gesture for each task.
- The product feels like layered utilities, not a coherent editor.

### 2. Discoverability is still fragile because core actions are mostly hover-only

Severity: High

The requirement explicitly targeted users who do not know the DSL. Those users are the least likely to hunt for invisible hover affordances. Participant insertion and message creation are both mainly hidden until hover, and the create handle is especially small. On touch devices or low-precision pointing, this is worse.

Impact:

- First-run usability depends on exploration luck.
- The P0 flows are technically implemented but not strongly self-revealing.

### 3. Message creation is operational but underspecified compared with modern connector workflows

Severity: High

Current create-message interaction only previews the dragged line. It does not show valid target highlighting, invalid-target feedback, cancellation feedback, or where the new message will land relative to existing messages. The transform is also append-only, so the gesture does not correspond to the apparent spatial drop location.

Impact:

- The visual gesture suggests spatial placement, but the data model ignores that spatial signal.
- Users may expect “drop here” semantics and instead get “append at end”.

### 4. The toolbar covers only part of the requested refine flow

Severity: Medium

The requirement page called out `Rename`, `Sync / Async / Return / Create`. Current implementation supports rename plus `sync / async / return`, but not `create`. If the product narrative is “every visible action maps back to DSL,” then omitting `create` leaves a visible gap in the story.

Impact:

- The refine step is incomplete relative to the requirement.
- Users cannot turn an existing call into a creation interaction from the same edit surface.

### 5. The transform layer is mostly string-slicing, which is fast but brittle

Severity: Medium

All five features currently rely on raw source ranges and string replacement. That made shipping fast, but it also means formatting preservation, comment attachment, edge syntax, and future multi-line moves are likely to become fragile. The participant insertion path is already rebuilding the whole participant section, while reorder and wrap operate at line granularity only.

Impact:

- Harder to extend toward cross-fragment move, multi-select wrap, or richer syntax coverage.
- Higher regression risk when comments, styling directives, semicolons, or inline constructs appear near edited nodes.

### 6. Reorder is a good v1, but it lacks the interaction safety modern editors use

Severity: Medium

The current reorder interaction gives a blue insertion line, which is the right primitive. However, it has no drag ghost, no explicit invalid region styling, no destination labels, and no clear preview for moving into or out of fragments. The line is enough for same-layer reorder, but not enough for the promised P2 mental model.

Impact:

- The step from same-layer reorder to cross-fragment move will be much larger than it first appears.
- Users may not trust the result when nested structures are involved.

### 7. Keyboard and accessibility support are under-modeled

Severity: Medium

The current flows are pointer-first. There is inline editing after creation and wrap, which is good, but the core gestures themselves do not expose keyboard equivalents, visible focus strategy, or accessible action menus. That is behind what modern canvas tools now treat as baseline.

Impact:

- Harder adoption for keyboard-heavy users.
- More work later if accessibility is added after interaction patterns solidify.

## Comparison With Common Modern Software Patterns

### FigJam

FigJam’s connector model is close to the desired message-create experience. Their official docs describe click-and-drag connectors that snap to objects, carry attachments when objects move, and expose toolbar-based text and endpoint controls after selection. This reinforces three patterns:

1. Connection is a first-class gesture, not an incidental button.
2. Selection owns editing.
3. Connector styling and labeling live in one contextual surface.

Where current implementation matches:

- Dragging to create a connection-like object
- Editing the connector text immediately after creation
- Contextual toolbar for selected connector-style actions

Where current implementation falls short:

- No target snap/highlight system
- No persistent selected state on the message
- No unified toolbar covering the full connector lifecycle

Source:

- https://help.figma.com/hc/en-us/articles/1500004414542-Create-diagrams-and-flows-with-connectors-in-FigJam

### Miro

Miro’s official help describes blue connection dots on objects, one-click creation and connection, and a context menu for line style, arrowheads, and labels. Miro also exposes connector lists and keyboard-friendly navigation in its diagramming guidance. The important pattern here is that connectors are both discoverable and editable.

Where current implementation matches:

- Drag-handle-based creation direction
- Contextual editing once a message is selected

Where current implementation falls short:

- The create handle is smaller and less obvious than Miro’s connection dots
- No valid target emphasis during drag
- No one-click insert-on-line or shape-between-line workflow

Sources:

- https://help.miro.com/hc/en-us/articles/360017730733-Connection-lines
- https://help.miro.com/hc/en-us/articles/4403634496402-Miro-for-mapping-diagramming

### draw.io / diagrams.net

diagrams.net exposes connection points on hover and supports drag-from-point to create connectors, then double-click to edit labels. This is mechanically close to the current implementation. The difference is consistency: the same connection-point language is used broadly throughout the editor.

Where current implementation matches:

- Hover reveals insertion or connection affordances
- Drag to connect
- Inline label editing after object creation

Where current implementation falls short:

- No shared affordance language between participant insertion and message creation
- No option to double-click the connector directly to rename, independent of the toolbar

Sources:

- https://www.drawio.com/doc/faq/connection-points-hide
- https://help.miro.com/hc/en-us/articles/14066677626770-Draw-io-diagrams-by-Miro

### Lucidchart

Lucidchart’s sequence-diagram guidance is still fundamentally “add components, then add text, then refine.” That validates the ordering used in the requirement page. It is less informative for the exact micro-interactions, but it supports the strategic sequencing: first make diagrams easy to build, then make structure easier to refine.

Where current implementation matches:

- The rollout order is correct
- P0 actions solve the most basic construction problem first

Where current implementation still needs work:

- The onboarding quality of those P0 actions is not yet as self-explanatory as template-first tools

Source:

- https://lucid.co/templates/sequence-diagram

## Improvement Plan

### Phase 1: Unify the interaction language

Goal:

- Make the editor feel like one product, not five isolated actions.

Plan:

1. Introduce a real selected-state model for messages and participants.
2. Render consistent selected visuals: outline, handle visibility, and contextual toolbar anchor.
3. Standardize handle visuals so insert, connect, and reorder belong to the same visual family.
4. Add explicit hover and selected states in design tokens instead of per-feature ad hoc styling.

Expected outcome:

- Users learn one selection model and reuse it across all edit flows.

### Phase 2: Strengthen P0 discoverability

Goal:

- Make “build without DSL” obvious within seconds.

Plan:

1. Enlarge the participant-insert and message-create affordances.
2. Show soft-visible affordances on initial load or when the canvas is empty/simple.
3. Add tooltip copy such as `Add participant` and `Drag to create message`.
4. Ensure the same affordances are reachable via keyboard focus and not only hover.

Expected outcome:

- Better first-run usability without needing a tutorial.

### Phase 3: Make message creation spatially honest

Goal:

- Align the drag gesture with the result users expect from the canvas.

Plan:

1. Highlight valid target participants during drag.
2. Show invalid drop states and allow clear cancel behavior with `Esc`.
3. Infer insertion position from the vertical drop location instead of always appending.
4. Show a horizontal insertion preview line at the eventual message row.

Expected outcome:

- The connector gesture becomes trustworthy and easier to predict.

### Phase 4: Complete the refine surface

Goal:

- Make message editing feel complete from a single contextual surface.

Plan:

1. Add the missing `Create` type transform if the DSL model supports it cleanly.
2. Let double-click on a message label enter rename directly, with the toolbar still available for power actions.
3. Consider a compact split-button or segmented control for message types.
4. Keep wrap actions and type actions in one stable menu, ordered by frequency.

Expected outcome:

- Users can stay in one edit loop instead of jumping between hidden modes.

### Phase 5: Replace line-based transforms where they block growth

Goal:

- Reduce fragility before implementing harder structural editing.

Plan:

1. Identify the next transforms that need AST-aware behavior: cross-fragment move, create-type conversion, and comment-preserving reorder.
2. Introduce a thin structural edit layer that works on parsed statement nodes rather than plain line slicing.
3. Preserve surrounding whitespace and comments deliberately instead of incidentally.

Expected outcome:

- P2 work becomes feasible without cascading string-edit edge cases.

### Phase 6: Finish P2 with strong preview semantics

Goal:

- Extend reorder into real structural movement.

Plan:

1. Add fragment-level drop zones.
2. Preview whether the move lands before, after, inside, or outside a fragment.
3. Differentiate valid and invalid targets visually.
4. Add tests for moving across nested fragment boundaries.

Expected outcome:

- The editor graduates from “diagram with helpers” to “structurally editable diagram.”

## Recommended Priority

If only three follow-up investments fit the next cycle, do these in order:

1. Unify selected state and contextual affordances
2. Make message creation spatially honest
3. Replace fragile string edits on the paths that will power cross-fragment movement

That order preserves the original product strategy: first make the editor easier to understand, then make the core drag gesture trustworthy, then harden the foundation for advanced structure editing.
