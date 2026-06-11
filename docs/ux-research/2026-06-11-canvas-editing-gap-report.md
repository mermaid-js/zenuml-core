---
scenario_id: canvas-editing-gap-report
scenario_title: Full gap analysis of on-canvas editing, from the end user's intentions
run_date: 2026-06-11
zenuml_core_sha: 2a7beba
method: static code analysis of src/ (all interaction handlers, DSL transforms, store atoms)
---

# Canvas Editing — Complete Gap & Elegance Report

This report analyzes on-canvas (rendered diagram) editing from the perspective of the end user — an architect or programmer who thinks in terms of *participants, interactions, control flow, and annotations*, not in terms of DSL text. For each intention the user brings to the canvas, it states what they expect, what the renderer does today (with code evidence), and where the gap or rough edge is.

Scope: the React renderer in Dynamic mode with all editing flags enabled (`enableParticipantInsertion`, `enableMessageInsertion`, `enableDividerInsertion`, `enableParticipantStyleEditing` — all default `false` in `src/store/Store.ts:120-123`; the demo apps enable them). The DSL text editor is out of scope except as the forced fallback.

> **Update (same day):** live captures for the companion visual audit revealed that both floating panels render with **no styling at all** in the running product (Tailwind is scoped under `.zenuml`; the panels portal to `document.body` outside it). Where this report describes panel appearance, it describes the intended classes. See finding 0 and the annotated screenshots in `2026-06-11-canvas-editing-visual-language.md`.

---

## 1. The user's mental model

An architect editing a sequence diagram operates on four kinds of objects, with a predictable set of verbs:

| Object | Verbs the user expects |
|---|---|
| **Participant** (actor, service, DB) | add, rename, retype/restyle, reorder, group, delete |
| **Message** (interaction) | create, rename, change kind (sync/async/return/create), reorder, **rewire endpoints**, duplicate, delete |
| **Control flow** (alt/opt/loop/par/try) | wrap messages, edit condition, add branch (else/catch/section), unwrap, delete |
| **Annotation** (note/comment, divider, title) | add, edit, style, delete |

