---
"@zenuml/core": patch
---

Enforce the v1 IR contract (`src/parser/ir/contract.ts`) instead of just documenting it. `src/parser-langium/compat.ts` now binds its module surface to `ParserModule` with `satisfies`, so the CI typecheck gate fails if the Langium facade drifts from the contract (including the ProgContext/GroupContext/ParticipantContext facade classes and the ParticipantsCollection shape, checked transitively).

Wiring this surfaced three real contract-vs-reality drifts, now reconciled (all internal, no consumer-facing behavior change):
- `IrNode.stop` was `TokenView` but ANTLR (and the facade) give zero-token rules `stop === null` — corrected to `TokenView | null`.
- The `Participant` class marked renderer-facing fields (`type`, `stereotype`, `color`, …) `private` while exposing them via `ToValue()`; made them public to match `ParticipantView` (compile-time only).
- `ParticipantsCollection.GetPositions`/`GetAssigneePositions` claimed `IrPosition[]` but return `Set | undefined` (the consumer normalizes with `Array.from(… ?? [])`) — corrected the contract.

Also corrected the contract header, which falsely claimed the facade classes `implements` these interfaces.
