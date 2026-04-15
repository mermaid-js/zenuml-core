# ZenUML UX Research Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a project-local Claude Code skill at `zenuml-core/.claude/skills/zenuml-ux-research/` that audits a single ZenUML interaction goal per run, writes a gap-only report to `docs/ux-research/`, and is validated by two calibration scenarios.

**Architecture:** Data-driven skill: thin `SKILL.md` procedure + `references/` data files (scenarios, assertion catalog, best-practices overview, report template). Live walkthrough via `claude-in-chrome` MCP tools; targeted static analysis via Grep on `src/`. Hypothesis-first, gap-only reports. Playwright regression snippets emitted but not run.

**Tech Stack:** Markdown (skill and data files), `claude-in-chrome` MCP tools (walkthrough), Read/Grep (static analysis), WebSearch (hypothesis formation). No new runtime code.

**Spec reference:** `docs/superpowers/specs/2026-04-15-zenuml-ux-research-skill-design.md`

---

## Preconditions

Before starting Task 1, the implementer should:

1. Be in the `zenuml-core` working directory (`/Users/penxia/ai-personal/zenuml-core`).
2. Create a dedicated feature branch for this work:
   ```bash
   cd /Users/penxia/ai-personal/zenuml-core
   git checkout -b feat/zenuml-ux-research-skill
   ```
3. Confirm `claude-in-chrome` MCP tools are loadable via `ToolSearch` in this session (they are deferred; Task 13 will load them).
4. Confirm `bun run dev` succeeds locally on port 4000. Do not leave the dev server running yet — Task 13 will start it when needed.

All commits in this plan go to the feature branch `feat/zenuml-ux-research-skill`. Do **NOT** push to `main`. Do **NOT** open a PR until the entire plan is complete and the user reviews it.

---

## File Structure

Files this plan will create (all under `zenuml-core/`):

| Path | Responsibility |
|---|---|
| `.claude/skills/zenuml-ux-research/SKILL.md` | Workflow procedure, error handling, invocation rules |
| `.claude/skills/zenuml-ux-research/references/assertion-catalog.md` | ~25 atomic best-practice rules across 7 categories |
| `.claude/skills/zenuml-ux-research/references/scenarios/insert-participant.md` | Seed scenario 1 |
| `.claude/skills/zenuml-ux-research/references/scenarios/rename-participant.md` | Seed scenario 2 |
| `.claude/skills/zenuml-ux-research/references/scenarios/insert-message.md` | Seed scenario 3 |
| `.claude/skills/zenuml-ux-research/references/scenarios/edit-message-label.md` | Seed scenario 4 |
| `.claude/skills/zenuml-ux-research/references/scenarios/undo-insert.md` | Seed scenario 5 |
| `.claude/skills/zenuml-ux-research/references/best-practices-overview.md` | Short narrative framing text-first vs drag-first tool families |
| `.claude/skills/zenuml-ux-research/references/report-template.md` | Template rendered into each gap report |
| `.claude/skills/zenuml-ux-research/examples/sample-report.md` | Hand-verified worked example from the known-gap calibration run |
| `docs/ux-research/.gitkeep` | Ensures the report output directory exists in git |

Files this plan will NOT modify: anything under `src/`, `tests/`, `docs/superpowers/specs/`, root config files, CLAUDE.md, AGENTS.md, existing skills.

---

## Task 1: Bootstrap skill directory and SKILL.md skeleton

**Files:**
- Create: `zenuml-core/.claude/skills/zenuml-ux-research/SKILL.md`
- Create (empty): `zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/` directory
- Create (empty): `zenuml-core/.claude/skills/zenuml-ux-research/examples/` directory

**Rationale:** Start with a minimal but valid SKILL.md so the skill is at least discoverable while the rest of the references are being filled in. Frontmatter only — procedure is written in Task 10.

- [ ] **Step 1: Create directory tree**

```bash
mkdir -p /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios
mkdir -p /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/examples
```

- [ ] **Step 2: Write SKILL.md skeleton**

Create `zenuml-core/.claude/skills/zenuml-ux-research/SKILL.md` with:

```markdown
---
name: zenuml-ux-research
description: Audit one ZenUML user interaction scenario at a time (e.g., inserting a message, renaming a participant) against diagramming-tool best practices. Uses claude-in-chrome to walk through the flow in a live browser and writes a gap-only markdown report to docs/ux-research/. Use when the user says "audit ux of", "zenuml ux research", "analyze interaction for zenuml", "run ux research on", or "/zenuml-ux-research". Produces a research report, not an audit pass/fail matrix.
---

# ZenUML UX Research

Skill scaffolding — full workflow, data files, and error handling are written by Tasks 2–10 of the implementation plan at `docs/superpowers/plans/2026-04-15-zenuml-ux-research-skill.md`. Do not invoke this skill end-to-end until Task 10 is complete.
```

- [ ] **Step 3: Verify file exists**

```bash
ls /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/SKILL.md
```
Expected: path is listed (no error).

