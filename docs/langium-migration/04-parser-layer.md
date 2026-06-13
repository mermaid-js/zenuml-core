# 04 — Parser Layer (`src/parser/`) Inventory for the Langium Migration

> Source of truth for the custom parser layer that sits on top of the ANTLR4-generated
> parser. Every non-spec file under
> `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/parser`
> was read in full for this document. Designers and implementers should be able to work
> from this document without re-reading the source.

## 0. Big Picture

The parser layer has **three architectural mechanisms**, all of which are ANTLR-specific
and all of which must be re-designed for Langium:

1. **Prototype augmentation (side-effect imports).** ~12 modules attach methods directly
   onto `antlr4.ParserRuleContext.prototype` and onto specific generated context classes
   (`sequenceParser.MessageContext`, `CreationContext`, `AsyncMessageContext`,
   `ReturnAsyncMessageContext`, `RetContext`, `ProgContext`, `StatContext`,
   `TitleContext`, `RefContext`, `DividerContext`, `IfBlockContext`, `LoopContext`,
   `ParametersContext`). The methods added (`getFormattedText`, `getComment`,
   `returnedValue`, `Origin`, `Owner`, `To`, `From`, `ProvidedFrom`, `SignatureText`,
   `ParametersText`, `isParamValid`, `Signature`, `ReturnTo`, `Starter`, `content`,
   `Note`, `Content`, `Participants`, `Statements`, `Assignment`, `Assignee`,
   `AssigneePosition`, `Constructor`, `Body`, `isCurrent`, `Key`, `getAncestors`,
   `ClosestAncestorStat`, `ClosestAncestorBlock`) form the **de-facto API contract**
   between the parse tree and the entire renderer (`src/components/`, `src/positioning/`,
   `src/svg/`, `src/store/`). React components call these methods on raw parse-tree
   nodes. In Langium, AST nodes are plain objects with `$type`/`$container`/`$cstNode`;
   there are no generated classes to augment, so this contract must be replaced by either
   (a) a facade/wrapper class layer, or (b) free functions over the Langium AST.

2. **Listener-based tree walking.** Four listeners extend (or instantiate)
   `sequenceParserListener` and are driven by `antlr4.tree.ParseTreeWalker.DEFAULT`:
   `ToCollector.js`, `MessageCollector.ts`, `FrameBuilder.ts`, `ChildFragmentDetecotr.js`.
   Langium has no generated listener; these become explicit recursive AST walks
   (`AstUtils.streamAllContents` or hand-rolled visitors).

3. **Token-stream / character-offset features.** Comments are read from a dedicated
   lexer channel (`COMMENT_CHANNEL`) via `getHiddenTokensToLeft`; editor round-trip
   features (participant rename, label edit, cursor highlight) rely on absolute character
   offsets `ctx.start.start` / `ctx.stop.stop` of tokens. Langium exposes offsets via
   `$cstNode.offset` / `$cstNode.end` and attaches hidden tokens (comments) to CST nodes,
   so both are portable but mechanically different.

Total non-spec code: **~1,873 lines** across 31 files (plus `CONTEXT.md`).

---

## 1. Entry Point

### 1.1 `src/parser/index.js` (104 lines) — REWRITE

**Purpose:** Public entry point of the whole parser. Builds the ANTLR pipeline, collects
syntax errors, installs three universal prototype methods, and re-exports the helper
collectors.

**Exports:**
- Named: `RootContext(code)`, `ProgContext`, `GroupContext`, `ParticipantContext`,
  `Depth(ctx)`, `Participants(ctx)`.
- Default object: `{ RootContext, ProgContext, GroupContext, ParticipantContext, Participants, Errors, ErrorDetails, Depth }`.

**Behavior details:**
- `rootContext(code)`:
  `antlr4.InputStream` → `sequenceLexer` → `antlr4.CommonTokenStream` → `sequenceParser`,
  adds a `SeqErrorListener`, then `return parser._syntaxErrors ? null : parser.prog();`.
  **Quirk:** `_syntaxErrors` is checked *before* `prog()` runs, so it is always `0` and
  the function effectively **always returns a parse tree**, relying on ANTLR's error
  recovery to produce a partial tree for invalid input. Error tolerance of the whole
  product depends on this (typing half-finished DSL must still render). Langium's
  Chevrotain-based error recovery behaves differently and must be validated against the
  same partial-input corpus.
- **Module-level mutable error state:** `const errors = []` and `const errorDetails = []`
  are module singletons appended to by every parse and **never cleared**. They are
  exported by live reference as `Errors` / `ErrorDetails` (consumed e.g. via
  `Parser.Errors`). Any Langium replacement should return errors per-parse from
  `document.diagnostics` instead of accumulating globally — but consumers currently
  expect a mutable array import.
- **Prototype methods installed on `antlr4.ParserRuleContext.prototype`:**
  - `getFormattedText()` — `this.parser.getTokenStream().getText(this.getSourceInterval())`
    then `formatText` from `@/utils/StringUtil` (strips extra quotes/spaces/newlines).
    This is the **single most-called method in the codebase** (renderer-wide). Note it
    reads from the *token stream*, not `getText()`, so it includes inter-token whitespace
    of the original source. Langium equivalent: `node.$cstNode.text` + same `formatText`.
  - `getComment()` — finds tokens on `COMMENT_CHANNEL` to the left of `this.start.tokenIndex`
    via `getTokenStream().getHiddenTokensToLeft(...)`, strips the leading `//` of each and
    joins with `\n`. **Special case:** if `this.constructor.name === "BraceBlockContext"`
    it uses `this.stop.tokenIndex` instead (comment before the closing `}` belongs to the
    block). Comments drive rendered notes/annotations (colors, styling via comments).
    This is the **hardest token-level feature to port**: Langium hidden terminals must be
    recovered from the CST (`CstUtils.findCommentNode` or manual scan of hidden CST leaf
    nodes preceding the node).
  - `returnedValue()` — `this.braceBlock().block().ret().value()`; sugar used to get the
    return value of a message body.
