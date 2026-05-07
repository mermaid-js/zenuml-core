# ZenUML UX Assertion Catalog

Atomic, testable best-practice rules for diagramming-tool interactions. Each rule has a stable ID that may be cited in gap reports. The catalog is a **reference library and hypothesis primer**, not a checklist — the skill does NOT grind through all rules on every run.

## Catalog structure

Each rule has:

- **ID** — stable, citable (e.g., `KBD-03`). Category prefix + two-digit number. Never renumber.
- **Rule** — one sentence describing the expected behavior.
- **Exemplars** — 2–3 tools where the rule is observed.
- **Rationale** — why the rule matters.
- **Applies when** — precondition that must hold for the rule to be meaningful.
- **Check** — concrete, observable outcome the skill can verify (optional for subjective rules).
- **Severity** — `low`, `med`, `high`.

New rules are appended; IDs are never reused.

---

## SEL — Selection model

### SEL-01
**Rule:** Clicking an item on the canvas selects it exclusively, deselecting anything else that was selected.
**Exemplars:** Figma, tldraw, draw.io.
**Rationale:** The standard single-select model users expect from any canvas editor; anything else forces the user to explicitly clear prior selection.
**Applies when:** The canvas has at least one selectable item and the user clicks it with a single unmodified click.
**Check:** Before click: zero or more items selected. After click: only the clicked item is selected.
**Severity:** high

### SEL-02
**Rule:** Clicking empty canvas area deselects all items.
**Exemplars:** Figma, tldraw, Excalidraw.
**Rationale:** Gives the user an always-available "get out of selection" gesture that does not require keyboard.
**Applies when:** At least one item is selected and the user clicks an area of the canvas with no item under the cursor.
**Check:** After click: zero items selected.
**Severity:** med

### SEL-03
**Rule:** Selected items have a visible, persistent selection indicator (outline, highlight, or handles).
**Exemplars:** Figma (blue outline), tldraw (dashed outline), draw.io (handles).
**Rationale:** Without visual feedback, selection state is invisible and any subsequent keyboard action feels random.
**Applies when:** One or more items are selected.
**Check:** The selected item's bounding box has a visually distinct marker compared to its non-selected state.
**Severity:** high

### SEL-04
**Rule:** Selection state is exposed to assistive technologies via `aria-selected` or equivalent.
**Exemplars:** VS Code editor, GitHub file tree.
**Rationale:** Screen-reader users need programmatic access to selection. Day 1 this rule is observational (the skill notes whether the attribute is present); it is not a hard fail.
**Applies when:** One or more items are selected.
**Check:** Inspect DOM for `aria-selected="true"` on the selected element or its representative.
**Severity:** low

---

## KBD — Keyboard interaction

### KBD-01
**Rule:** Tab moves focus INTO the diagram composite widget from the surrounding page; Shift+Tab moves focus OUT.
**Exemplars:** VS Code tree view, GitHub file tree, Figma.
**Rationale:** The diagram is one Tab stop from the page's perspective; arrow keys navigate inside. This is the ARIA composite-widget convention.
**Applies when:** Focus is on the element immediately before or after the diagram in tab order.
**Check:** Press Tab; focus lands on the diagram root. Press Tab again from inside; focus leaves the diagram.
**Severity:** high

### KBD-02
**Rule:** Arrow keys navigate between items inside the diagram composite widget when it has focus.
**Exemplars:** Figma (arrows move selection), tldraw, Excalidraw.
**Rationale:** Once inside the widget, the user needs a keyboard-only way to move the cursor/selection across items.
**Applies when:** Focus is inside the diagram and at least one item is selectable.
**Check:** Press an arrow key; focus or selection visibly moves to an adjacent item.
**Severity:** high

### KBD-03
**Rule:** Enter on a selected canvas item enters edit mode with the cursor at the end of the item's label.
**Exemplars:** Figma (text layers), Notion (table cells), tldraw (shapes), VS Code (F2 rename).
**Rationale:** Keyboard-first editing; no mouse round-trip after selection. The most-expected canvas-editor keybinding after Tab/Arrow.
**Applies when:** A single selectable item is selected and the diagram widget has focus.
**Check:** After selection, send Enter. Within 300ms the item's label should become an editable input, focused, with the caret at the end of the existing text.
**Severity:** high