- [ ] **Step 4: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/SKILL.md
git commit -m "feat(skill): bootstrap zenuml-ux-research skill directory"
```

---

## Task 2: Write `references/best-practices-overview.md`

**Files:**
- Create: `zenuml-core/.claude/skills/zenuml-ux-research/references/best-practices-overview.md`

**Rationale:** Short narrative context on tool families. This is NOT the checklist — that's `assertion-catalog.md`. This file is for humans and for LLM hypothesis formation, framing why certain interactions are expected.

- [ ] **Step 1: Write the file**

Create `zenuml-core/.claude/skills/zenuml-ux-research/references/best-practices-overview.md`:

````markdown
# Diagramming Tool UX — Best-Practice Overview

This document frames the interaction-design context the ZenUML UX research skill reasons about. It is **not** a checklist. Atomic, testable rules live in `assertion-catalog.md`. This file provides the *why* behind the rules.

## Two tool families

Diagramming tools split along a single axis: **what is the primary input method for the user who is actively creating diagram content?**

### Text-first (DSL-driven)

The user types structured text; the rendered diagram is a side-effect.

Examples: **Mermaid Live**, **PlantUML editors**, **D2 Playground**, **ZenUML**.

Typical strengths:
- Keyboard-first by construction.
- Versionable, diffable, pasteable content.
- Fast iteration for users who know the DSL.

Typical weaknesses:
- Discoverability for new users is poor ("what's the syntax for a loop?").
- Visual affordances (clicking a participant to rename it, dragging to reorder) are bolted on, not native.
- Round-trip between "I see a shape on the canvas" and "I edit the text that produced it" is often clunky.

### Drag-first (graphical, canvas-driven)

The user drags shapes; a model is built behind the scenes.

Examples: **Lucidchart**, **draw.io (diagrams.net)**, **Figma**, **Miro**, **tldraw**, **Excalidraw**.

Typical strengths:
- New-user discoverability is very high.
- Inline editing on the canvas is the default path.
- Rich direct-manipulation gestures (drag, marquee, snap).

Typical weaknesses:
- Power-user keyboard flows are often worse than text-first tools.
- Hard to version or diff the output.
- Harder to reuse content across diagrams.

### Hybrids

Some tools occupy the middle and are the most instructive comparisons for ZenUML, which is fundamentally text-first but is growing canvas affordances:

- **Mermaid Live** — text-first with live preview and basic canvas interactions (click-to-select in generated SVG, no canvas editing).
- **tldraw** / **Excalidraw** — drag-first, but with aggressive keyboard shortcuts and inline editing patterns that text-first tools can borrow.
- **Notion databases / Airtable** — not diagramming, but their inline edit + Tab-to-sibling patterns are the gold standard for keyboard-first editing in any grid/canvas context.
- **Miro sticky note flows** — the current "speed of thought" standard for inserting, renaming, and connecting items without touching a mouse.

## Why this matters for ZenUML

ZenUML is text-first but is moving toward canvas-embedded editing. That means every scenario this skill audits has at least two valid interaction paths — DSL and canvas — and the user experience should be coherent across both. The assertion catalog is structured so that each rule is testable in either path; the walkthrough tries the most discoverable new-user path first and notes alternative paths second.

## How this overview is used by the skill

During Phase B (hypothesis formation), the skill reads this overview to calibrate expectations: for a text-first tool, "you can always fall back to the DSL editor" is a valid mitigation; "this requires a mouse" is a valid finding worth recording, because ZenUML's history of DSL-first users means keyboard-only paths matter disproportionately.
````

- [ ] **Step 2: Verify file content**

```bash
head -30 /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/best-practices-overview.md
```
Expected: the first 30 lines of the file display, starting with `# Diagramming Tool UX — Best-Practice Overview`.

- [ ] **Step 3: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/references/best-practices-overview.md
git commit -m "feat(skill): add best-practices overview for zenuml-ux-research"
```

---

## Task 3: Write `references/assertion-catalog.md`

**Files:**
- Create: `zenuml-core/.claude/skills/zenuml-ux-research/references/assertion-catalog.md`

**Rationale:** The catalog is a reference library of atomic, testable assertions with stable IDs. Every gap in a report can cite an ID; every scenario can prime its hypotheses from the categories here. This file is used heavily during Phase B (hypothesis formation) and Phase D (gap labeling).

This task writes all ~25 rules in full. No placeholders.

- [ ] **Step 1: Write the file**

Create `zenuml-core/.claude/skills/zenuml-ux-research/references/assertion-catalog.md`:

````markdown
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
````

- [ ] **Step 2: Verify all categories and rules present**

```bash
grep -c "^### " /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/assertion-catalog.md
```
Expected: `27` (4 SEL + 6 KBD + 4 EDT + 4 FOC + 3 INS + 3 UND + 3 FBK = 27 rule headers).

Also:
```bash
grep "^## " /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/assertion-catalog.md | sort
```
Expected output contains lines for: `## Catalog structure`, `## EDT — Inline editing`, `## FBK — Visual feedback`, `## FOC — Focus management`, `## INS — Insertion affordances`, `## KBD — Keyboard interaction`, `## SEL — Selection model`, `## UND — Undo / redo`.

- [ ] **Step 3: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/references/assertion-catalog.md
git commit -m "feat(skill): seed zenuml-ux-research assertion catalog (27 rules, 7 categories)"
```

---

## Task 4: Write scenario `insert-participant.md`

**Files:**
- Create: `zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/insert-participant.md`

- [ ] **Step 1: Write the file**

````markdown
---
id: insert-participant
title: Insert a participant on a blank diagram
---

## User intent
The user opens ZenUML to a blank diagram and wants to add one participant named `Alice` so they can start modelling.

## Starting DSL
```
```

## Target DSL
```
Alice
```

## Relevant assertion categories
INS, FOC, EDT, KBD

## Walkthrough hints (not prescriptive)
- Blank canvas is the highest-stakes discoverability test — the skill should record how long it takes to find the insertion affordance.
- Candidate insertion paths to try in order:
  1. Click on the canvas background.
  2. Look for a visible "+" or "Add participant" affordance.
  3. Keyboard: try pressing Enter or `p` on an empty canvas.
  4. Fall back to typing directly into the DSL editor pane.
- The moment the user successfully names the new participant `Alice` is the scenario's end state.

## Known issues to watch for (optional)
- If the only path is direct DSL editing, that itself is a finding (violates INS-01).
````

- [ ] **Step 2: Verify file**

```bash
ls /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/insert-participant.md
```
Expected: path listed.

- [ ] **Step 3: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/references/scenarios/insert-participant.md
git commit -m "feat(skill): add insert-participant scenario"
```

