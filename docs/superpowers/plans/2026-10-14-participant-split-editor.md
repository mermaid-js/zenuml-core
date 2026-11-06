# Participant Split Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 320 px inspector popover (`ParticipantStylePanel`) with a split on-canvas editor. Each attribute is edited where it renders: icon slot on the left edge of the box, colour slot on the right edge, stereotype pill above, `Name as Label` row below.

**Architecture:** One portal root (`panelRef`) still owns every overlay piece, so the existing click-away, deferred-reselect and draft-commit logic carries over unchanged. Pieces anchor to the selected `[data-participant-id]` rect. Two small pickers (type, colour) open from their slots. Hover in a picker writes a transient `participantPreviewAtom`; `Participant.tsx` reads it to preview the box without touching `code`. Text colour on the box and on every swatch comes from one shared helper, `participantTextColor()`, which uses the renderer's brightness rule.

**Tech Stack:** React 19, Jotai, TypeScript, Tailwind, Vitest / bun test (unit), Playwright (E2E), Bun.

**Visual source of truth:**

- Canvas, version 11: https://claude.ai/artifact/5SCdzMgCsxkxX9VdCNAaGu (boards `Split-1-Selected` … `Split-5-Clear`)
- Figma: https://www.figma.com/design/5Q1se9EshgSAOob672uvdR?node-id=5-2 — state 1 `5:4`, state 2 `5:42`, state 3 `5:110`, state 4 `5:156`, state 5 `5:215`

**Base branch:** `feat/participant-editor-redesign` (current HEAD `98bb3db9`).

```
            ┌─«stereotype»─┐            pill, top − 32
   ┌──┐ ┌──────────────────┐ ┌──┐
   │DB│ │      Alice       │ │■ │       icon slot (28 px) · box · colour slot (24 px)
   └──┘ └──────────────────┘ └──┘
        [ Alice ] as [ Display name ]   name row, bottom + 8
        @Database <<Service>> Alice …   DSL tooltip on hover
```

---

## Decisions and defaults

These are fixed. A worker must not improvise around them.

| # | Topic | Decision |
|---|---|---|
| D1 | File name | Keep `ParticipantStylePanel.tsx` and the export name. Smaller diff; `SeqDiagram.tsx` and the specs keep their imports. Extract pickers into sibling files (see file map). |
| D2 | Click-away | All overlay pieces render under the single `panelRef`. The `onPointerDown` / `interactionTokenRef` / `cancelPendingRef` / `selectedRef` block stays verbatim. Three E2E tests and three unit tests depend on it. |
| D3 | "None" options | No "Default" type chip (remove the `null` entry from `ARCHETYPES`). No "Remove color" swatch. Clearing goes through the split slot (D7). |
| D4 | Palette | Replace `PRESET_COLORS` with the 10 colours in `Split-3-Color.dc.html`, in that order. Top row: Rose, Amber, Emerald, Blue, Violet (light). Bottom row: Deep rose, Brown, Deep emerald, Deep blue, Deep violet (dark). Copy hex values from the canvas file; do not retype from memory. |
| D5 | Swatch "A" | Each swatch is 24 × 24, radius 5, shows the letter "A". Its `color` is `participantTextColor(hex)`, computed at render time. Never a literal per swatch. Font: `font-family: inherit`; the panel root must not carry `font-sans`, so the `.zenuml` rule in `src/assets/tailwind.css` (IBM Plex Sans stack, kept in sync with `DIAGRAM_FONT_STACK`) applies. Weight 400. |
| D6 | Text colour rule | `participantTextColor(c) = brightnessIgnoreAlpha(c) > 128 ? "#000" : "#fff"`. Same rule `Participant.tsx` uses today. Remove `isLightColor` (threshold 186). |
| D7 | Clearing a slot | Hover or focus on a filled slot widens it into the box: `[icon │ ×]` for type, `[× │ ■]` for colour. Left/right halves are separate buttons (28 + 24 px, each ≥ 24 px per WCAG 2.5.8). `Delete` / `Backspace` on a focused filled slot clears it. Empty slots have no ×. |
| D8 | Stereotype | Pill above the box. Empty: dashed pill with grey «stereotype» placeholder (button). Click: becomes an input with « » around it. Erasing the text and committing removes the stereotype. No ×. The in-box `«stereotype»` label stays rendered; the pill is the edit affordance. |
| D9 | Name row | Always visible while selected (state 1). `Name` input, "as", `Display as` input (placeholder "Display name"). Rename / label validation from commits `4df9d8cb`, `dae674bd`, `7a754764` is unchanged. Errors render inline under the row (state 4 error block), `role="alert"`. |
| D10 | DSL tooltip | Shown on hover/focus-within of the editor, below the name row. Keeps `data-testid="participant-dsl-preview"`. |
| D11 | Escape | In an open picker: closes the picker only. Elsewhere: deselects and closes (current behaviour). `skipCommitRef` discard semantics unchanged. |
| D12 | Preview | Set on swatch / chip / search-result hover. Cleared on pointer leave, picker close, commit and deselect. Never written to `code`. |
| D13 | Insert "+" buttons | Hidden while exactly one participant is selected (state 1 note). |
| D14 | Positioning | Icon slot `left − 14, top + 6`; colour slot `right − 12, top + 8`; pill centred at `top − 32`; name row `bottom + 8`. Pickers anchor below their slot and reuse the existing viewport clamp / flip. Re-anchor on `code` change, as today. |
| D15 | Gate | Unchanged: `enableParticipantStyleEditingAtom`, `RenderMode.Dynamic`, hidden during `textEditing` and message drag. |