### KBD-04
**Rule:** Escape while an item is in edit mode cancels the edit without committing changes.
**Exemplars:** Figma, Notion, tldraw, VS Code rename.
**Rationale:** Undoing an in-flight edit should never require actually committing then undoing. Escape is the universal cancel.
**Applies when:** An item is currently in edit mode and the input has unsaved changes.
**Check:** Enter edit mode, modify text, press Escape. Label reverts to pre-edit value; item exits edit mode.
**Severity:** high

### KBD-05
**Rule:** Escape on a selected (but not editing) item either deselects or exits the widget; it should not silently do nothing.
**Exemplars:** Figma, tldraw.
**Rationale:** Escape is the "get me out" key. Silent no-op leaves the user uncertain about what's selected.
**Applies when:** Focus is inside the diagram and exactly one item is selected (not in edit mode).
**Check:** Press Escape. Selection clears OR focus leaves the diagram widget.
**Severity:** med

### KBD-06
**Rule:** Tab inside edit mode commits the current edit and spawns a new sibling in edit mode (Miro pattern).
**Exemplars:** Miro sticky notes, Notion database rows, Linear issue creation.
**Rationale:** Speed-of-flow creation for power users. Not universally expected but is the gold standard when present.
**Applies when:** An item is in edit mode.
**Check:** Type label, press Tab. Edit commits; a new sibling of the same type appears next in order, already in edit mode with focus.
**Severity:** med

---

## EDT — Inline editing

### EDT-01
**Rule:** Entering edit mode replaces the label rendering with a focused, editable input in the same visual position.
**Exemplars:** Figma, Notion, tldraw.
**Rationale:** Prevents layout shift and makes the edit feel like direct manipulation rather than a modal.
**Applies when:** An item is entering edit mode by any means (Enter, double-click, toolbar).
**Check:** The input element is visible at the label's prior position; no modal or popover opens; the input has focus.
**Severity:** high

### EDT-02
**Rule:** On edit mode entry via Enter, the caret is placed at the end of the existing text with no pre-selection.
**Exemplars:** Notion cell edit, Linear issue title edit.
**Rationale:** Appending to an existing label (the common case) should not require arrow-right; deleting the whole label should be an explicit second step.
**Applies when:** Edit mode was entered via Enter on a selected item with an existing, non-empty label.
**Check:** After entering edit mode, caret is at end-of-text; no characters are pre-selected.
**Severity:** med

### EDT-03
**Rule:** Edit mode entered on a newly inserted item places an empty input with focus, ready to accept typing.
**Exemplars:** Miro sticky notes, Notion new row, tldraw new shape.
**Rationale:** New items should not require a second click to start typing.
**Applies when:** A new item was just inserted and is expected to be named.
**Check:** Immediately after insertion, the item is in edit mode with an empty input and keyboard focus.
**Severity:** high

### EDT-04
**Rule:** Committing an edit (Enter or blur) persists the change; cancelling (Escape) discards without side-effects.
**Exemplars:** Figma, Notion, VS Code rename.
**Rationale:** The commit/cancel contract is the most-trusted UX primitive in inline editing; violating it silently loses user work.
**Applies when:** An item is in edit mode.
**Check:** Make an edit. Press Enter → change persists in the DSL and on the canvas. Separately, make an edit and press Escape → change is fully discarded.
**Severity:** high

---

## FOC — Focus management

### FOC-01
**Rule:** After inserting a new item via keyboard, focus lands on the new item in edit mode.
**Exemplars:** Miro stickies, tldraw new shapes, Excalidraw text boxes.
**Rationale:** The user's next likely action on a new item is to name it. Requiring a separate selection step is friction.
**Applies when:** An insertion was triggered via keyboard (shortcut, Tab-to-sibling, Enter on a "plus" affordance).
**Check:** Immediately after insertion, the new item is selected AND in edit mode AND has keyboard focus.
**Severity:** high

### FOC-02
**Rule:** After deleting an item, focus moves to a predictable sibling (previous if any, else next, else parent).
**Exemplars:** VS Code file explorer, Linear list delete, Notion row delete.
**Rationale:** Focus-left-hanging after delete is one of the top accessibility complaints in web apps; any sibling is better than the document root.
**Applies when:** An item is deleted while the diagram widget has focus.
**Check:** After delete, a sibling or parent element has focus (not `document.body`, not `:focus-visible` on nothing).
**Severity:** med

### FOC-03
**Rule:** Undo restores selection and focus to the pre-operation state, not just the data.
**Exemplars:** Figma undo, Linear undo.
**Rationale:** The point of undo is to undo what the user *experienced*, which includes selection and focus. Undoing data without selection is disorienting.
**Applies when:** Undo was triggered after an operation that changed selection or focus.
**Check:** Before operation: selection = X. After operation: selection = Y. After undo: selection = X.
**Severity:** med

