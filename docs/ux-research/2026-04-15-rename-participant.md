---
scenario_id: rename-participant
scenario_title: Rename a participant via keyboard
run_date: 2026-04-15
zenuml_core_sha: 2c6e120d
audited_url: http://localhost:4000
skill_version: 0.1.0
gap_count: { high: 2, med: 1, low: 0 }
---

# UX Research — Rename a participant via keyboard

## Executive summary

Renaming a participant on the ZenUML canvas is not possible without editing the DSL text directly. Clicking a participant opens a style panel (color/type selector) instead of selecting it for editing. Pressing Enter toggles that style panel rather than entering inline edit mode. No inline edit affordance exists for participant labels — the code explicitly treats the participant as a "style" button (`role="button"`, `title="Click to style participant"`). The most important thing to fix is adding an inline edit mode triggered by Enter on a selected participant, separating selection from the style panel.

## Scenario recap

**User intent:** The user has a participant `A` on the canvas and wants to rename it to `Alice` without leaving the keyboard.

**Starting DSL:**
```
A
```

**Target DSL:**
```
Alice
```

## Observed walkthrough

### Path 1 — Click to select, then Enter to edit (most discoverable keyboard path)

1. **Typed `A` in the DSL editor** to seed the starting state. Participant A appeared on the canvas in both DOM and SVG previews. (Setup, not walkthrough.)

2. **Clicked participant A on the canvas.** A style panel opened immediately below the participant showing COLOR swatches and TYPE selectors (Actor, Boundary, Control, Entity, Database, Queue, None). Participant A showed a blue selection ring (`ring-2 ring-sky-400`). The panel opened on click rather than on a secondary gesture — click is conflated with "open panel," not "select for editing."

3. **Pressed Enter.** The style panel closed. The blue selection ring remained on participant A. **No edit mode appeared** — the label `A` remained static text, not an editable input.

4. **Pressed Enter again.** The style panel re-opened. Enter toggles the style panel. The code at `Participant.tsx:114-118` explicitly routes `Enter` to `onSelect()` which opens the style panel. There is no code path from Enter to an inline edit mode.

5. **Pressed Escape.** The style panel closed and selection was cleared (blue ring disappeared). This is correct behavior — Escape dismisses the panel and deselects.

### Path 2 — Double-click to edit

6. **Double-clicked participant A on the canvas.** The style panel opened, identical to single-click. Double-click does not enter edit mode. There is no differentiation between single-click and double-click on the participant component.

### Path 3 — DSL editor fallback

7. The only way to rename participant A to Alice is to edit the DSL directly: click into the code editor, select `A`, type `Alice`. This works but requires leaving the canvas entirely and switching to the text editor pane.

## Gaps

### Gap 1 — Enter on selected participant toggles style panel instead of entering edit mode
**Severity:** high
**Catalog ID:** KBD-03 (Enter enters edit mode on selected item)
**Observed:** After clicking participant A (which opens the style panel) and pressing Escape to close the panel, pressing Enter re-opens the style panel. The cycle repeats: Enter and Escape toggle the panel. No edit mode is ever entered.
**Expected:** Pressing Enter on a selected participant should replace the label with a focused, editable input so the user can retype the name. The style panel should be accessed via a secondary gesture (e.g., right-click or a dedicated button), not via the same interaction as editing.
**Exemplars:** Figma (Enter on selected text layer enters edit mode), Notion (Enter on selected cell enters edit mode), tldraw (Enter on selected shape enters text edit), VS Code (F2 on selected item enters rename mode).
**Rationale:** The Enter key is the universal "act on this selection" key in canvas editors. Using it for the style panel instead of inline editing forces users to leave the canvas for what should be the most common operation — renaming.
**Suggested fix:** `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx:114-118` — the `onKeyDown` handler currently routes `Enter` to `onSelect()` (which opens the style panel). This handler should be changed so that Enter triggers an inline edit mode instead. The `onSelect` / style-panel behavior should move to a secondary gesture. No existing edit-mode handler was found — this is a missing code path, not a misrouted one. The concurrent `keyboard-editing-on-diagram` design spec (`docs/superpowers/specs/2026-04-15-keyboard-editing-on-diagram-design.md`) appears to address exactly this gap.

### Gap 2 — No inline edit mode exists for participant labels
**Severity:** high
**Catalog ID:** EDT-01 (entering edit mode replaces the label with a focused, editable input)
**Observed:** The participant component renders the label as a static `<div>` inside a flex container. There is no code path that transforms this into an editable input, contenteditable span, or any form of inline editing. The `role="button"` and `title="Click to style participant"` attributes on the participant div confirm this is intentionally a style-trigger, not an edit target.
**Expected:** When edit mode is triggered (by Enter, double-click, or F2), the static label should be replaced by an editable input at the same visual position, with focus and cursor placement at end-of-text.
**Exemplars:** Figma (text layers become editable on Enter), tldraw (shapes show text input on Enter), Notion (cells become editable inputs on Enter).
**Rationale:** Inline editing is the single most expected interaction on a canvas item after selection. Its absence forces all renaming through the DSL editor, breaking the user's flow between "I see the diagram" and "I edit the diagram."
**Suggested fix:** `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx` — no edit-mode logic exists in this file. A new state (`isEditing`) and a conditional render path are needed: when `isEditing` is true, render an `<input>` or `<EditableSpan>` (an existing component at `src/components/common/EditableSpan/EditableSpan.tsx`) in place of the static label. Note: `EditableSpan` already exists in the codebase and has keyboard handling — it may be reusable here.

