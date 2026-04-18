---
scenario_id: insert-participant
scenario_title: Insert a participant on a blank diagram
run_date: 2026-04-18
zenuml_core_sha: e8db2a7a
audited_url: http://localhost:4000
skill_version: 0.1.0
gap_count: { high: 3, med: 1, low: 0 }
---

# UX Research — Insert a participant on a blank diagram

## Executive summary

Inserting a participant on a blank ZenUML canvas requires editing the DSL text directly — there is no canvas-based insertion affordance. Clicking the canvas background, double-clicking, right-clicking, and pressing Enter or other keys on the canvas all produce no response. The diagram container has no `tabindex`, `role`, or ARIA attributes, so it cannot receive keyboard focus at all. The only working path is clicking into the DSL editor pane and typing the participant name. While this works, it means ZenUML's canvas is purely a rendering surface with no creation capabilities — a significant gap for new users who expect a diagramming tool to let them create directly on the canvas.

## Scenario recap

**User intent:** The user opens ZenUML to a blank diagram and wants to add one participant named `Alice` so they can start modelling.

**Starting DSL:**
```
```

**Target DSL:**
```
Alice
```

## Observed walkthrough

1. **Cleared editor** — clicked "Clear" button to reach blank-diagram state. Canvas shows a single anonymous participant (person icon) with no label.
2. **Clicked canvas background** (empty area to the right of the default participant) — no visible change, no context menu, no insertion affordance.
3. **Searched for "Add participant" or "+" button** using accessibility tree scan — no matching elements found. Bottom toolbar contains only info, emoji/settings, version badge, zoom controls, and ZenUML.com link.
4. **Pressed Enter on canvas** — no response. Canvas does not appear to receive keyboard focus.
5. **Right-clicked canvas background** — no custom context menu appeared (browser default was suppressed but nothing replaced it).
6. **Double-clicked canvas background** — no response.
7. **Fell back to DSL editor** — clicked into the code editor pane on the left, typed `Alice`. Canvas immediately rendered a participant labeled "Alice". Target state reached.

## Gaps

### Gap 1 — No canvas-based insertion affordance for participants

**Severity:** high
**Catalog ID:** INS-01
**Observed:** The only way to insert a participant is by typing directly into the DSL editor pane. No button, context menu, toolbar item, or click gesture on the canvas creates a new participant.
**Expected:** At least one insertion path that does not require opening or touching the DSL editor directly (e.g., a visible "+" button, a right-click context menu, or clicking empty canvas space to create a participant).
**Exemplars:** tldraw (visible toolbar with shape tools), Figma (toolbar + keyboard shortcuts), Miro (visible "+" for stickies), draw.io (drag from shape palette).
**Rationale:** For a tool growing canvas affordances, the canvas should be a primary creation surface. Being forced into the DSL editor to create the most basic element is a high-friction barrier for new users.
**Suggested fix:** No code path found — this is a missing implementation, not a misrouted one. The canvas (`src/components/DiagramFrame/SeqDiagram/`) has no insertion handlers. Participant creation is exclusively driven by DSL parsing in `src/parser/ToCollector.js` and `src/parser/Participants.ts:110` (`Add` method).

### Gap 2 — No keyboard-only insertion path

**Severity:** high
**Catalog ID:** INS-03
**Observed:** Pressing Enter, Tab, or letter keys while the canvas area has apparent focus produces no effect. There is no keyboard shortcut to insert a participant.
**Expected:** At least one keyboard-only path from blank state to new participant (e.g., pressing `p` to create a participant, or Tab into the canvas then Enter to create).
**Exemplars:** Miro (Tab from one sticky creates a sibling), Linear (Cmd+Enter for new issue), Notion (Enter in a database for a new row).
**Rationale:** ZenUML's user base is text-first and keyboard-native. A mouse-only workflow (click into DSL editor) is acceptable but a keyboard shortcut for the most common creation action would match user expectations.
**Suggested fix:** No keyboard event handlers exist on the diagram container (`src/components/DiagramFrame/SeqDiagram/SeqDiagram.tsx`). The container div has no `tabindex` attribute, so it cannot receive focus or keyboard events. Only `src/components/common/EditableSpan/EditableSpan.tsx:111` and `src/components/DiagramFrame/Debug/index.tsx:8` have keydown handlers.

### Gap 3 — Diagram container is not a focusable widget