- Side-effect imports (order matters only in that they must run before rendering):
  `./TitleContext`, `./IsCurrent`, `./Owner`, `./ProgContext`, `./RetContext`,
  `./RefContext`, `./Origin`, `./Divider/DividerContext`, `./SignatureText`,
  `./Messages/MessageContext`, `./From`, `./key/Key`,
  `./utils/cloest-ancestor/ClosestAncestor`, `./AncestorPath`.
- `Depth(ctx)` delegates to `ChildFragmentDetector.depth(...)`; `Participants(ctx)`
  delegates to `ToCollector.getParticipants(ctx)`.

**Consumers (non-exhaustive, from grep):** `src/store/Store.ts`
(`import { RootContext, Participants } from "@/parser"`), `src/core.tsx`
(`import Parser from "./parser/index.js"`), `src/cli/zenuml.ts`,
`src/positioning/Coordinates.ts`, `src/positioning/LocalParticipants.ts`,
`src/components/DiagramFrame/SeqDiagram/LifeLineLayer/LifeLineLayer.tsx`
(`GroupContext`, `ParticipantContext` for `instanceof` dispatch), `src/svg/*` and ~25
other component files.

---

## 2. Listener-Based Collectors (tree walkers)

### 2.1 `src/parser/ToCollector.js` (181 lines) — REWRITE

**Purpose:** Walks the parse tree and builds the `Participants` collection — every
participant that exists, in source order, with all metadata (type, stereotype, emoji,
width, group, label, color, comment, character positions).

**Export:** default `ToCollector` — a **singleton instance** of
`new sequenceParserListener()` with handler methods assigned onto it, plus an added
`getParticipants(context)` method that resets module state and runs
`antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, context)`.

**Module-level mutable state (not re-entrant):**
- `let participants` — replaced with `new Participants()` on each `getParticipants` call.
- `let isBlind` — suppression flag: set `true` on `enterParameters` / `enterCondition`,
  `false` on exit. Participant names appearing inside method parameters or fragment
  conditions (`if(x)`) must **not** become participants.
- `let groupId` — set in `enterGroup` (`ctx.name()?.getFormattedText()`, may be
  `undefined` for anonymous groups), cleared in `exitGroup`; stamped onto participants
  declared inside the group.

**Handlers (grammar rules listened to):**
- `enterParticipant` — reads `participantType()` (strips leading `@`), `name()`,
  `stereotype()?.name()`, `emoji?.()?.name?.()`, `width()` (parsed int), `label()?.name()`,
  `COLOR()` token, `ctx.getComment()`. Computes character `position` `[start, end]`:
  from the label name token if a label exists (so in-diagram rename edits the label),
  else from the name token (`nameCtx.start.start`, `nameCtx.stop.stop + 1`). Adds with
  `explicit: true`. Missing name → literal participant `"Missing \`Participant\`"`.
- `enterFrom` / `enterTo` (same function `onTo`) — registers message endpoints as
  implicit participants. Name: `ctx.name?.()?.getFormattedText() || ctx.getFormattedText()`.
  Three position cases: (a) participant already has a `label` → add without position;
  (b) participant has an `assignee` (came from `ret = new A()` then `"ret:A".method()`):
  position points at the *type* part inside the quoted name —
  `start = ctx.start.start + assignee.length + 2`, and `assigneePosition` covers the
  assignee part (`+1` offsets account for the opening quote); (c) plain → position is
  `[ctx.start.start, ctx.stop.stop + 1]`.
- `enterStarter` — `@Starter(X)`; adds with `isStarter: true` and position.
- `enterCreation` — participant is `ctx.Owner()` (from `Owner.js` augmentation, i.e.
  `assignee:Type` or `Type`); if a constructor exists and the participant has no label,
  stores `position` = constructor token range and `assignee` / `assigneePosition` from
  `ctx.Assignee()` / `ctx.AssigneePosition()` (also `Owner.js` augmentations).
- `enterRef` — `ctx.Participants()` (from `RefContext.ts`: all `name()` children after
  the first) each added with their token positions.
- `enterRet` — if `ctx.asyncMessage()` exists, skip (handled when the walker descends);
  else add `ctx.From()` and `ctx.ReturnTo()` (both prototype augmentations) as bare
  participants.
- `enterParameters`/`exitParameters`, `enterCondition`/`exitCondition` — blind-mode
  toggles. **Note:** `enterParticipant`, `enterCreation`, `onTo` check `isBlind`, but
  `enterRef`, `enterStarter`, `enterRet` do not.

**Semantics rules (in header comment):** later declarations win for *first-set* fields
(see `Participant.mergeOptions` — actually first writer wins per field because of `||=`);
explicit participant declarations cannot be downgraded by To/Starter mentions.

**ANTLR coupling:** generated listener base, `ParseTreeWalker`, `getFormattedText`,
`getComment`, token offsets, augmented methods (`Owner`, `Assignee`, `AssigneePosition`,
`From`, `ReturnTo`, `Participants`).

