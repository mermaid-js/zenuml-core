# IR Migration Guide (Parser ➜ Renderer)

## Overview

This guide describes how we are migrating from using ANTLR parse-tree contexts directly in the renderer to a small, renderer‑focused Intermediate Representation (IR). The IR captures exactly what the UI and layout need (e.g., for messages: `from`, `to`, `signature`, `type`, plus `labelRange`, `comment`) and keeps parser internals behind a clear boundary.

## Goals

- Decouple the renderer and positioning from ANTLR internals and prototype extensions.
- Centralize sensitive logic (e.g., label ranges, signatures, comments) in shared helpers.
- Reduce repeated parse-tree walks and duplicated semantics.
- Improve testability (explicit, stable expectations) and maintenance velocity.
- Migrate incrementally with no fallbacks, validating each step.

## Terminology

- AST: Abstract Syntax Tree, typically mirrors grammar. We are not building a full AST yet.
- IR: Intermediate Representation designed for the renderer. It flattens and normalizes parser details into stable fields.

## Principles

- No fallbacks: adopt the new approach at the chosen callsite and fix issues, rather than silently falling back to old code.
- Small steps: integrate one surface at a time to keep blast radius contained.
- Single source of truth: range/label/comment logic lives in `src/parser/helpers.ts`.
- Renderer/parser boundary: UI/layout only consume IR and helpers; no direct token math in components.
- Tests first: add focused tests for helpers and IR outputs; migrate legacy tests to assert IR.

## Current Status

Delivered in this branch:

- Shared helpers (`src/parser/helpers.ts`)
  - `codeRangeOf(ctx)`
  - `signatureOf(ctx)`
  - `commentOf(ctx)`
  - `labelRangeOfMessage(ctx, kind)`
  - `labelRangeOfRef(ctx)`
  - `labelRangeOfCondition(ctx)`

- Messages IR (`src/ir/messages.ts`)
  - Builder: `buildMessagesModel(rootCtx)`
  - Runtime adoption:
    - `MessageLayer` origin
    - `WidthOfContext` extra width calculation
    - `Coordinates` message gaps
    - `OrderedParticipants` starter/ordering

- Participants IR (`src/ir/participants.ts`)
  - Implemented; now the canonical runtime source via `participantsAtom`.

- Legacy removal and tests
  - Removed runtime `MessageCollector.ts`; tests now assert IR outputs.
  - Added focused helper tests for message label ranges, ref label ranges, and condition ranges.

- Component cleanups
  - Message components (sync/async/self/creation/return) use `labelRangeOfMessage`.
  - FragmentRef uses `labelRangeOfRef`.
  - ConditionLabel uses `labelRangeOfCondition`.

## Phased Plan

### Phase 1 (Complete)

- Add helpers and adopt them in message components.
- Introduce Messages IR and wire up select runtime consumers (origin, width, coordinates, ordering).
- Remove runtime `AllMessages` walker; migrate tests to IR.

Acceptance
- No UI regressions; focused tests pass; profiling shows comparable performance.

### Phase 2 (Participants IR — Small, Verified Steps)

1) Adopt Participants IR for implicit participants only in Lifeline rendering.
   - Keep `OrderedParticipants` intact (still drives ordering and coordinates).
   - Verify lifelines render identically on sample diagrams.

2) Use Participants IR for label/assignee positions in `Participant` component.
   - Replace reads to `participantsAtom` position sets with IR equivalents.
   - Validate MessageLabel edits against token positions.

3) Switch readiness logic only after visual verification.
   - Ensure `renderingReadyAtom` counts expected lifelines (exclude `_STARTER_`).

Acceptance
- Visual diffs match; edits update code correctly; no freeze in readiness.

### Phase 3 (Fragments and Frame Data — Optional)

- Keep current `FrameBuilder` unless IR is needed for fragment tree.
- Continue centralizing fragment label ranges via helpers (`labelRangeOfRef`, `labelRangeOfCondition`).

Acceptance
- Fragment labels remain editable and correct on valid input; invalid inputs do not expose synthetic label ranges.

### Phase 4 (Tighten the Boundary)

- Audit components for residual parser/token accesses (e.g., `start.start`, `stop.stop`).
- Replace with helpers or IR accessors; add focused tests as needed.

Acceptance
- No remaining token math in components; helpers and IR are the only boundary.

## Validation Strategy

- Helper tests: pure, input-to-output assertions for ranges, signatures, comments.
- IR tests: assert message arrays (from/to/signature/type) and presence of ranges/comments when applicable.
- Render sanity: load representative diagrams (empty, simple, with `@Starter`, with returns/async, with fragments) and verify layout/edits.
- Performance: compare parse/build and render timings on medium diagrams; ensure no noticeable regression.

## Rollback Strategy

- Each step is isolated (single file/class). If an issue is found, revert that change while keeping prior steps.
- Because there are no fallbacks, failures are visible and can be fixed immediately.

## Coding Guidelines

- Components must not compute label ranges or comments; always use helpers.
- Helpers return `null` for non-existing/invalid cases; components map `null` to safe defaults (e.g., `[-1,-1]`).
- IR builders should reuse helpers for any semantics used by the UI to avoid drift.

## Known Pitfalls

- ANTLR error recovery can fabricate contexts (e.g., `ref()` yielding a synthetic `NameContext`). Helpers must guard synthesized tokens and invalid token types.
- Readiness counting must match actual lifelines rendered (exclude `_STARTER_` from expected count).

## Appendix

- IR README: `src/ir/README.md`
- Helpers: `src/parser/helpers.ts`
- Messages IR: `src/ir/messages.ts`
- Participants IR: `src/ir/participants.ts`