**Severity:** high
**Catalog ID:** KBD-01
**Observed:** The diagram container (`div.zenuml.sequence-diagram`) has no `role`, no `tabindex`, and no `aria-label`. It cannot receive keyboard focus via Tab. Pressing Tab from the editor pane skips over the diagram entirely.
**Expected:** The diagram should be one Tab stop from the page's perspective (the ARIA composite-widget convention). Tab moves focus into the diagram; Shift+Tab moves focus out.
**Exemplars:** Figma canvas (focusable, receives keyboard events), VS Code tree view (composite widget with `role="tree"` and `tabindex`).
**Rationale:** Without being focusable, the diagram cannot support any keyboard interaction — selection, navigation, editing, or insertion. This is the foundational gap that blocks KBD-02 through KBD-06.
**Suggested fix:** The diagram container is rendered in `src/components/DiagramFrame/SeqDiagram/SeqDiagram.tsx`. It needs `tabIndex={0}`, `role="application"` or `role="group"`, and `aria-label="Sequence diagram"`. No such attributes exist anywhere in the component tree — grep for `tabindex` and `role=` across `src/components/` returned zero matches.

### Gap 4 — Insertion affordance not discoverable within 10 seconds

**Severity:** med
**Catalog ID:** INS-02
**Observed:** On a blank canvas, a new user sees a single anonymous participant icon and an empty area. No visual cue suggests how to create a new participant. The DSL editor on the left has a dark background with just a line number "1" — it does not prompt or hint that typing there creates participants. Discovery required switching mental models from "canvas tool" to "text editor" and realizing the left pane is the creation mechanism.
**Expected:** The primary insertion affordance should be discoverable by a new user within ~10 seconds of looking at the canvas (e.g., a visible "Add participant" button, a "+" icon, or placeholder text like "Type a participant name here").
**Exemplars:** tldraw (visible toolbar with labeled shape tools), Figma (prominent toolbar), draw.io (shape palette on the left).
**Rationale:** Discoverability is the gateway to every other interaction. Hidden affordances turn new users away.
**Suggested fix:** The blank-canvas state is rendered by `src/components/DiagramFrame/SeqDiagram/SeqDiagram.tsx` and `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/`. No empty-state guidance, placeholder text, or onboarding affordance exists. A `TipsDialog` component exists at `src/components/DiagramFrame/Tutorial/TipsDialog.tsx` but it is a general tips dialog, not contextual insertion guidance.

## Coverage

Tested hypotheses (no gap found):
- DSL editor correctly creates a participant when text is typed (verified — `Alice` appeared immediately on canvas)
- No console errors during walkthrough (verified — only debug-level render messages)

Not tested (out of scope for this scenario):
- EDT-02 (caret placement on edit entry — tested in rename-participant scenario)
- EDT-04 (commit/cancel contract — tested in rename-participant scenario)
- KBD-04, KBD-05 (Escape behavior — requires selection, which requires focus, which is blocked by Gap 3)
- UND-01, UND-02, UND-03 (undo/redo — tested in undo-insert scenario)

Skipped (couldn't form a testable hypothesis):
- FOC-01 (focus after keyboard insertion — no keyboard insertion path exists, so this is untestable; subsumed by Gap 2)
- KBD-02 (arrow-key navigation — diagram not focusable; subsumed by Gap 3)
- KBD-06 (Tab to spawn sibling — diagram not focusable; subsumed by Gap 3)

## Best-practice sources

**Bundled catalog IDs referenced:**
INS-01, INS-02, INS-03, KBD-01, FOC-01, EDT-03

**Web sources fetched during this run:**
None — catalog and common sense were sufficient for this scenario.

## Playwright regression snippet

Paste into `zenuml-core/tests/ux/insert-participant.spec.ts` once the gap is fixed. The skill emits this snippet; it does not run it.

```typescript
import { test, expect } from "@playwright/test";

test.describe("insert-participant UX", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:4000");
    // Clear to blank state
    await page.getByRole("button", { name: "Clear" }).click();
  });

  test("diagram container is focusable via Tab", async ({ page }) => {
    // Gap 3: KBD-01
    const diagram = page.locator(".sequence-diagram");
    await expect(diagram).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("Tab");
    // After enough Tabs, focus should land on the diagram
    await expect(diagram).toBeFocused();
  });

  test("canvas has a visible insertion affordance", async ({ page }) => {
    // Gap 1: INS-01 + Gap 4: INS-02
    // Look for a button or affordance that creates a participant
    const addButton = page.getByRole("button", { name: /add|insert|new|participant|\+/i });
    await expect(addButton).toBeVisible();
  });

  test("keyboard shortcut inserts a participant", async ({ page }) => {
    // Gap 2: INS-03
    const diagram = page.locator(".sequence-diagram");
    await diagram.focus();
    // Press the expected shortcut (adjust once implemented)
    await page.keyboard.press("p");
    // A new participant should appear in edit mode
    const editInput = diagram.locator("input, [contenteditable=true]");
    await expect(editInput).toBeFocused();
    await page.keyboard.type("Alice");
    await page.keyboard.press("Enter");
    await expect(diagram.locator(".participant")).toContainText("Alice");
  });
});
```