**Langium port:** a single recursive AST visitor producing the same `Participants`
collection; blind-mode becomes "don't descend into parameter/condition sub-trees", which
is *easier* with explicit recursion than with a listener.

### 2.2 `src/parser/MessageCollector.ts` (69 lines) — REWRITE

**Purpose:** Flattens the tree into an ordered `OwnableMessage[]` (`{from, to, signature,
type}`) consumed by the horizontal coordinate solver (`src/positioning/Coordinates.ts`)
and `OrderedParticipants`.

**Exports:** `class MessageCollector extends sequenceParserListener` and
`AllMessages(ctx)` — constructs a fresh listener (✅ re-entrant, unlike ToCollector) and
walks with `ParseTreeWalker.DEFAULT`.

**Handlers:**
- `enterMessage` → `OwnableMessageType.SyncMessage`
- `enterAsyncMessage` → `AsyncMessage`
- `enterCreation` → `CreationMessage`
- `enterReturnAsyncMessage` → `ReturnMessage`
- `enterRet` → `ReturnMessage`, but skipped if `ctx.asyncMessage()` or
  `ctx.returnAsyncMessage()` exists (those fire their own enter events later).
- `enterParameters`/`exitParameters` → blind mode (messages inside parameters ignored).

**Per message:** `from = ctx.From()`, `to/owner = ctx.Owner()`,
`signature = ctx.SignatureText()`; if `from === owner` (self message) and the context has
an `Assignment()` (sync message / creation), signature becomes
`"${assignment.getText()} = ${signature}"` (e.g. `a:A = method()`); all of these are
prototype augmentations from `From.ts`, `Owner.js`, `SignatureText.ts`,
`Messages/Assignment.ts`.

**Consumers:** `src/positioning/Coordinates.ts`, `src/parser/OrderedParticipants.ts`,
`src/svg/*` (via `AllMessages`).

### 2.3 `src/parser/FrameBuilder.ts` (128 lines) — REWRITE

**Purpose:** Builds the nested `Frame` tree (one node per fragment) used to compute
fragment border offsets. `Frame = { type, left, right, children }` where `left`/`right`
are the leftmost/rightmost **participant names** the fragment touches (type imported from
`@/positioning/FrameBorder`).

**Export:** default `class FrameBuilder extends sequenceParserListener`.
`constructor(orderedParticipants: string[])`; `getFrame(context)` walks each
`context.children` child with `ParseTreeWalker.DEFAULT` and returns `frameRoot`.

**Mechanics:** `enterFragment(ctx, type)` pushes a frame onto a `parents` stack and links
it into the parent's `children`; first frame becomes root; `exitFragment()` pops.
Fragment rules handled: `tcf` (try/catch/finally), `opt`, `par`, `alt`, `loop`,
`section`, `critical`, `ref` — each with its own `enterX`/`exitX` pair delegating to the
generic ones.

**Left/right resolution:** `getLeft`/`getRight` call
`getLocalParticipantNames(ctx)` from `src/positioning/LocalParticipants.ts` — which in
turn calls `ctx.Origin()` (prototype augmentation) and `Participants(ctx)`
(ToCollector walk **per fragment node** — quadratic-ish, a known perf hot spot) — and
then pick the first/last match in `this._orderedParticipants` order.

**Cross-layer cycle:** parser → positioning (`FrameBorder`, `LocalParticipants`) →
parser (`OrderedParticipants._STARTER_`, `Participants`). The Langium design should break
this cycle (compute local participants in the parser facade layer).

**Consumers:** `src/positioning/Coordinates.ts` / vertical positioning / `src/svg/*`
(via `import FrameBuilder from "@/parser/FrameBuilder"`).

### 2.4 `src/parser/ChildFragmentDetecotr.js` (73 lines, note the filename typo) — REWRITE

**Purpose:** Computes the maximum nesting depth of fragments under a context. Exposed as
`Parser.Depth(ctx)` from `index.js` (used to widen fragments by 10px per nesting level —
historically; **no current non-parser consumer of `Depth` was found by grep**, so verify
before porting).

**Export:** default singleton `new sequenceParserListener()` with `enterTcf/Opt/Par/Alt/
Loop/Section/Critical` incrementing a **module-level** `cursor` and `exitX` updating
`max = Math.max(max, cursor)` then decrementing. (`ref` is *not* counted, unlike
FrameBuilder.) `depth(me)(context)` resets `cursor`/`max`, walks each `context.children`
child, returns `max`. Same non-re-entrancy caveat as ToCollector.

**Langium port:** trivial recursive function; ~10 lines.

---

## 3. Prototype-Augmentation Modules (semantic methods on parse-tree nodes)

These are all "import-for-side-effect" modules loaded by `index.js`. None export anything
meaningful (some export the class for convenience). **All are REWRITE** — in Langium they
become functions over AST nodes (or methods on facade wrappers), with `instanceof`
replaced by `$type` checks / `isXxx` type guards, and `parentCtx` replaced by
`$container`.

### 3.1 `src/parser/Origin.js` (39 lines)

**Purpose:** `Origin()` = the inferred *sender* of a statement. For
`S -> A.m1 { B.m2 { C.m3 } }`: origin of `m1` is `S`, of `m2` is `A`, of `m3` is `B`.

**Augments:**
- `ParserRuleContext.prototype.Origin()` — climbs to the nearest `StatContext` or
  `ProgContext` ancestor and calls its `Origin()`. **Latent bug:** the loop body is
  `ctx = this.parentCtx;` (not `ctx = ctx.parentCtx`), so if the *direct* parent is not
  a Stat/Prog the loop never advances → infinite loop. It works in practice only because
  callers (`From.ts` etc.) go through `ClosestAncestorStat()` first. Do **not** port this
  loop verbatim.