**Out of scope:**

- SVG renderer contrast. `src/svg/components/participant.ts` uses a fixed `PARTICIPANT_TEXT_FILL`. Switching it to `participantTextColor` changes snapshots; separate PR.
- `EditableSpan` inline rename on the box label (`ParticipantLabel.tsx`). Covered by `participant-rename.spec.ts`; leave as is.
- Adding a gray to the palette.

---

## File map

### New files

- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/participantEditor/TypePicker.tsx` — archetype chips + icon search (moved from the panel).
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/participantEditor/ColorPicker.tsx` — swatch grid + hex field.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/participantEditor/SplitSlot.tsx` — slot button with hover/focus clear half.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/participantEditor/palette.ts` — `PRESET_COLORS`, `ARCHETYPES`.
- `src/utils/Color.spec.ts` — helper tests (create if absent).
- `src/store/participantPreviewAtom.ts` — `participantPreviewAtom: atom<{ name: string; color?: string; type?: string } | null>`; re-exported from `src/store/Store.ts`.

### Modified files

- `src/utils/Color.ts` — add `participantTextColor`.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx` — use the helper; read the preview atom.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantStylePanel.tsx` — rewrite render tree as the split editor.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantInsertControls.tsx` — hide while one participant is selected.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantStylePanel.stories.tsx` — one story per design state.
- Tests: `ParticipantStylePanel.spec.tsx`, `tests/interaction/participant-editor.spec.ts`, `tests/interaction/style-panel-apply.spec.ts`.

---

## Task 1: Shared text-colour helper

**Files:** `src/utils/Color.ts`, `src/utils/Color.spec.ts`