---

## Task 5: Write scenario `rename-participant.md`

**Files:**
- Create: `zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/rename-participant.md`

- [ ] **Step 1: Write the file**

````markdown
---
id: rename-participant
title: Rename a participant via keyboard
---

## User intent
The user has a participant `A` on the canvas and wants to rename it to `Alice` without leaving the keyboard.

## Starting DSL
```
A
```

## Target DSL
```
Alice
```

## Relevant assertion categories
KBD, EDT, SEL, FOC

## Walkthrough hints (not prescriptive)
- This scenario is the canonical test of KBD-03 (Enter enters edit mode) and EDT-02 (caret at end of text).
- Candidate paths to try in order:
  1. Tab into the diagram widget, arrow-key to select `A`, press Enter, type `lice`, press Enter.
  2. Click `A` to select, press Enter, retype.
  3. Double-click `A` to enter edit mode.
  4. Fall back to editing the DSL editor directly.
- Watch specifically for: whether Enter does anything on the selected participant; whether the caret is placed at the end or the whole label is pre-selected; whether Escape cancels cleanly.

## Known issues to watch for (optional)
- If Enter does nothing on a selected participant, that is a KBD-03 violation at high severity.
- If only mouse double-click works, that is a KBD-only violation (no mouse-free path).
````

- [ ] **Step 2: Verify file**

```bash
ls /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/rename-participant.md
```
Expected: path listed.

- [ ] **Step 3: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/references/scenarios/rename-participant.md
git commit -m "feat(skill): add rename-participant scenario"
```

---

## Task 6: Write scenario `insert-message.md`

**Files:**
- Create: `zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/insert-message.md`

- [ ] **Step 1: Write the file**

````markdown
---
id: insert-message
title: Insert a synchronous message between two participants
---

## User intent
The user has two participants `A` and `B` on the canvas and wants to add a synchronous message from `A` to `B` with the label `hello`.

## Starting DSL
```
A
B
```

## Target DSL
```
A
B
A->B: hello
```

## Relevant assertion categories
INS, KBD, EDT, FOC, FBK

## Walkthrough hints (not prescriptive)
- This is the most common creation action in any sequence diagramming tool; it is the load-bearing scenario for canvas-first editing of ZenUML.
- Candidate paths to try in order:
  1. Click `A`, look for a "send message" affordance or toolbar button, draw/click toward `B`.
  2. Hover between `A` and `B` in the lifeline area for an inline "+" affordance.
  3. Keyboard: Tab into widget, select `A`, press a hotkey for "new message".
  4. Fall back to typing `A->B: hello` into the DSL editor.
- Watch specifically for: whether a canvas-first path exists at all, whether message creation automatically enters label edit mode on the new message, whether Escape during message creation cancels cleanly.

## Known issues to watch for (optional)
- If the canvas has no message-creation affordance at all, that is an INS-01 violation at high severity.
- If the new message is not in edit mode immediately on creation, that is an EDT-03 / FOC-01 violation.
````

- [ ] **Step 2: Verify file**

```bash
ls /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/insert-message.md
```
Expected: path listed.

- [ ] **Step 3: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/references/scenarios/insert-message.md
git commit -m "feat(skill): add insert-message scenario"
```

---

## Task 7: Write scenario `edit-message-label.md`

**Files:**
- Create: `zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/edit-message-label.md`

- [ ] **Step 1: Write the file**

````markdown
---
id: edit-message-label
title: Edit an existing message label
---

## User intent
The user has a message `A->B: hello` on the canvas and wants to change the label to `hi`.

## Starting DSL
```
A
B
A->B: hello
```

## Target DSL
```
A
B
A->B: hi
```

## Relevant assertion categories
EDT, KBD, SEL, FOC, UND

## Walkthrough hints (not prescriptive)
- This scenario exercises the inline-edit contract on an existing piece of DSL, not a new one.
- Candidate paths to try in order:
  1. Click the message label `hello` once to select, press Enter, retype.
  2. Double-click the message label.
  3. Keyboard: navigate to the message via arrows, press Enter.
  4. Fall back to editing the DSL editor directly.
- Watch specifically for: undo granularity when the user types `hi` then changes their mind (one undo should revert the whole label, not one character at a time).

## Known issues to watch for (optional)
- If undo is character-level during a label edit, that is a UND-02 violation.
- If clicking the message selects the wrong thing (e.g., the arrow instead of the label), that is a SEL-01 violation.
````

- [ ] **Step 2: Verify file**

```bash
ls /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/edit-message-label.md
```
Expected: path listed.

- [ ] **Step 3: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/references/scenarios/edit-message-label.md
git commit -m "feat(skill): add edit-message-label scenario"
```

---

## Task 8: Write scenario `undo-insert.md`

**Files:**
- Create: `zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/undo-insert.md`

- [ ] **Step 1: Write the file**

````markdown
---
id: undo-insert
title: Undo a just-inserted message
---

## User intent
The user has two participants `A` and `B`, inserts a message `A->B: hello`, then immediately presses Ctrl/Cmd+Z to undo. The expected result is that the message is removed and the state is back to just the two participants.

## Starting DSL
```
A
B
```

## Target DSL
```
A
B
```
(after: insert `A->B: hello`, then undo)

## Relevant assertion categories
UND, FOC, SEL, KBD

## Walkthrough hints (not prescriptive)
- This scenario exercises the full insertion-then-undo round trip.
- Steps:
  1. Follow the `insert-message` scenario's walkthrough to get to the post-insert state.
  2. Press Ctrl+Z (or Cmd+Z on macOS).
  3. Observe: is the message removed? Is the DSL editor reverted? Is selection/focus restored to whatever it was before the insert?
- Watch specifically for: undo granularity (one Ctrl+Z should undo the whole insert, not the individual keystrokes of the label edit) and focus restoration (FOC-03).

## Known issues to watch for (optional)
- If the undo leaves the label partially typed, UND-02 is violated.
- If focus ends up on the document body after undo, FOC-03 is violated.
````

- [ ] **Step 2: Verify file**

```bash
ls /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios/undo-insert.md
```
Expected: path listed.

- [ ] **Step 3: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/references/scenarios/undo-insert.md
git commit -m "feat(skill): add undo-insert scenario"
```