- `StatContext.prototype.Origin()` — walks ancestors: nearest enclosing
  `MessageContext`/`CreationContext` → its `Owner()` (the receiver of the enclosing
  message is the sender of nested messages); reaching `ProgContext` → `ctx.Starter()`
  (the `@Starter(X)` declaration or `undefined`).
- `ProgContext.prototype.Origin()` — `this.Starter()`.

**ANTLR coupling:** `instanceof StatContext/ProgContext/MessageContext/CreationContext`,
`parentCtx` chain.

### 3.2 `src/parser/Owner.js` (89 lines)

**Purpose:** `Owner()` = the *receiver* of a message; also creation-specific helpers.
For `S -> A.m1 {B.m2 {C.m3}} D->E:m4` owners are A, B, C, E.

**Augments:**
- `CreationContext.prototype.Assignee()` —
  `creationBody()?.assignment()?.assignee()?.getFormattedText()`.
- `CreationContext.prototype.AssigneePosition()` — `[assignee.start.start,
  assignee.stop.stop + 1]` or `undefined`.
- `CreationContext.prototype.Constructor()` — `creationBody()?.construct()?.getFormattedText()`.
- `CreationContext.prototype.To()` — alias of `Constructor()`.
- `CreationContext.prototype.Owner()` — `"Missing Constructor"` if no constructor; else
  `` `${assignee}:${type}` `` when an assignee exists (this composite string is the
  participant *name* for created instances), else the type.
- `MessageContext.prototype.To()` — `messageBody()?.fromTo()?.to()`, name preferred over
  raw text.
- `MessageContext.prototype.Owner()` — `To() || getOwnerFromAncestor(parentCtx)` where
  `getOwnerFromAncestor` climbs `parentCtx` until a `CreationContext`/`MessageContext`
  and returns its `Owner()` (self-messages without a `to` inherit the enclosing receiver).
- Same `To()`/`Owner()` pair on `AsyncMessageContext` and `ReturnAsyncMessageContext`
  (using `this.to()`).
- `RetContext.prototype.To()` — `this.ReturnTo()` (from `RetContext.js`);
  `RetContext.prototype.Owner()` — `To() || getOwnerFromAncestor(...)`.

### 3.3 `src/parser/From.ts` (64 lines)

**Purpose:** `From()` = the resolved sender; `ProvidedFrom()` = the explicitly written
sender only.

**Augments (all with `@ts-expect-error` since the generated classes are untyped):**
- `CreationContext.prototype.From()` — if parent is a `StatContext`:
  `this.ClosestAncestorStat().Origin()`; else `undefined`.
- `MessageContext.prototype.ProvidedFrom()` — `messageBody()?.fromTo()?.from()` (name or
  raw text); `From()` — `ProvidedFrom() || ClosestAncestorStat().Origin()`.
- `AsyncMessageContext` / `ReturnAsyncMessageContext` — same pattern using `this.from()`.
- `RetContext.prototype.From()` —
  `asyncMessage()?.From() || returnAsyncMessage()?.From() || ClosestAncestorStat().Origin()`.

### 3.4 `src/parser/SignatureText.ts` (117 lines)

**Purpose:** Human-readable message label text.

**Augments:**
- `MessageContext.prototype.SignatureText()` —
  `messageBody()?.func()?.signature()` mapped through `getFormattedText()` joined with
  `"."` (method chains: `A.m1().m2()`), else `""`.
- `AsyncMessageContext.prototype.SignatureText()` — `content()?.getFormattedText() ?? ""`.
- `ReturnAsyncMessageContext.prototype.SignatureText()` — same.
- `CreationContext.prototype.ParametersText()` — formats
  `creationBody().parameters().parameter()` via local helpers; `SignatureText()` —
  `«params»` or `«create»` (guillemets baked in); `isParamValid()` — params length > 0.
- `RetContext.prototype.SignatureText()` —
  `asyncMessage()?.content() ?? returnAsyncMessage()?.content() ?? expr()`,
  formatted, else `""`.
- `ParametersContext.prototype.getFormattedText()` — **overrides** the universal
  `getFormattedText` with parameter-aware formatting (joins with `","`).

**Pure helpers inside (PORT-AS-IS logic):** `formatParameter(param)` — named parameter
→ `id=expr`; declaration → `type id`; expression → formatted text; fallback raw;
`formatParameters(params)` — comma-join. Typed against `Parser.types.ts` interfaces.

### 3.5 `src/parser/RetContext.js` (51 lines)

**Augments:**
- `RetContext.prototype.Signature()` — like `SignatureText` (async content ||
  returnAsync content || expr), but returns `undefined` instead of `""` when empty.
- `RetContext.prototype.ReturnTo()` — the receiver of a `return`: explicit `to` of the
  embedded async/returnAsync message if present; otherwise walks
  `stat → block → blockParent`: if `ProgContext` → `Starter()`; else climbs until a
  `MessageContext`/`CreationContext`/`ProgContext`; for `MessageContext` returns its
  explicit `from` (the `return` goes back to whoever called the enclosing message), else
  `ClosestAncestorStat().Origin()`.

### 3.6 `src/parser/ProgContext.js` (42 lines)

**Augments:** `ProgContext.prototype.Starter()` —
`this.head()?.starterExp()?.starter()?.getFormattedText()`.

