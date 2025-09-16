**Purpose**

- Provide a small, renderer‑focused Intermediate Representation (IR) built from the ANTLR parse tree.
- Decouple UI/layout from parser internals and prototype extensions.
- Centralize message semantics (label ranges, signatures, comments) as a single source of truth.
- Improve testability and maintainability while enabling incremental refactors.

**IR vs AST**

- AST mirrors grammar structure; IR is task‑oriented for rendering and layout.
- IR flattens and normalizes parser details into stable fields the renderer needs.
- Example: messages IR carries `{ from, to, signature, type, labelRange, comment }` without exposing parser classes.

**Current Scope**

- Messages IR
  - Builder: `buildMessagesModel(rootCtx)` → `Array<{ from?: string; to?: string; signature: string; type: OwnableMessageType; labelRange?: [number, number]; comment?: string }>`
  - Uses shared helpers: `labelRangeOfMessage`, `signatureOf`, `commentOf`.
  - Consumed by: `messagesModelAtom`, `MessageLayer` (origin), `WidthOfContext`, `Coordinates`, `OrderedParticipants`.
- Participants IR
  - Builder: `buildParticipantsModel(rootCtx)` → `Array<{ name: string; label?; type?; explicit?; isStarter?; positions: [number, number][]; assigneePositions: [number, number][] }>`
  - Current status: available; integration is incremental.

**Helpers**

- `src/parser/helpers.ts` centralizes:
  - `codeRangeOf(ctx)` → line/column range object for clicks/selection.
  - `labelRangeOfMessage(ctx, kind)` → inclusive `[start, end]` offsets for in‑place editing.
  - `signatureOf(ctx)` → normalized display text (respects named params).
  - `commentOf(ctx)` → channel‑aware comment text.

**Integration Points**

- Store atoms (see `src/store/Store.ts`):
  - `messagesModelAtom` exposes messages IR for consumers.
- `participantsAtom` exposes participants IR (canonical source).
- Runtime consumers:
  - `MessageLayer`: origin calculation from messages IR.
  - `WidthOfContext`: computes extra width using messages IR.
  - `Coordinates`: uses messages IR for message gaps.
  - `OrderedParticipants`: uses messages IR for starter/ordering.

**Usage**

- Build IR from parse root:
  - `import { RootContext } from '@/parser'`
  - `import { buildMessagesModel } from '@/ir/messages'`
  - `const ctx = RootContext(code)`
  - `const messages = ctx ? buildMessagesModel(ctx) : []`

**Design Notes**

- Inclusive offsets: `labelRange` uses `[start, end]` character offsets matching editor behavior.
- Parser isolation: IR is plain data; consumers do not import ANTLR classes.
- Minimal contracts: each IR includes only fields actually used by UI/layout.

**Testing**

- Message IR tests: `src/ir/messages.spec.ts` (explicit expectations).
- Helper tests: `src/parser/helpers.spec.ts` (ranges/labels).
- Legacy tests migrated off `AllMessages` to IR parity where appropriate.

**Next Steps**

- Incremental adoption of participants IR in lifeline rendering.
- Optional fragment IR (alt/opt/par/loop/section) if needed by renderer.