---

## Task 9: Write `references/report-template.md`

**Files:**
- Create: `zenuml-core/.claude/skills/zenuml-ux-research/references/report-template.md`

**Rationale:** The template is what Phase F renders into each gap report. SKILL.md's procedure prose will reference this file by name. Template uses `{{placeholder}}` syntax the skill fills in at render time.

- [ ] **Step 1: Write the file**

Create `zenuml-core/.claude/skills/zenuml-ux-research/references/report-template.md`:

`````markdown
---
scenario_id: {{scenario_id}}
scenario_title: {{scenario_title}}
run_date: {{run_date}}
zenuml_core_sha: {{zenuml_core_sha}}
audited_url: {{audited_url}}
skill_version: 0.1.0
gap_count: { high: {{gap_count_high}}, med: {{gap_count_med}}, low: {{gap_count_low}} }
---

# UX Research — {{scenario_title}}

## Executive summary

{{executive_summary}}

## Scenario recap

**User intent:** {{user_intent}}

**Starting DSL:**
```
{{starting_dsl}}
```

**Target DSL:**
```
{{target_dsl}}
```

## Observed walkthrough

{{walkthrough_numbered_steps}}

## Gaps

{{gap_blocks}}

> Each gap block uses this structure:
>
> ```
> ### Gap N — <short headline>
> **Severity:** <low|med|high>
> **Catalog ID:** <id or "novel — candidate for new rule">
> **Observed:** <verbatim>
> **Expected:** <from hypothesis>
> **Exemplars:** <tools where expected behavior is seen>
> **Rationale:** <why this matters>
> **Suggested fix:** <grep result: file:line; or "no code path found">
> ```
>
> (Blockquote is for documentation inside the template — the rendered report omits it.)

## Coverage

Tested hypotheses (no gap found):
{{coverage_tested}}

Not tested (out of scope for this scenario):
{{coverage_out_of_scope}}

Skipped (couldn't form a testable hypothesis):
{{coverage_skipped}}

## Best-practice sources

**Bundled catalog IDs referenced:**
{{bundled_sources}}

**Web sources fetched during this run:**
{{web_sources}}

## Playwright regression snippet

Paste into `zenuml-core/tests/ux/{{scenario_id}}.spec.ts` once the gap is fixed. The skill emits this snippet; it does not run it.

```typescript
{{playwright_snippet}}
```

---

## Zero-gap rendering

If the scenario produced zero gaps, render the report omitting the **Gaps** and **Playwright regression snippet** sections. The **Observed walkthrough** section becomes a single line:

> No gaps observed on zenuml-core @ {{zenuml_core_sha}}.

All other sections (metadata, executive summary, scenario recap, coverage, best-practice sources) still render.
`````

- [ ] **Step 2: Verify file content**

```bash
grep -c "{{" /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/report-template.md
```
Expected: at least 15 (one per placeholder).

- [ ] **Step 3: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/references/report-template.md
git commit -m "feat(skill): add zenuml-ux-research report template"
```

---

## Task 10: Write `SKILL.md` (full procedure)

**Files:**
- Modify: `zenuml-core/.claude/skills/zenuml-ux-research/SKILL.md`

**Rationale:** Task 1 created a skeleton. This task fully replaces it with the procedure prose, error handling, and invocation instructions. SKILL.md is the file Claude Code loads when the skill is invoked, so everything the skill needs to do at runtime must be in here (or in a referenced file the skill reads on demand).

- [ ] **Step 1: Read the current skeleton to confirm it exists**

```bash
cat /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/SKILL.md
```
Expected: the skeleton content from Task 1 displays.

- [ ] **Step 2: Fully replace SKILL.md with the procedure**

Overwrite `zenuml-core/.claude/skills/zenuml-ux-research/SKILL.md` with:

`````markdown
---
name: zenuml-ux-research
description: Audit one ZenUML user interaction scenario at a time (e.g., inserting a message, renaming a participant) against diagramming-tool best practices. Uses claude-in-chrome to walk through the flow in a live browser and writes a gap-only markdown report to docs/ux-research/. Use when the user says "audit ux of", "zenuml ux research", "analyze interaction for zenuml", "run ux research on", or "/zenuml-ux-research". Produces a research report, not an audit pass/fail matrix.
---

# ZenUML UX Research

This skill audits a single ZenUML interaction scenario against diagramming-tool best practices and writes a gap-only markdown report. It is a research tool, not an audit or regression tool. Run it interactively, read the report, and act on it by hand. Never wire it into CI.

## When to invoke

- User asks "audit ux of X", "zenuml ux research", "analyze interaction for X".
- User runs `/zenuml-ux-research <scenario-id>` or `/zenuml-ux-research "free-text goal"`.
- User asks for a specific gap analysis in the ZenUML editor experience.

Do NOT invoke this skill for pixel-level comparison (that is `dia-scoring`), parser behavior, or build/deploy tasks.

## Invocation parameters