Contains the **canonical design note on starter semantics** (6 numbered cases): `Starter()`
returns the explicit `@Starter(x)` or `undefined`; the renderer (LifelineLayer /
`OrderedParticipants`) decides whether the synthetic `_STARTER_` participant is needed
based on messages; the parser must not invent default starters.

### 3.7 `src/parser/TitleContext.js` (13 lines)

**Augments:** `TitleContext.prototype.content()` — `""` if fewer than 2 children, else
`this.children[1].getText().trim()` (child 0 is the `title` keyword token). Exports
`TitleContext` as default. Relies on raw `children` array indexing — in Langium the title
content becomes a normal grammar property.

### 3.8 `src/parser/RefContext.ts` (14 lines)

**Augments:** `RefContext.prototype.Content()` — `this.name()[0]` (first name = ref
label); `RefContext.prototype.Participants()` — `this.name().slice(1) ?? []` (remaining
names = participants the ref spans). Used by `ToCollector.enterRef` and renderer
`FragmentRef`.

### 3.9 `src/parser/Divider/DividerContext.ts` (16 lines)

**Augments:** `DividerContext.prototype.Note()` — `dividerNote()?.getFormattedText().trim()`,
throws `Error("Divider note must start with ==")` if it doesn't start with `==`, then
strips leading/trailing `=` runs. Returns the divider's display text.

### 3.10 `src/parser/IsCurrent.js` (26 lines)

**Augments:**
- `CreationContext.prototype.Body = CreationContext.prototype.creationBody` (alias),
  `MessageContext.prototype.Body = messageBody` (alias).
- `isCurrent(cursor)` on both — `true` iff `cursor` (absolute character offset from the
  editor) is within `[this.start.start, this.Body().stop.stop + 1]`. Try/catch returns
  `false` on any failure. Drives "highlight the message under the editor cursor"
  (`src/components/.../Interaction.tsx`, `Creation.tsx`, `StylePanel.tsx`).
  Langium equivalent: `$cstNode.offset` / `$cstNode.end` of node + body.

### 3.11 `src/parser/key/Key.ts` (5 lines)

**Augments:** `ParserRuleContext.prototype.Key()` — `` `${this.start.start}:${this.stop.stop}` ``
— a stable identity key for a context based on absolute character offsets (intended as a
React key / memo key). **Grep found no non-spec consumers of `.Key()`** — likely dead;
confirm before porting. Langium equivalent: `` `${$cstNode.offset}:${$cstNode.end}` ``.

### 3.12 `src/parser/utils/cloest-ancestor/ClosestAncestor.ts` (31 lines; directory name is a typo of "closest")

**Augments:**
- `ParserRuleContext.prototype.ClosestAncestorStat()` — returns `this` if it *is* a
  `StatContext`; else climbs `parentCtx` to the nearest `StatContext`; `undefined` if
  none. Core building block for `From`/`Origin` resolution.
- `ParserRuleContext.prototype.ClosestAncestorBlock()` — parent of
  `ClosestAncestorStat()` if it is a `BlockContext`, else `console.warn` + `undefined`.

**Langium port:** `AstUtils.getContainerOfType(node, isStat)` — near 1:1.

### 3.13 `src/parser/AncestorPath.ts` (19 lines)

**Augments:** `ParserRuleContext.prototype.getAncestors(predicate?)` — returns
`[this (if matching), ...all ancestors matching predicate]` (self-inclusive, root-last).
Spec: `AncestorPath.spec.ts`.

**Consumers:** `src/components/.../Fragment/useFragmentData.ts` and
`src/components/.../useArrow.ts` — both call `context?.getAncestors((ctx) => ...)` to
find enclosing fragments/messages for layout. Langium: walk `$container` chain.

### 3.14 `src/parser/Messages/MessageContext.ts` (28 lines)

**Purpose:** `Statements()` helper for nested-statement access; also imports
`./Assignment` for its side effects.

**Augments:** `MessageContext`, `CreationContext`, `IfBlockContext`,
`LoopContext` — each `.prototype.Statements = () => this.braceBlock()?.block()?.stat() || []`.
(The directory also holds `MessageContext/MessageContext.spec.ts` — a spec-only sibling
directory `src/parser/MessageContext/` exists with no implementation file.)

### 3.15 `src/parser/Messages/Assignment.ts` (76 lines)

**Purpose:** Structured assignment info for `a = method()` / `a:A = new A()`.

**Exports:** `class Assignment` — fields `assignee`, `type`, `labelPosition`
(=assigneePosition, backward compat), `assigneePosition`, `typePosition`
(`[-1,-1]` when absent); constructor throws if `type` is set without `assignee`;
`getText()` → `"assignee:type"` / `"assignee"`.

**Augments:** `MessageContext.prototype.Assignment()` —
`extractAssignmentFromContext(this.messageBody().assignment())`;
`CreationContext.prototype.Assignment()` — same with `creationBody()?.assignment()`.
`extractAssignmentFromContext` reads `assignee()`/`type()` formatted text and token
offsets (`start.start` / `stop.stop` — note **no `+1`** here, unlike ToCollector).
Positions feed in-diagram label editing. The `Assignment` class itself is **PORT-AS-IS**;
the extraction function is REWRITE.

---

## 4. Model / Data Modules (mostly pure)

### 4.1 `src/parser/Participants.ts` (176 lines) — PORT-AS-IS

**Purpose:** The semantic participant model. **Zero ANTLR imports** — completely pure.

