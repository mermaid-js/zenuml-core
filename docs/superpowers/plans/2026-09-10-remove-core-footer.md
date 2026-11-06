# Remove Core Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the embedded ZenUML footer and expose numbering visibility as a host-controlled render option.

**Architecture:** `DiagramFrame` becomes diagram chrome without a footer. `ZenUml.render()` maps the optional `enableNumbering` configuration into the existing numbering atom; theme and imperative zoom behavior remain intact for compatibility.

**Tech Stack:** TypeScript, React 19, Jotai, Bun tests, Testing Library, Vite

**Spec:** `docs/superpowers/specs/2026-09-10-remove-core-footer-design.md`

## Global Constraints

- Message numbering remains enabled by default.
- Existing theme and imperative zoom APIs remain available.
- No DSL grammar changes are included.
- Host applications own help, viewport controls, and attribution.

---

### Task 1: Lock the public behavior with failing tests

**Files:**

- Modify: `src/core.spec.ts`

**Interfaces:**

- Consumes: `ZenUml.render(code, config)` and its rendered DOM.
- Produces: Regression coverage for footer absence and `enableNumbering`.

- [ ] Add a test that renders a diagram and asserts `.footer` is absent.
- [ ] Run `bun test src/core.spec.ts` and verify the footer test fails because `.footer` exists.
- [ ] Add tests proving numbering is visible by default and hidden with `enableNumbering: false`.
- [ ] Run `bun test src/core.spec.ts` and verify the explicit-disable test fails because the option is not implemented.

### Task 2: Remove footer UI and wire host-controlled numbering

**Files:**

- Modify: `src/components/DiagramFrame/DiagramFrame.tsx`
- Modify: `src/core.tsx`
- Delete if unreferenced: `src/components/DiagramFrame/ThemeSelector.tsx`
- Delete if unreferenced: `src/components/DiagramFrame/Tutorial/TipsDialog.tsx`
- Delete only assets proven unreferenced by `rg`: footer-only icon modules/assets

**Interfaces:**

- Consumes: existing `enableNumberingAtom`.
- Produces: `Config.enableNumbering?: boolean` with omission preserving existing state.

- [ ] Remove the footer JSX and imports/state used only by it.
- [ ] Add `enableNumbering?: boolean` to `Config`.
- [ ] In `doRender`, set `enableNumberingAtom` only when the option is explicitly defined.
- [ ] Remove UI modules and assets only after repository-wide reference checks.
- [ ] Run `bun test src/core.spec.ts` and verify all new tests pass.

### Task 3: Verify the repository and preview

**Files:**

- Modify only if required by verified failures: affected tests or documentation comments.

**Interfaces:**

- Consumes: completed Tasks 1–2.
- Produces: verified build-quality evidence and visual confirmation.

- [ ] Run `bun run test`.
- [ ] Run `bun run typecheck`.
- [ ] Run `bun run build:site`.
- [ ] Open the DOM preview and verify the frame ends after diagram content with no footer.
- [ ] Inspect `git diff --check` and the final scoped diff.