- **Scenario identifier (positional):** either a catalog ID like `insert-message` or a free-text goal like `"audit how users insert a message between A and B"`.
- **`--url <url>` (optional):** target URL. Default `http://localhost:4000`. Can point to a deployed staging URL.
- **`--allow-prod` (optional):** required for any URL that is not `localhost`, `127.0.0.1`, or a known staging subdomain. The skill is read-only against the target, but this flag forces the human to confirm they know they're pointing at a real-users environment.

## Dependencies

- `claude-in-chrome` MCP tools (for walkthrough). If these are not yet loaded in the session, the skill must instruct the user to load them via `ToolSearch` and stop; the walkthrough cannot run in text-only mode.
- `ZenUML dev server or a reachable URL` (default `http://localhost:4000`).
- `Read` / `Grep` tools (for static source analysis of `zenuml-core/src/`).
- `WebSearch` / `WebFetch` tools (for targeted best-practice lookups; optional).

## Files this skill uses at runtime

- `references/scenarios/<scenario-id>.md` — loaded at Phase A.
- `references/assertion-catalog.md` — loaded at Phase B.
- `references/best-practices-overview.md` — loaded at Phase B for narrative framing.
- `references/report-template.md` — loaded at Phase F.

## Report output

- Written to `zenuml-core/docs/ux-research/YYYY-MM-DD-<scenario-id>.md`.
- Create the directory if it doesn't exist (`mkdir -p`).
- On filename collision, append `-2`, `-3`, etc. Never overwrite.
- Never commit the report automatically — the human decides.

## Workflow

### Phase A — Scenario resolution

1. Determine whether the invocation is a catalog ID or free-text.
2. **Catalog ID:**
   - Check that `references/scenarios/<id>.md` exists.
   - If not, list all available scenario filenames (glob `references/scenarios/*.md`) and stop.
   - Load the file. Verify it has front matter with `id` and `title`, plus headings for `User intent`, `Starting DSL`, `Target DSL`, `Relevant assertion categories`. If any are missing, print which field is missing from which file and stop.
3. **Free-text:**
   - Synthesize a scenario record with the same fields (id, title, user intent, starting DSL, target DSL, relevant categories).
   - Present the synthesized record to the user and wait for explicit confirmation.
   - Do NOT proceed on an unconfirmed synthesized scenario.
4. Check `--url` reachability with a quick HTTP GET.
   - If unreachable and the URL is local: print the exact fix command (`cd /Users/penxia/ai-personal/zenuml-core && bun run dev`) and stop.
   - If unreachable and the URL is remote: print the HTTP status and stop.
   - If reachable and the URL is non-local but does NOT have `--allow-prod`: warn and stop. Non-local URLs that look like known staging patterns (e.g., contain `staging`, `preview`, `github.io` for the gh-pages build) may proceed with a one-line warning but no hard stop.
5. Confirm `claude-in-chrome` tools are loaded. If not: instruct the user to load them via `ToolSearch` with query `"select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__find,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__javascript_tool"` and stop.

### Phase B — Hypothesis formation

1. Read the scenario's User intent.
2. Read `references/best-practices-overview.md` for narrative framing.
3. Scan `references/assertion-catalog.md` for rules whose category is in the scenario's Relevant assertion categories list. Treat these as **priors** — starting points for what you expect to see — not as a checklist.
4. Form a short list of expectations in working memory. Example for `rename-participant`: "I expect Enter on selected participant to enter edit mode (KBD-03). I expect caret at end (EDT-02). I expect Escape to cancel (KBD-04). I expect undo granularity to be at the label level (UND-02)."
5. **Hypotheses are NOT limited to the catalog.** Form open-ended expectations based on general best practices and common sense. If the scenario suggests territory the catalog is silent on, run **1–3** targeted `WebSearch` queries (e.g., "how does tldraw handle arrow-key navigation between shapes"). Keep the budget tight.

### Phase C — Browser walkthrough

1. `mcp__claude-in-chrome__tabs_context_mcp` → get current tab state (do not reuse existing tabs from prior sessions).
2. `mcp__claude-in-chrome__tabs_create_mcp` → open a new tab.
3. `mcp__claude-in-chrome__navigate` → navigate to the `--url`.
4. Wait for the page to load. `mcp__claude-in-chrome__read_console_messages` at each interaction to catch runtime errors.
5. **Seed the starting state** by interacting with the DSL editor pane to type the scenario's Starting DSL. This is setup, not walkthrough — failures here are infrastructure errors.
   - If Starting DSL is empty, no seeding is needed.
   - If seeding itself fails (e.g., the DSL editor is unreachable), stop, report "could not seed starting state via DSL editor" as a walkthrough-blocker, and do NOT write a report. This is worse than a gap — it's a dead environment.
6. **Attempt to reach Target DSL via the most discoverable path a new user would try first.** Record each step:
   - What was attempted (e.g., "clicked canvas area to the right of participant B")
   - What happened (e.g., "no visible change; console warning: `[zenuml] unknown click target`")
   - Whether it advanced toward Target DSL
7. If the first path fails or hits friction, try 1–2 alternative paths (toolbar, keyboard shortcut, DSL edit). Record each.
8. **Capture screenshots only at decision moments**, not every step — keeps reports readable. Use `mcp__claude-in-chrome__computer` for screenshots if the tool is available.
9. **Hard stop after 3 failed attempts on the same step.** Record "could not perform step X after 3 attempts" and move on or stop. Do NOT loop.

### Phase D — Gap detection