Plus three cross-cutting expectations from any modern canvas editor: **selection** (click = select, see what's selected, multi-select), **reversibility** (undo, cancel mid-gesture, delete), and **discoverability** (affordances visible or one obvious gesture away).

The sections below walk these intentions one by one.

---

## 2. Participants

### 2.1 "I want to add a participant" — supported, one inelegance

**Expectation:** A visible or hover-revealed "+" that creates a participant *and immediately lets me name it*, since the auto-generated name is never the name I want.

**Today:** Hover over the participant header row reveals "+" buttons before, between, and after participants (`ParticipantInsertControls.tsx:199-271`). Clicking inserts a participant with an auto-generated name (`A`, `B`, … `P1`, `P2`, `ParticipantInsertControls.tsx:62-73`). On an empty diagram, an explicit "Click to add your first participant" prompt exists (`EmptyDiagramPrompt.tsx`).

**Gap (inelegant):** Unlike message insertion — which sets `pendingEditableRangeAtom` so the new label opens **pre-focused in edit mode** (`MessageCreateControls.tsx:121-125`) — `handleInsert` for participants does *not* set a pending editable range (`ParticipantInsertControls.tsx:160-172`). The user gets a participant literally named "A" and must notice it, then click the label, select-all, and retype. Every real-world insertion is therefore a two-step interaction where the sibling feature (messages) already solved the same problem in one. This is the single most jarring inconsistency in the current editing model.

**Gap (touch):** The "+" buttons are revealed by `group-hover` opacity (`ParticipantInsertControls.tsx:182`). On touch devices there is no hover, so the affordance is effectively invisible (the buttons are still hit-testable but `opacity-0`).

### 2.2 "I want to rename a participant" — supported, mostly good

**Expectation:** Click or double-click the name, type, Enter. The rename should propagate to every message that references the participant.

**Today:** The label is an `EditableSpan`; a single click on the name text enters edit mode (the "message must be selected first" guard only applies inside `.message`, `EditableSpan.tsx:102-111`). Rename replaces **all occurrences** — the parser collects every mention position per participant (`Participants.ts:84,169-170`) and `ParticipantLabel.replaceCodeAtPositions` rewrites them in reverse order (`ParticipantLabel.tsx:48-70`). Names with spaces/special characters are auto-quoted (`ParticipantLabel.tsx:32-46`). The `assignee:Type` form is handled with a combined parser (`ParticipantLabel.tsx:83-112`).

This is genuinely well done — holistic rename is exactly what users expect and many tools get wrong.

**Inelegances:**
1. **Misleading tooltip.** The tooltip says "Double-click to edit" (`ParticipantLabel.tsx:125`) but a single click edits. Trivial fix, real trust cost: users who believe the tooltip will double-click, and users who single-click "to select" get dropped into edit mode unexpectedly.
2. **Split-pixel click semantics.** Clicking the name text edits the name; clicking the participant box 5px away selects it and opens the style panel (`Participant.tsx:113`, `ParticipantStylePanel.tsx:62-70`). Two adjacent targets, two very different outcomes, no visual boundary between them.
3. **Empty rename silently reverts** (`ParticipantLabel.tsx:74-77`). Reasonable as a guard, but there is no feedback that the input was discarded.

### 2.3 "I want to change a participant's type or color" — supported, with friction

**Expectation:** Select the participant, see a panel, apply several properties in one sitting.

**Today:** Clicking a participant opens the style panel with 10 preset colors and 6 UML types (`ParticipantStylePanel.tsx`). Undeclared participants get a declaration auto-inserted before styling (`ParticipantStylePanel.tsx:139-147`) — a nice touch.

**Inelegances:**
1. **The panel closes after every single change** (`applyStyle` ends with `setIsOpen(false); setSelected([])`, `ParticipantStylePanel.tsx:151-162`). Setting color *and* type requires click participant → pick color → panel vanishes → click participant again → pick type. Property panels should stay open until dismissed.
2. **Selection is conflated with the panel.** There is no "selected but no panel" state reachable by mouse — the panel opens whenever exactly one participant is selected (`ParticipantStylePanel.tsx:61-75`). The earlier rename-participant research (2026-04-15, Gap 3) flagged this; it still holds. Click should select; the panel should be a second gesture (or at minimum not steal Escape-cycles).
3. **No custom color** — 10 presets only, though the DSL accepts any hex (the panel writes whatever hex it's given via `setParticipantStyleInDsl`).
4. **The panel cannot rename** — rename lives on the label, type/color live in the panel, with no cross-link. The message style panel has a Rename button; the participant panel does not.

### 2.4 "I want to reorder participants" — **not supported**

**Expectation:** Drag a participant header left/right to reduce arrow crossings — one of the most common cleanup actions architects perform on sequence diagrams.

**Today:** Nothing. No drag handlers exist on participant headers (verified across `LifeLineLayer/`); participant order is fixed by first mention or declaration order. The only workaround is editing declaration order in the DSL text.

### 2.5 "I want to delete a participant" — **not supported**

No delete affordance of any kind exists in the renderer — no Delete/Backspace key handling, no button, no context menu (no `onContextMenu` anywhere in `src/components`; no delete utility in `src/utils`). Deleting a participant is admittedly a hard semantic operation (what happens to its messages?), but today even the question can't be asked on the canvas.

### 2.6 "I want to group participants" (e.g., a bounded context) — **not supported**

The DSL supports groups and the renderer draws them, but there is no canvas affordance to create, edit, rename, or dissolve a group.

---

## 3. Messages

### 3.1 "I want to add a message" — supported, the flagship flow, three sharp edges

**Expectation:** Grab a lifeline (or a "+" near it), drag to the target, drop, type the name. Cancel by dropping on empty space.

**Today:** This is the most invested flow and its core is good:
- Hovering a gap between statements reveals per-participant "+" handles plus a divider button (`GapHandleZone.tsx:139-183`).
- Dragging draws a live dashed arrow with source/target highlights (`MessageCreateControls.tsx:179-243`).
- Dropping inserts `From->To.newMessage()` at the right position — including wrapping a leaf call in `{ }` when dropping inside an occurrence that has no block yet (`insertMessageInDsl.ts:41-61`) — and the label opens pre-focused for naming (`pendingEditableRangeAtom`). Dragging from an occurrence bar creates a *nested* call (`Occurrence.tsx:107-147`).

**Gaps and inelegances:**

1. **You cannot cancel by dropping.** On pointer-up, the target is `findNearest(event.clientX)` — the nearest non-source participant **at any distance** (`MessageCreateControls.tsx:68-80,102-126`). Dropping in empty space, off-diagram, or back on the source still creates a message to whichever participant happens to be nearest. The only cancel is Escape, which nobody discovers mid-drag. Every canvas tool treats "drop on nothing" as cancel; here it commits.
2. **Abandoning the rename leaves junk in the document.** The message is inserted as `newMessage()` *before* the rename begins. If the user presses Escape or clicks away without typing, `from->to.newMessage()` stays in the DSL permanently (`EditableSpan.tsx:151-163` restores the placeholder text; nothing removes the statement). Combined with gap 1 and the absence of undo (§5.2), an accidental drag is unrecoverable from the canvas.
3. **No self-message.** `findNearest` skips the source participant (`MessageCreateControls.tsx:72`), so `A->A.method()` can't be created by any gesture, even though the renderer fully supports self-invocations.
4. **Always creates a sync message.** Creating an async signal or a `new B()` creation message takes two steps: create sync, then open the style panel and transform the type. There is no modifier or post-drop choice at creation time.
5. **No "drag to empty space creates a new participant."** Tools in this space (e.g., sequencediagram.org, Miro) let a message drag that ends on blank canvas spawn the target participant. Here the handles only exist when ≥2 participants are already present (`GapHandleZone.tsx:101-106`), so message creation is gated on participant creation.
6. **Hover-gated, touch-invisible.** Gap handles appear only on `pointerenter` of a 16px-tall invisible strip (`GapHandleZone.tsx:214-228`). Precise, but undiscoverable on first use and unreachable on touch.

### 3.2 "I want to rename a message" — supported, good pattern

**Expectation:** Click to select, click again (or F2/Enter) to edit; Enter commits, Escape cancels.

**Today:** Exactly this. First click selects the message and opens the style panel; a second click on the label enters inline edit (the `data-selected` guard, `EditableSpan.tsx:102-111`). Enter/Tab commit, Escape cancels, blur commits. The hover hint even teaches the contract ("Click to select · drag to reorder" → "Click label to edit", `MessageView.tsx`). Keyboard-only entry works (Enter/Space on the focused span). Async, return, and creation labels are all editable via the same `EditableLabelField` position-range mechanism.

**Inelegances:**
1. **Click-away commits, empty input silently reverts** (`EditableLabelField.tsx:46-49`). Both defensible individually, but together they mean a user who wants to *clear* a label gets a silent no-op with no feedback, and a user who clicks away mid-thought has committed half-typed text into the document.
2. **Tab commits but doesn't travel.** Tab saves the label (`EditableSpan.tsx:175-181`) but doesn't move editing to the next label — a natural expectation for users renaming a sequence of messages.

### 3.3 "I want to change a message's kind" — supported, reasonable

**Today:** The style panel's type submenu transforms sync ↔ async ↔ return, with guarded constraints (creation messages can't convert; converting to sync requires a method-shaped label) and disabled-state tooltips explaining why (`StylePanel.tsx:388-432`). The transform preserves the label and re-selects it. This is solid.

**Inelegances:**
1. The submenu opens on hover with a 120 ms close timer (`StylePanel.tsx:300-310`) — workable, but a hover-menu inside a click-opened floating panel is fiddly on trackpads, and it's the only hover-menu in the product.
2. The B/I/U/S buttons next to it silently write `// [bold]` *comment lines above the message* into the DSL (`StylePanel.tsx:87-124`). The styling works, but users who later read their DSL find comment lines they never typed, with no explanation of the mechanism. Side-effects to invisible parts of the document should be at least visible at apply time.

### 3.4 "I want to reorder a message" — supported, minimal feedback

**Today:** Press-and-drag any message (4 px threshold distinguishes click from drag, `Block.tsx:64-72`) shows a grabbing cursor and a blue before/after drop line on the hovered statement (`Block.tsx:199-204`); drop rewrites the statement order (`reorderMessageInDsl`). Whole statements move with their nested blocks.

**Inelegances:**
1. **The dragged message doesn't visibly move** — no ghost, no dimming beyond `data-reorder-state`; the only feedback is the cursor and the drop line. Users routinely doubt whether the drag "took".
2. **No auto-scroll during drag** — no scroll handling exists in the drag effects (`Block.tsx:56-118`), so reordering across a viewport-tall diagram requires dropping in stages.
3. **Drag and select share the same press.** The same pointer-down both arms reorder and (on release without movement) selects. The 4 px threshold mostly disambiguates, but a slightly shaky click on a trackpad becomes a no-op drag that swallows the selection.

### 3.5 "I want to rewire a message" (change source/target) — **not supported**

**Expectation:** Drag an arrowhead or arrow tail from one lifeline to another — a first-class operation in every direct-manipulation diagram tool, and the natural follow-up to "I drew this against the wrong service."

**Today:** Nothing. Arrow endpoints are not interactive. The workaround is renaming participants (wrong tool) or editing the DSL text. With reorder, rename, and re-type all supported, endpoint rewiring is the conspicuous missing member of the "fix this message" family.

### 3.6 "I want to delete a message" — **not supported**

No Delete/Backspace handler exists anywhere (sweep confirmed zero `Delete`/`Backspace` key handling in `src/components`), no delete button in the style panel, no context menu. This is the most glaring CRUD asymmetry on the canvas: a selected message offers bold/italic, rename, type change, and fragment wrapping — but not removal. Combined with §3.1's "every drop commits", users *will* create messages they cannot remove without switching to the text editor.

### 3.7 "I want to duplicate / copy-paste messages" — **not supported**

No clipboard model exists on the canvas.

---

## 4. Control flow (fragments)

### 4.1 "I want to wrap messages in alt/opt/loop/par" — supported for a single message only

**Today:** Select a message → style panel → Wrap → alt/loop/opt/par; the fragment is created around that one statement and the condition opens pre-focused for editing (`StylePanel.tsx:182-198`, `messageWrapTransform.ts`).

**Gaps:**
1. **Single-statement only.** The selection model holds exactly one message (`selectedMessageAtom`, `Store.ts:144-148`), so wrapping *a range* of messages — the dominant real-world case ("these four calls are the retry loop") — is impossible. There is no multi-select (no ctrl/shift-click, no marquee).
2. **Four types only.** The DSL and renderer support `critical`, `section`, `try/catch/finally`, and `ref`, but the wrap menu offers `alt/loop/opt/par` (`StylePanel.tsx:48`).

### 4.2 "I want to edit a fragment's condition" — supported

Click the `[condition]` text and type (`ConditionLabel.tsx`); special characters are auto-quoted, equality expressions are left bare. Works as expected.

### 4.3 "I want to restructure a fragment" — **not supported**

Fragments are not selectable objects. There is no way, on the canvas, to:
- **add an `else` branch** to an `alt` (or a section to a `par`, a `catch` to a `try`),
- **unwrap** a fragment (remove the frame, keep the contents),
- **delete** a fragment with its contents,
- **drag a message into or out of** a fragment body with explicit fragment-boundary feedback (reorder drops relative to statements may land inside or outside, but the user has no fragment-level affordance or indicator).

So the canvas can *create* control flow (one message at a time) but can never *revise* its shape — the asymmetry users hit immediately after their first `alt`, when they want the else-branch.

### 4.4 "I want to collapse a fragment while I work" — supported, with a quirk

The collapse toggle works (`CollapseButton.tsx`, `useFragmentData.ts:74-81`) but the state is component-local and resets whenever the context changes — i.e., **any edit anywhere re-expands everything**. For the "collapse the noise while I edit elsewhere" use case, this defeats the purpose.

---

## 5. Annotations & cross-cutting

### 5.1 "I want to add a note/comment" — **not supported** (read-only rendering)

Comments render rich markdown (`Comment/Comment.tsx`) but are not editable on the canvas, and there is no affordance to create one. Notably, the B/I/U/S styling buttons *do* programmatically create comment lines (§3.3.2) — the machinery to insert comments exists; it just isn't exposed as "add a note". Dividers, by contrast, are fully supported (insert via gap button + auto-edit label, `GapHandleZone.tsx:81-99`), and the title is click-to-edit with an empty-state placeholder (`DiagramTitle/index.tsx`) — though the placeholder is `opacity-0` until hover, so an empty title is undiscoverable on touch and nearly so on desktop.

### 5.2 "I made a mistake" — **no undo, no delete, weak cancel**

This is the report's most important finding, because it compounds every other gap:

- **No undo/redo** anywhere in `src/` (grep confirmed). The renderer mutates the document via `setCode` + `onContentChange` and keeps no history. A host application *may* provide undo around `onContentChange`, but the canvas itself offers none, and nothing in the UI suggests Ctrl+Z (it does nothing).
- **No delete** for any object (messages §3.6, participants §2.5, fragments §4.3, dividers, comments).
- **Cancel exists only where it's least needed.** Inline label edits cancel cleanly with Escape. But the destructive-ish gestures — message-create drop (§3.1.1-2) and reorder drop — commit unconditionally on pointer-up.

The combined effect: the canvas is a one-way ratchet. Users can add and modify, but every mistake forces a context switch to the DSL text editor. For the target audience (programmers) the escape hatch is at least usable; for anyone else it is a dead end.

### 5.3 Selection model — single-object, two parallel systems

Two unrelated selections coexist: `selectedAtom` (participants, a string array of which the UI only honors one, `Store.ts:98-110`) and `selectedMessageAtom` (one message). They clear each other ad hoc at each interaction site rather than through a unified model. Consequences for the user:

- No multi-select of anything → no group operations (wrap range, bulk delete if it existed, bulk style).
- No selection of fragments, dividers, or comments at all.
- No arrow-key navigation between elements, and no Tab order designed for the diagram as a widget (individual spans/messages have `tabIndex={0}`, so Tab walks every label in DOM order — dozens of stops on a real diagram).
- Background click deselects (`SeqDiagram.tsx:80-90`) — correct and present.

### 5.4 No context menu

Right-click does nothing anywhere (`onContextMenu` absent from `src/components`). The style panel is effectively a context menu that only messages get, and only via left-click-select. A right-click menu is also the conventional home for the missing verbs (delete, duplicate, unwrap, add branch) and would solve several discoverability problems at once.

### 5.5 Discoverability summary

The current affordances are almost all **hover-revealed and unexplained**: gap handles, participant "+" buttons, the title placeholder, editable-label hover styling. Tooltips carry the contract, and one of them is wrong (§2.2.1). There is no onboarding hint on the canvas itself (the Tips dialog is generic), no affordance works on touch, and a user who never hovers a 16-px gap strip will conclude the diagram is read-only — which is exactly what the April 2026 research observed before these features shipped, and remains the first-session risk now.

---

## 6. Summary tables

### Unsupported intentions (the user must leave the canvas)

| # | Intention | Severity | Notes |
|---|---|---|---|
| 1 | Delete anything (message, participant, fragment, divider) | **Critical** | CRUD asymmetry; canvas is add-only |
| 2 | Undo / redo | **Critical** | No history; combines badly with commit-on-drop |
| 3 | Rewire message endpoints | High | Natural sibling of supported reorder/retype |
| 4 | Wrap a *range* of messages in a fragment | High | Blocked by single-selection model |
| 5 | Add `else`/`catch`/section branch; unwrap fragment | High | Fragments are not objects on the canvas |
| 6 | Reorder participants | High | Most common layout cleanup |
| 7 | Create self-message | Medium | `findNearest` excludes source |
| 8 | Create message as async/creation directly | Medium | Two-step today (create sync → transform) |
| 9 | Add/edit notes & comments | Medium | Render-only; insertion machinery already exists |
| 10 | Drag-to-blank creates target participant | Medium | Message creation gated on ≥2 participants |
| 11 | Group participants | Low | DSL supports; no affordance |
| 12 | Duplicate / copy-paste | Low | No clipboard model |
| 13 | Any editing on touch devices | Medium | All entry points are hover-gated |

### Supported but inelegant

| # | Interaction | Issue | Evidence |
|---|---|---|---|
| 1 | Message-create drop | Drop anywhere commits to *nearest* participant; no drop-to-cancel | `MessageCreateControls.tsx:102-126` |
| 2 | Message-create rename | Abandoning the rename leaves `newMessage()` in the document | `insertMessageInDsl.ts:29` + `EditableSpan.tsx:151-163` |
| 3 | Participant insert | Doesn't auto-open rename (messages do); ships a participant named "A" | `ParticipantInsertControls.tsx:160-172` vs `MessageCreateControls.tsx:121-125` |
| 4 | Participant style panel | Closes after every single change; conflated with selection; no custom color; no rename | `ParticipantStylePanel.tsx:151-162` |
| 5 | Participant label | Tooltip says double-click, single click edits; edit target and select target are adjacent pixels | `ParticipantLabel.tsx:125` |
| 6 | Message reorder | No drag ghost; no auto-scroll; shares pointer-down with select | `Block.tsx:160-204` |
| 7 | B/I/U/S styling | Writes invisible `// [style]` comment lines users never typed | `StylePanel.tsx:87-124` |
| 8 | Type submenu | Hover-open/120 ms-close menu inside a click panel | `StylePanel.tsx:300-310` |
| 9 | Fragment collapse | State resets on every edit anywhere | `useFragmentData.ts:79-81` |
| 10 | Label editing | Empty input silently reverts; blur commits half-typed text; Tab doesn't advance | `EditableLabelField.tsx:46-49` |
| 11 | Title placeholder | Invisible until hover | `DiagramTitle/index.tsx:45` |

### Recommended priorities

1. **Reversibility bundle** — delete for messages (selected message + Delete key and a style-panel button), drop-outside-cancels for message creation, and remove-statement-on-abandoned-rename. These three convert the canvas from a one-way ratchet into a safe editing surface and unblock everything else. Undo/redo (a simple code-snapshot stack in the store) belongs in the same arc.
2. **Finish the insert-participant flow** — set `pendingEditableRangeAtom` on insert, exactly as message insertion does. Smallest fix, highest daily-use payoff.
3. **Fragments as objects** — selectable frame, with unwrap / add-branch / delete, and range-wrap once multi-select lands. This is where architect-level editing (control flow) currently dead-ends.
4. **Endpoint rewiring and self-messages** — completes the message-manipulation family around the already-strong create/reorder/rename core.
5. **Interaction polish** — keep the participant panel open across edits, fix the tooltip, drag ghost + auto-scroll, surface a context menu as the home for the new verbs.