- [ ] **Step 1: Failing test.** For each of the 10 palette hexes (import from `palette.ts` once Task 3 lands; until then inline the list copied from the canvas file), assert top row gives `"#000"` and bottom row gives `"#fff"`. Add edge cases: `rgb(...)` string input, an 8-digit hex with alpha (alpha ignored), brightness exactly 128 gives `"#fff"`.
- [ ] **Step 2:** Run `bun run test src/utils/Color.spec.ts`. Expect failure: `participantTextColor` is not exported.
- [ ] **Step 3:** Implement `export const participantTextColor = (color: string): "#000" | "#fff" => brightnessIgnoreAlpha(color) > 128 ? "#000" : "#fff";`
- [ ] **Step 4:** Test passes.
- [ ] **Step 5:** In `Participant.tsx`, replace the inline `brightnessIgnoreAlpha(bgColor) > 128 ? "#000" : "#fff"` with the helper. Input stays the computed background. Run `bun run test`; no behaviour change.
- [ ] **Step 6:** Commit `feat: share participant text colour rule`.

## Task 2: Preview atom

**Files:** `src/store/participantPreviewAtom.ts`, `src/store/Store.ts`, `Participant.tsx`, a `Participant` unit spec.

- [ ] **Step 1: Failing test.** Render a `Participant` with `color` unset and the atom set to `{ name, color: <Deep blue> }`. Assert the box background is Deep blue and its text colour is white. Set the atom for another name; assert this box is unchanged.
- [ ] **Step 2:** Run; expect failure.
- [ ] **Step 3:** Add the atom. In `Participant.tsx`, when `preview?.name === entity.name`, use `preview.color ?? entity.color` and `preview.type ?? entity.type`. The `color` memo must depend on the effective colour (not only `props.entity.color`).
- [ ] **Step 4:** Test passes. Commit `feat: preview participant style without editing code`.

## Task 3: Palette and archetypes module

**Files:** `participantEditor/palette.ts`, `ParticipantStylePanel.tsx`

- [ ] **Step 1: Failing test.** `palette.ts` exports 10 colours (names per D4) and 6 archetypes; neither contains a `null` / "Default" / "None" entry.
- [ ] **Step 2:** Implement, copy hexes from `Split-3-Color.dc.html`. Point the panel at the module. Switch the Task 1 spec to import the palette.
- [ ] **Step 3:** Tests pass. Commit.

## Task 4: Split slot component

**Files:** `participantEditor/SplitSlot.tsx`, spec next to it.

- [ ] **Step 1: Failing tests.**
  - Empty slot: one dashed button, no clear button in the tree.
  - Filled slot: clear button hidden until hover or focus-within; then visible with `aria-label` "Remove type" / "Remove colour".
  - `Delete` and `Backspace` on the focused main button call `onClear`.
  - Clicking the main half calls `onOpen`, not `onClear`.
- [ ] **Step 2:** Implement per D7. Widen side: icon slot widens right (into the box), colour slot widens left (into the box), matching state 5.
- [ ] **Step 3:** Tests pass. Commit.

## Task 5: Colour picker

**Files:** `participantEditor/ColorPicker.tsx`, spec.

- [ ] **Step 1: Failing tests.**
  - 10 swatches, `grid-template-columns: repeat(5, 30px)`.
  - Each swatch's text colour equals `participantTextColor(hex)`. Assert via the helper, not via literals, plus one spy assertion that the helper is called (proves the rule is dynamic).
  - Current colour has `aria-pressed="true"`.
  - Hover sets the preview atom; pointer leave clears it.
  - Hex field: valid 6-digit commits, invalid resets (existing `normalizeHex` behaviour).
  - Escape closes the picker without deselecting.
- [ ] **Step 2:** Implement. Dialog `role="dialog"`, `aria-label="Participant colour"`, width 180 px.
- [ ] **Step 3:** Tests pass. Commit.

## Task 6: Type picker

**Files:** `participantEditor/TypePicker.tsx`, spec.

- [ ] **Step 1: Failing tests.** 6 archetype chips (no Default). Search keeps the current combobox / listbox semantics, arrow keys and Enter. Hover on a chip or result sets the preview type. Escape with a query clears the query; Escape with an empty query closes the picker only.
- [ ] **Step 2:** Move the search code out of the panel unchanged except for D11. Width 220 px.
- [ ] **Step 3:** Tests pass. Commit.