1. For each observation, compare against the corresponding hypothesis.
2. **If observation matches hypothesis: drop it. Do not record. Silence is correct.**
3. **If observation diverges from hypothesis: record a gap.** Each gap has:
   - Headline (short, e.g., "Enter on selected participant does nothing")
   - Observed (verbatim)
   - Expected (from hypothesis)
   - Catalog ID (scan `references/assertion-catalog.md` for a rule whose `Applies when` and `Check` match; cite that ID. If no rule matches, label the gap `novel — candidate for new rule`.)
   - Exemplars (from the catalog if cited, else from web search)
   - Rationale
   - Severity (`low`, `med`, `high`) — use the catalog rule's severity if cited, else judge based on impact
4. Novel gaps are flagged but NOT auto-written to the catalog. The human reviews them and folds them in manually later.

### Phase E — Targeted static source analysis

For each gap, use `Grep` on `/Users/penxia/ai-personal/zenuml-core/src/` to find the relevant code path:

- For keyboard interactions: grep for the key name (`'Enter'`, `'Escape'`) and keydown listeners.
- For selection state: grep for `select`, `Selection`, `aria-selected`, and the Jotai atoms.
- For inline editing: grep for `contenteditable`, `input`, component names like `Participant`, `Message`.
- For undo/redo: grep for `undo`, `history`, `Jotai` atoms that track history state.

Attach `file:line` pointers to each gap. If no handler is found, write `"no code path found — this is a missing implementation, not a misrouted one."` Often the most useful finding.

### Phase F — Report writing

1. Load `references/report-template.md`.
2. Fill in all `{{placeholder}}` fields.
3. Determine the output path:
   - Today's date in `YYYY-MM-DD` format.
   - Filename: `YYYY-MM-DD-<scenario-id>.md`.
   - Full path: `/Users/penxia/ai-personal/zenuml-core/docs/ux-research/YYYY-MM-DD-<scenario-id>.md`.
4. Create `docs/ux-research/` if it doesn't exist.
5. If the filename already exists for today, append `-2`, `-3`, etc.
6. Write the file.
7. If gap count is zero, render the zero-gap form (omit Gaps and Playwright snippet sections, collapse the walkthrough to a one-line "No gaps observed on <sha>").

### Phase G — Hand-off

1. Print the report path.
2. Print a one-line summary: `"Found N gaps (X high, Y med, Z low). Report at <path>."`
3. Stop. Do NOT:
   - auto-commit the report
   - auto-fix any gap
   - open a PR
   - notify anyone
   - run additional scenarios

## Error handling

**Invocation-time (fail fast, clear instructions):**