**Exports:**
- `type Position = [number, number]` (absolute character offsets `[start, end)`).
- `blankParticipant` — all-undefined template object (used by `OrderedParticipants` and
  `src/positioning/Coordinates.ts` to synthesize `_STARTER_`).
- `class Participant` — fields `name`, `stereotype`, `width`, `groupId`, `explicit`,
  `isStarter`, `label`, `type`, `color`, `comment`, `assignee`, `emoji`,
  `positions: Set<Position>`, `assigneePositions: Set<Position>`.
  `mergeOptions(options)` uses `||=` per field — **first non-falsy value wins** (so the
  *first* declaration's type/color/etc. stick; later mentions only fill gaps).
  `AddPosition(position)`; `ToValue()` returns a plain-object snapshot.
- `class Participants` — insertion-ordered `Map<string, Participant>` (private).
  `Add(name, options)` (throws `Error("Participant name is required")` on empty name;
  merges options into existing; accumulates `position` / `assigneePosition` sets),
  `ImplicitArray()` (non-explicit participants — those deduced from messages),
  `Names()`, `First()`, `Get(name)`, `Size()`, `Starter()` (first with `isStarter`),
  `GetPositions(name)`, `GetAssigneePositions(name)`.

**Note:** `OrderedParticipants.ts` reaches into the **private** `participants` map via
`(participants as any).participants.entries()` — keep that accessible or add a public
`Entries()` in the port.

### 4.2 `src/parser/OrderedParticipants.ts` (73 lines) — PORT-AS-IS (logic) / touchpoint REWRITE

**Purpose:** Produces the renderer-facing ordered `IParticipantModel[]`, injecting the
synthetic `_STARTER_` participant when needed.

**Exports:** `_STARTER_ = "_STARTER_"` (imported widely: `LocalParticipants`,
`Coordinates`, many components) and `OrderedParticipants(rootContext)`.

**Logic:**
1. `ToCollector.getParticipants(rootContext)` → entries (insertion order = source order).
2. `AllMessages(rootContext)` → messages.
3. `needDefaultStarter = (no messages && no participants) || some message lacks 'from'`;
   if so, unshift `[_STARTER_, { ...blankParticipant, name: _STARTER_, isStarter: true }]`.
4. Map to local `class Participant implements IParticipantModel` with
   `left = previous participant's name` (`""` for the first) — the "left neighbor"
   linkage the layout engine uses. `getDisplayName()` = `label || name`; `hasIcon()` =
   `type !== undefined`.

The function is ANTLR-coupled only through the two collectors; the
ordering/starter-injection logic ports unchanged.

### 4.3 `src/parser/OwnableMessage.ts` (13 lines) — PORT-AS-IS

`enum OwnableMessageType { SyncMessage=0, AsyncMessage=1, CreationMessage=2,
ReturnMessage=3 }` and `interface OwnableMessage { from; to; signature; type }`.
Consumed by positioning (`OwnableMessageType` used in `Coordinates.ts`).

### 4.4 `src/parser/IParticipantModel.ts` (23 lines) — PORT-AS-IS

Renderer-facing participant interface: `name`, `left`, `label?`, `type?`, `stereotype?`,
`color?`, `emoji?`, `groupId?`, `getDisplayName()`, `hasIcon()`. Imported by
`src/svg/buildParticipantGeometry.ts`, `src/positioning/Coordinates.ts`, components.

### 4.5 `src/parser/ParticipantListener.ts` (17 lines) — DEAD CODE

Despite the name, it contains **no listener** — only a *duplicate* (older, looser)
`IParticipantModel` interface (`left?` optional, no stereotype/color/emoji/groupId) and
`export default {}`. **Grep found zero importers.** Recommend deleting rather than
migrating.

### 4.6 `src/parser/CodeRange.ts` (30 lines) — PORT-AS-IS (with adapter)

**Exports:** `class CodeRange { start: {line, col}; stop: {line, col} }` with private
constructor and `static from(context)` reading `context.start.line/.column` and
`context.stop.line/.column + stop.text.length` (ANTLR's `stop.column` is the *start*
column of the stop token, hence the `+ text.length`). 1-based lines, 0-based columns
(ANTLR convention). Used by `src/store/Store.ts` (type) and message components
(`Interaction-async.tsx`, `Creation.tsx`, `Return.tsx`) for editor synchronization.
The class is pure; only `from()` duck-types ANTLR tokens — Langium adapter reads
`$cstNode.range` (note Langium ranges are 0-based lines — conversion needed).

### 4.7 `src/parser/Parser.types.ts` (77 lines) — PORT-AS-IS (will be superseded)

Hand-written structural interfaces for context shapes used by `SignatureText.ts`:
`BaseContext` (`getFormattedText()`), `Parameter`, `NamedParameter`, `Declaration`,
`Parameters`, `Signature`, `Func`, `MessageBody`, `Content`, `CreationBody`,
`AsyncMessage`, `Expression`, `MessageContext`, `AsyncMessageContext`,
`CreationContext`, `RetContext`. Pure type declarations; Langium's generated AST types
replace them, but they document the exact accessor surface the formatting code expects.

### 4.8 `src/parser/AntlrTypes.ts` (116 lines) — PORT-AS-IS (will be superseded)

Broader duck-typed interfaces for tree nodes as the *renderer* sees them: `AntlrNode`
(`getText/getFormattedText/getComment`), `BlockNode`, `RootContextNode`, `StatNode`
(dispatch via optional `message()/asyncMessage()/creation()/ret()/divider()/alt()/tcf()/
loop()/opt()/par()/critical()/section()/ref()` + index signature), `MessageNode`,
`AsyncMessageNode`, `CreationNode`, `ReturnNode`, `AltNode` (`ifBlock/elseIfBlock/
elseBlock`), `TcfNode` (`tryBlock/catchBlock/finallyBlock`), `ConditionBlockNode`,
`CatchBlockNode`, `SingleBlockFragmentNode`. Imported by `src/svg/walkStatements.ts`,
`src/svg/renderToSvg.ts` etc. This file is the best single description of **what the
renderer needs from the AST** — use it as the spec for the Langium AST facade.

### 4.9 `src/parser/ContextsFixture.ts` (46 lines) — REWRITE (test infra)

Test-only helpers: `createParser(code)` builds the full ANTLR pipeline (with a no-op
error listener) and exposes per-rule entry points:
`ProgContextFixture`, `TitleContextFixture`, `StatContextFixture`,
`AsyncMessageContextFixture`, `SyncMessageContextFixture`, `DividerContextFixture`,
`CreationContextFixture`, `RetContextFixture` — i.e. specs parse *fragments* starting at
arbitrary grammar rules (`parser.title()`, `parser.stat()`, ...). Langium parses from
the entry rule by default; `LangiumParser.parse` with alternate entry rules (or
test-specific wrapper grammars) is needed to keep the existing spec suite. Imports
`"../parser/index"` for its prototype side effects — every fixture-based spec implicitly
depends on the augmentations being installed.

### 4.10 `src/parser/CONTEXT.md` (117 lines) — docs

Architecture summary of the two-stage pipeline (quoted in section 0 design): lexer
channels (`HIDDEN`, `COMMENT_CHANNEL`, `MODIFIER_CHANNEL`), lexer modes (`EVENT` after
`:`, `TITLE_MODE`), `DIVIDER` must start at column 0, unicode identifiers via `\p{L}`,
grammar shape `prog → title? head? block`, public API and key types. Update after
migration.

---

## 5. Spec Files (skipped per instructions, listed for completeness)

`AncestorPath.spec.ts`, `Atom/Money.spec.ts`, `Atom/NumberUnit.spec.ts`,
`ChineseSupport.spec.ts`, `CodeRange.spec.ts`, `Creation/creation.spec.js`,
`Divider/DividerContext.spec.ts`, `EmojiParser.spec.ts`, `FrameBuilder.spec.ts`,
`From.spec.ts`, `IfWithoutBody.spec.ts`, `key/Key.spec.ts`,
`Message.SignatureText.spec.ts`, `MessageContext/MessageContext.spec.ts`,
`Messages/Assignment.spec.ts`, `Messages/MessageContext.spec.ts`,
`NamedParameter.spec.ts`, `OrderedParticipants.spec.ts`, `Participants.spec.ts`,
`Title/Title.spec.ts`, `utils/cloest-ancestor/ClosestAncestor.spec.ts`.

Note the spec-only directories: `Atom/`, `Creation/`, `Title/`, `MessageContext/` contain
no implementation files. The specs collectively encode grammar behavior (Chinese/emoji
identifiers, money/number-unit atoms, if-without-body recovery, named parameters) and are
the regression suite the Langium grammar must pass.

---

## 6. Dependency Graph

```
                                ┌────────────────────────────────────────────┐
                                │  ANTLR runtime (antlr4) +                  │
                                │  src/generated-parser/{Lexer,Parser,       │
                                │                        ParserListener}     │
                                └───────▲───────────▲───────────▲────────────┘
                                        │           │           │
        prototype-augmentation modules  │   listeners           │  pipeline
  ┌─────────────────────────────────────┤           │           │
  │ Origin.js  Owner.js  From.ts        │  ToCollector.js ──────┼─► Participants.ts (pure)
  │ SignatureText.ts  RetContext.js     │  MessageCollector.ts ─┼─► OwnableMessage.ts (pure)
  │ ProgContext.js  TitleContext.js     │  FrameBuilder.ts ─────┼─► positioning/FrameBorder (Frame type)
  │ RefContext.ts  DividerContext.ts    │        │              │        ▲ cycle!
  │ IsCurrent.js  Messages/Assignment.ts│        └─ positioning/LocalParticipants
  │ Messages/MessageContext.ts          │              (calls ctx.Origin(), Participants(ctx))
  │ key/Key.ts  AncestorPath.ts         │  ChildFragmentDetecotr.js
  │ ClosestAncestor.ts                  │           │
  └───────────────▲─────────────────────┘           │
                  │ side-effect imports             │
            index.js  (RootContext, Errors, Depth, Participants) ◄──────────┐
                  │                                                          │
        OrderedParticipants.ts ──► ToCollector + MessageCollector +          │
                  │                Participants.blankParticipant +           │
                  │                IParticipantModel.ts (pure)               │
                  ▼                                                          │
   consumers: store/Store.ts, core.tsx, cli/zenuml.ts, positioning/*,        │
              svg/*, components/* (call augmented methods directly) ─────────┘

   ContextsFixture.ts ──► antlr4 + generated parser + index.js side effects (test only)
   CodeRange.ts ──► duck-typed ANTLR token shape (line/column/text)
   AntlrTypes.ts / Parser.types.ts ──► pure type declarations (document the contract)
   ParticipantListener.ts ──► nothing (dead)
```

**Modules importing the ANTLR runtime and/or generated parser directly (17):**
`index.js`, `ToCollector.js`, `MessageCollector.ts`, `FrameBuilder.ts`,
`ChildFragmentDetecotr.js`, `Origin.js`, `Owner.js`, `From.ts`, `SignatureText.ts`,
`RetContext.js`, `ProgContext.js`, `TitleContext.js`, `RefContext.ts`,
`Divider/DividerContext.ts`, `IsCurrent.js`, `key/Key.ts`,
`utils/cloest-ancestor/ClosestAncestor.ts`, `AncestorPath.ts`,
`Messages/MessageContext.ts`, `Messages/Assignment.ts`, `ContextsFixture.ts`. (21 — all
of section 1, 2, 3 plus the fixture.)

**Pure modules (no ANTLR import):** `Participants.ts`, `OwnableMessage.ts`,
`IParticipantModel.ts`, `ParticipantListener.ts` (dead), `Parser.types.ts`,
`AntlrTypes.ts`, `CodeRange.ts` (duck-typed token shape only),
`OrderedParticipants.ts` (no direct ANTLR import; coupled via the two collectors).

---

## 7. Classification: REWRITE vs PORT-AS-IS

| Module | Lines | Classification | Notes |
|---|---:|---|---|
| `index.js` | 104 | **REWRITE** | New entry: Langium services, per-parse diagnostics; replace prototype `getFormattedText`/`getComment`/`returnedValue` with facade/functions |
| `ToCollector.js` | 181 | **REWRITE** | Listener → recursive visitor; keep blind-mode + position semantics; fix singleton state |
| `MessageCollector.ts` | 69 | **REWRITE** | Listener → visitor; logic (type mapping, self-message assignment prefix) carries over |
| `FrameBuilder.ts` | 128 | **REWRITE** | Listener → visitor; break parser↔positioning cycle; left/right logic carries over |
| `ChildFragmentDetecotr.js` | 73 | **REWRITE** | ~10-line recursive depth function; verify `Depth` still has consumers |
| `Origin.js` | 39 | **REWRITE** | `$container` walk + `$type` guards; do not port the buggy base-class loop |
| `Owner.js` | 89 | **REWRITE** | Receiver resolution + creation `assignee:Type` naming — port semantics exactly |
| `From.ts` | 64 | **REWRITE** | Sender resolution (`ProvidedFrom` vs inferred `Origin`) |
| `SignatureText.ts` | 117 | **REWRITE** (helpers PORT-AS-IS) | `formatParameter`/`formatParameters` are pure; guillemet `«create»` convention must survive |
| `RetContext.js` | 51 | **REWRITE** | `ReturnTo()` ancestor-walk semantics are subtle — port with tests |
| `ProgContext.js` | 42 | **REWRITE** | One accessor + the starter design doctrine (keep the comment!) |
| `TitleContext.js` | 13 | **REWRITE** | Becomes a grammar property in Langium |
| `RefContext.ts` | 14 | **REWRITE** | First-name = label, rest = participants |
| `Divider/DividerContext.ts` | 16 | **REWRITE** | `=`-trimming logic ports verbatim |
| `IsCurrent.js` | 26 | **REWRITE** | Cursor hit-test on `$cstNode` offsets |
| `key/Key.ts` | 5 | **REWRITE / likely DELETE** | No non-spec consumers found |
| `utils/cloest-ancestor/ClosestAncestor.ts` | 31 | **REWRITE** | → `AstUtils.getContainerOfType`; fix the directory-name typo while at it |
| `AncestorPath.ts` | 19 | **REWRITE** | `$container` chain collector; 2 renderer consumers |
| `Messages/MessageContext.ts` | 28 | **REWRITE** | `Statements()` becomes a property/util over Langium blocks |
| `Messages/Assignment.ts` | 76 | **SPLIT** | `Assignment` class PORT-AS-IS; `extractAssignmentFromContext` REWRITE |
| `Participants.ts` | 176 | **PORT-AS-IS** | Pure; expose entries publicly for OrderedParticipants |
| `OrderedParticipants.ts` | 73 | **PORT-AS-IS** (touchpoints rewired) | Starter-injection + left-neighbor logic unchanged |
| `OwnableMessage.ts` | 13 | **PORT-AS-IS** | Pure types |
| `IParticipantModel.ts` | 23 | **PORT-AS-IS** | Pure interface |
| `ParticipantListener.ts` | 17 | **DELETE** | Dead duplicate interface, zero importers |
| `CodeRange.ts` | 30 | **PORT-AS-IS** (+ Langium range adapter) | Mind 1-based vs 0-based line conventions |
| `Parser.types.ts` | 77 | **SUPERSEDED** | Replaced by generated Langium AST types; keep as spec reference |
| `AntlrTypes.ts` | 116 | **SUPERSEDED** | Ditto — best description of the renderer's AST contract |
| `ContextsFixture.ts` | 46 | **REWRITE** (test infra) | Needs Langium alternate-entry-rule parsing to keep fragment-level specs |
| `CONTEXT.md` | 117 | **UPDATE** | Docs |

**Bottom line:** roughly **1,150 lines REWRITE** (everything that touches the tree) vs
**~430 lines PORT-AS-IS** (the semantic model: `Participants`, `OrderedParticipants`,
`OwnableMessage`, `IParticipantModel`, `CodeRange`, `Assignment` class) plus ~190 lines
of type declarations that the Langium generator supersedes. The dominant migration risk
is **not** inside `src/parser/` — it is that ~30 renderer/positioning/svg/store files
call the augmented prototype methods directly on parse-tree nodes, so the replacement
must preserve that method surface (facade objects) or every call site must change.