## Task 7: Rewrite the panel render tree

**Files:** `ParticipantStylePanel.tsx`

- [ ] **Step 1: Failing E2E** (add to `participant-editor.spec.ts`): selecting a participant shows the pill, both slots and the name row, and no element with text "Default" or "No color".
- [ ] **Step 2:** Replace the JSX below the `return (` with the split layout (D8–D10, D14). Keep everything above it: atoms, drafts, `applyStyle`, `commit*`, `onEnterBlur`, click-away effect. Remove `PANEL_WIDTH`, the close button, `isLightColor`, the `font-sans` class.
- [ ] **Step 3:** Clear handlers: `applyStyle({ type: null })` and `applyStyle({ color: null })`.
- [ ] **Step 4:** Run the unit specs and `bun pw tests/interaction/participant-editor.spec.ts`. Commit.

## Task 8: Hide insert "+" while selected

**Files:** `ParticipantInsertControls.tsx`, `participant-insert.spec.ts`

- [ ] **Step 1: Failing E2E:** select a participant; assert no insert buttons are visible. Deselect; they return.
- [ ] **Step 2:** Read `selectedAtom`; render nothing when `selected.length === 1`.
- [ ] **Step 3:** Pass. Commit.

## Task 9: Migrate existing tests

Each test keeps its behaviour; only selectors change unless noted.

`tests/interaction/participant-editor.spec.ts`:

- [ ] "edits every declaration attribute in one visit and stays open" — open each picker through its slot.
- [ ] "finds cloud icons by search and applies the key as the type" — search now inside the type picker.
- [ ] "renames the identifier everywhere, even with a display label" — name row.
- [ ] "closes with Escape, the close button and outside clicks" — **behaviour change:** close button removed. Rename to "closes with Escape and outside clicks"; add a case that Escape in an open picker closes only the picker.
- [ ] "does not carry an uncommitted draft over to another participant"
- [ ] "Escape in a text field discards the draft and closes the panel"
- [ ] "shows an alert when a rename would merge two participants"
- [ ] "Escape between pointerdown and pointerup does not reopen the edited participant"
- [ ] "click-away discards a rejected rename and closes the panel"
- [ ] "Enter on a rejected rename keeps focus, the draft and the alert"

`tests/interaction/style-panel-apply.spec.ts`:

- [ ] "participant toolbar keeps its styles and applies color to an implicit participant" — via colour slot.
- [ ] "applies a type directly to an implicit participant" — via icon slot.
- [ ] "message toolbar …" — untouched.

`ParticipantStylePanel.spec.tsx` (pending reselect cleanup, 3 tests) — untouched; must still pass.

New E2E tests:

- [ ] Hovering a swatch previews the box; `code` is unchanged until click.
- [ ] Split-slot × clears type; split-slot × clears colour.
- [ ] `Delete` on a focused filled slot clears it.
- [ ] Stereotype round trip: placeholder, type "Service", commit, erase, commit, placeholder returns.

## Task 10: Stories

- [ ] One story per state 1–5 in `ParticipantStylePanel.stories.tsx`. Compare against the canvas boards side by side.

## Task 11: Snapshots and full run

- [ ] `bun run test`, `bun pw`, `bun eslint`, `bun prettier`.
- [ ] `participant-insert.spec.ts-snapshots`, `participant-rename.spec.ts-snapshots` and others may shift (hidden "+", overlays). Follow the "E2E Screenshot Snapshot Updates" rule in `CLAUDE.md`: run `node scripts/analyze-compare-case.mjs` where it applies, name each changed element and why. Never update a snapshot only to make it pass.
- [ ] Typecheck: compare against `main` baseline, not against zero.

## Task 12: PR

- [ ] Open a PR from `feat/participant-editor-redesign` to `main`. Body: link canvas v11 and Figma, list D1–D15, list snapshot changes with reasons.