- Scenario ID not found → list `references/scenarios/*.md` filenames, stop.
- Free-text goal too ambiguous (e.g., can't infer starting or target DSL) → ask one clarifying question, re-confirm, only proceed on confirmation.
- Scenario file malformed → print file path and missing field, stop.
- `claude-in-chrome` tools not loaded → instruct user to load via ToolSearch (query shown above), stop.
- URL unreachable → print fix command, stop.
- Non-local URL without `--allow-prod` → warn and stop.

**Walkthrough-time (observe and record, do not panic):**

- Target state unreachable after 2–3 paths → this is itself a high-severity gap. Write a report with "scenario target is unreachable via discovered interaction paths" as the primary finding.
- Console error mid-walkthrough → captured, included in the walkthrough step, does not halt unless the app becomes unresponsive.
- Browser crash → stop, print observations so far, do NOT write a partial report.
- Screenshot failure → skipped, walkthrough step still recorded with `screenshot: failed`.
- Same step fails 3 times → stop retrying, record "could not perform step X", move on or stop.

**Analysis-time (degrade gracefully):**

- Static analysis finds no handler → say so explicitly.
- Web search returns nothing → fall back to catalog and common sense.
- Catalog has no matching rule → label gap `novel`, flag as growth candidate.

**Output-time:**

- `docs/ux-research/` does not exist → create it.
- Filename collision → append `-2`, `-3`, etc.
- Git SHA capture fails → write `unknown` in metadata. Do not abort.

## What this skill does NOT do

- Retry failed walkthrough paths indefinitely.
- Auto-fix any gap.
- Commit the report, open a PR, notify anyone.
- Run multiple scenarios in one invocation.
- Run Playwright — only emits a snippet for the human to use.
- Touch production deploy state.

## Extending the skill

- **New scenario:** drop a new file into `references/scenarios/`, matching the format of existing scenarios. The skill discovers it automatically.
- **New assertion rule:** append it to `references/assertion-catalog.md` with the next sequential ID in its category. Never renumber existing rules.
- **Catalog growth from novel gaps:** when a run flags a `novel` gap, the human reviews and, if appropriate, adds a new rule to the catalog by hand.
- **Calibration drift:** any substantial change to this SKILL.md should be followed by re-running both calibration scenarios (see the plan document).
`````

- [ ] **Step 3: Verify the file is well-formed**

```bash
head -5 /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/SKILL.md
```
Expected first line: `---`. Second line should start with `name: zenuml-ux-research`.

```bash
grep -c "^## " /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/SKILL.md
```
Expected: at least 10 (top-level headings: When to invoke, Invocation parameters, Dependencies, Files this skill uses, Report output, Workflow, Error handling, What this skill does NOT do, Extending the skill, plus any inner `## ` headings).

```bash
grep -c "TBD\|TODO\|XXX\|FIXME" /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/SKILL.md
```
Expected: `0`.

- [ ] **Step 4: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/SKILL.md
git commit -m "feat(skill): write full zenuml-ux-research SKILL.md procedure"
```

---

## Task 11: Create `docs/ux-research/` output directory

**Files:**
- Create: `zenuml-core/docs/ux-research/.gitkeep`

**Rationale:** The skill creates the directory at runtime if missing, but having it in git from the start makes report PRs cleaner and lets the skill skip the `mkdir -p` step on first run.

- [ ] **Step 1: Create directory and `.gitkeep`**

```bash
mkdir -p /Users/penxia/ai-personal/zenuml-core/docs/ux-research
touch /Users/penxia/ai-personal/zenuml-core/docs/ux-research/.gitkeep
```

- [ ] **Step 2: Verify**

```bash
ls -la /Users/penxia/ai-personal/zenuml-core/docs/ux-research/
```
Expected: `.gitkeep` listed.

- [ ] **Step 3: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add docs/ux-research/.gitkeep
git commit -m "chore: add docs/ux-research output directory for zenuml-ux-research skill"
```

---

## Task 12: Static validation of the skill's data files

**Files:** no changes; this task runs verification commands only.

**Rationale:** Layer 1 of the test plan from the spec — verify that every scenario has required fields and every category referenced in a scenario resolves to a real category in the catalog. This is what the skill does at runtime on every invocation; running it manually here catches any drift introduced while writing the files.

- [ ] **Step 1: Verify every scenario has required front-matter and headings**

```bash
cd /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references/scenarios
for f in *.md; do
  echo "=== $f ==="
  grep -E "^(id|title):" "$f" || echo "MISSING FRONT MATTER"
  grep -E "^## (User intent|Starting DSL|Target DSL|Relevant assertion categories)" "$f" || echo "MISSING HEADING"
done
```
Expected: each of the 5 files prints `id`, `title`, and the four `## ` headings. No `MISSING` lines.

- [ ] **Step 2: Verify every category referenced in a scenario resolves to a real category in the catalog**

```bash
cd /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references
CATS=$(grep "^## [A-Z][A-Z][A-Z] " assertion-catalog.md | sed -E 's/## ([A-Z]+).*/\1/' | sort -u)
echo "Catalog categories: $CATS"
for f in scenarios/*.md; do
  echo "=== $f ==="
  # Extract the line after "## Relevant assertion categories" and check each token
  REFS=$(awk '/^## Relevant assertion categories/{getline; print}' "$f" | tr -d ',' )
  for ref in $REFS; do
    if echo "$CATS" | grep -qw "$ref"; then
      echo "  OK: $ref"
    else
      echo "  FAIL: $ref not in catalog"
    fi
  done
done
```
Expected: every referenced category prints `OK`. No `FAIL` lines.

- [ ] **Step 3: Verify catalog entries have required fields**

```bash
cd /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/references
# Each rule starts with "### <ID>" — count them and confirm each has Rule/Exemplars/Rationale/Severity
RULES=$(grep -c "^### [A-Z][A-Z][A-Z]-[0-9][0-9]" assertion-catalog.md)
echo "Rules found: $RULES"
for field in "Rule:" "Exemplars:" "Rationale:" "Applies when:" "Severity:"; do
  COUNT=$(grep -cF "**$field**" assertion-catalog.md)
  echo "  $field appears $COUNT times"
done
```
Expected: `Rules found` is 27 and each field count equals 27 (each rule must have every one of these fields).

- [ ] **Step 4: If any failure above, fix inline and re-run the checks**

Any `MISSING` or `FAIL` line is a blocker. Fix the referenced file by hand, re-run the checks, and do not proceed until all output is clean.

- [ ] **Step 5: No commit**

This task makes no changes; nothing to commit.

---

## Task 13: Run the known-gap calibration scenario

**Files:** no file changes yet; a report will be generated into `docs/ux-research/` and a sample report created in Task 14.

**Rationale:** Layer 2 of the test plan. This is the first real run of the skill end-to-end. The acceptance criterion is that the skill successfully executes Phases A–G and produces a report that catches at least one real, meaningful gap in the current zenuml-core build.

**Pre-flight:** the implementer must choose ONE scenario from the seed five to use as the known-gap calibration. Typical choice is `rename-participant` because the scenario's explicit design target (Enter → edit mode) is the most likely place for a gap in a text-first tool. The actual calibration scenario should be chosen based on the implementer's five-minute manual check of current ZenUML behavior on `localhost:4000`.

- [ ] **Step 1: Start the dev server in a separate terminal**

```bash
cd /Users/penxia/ai-personal/zenuml-core
bun run dev
```
Expected: Vite boots and logs `http://localhost:4000` as the dev URL. Leave this terminal running.

- [ ] **Step 2: In this Claude session, load the `claude-in-chrome` MCP tools**

Use `ToolSearch` with query:
```
select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__find,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__javascript_tool
```
Expected: the tool schemas are loaded and callable.

- [ ] **Step 3: Manually pick the known-gap scenario**

Pick one of `insert-participant`, `rename-participant`, `insert-message`, `edit-message-label`, `undo-insert`.

Spend five minutes driving `http://localhost:4000` by hand to verify that the scenario does in fact have at least one real gap in current ZenUML behavior. Record which scenario you picked and which gap you expect the skill to find.

If **none** of the five have a visible gap on the first manual pass, write that observation down as a finding for the spec author and pick the most-constrained scenario (`rename-participant`) anyway — the skill may catch something subtler than a five-minute manual pass.

- [ ] **Step 4: Invoke the skill**

In the Claude session, say:
```
/zenuml-ux-research <picked-scenario-id>
```
Expected behavior:
- Phase A loads the scenario, confirms the URL reachable.
- Phase B forms hypotheses from the catalog.
- Phase C walks through the scenario in the Chrome tab.
- Phase D records any gaps.
- Phase E greps `src/` for file:line pointers on each gap.
- Phase F writes the report to `docs/ux-research/2026-04-15-<scenario-id>.md`.
- Phase G prints the path and a one-line summary.

- [ ] **Step 5: Verify the report was written**

```bash
ls /Users/penxia/ai-personal/zenuml-core/docs/ux-research/
cat /Users/penxia/ai-personal/zenuml-core/docs/ux-research/2026-04-15-<scenario-id>.md | head -50
```
Expected: the report file exists and the first 50 lines render the front matter, executive summary, and start of the walkthrough.

- [ ] **Step 6: Hand-verify the report catches the expected gap**

Read the entire report. Acceptance:
- At least one gap in the Gaps section matches the gap you identified in Step 3.
- The gap's severity is reasonable.
- The gap cites a catalog ID (if one matches) or is labeled `novel`.
- The Suggested fix field points at a real file in `src/` (or says "no code path found" if the handler genuinely doesn't exist).
- The Coverage section has at least 3 bullets of tested hypotheses.

**If acceptance fails**, the skill's procedure prose needs refinement. Document what failed in the plan's "Known issues" at the bottom of this file, revise SKILL.md, and re-run from Step 4. Do NOT declare the task complete until acceptance passes.

- [ ] **Step 7: Commit the calibration report**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add docs/ux-research/2026-04-15-<scenario-id>.md
git commit -m "docs: calibration report for <scenario-id> (known-gap calibration)"
```

---

## Task 14: Create `examples/sample-report.md` from the calibration run

**Files:**
- Create: `zenuml-core/.claude/skills/zenuml-ux-research/examples/sample-report.md`

**Rationale:** The hand-verified report from Task 13 becomes the skill's reference example — used as documentation and as a regression anchor. It is NOT used for automated diffing.

- [ ] **Step 1: Copy the calibration report**

```bash
cp /Users/penxia/ai-personal/zenuml-core/docs/ux-research/2026-04-15-<scenario-id>.md \
   /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/examples/sample-report.md
```

- [ ] **Step 2: Hand-edit for accuracy and clarity**

Open `sample-report.md` and:
- Correct any sloppy phrasing.
- Make sure the executive summary is a tight 3–5 sentences.
- Make sure every gap block has all the required fields.
- Make sure the Coverage section lists real tested hypotheses (not placeholders).
- Add a short preamble comment at the top of the file: `<!-- Sample report generated from the known-gap calibration run of <scenario-id>. See docs/superpowers/plans/2026-04-15-zenuml-ux-research-skill.md Task 14. -->`

- [ ] **Step 3: Verify**

```bash
head -5 /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research/examples/sample-report.md
```
Expected: starts with the preamble comment followed by the metadata block.

- [ ] **Step 4: Commit**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add .claude/skills/zenuml-ux-research/examples/sample-report.md
git commit -m "feat(skill): add hand-verified sample report from calibration"
```

---

## Task 15: Run the known-clean calibration scenario

**Files:** a second calibration report is generated into `docs/ux-research/`.

**Rationale:** Layer 2 of the test plan — second calibration. This run verifies the skill does NOT hallucinate gaps on a flow that works correctly. The acceptance criterion is zero gaps (or only `low` severity non-blockers) with a populated Coverage section.

- [ ] **Step 1: Pick a second scenario from the seed five**

Choose a scenario different from the one used in Task 13. This scenario should target an interaction you believe works correctly in the current ZenUML build.

Five-minute manual check: drive the scenario by hand on `http://localhost:4000`. Confirm no obvious UX issues.

- [ ] **Step 2: Invoke the skill**

```
/zenuml-ux-research <second-scenario-id>
```
Expected: skill runs end-to-end as in Task 13.

- [ ] **Step 3: Verify the report**

```bash
cat /Users/penxia/ai-personal/zenuml-core/docs/ux-research/2026-04-15-<second-scenario-id>.md
```
Acceptance:
- Report file exists.
- Gap count is zero, OR only `low` severity non-blockers. No `high`.
- Coverage section has at least 3 tested-hypothesis bullets.
- The executive summary makes it clear the flow was audited and found clean.

**If the skill invented a high-severity gap that is not real**, hypothesis formation is too aggressive. Document what the hallucinated gap was, revise SKILL.md Phase B prose to calibrate, and re-run from Step 2.

- [ ] **Step 4: Commit the clean calibration report**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git add docs/ux-research/2026-04-15-<second-scenario-id>.md
git commit -m "docs: calibration report for <second-scenario-id> (known-clean calibration)"
```

---

## Task 16: Final review and wrap-up

**Files:** none

- [ ] **Step 1: Verify git log shows all commits**

```bash
cd /Users/penxia/ai-personal/zenuml-core
git log --oneline feat/zenuml-ux-research-skill ^main | head -30
```
Expected: ~15 commits covering Tasks 1–15 in order.

- [ ] **Step 2: Verify the skill directory is complete**

```bash
find /Users/penxia/ai-personal/zenuml-core/.claude/skills/zenuml-ux-research -type f | sort
```
Expected output:
```
.../SKILL.md
.../examples/sample-report.md
.../references/assertion-catalog.md
.../references/best-practices-overview.md
.../references/report-template.md
.../references/scenarios/edit-message-label.md
.../references/scenarios/insert-message.md
.../references/scenarios/insert-participant.md
.../references/scenarios/rename-participant.md
.../references/scenarios/undo-insert.md
```

- [ ] **Step 3: Verify both calibration reports exist**

```bash
ls /Users/penxia/ai-personal/zenuml-core/docs/ux-research/
```
Expected: two reports for today's date plus `.gitkeep`.

- [ ] **Step 4: Hand-off to the user**

Print a summary to the user:
- Feature branch name.
- Commit count.
- Path to the two calibration reports.
- Path to the sample report.
- A note: **the branch has not been pushed. The user decides whether to open a PR.**

Do NOT run `git push`. Do NOT open a PR. The mental seal in the user's CLAUDE.md requires the human to approve any push to remote branches, and this skill is new enough that the user will likely want to review before sharing.

---

## Known issues (filled in during execution if needed)

*None yet. If any task surfaces a problem, document it here with the task number and a one-line description.*