### FOC-04
**Rule:** Focus indicator is always visible when keyboard-focused; `:focus-visible` suppression is not applied to the entire widget.
**Exemplars:** any WAI-ARIA-compliant widget.
**Rationale:** A keyboard user should always know where focus is.
**Applies when:** A focusable element inside the diagram is focused via keyboard navigation.
**Check:** Inspect the focused element; it has a visible focus outline or equivalent.
**Severity:** med

---

## INS — Insertion affordances

### INS-01
**Rule:** A new item can be inserted without opening or touching the DSL editor pane directly.
**Exemplars:** Mermaid Live (no, this is a known weakness; cited as a negative exemplar), tldraw (yes), Figma (yes).
**Rationale:** For a tool that is text-first but growing canvas editing, the canvas should be a primary creation surface. Falling back to the DSL is acceptable; being forced into it is a gap.
**Applies when:** A scenario's target state requires inserting a new participant, message, note, or other item.
**Check:** The skill must find at least one insertion path that does not require editing the DSL editor text area.
**Severity:** high

### INS-02
**Rule:** The primary insertion affordance is discoverable by a new user within ~10 seconds of looking at the canvas.
**Exemplars:** tldraw (visible toolbar), Figma (visible plus button).
**Rationale:** Discoverability is the gateway to every other interaction; hidden affordances turn new users away.
**Applies when:** A scenario involves inserting something.
**Check:** Subjective; the skill records whether the insertion affordance was obvious on first look and, if not, how long it took to find.
**Severity:** med

### INS-03
**Rule:** Insertion has at least one keyboard-only path.
**Exemplars:** Miro (Tab-to-sibling), Linear (Cmd+Enter on issues).
**Rationale:** Text-first tool users are keyboard-native; a mouse-only insertion affordance loses them.
**Applies when:** A scenario involves inserting something.
**Check:** The skill must find at least one path from "blank state" to "new item present" that uses only the keyboard.
**Severity:** high

---

## UND — Undo / redo

### UND-01
**Rule:** Ctrl/Cmd+Z undoes the last logical operation.
**Exemplars:** every text editor, every canvas editor.
**Rationale:** The universal baseline.
**Applies when:** At least one undoable operation has occurred.
**Check:** Perform operation X. Press Ctrl/Cmd+Z. State reverts to pre-X.
**Severity:** high

### UND-02
**Rule:** Undo/redo granularity matches a logical user action, not individual keystrokes during a label edit.
**Exemplars:** Figma undo, Notion undo, Linear undo.
**Rationale:** One undo should undo one perceived action. Undoing character-by-character turns Ctrl+Z into an "erase this text" macro, which is worse than useless.
**Applies when:** A label was edited and then undo was pressed.
**Check:** Edit a label from `A` to `Alice`. Press Ctrl/Cmd+Z once. The label returns to `A`, not `Alic`.
**Severity:** high

### UND-03
**Rule:** Undo restores the selection to the item that was operated on, not an arbitrary state.
**Exemplars:** Figma, Linear.
**Rationale:** Undo should put the user back where they can immediately re-try or explore, which requires selection to match.
**Applies when:** An operation that affected selection is being undone.
**Check:** Before: select X, modify X. After undo: X is selected again.
**Severity:** med

---

## FBK — Visual feedback

### FBK-01
**Rule:** Hover states are visible on interactive elements.
**Exemplars:** every canvas editor.
**Rationale:** Hover is the pre-interaction affordance; its absence forces trial-and-error clicks.
**Applies when:** A clickable or draggable element exists on the canvas.
**Check:** Hover over the element; visual state changes (cursor, outline, tint).
**Severity:** low

### FBK-02
**Rule:** Invalid actions show immediate non-blocking feedback rather than silently failing.
**Exemplars:** Figma toast, Linear inline errors.
**Rationale:** Silent failure trains users to distrust the tool; even a toast is better than nothing.
**Applies when:** The user attempts an operation that is not currently valid (e.g., delete with nothing selected).
**Check:** Trigger an invalid operation. Observe any feedback within 500ms.
**Severity:** med

### FBK-03
**Rule:** Drop targets or alignment guides are shown during drag operations where applicable.
**Exemplars:** Figma smart guides, tldraw snap lines.
**Rationale:** Without guides, drag feels imprecise.
**Applies when:** The scenario involves a drag operation.
**Check:** During an active drag, alignment guides or drop indicators appear before release.
**Severity:** low