### Gap 3 — Click conflates selection with opening the style panel
**Severity:** med
**Catalog ID:** novel — candidate for new rule (SEL category: "single click selects without opening secondary panels")
**Observed:** Clicking participant A simultaneously selects it (blue ring) AND opens the style panel. There is no state where the participant is "selected but no panel is open" that is reachable via mouse click alone. The only way to reach a "selected, no panel" state is to click (panel opens) then press Escape (panel closes, but selection clears too per `ParticipantStylePanel.tsx:103-104`).
**Expected:** Single click should select the participant with a visible selection indicator. The style panel should open on a secondary gesture: either Enter (but we'd want Enter for edit mode), right-click, or a dedicated "style" button/icon on the selection frame. Selection and style-editing should be separate states.
**Exemplars:** Figma (click selects; panel is opened via sidebar or right-click), tldraw (click selects; style panel is in a persistent sidebar), draw.io (click selects; style is in a panel that opens on secondary action).
**Rationale:** Conflating selection with panel-opening means the user can never "just select" a participant to then decide what to do with it (rename, delete, move, style). Every click forces the style panel into view, which is the wrong action most of the time.
**Suggested fix:** `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx:113` — the `onClick` handler should set selection state WITHOUT opening the style panel. The style panel trigger should move to a different gesture.

## Coverage

Tested hypotheses (no gap found):
- KBD-05: Escape on the style panel correctly closes it (verified in `ParticipantStylePanel.tsx:101-105`)
- SEL-03: Selection indicator (blue ring) IS implemented via `ring-2 ring-sky-400` CSS class (verified at `Participant.tsx:102`)
- Participant IS keyboard-focusable via `tabIndex={0}` (verified at `Participant.tsx:120`)
- KBD-04: Escape during edit mode cancels — not testable because edit mode does not exist

Not tested (out of scope for this scenario):
- INS, UND, FBK categories
- Arrow-key navigation between participants (this scenario focuses on a single participant)

Skipped (couldn't form a testable hypothesis):
- KBD-01: Tab into the diagram widget — the Dev Workbench layout (editor + two previews) makes tab-order analysis unreliable in this context; would need a standalone embed to test properly

## Best-practice sources

**Bundled catalog IDs referenced:**
- KBD-03 (Enter enters edit mode)
- KBD-04 (Escape cancels edit)
- KBD-05 (Escape on selected item deselects or exits)
- EDT-01 (inline edit replaces label with input)
- EDT-02 (caret at end of text)
- SEL-01 (click selects exclusively)
- SEL-03 (visible selection indicator)

**Web sources fetched during this run:**
- None needed — catalog coverage was sufficient for this scenario.

## Playwright regression snippet

Paste into `zenuml-core/tests/ux/rename-participant.spec.ts` once the gaps are fixed. The skill emits this snippet; it does not run it.

```typescript
import { test, expect } from "@playwright/test";

test("KBD-03: Enter on selected participant enters edit mode", async ({ page }) => {
  await page.goto("/");
  // Clear and seed DSL with a single participant
  await page.click("text=Clear");
  await page.locator(".cm-content").click();
  await page.keyboard.type("A");
  // Wait for participant to render
  await page.waitForSelector('[data-participant-id="A"]');
  // Click participant to select it
  await page.click('[data-participant-id="A"]');
  // Close the style panel if it opens
  await page.keyboard.press("Escape");
  // Now press Enter — should enter edit mode
  await page.click('[data-participant-id="A"]');
  await page.keyboard.press("Enter");
  // Verify an editable input appeared
  const input = page.locator('[data-participant-id="A"] input, [data-participant-id="A"] [contenteditable]');
  await expect(input).toBeFocused({ timeout: 500 });
});

test("EDT-01: Edit mode shows editable input at label position", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Clear");
  await page.locator(".cm-content").click();
  await page.keyboard.type("A");
  await page.waitForSelector('[data-participant-id="A"]');
  // Enter edit mode (once implemented)
  await page.click('[data-participant-id="A"]');
  await page.keyboard.press("Enter");
  const input = page.locator('[data-participant-id="A"] input, [data-participant-id="A"] [contenteditable]');
  await expect(input).toBeVisible();
  // Type new name and commit
  await input.fill("Alice");
  await page.keyboard.press("Enter");
  // Verify DSL updated
  const editor = page.locator(".cm-content");
  await expect(editor).toContainText("Alice");
});
```
