# 09 — v1 IR Contract (`src/parser/ir/contract.ts`)

> The prose companion to `src/parser/ir/contract.ts` — the **declared boundary**
> between the parser (whatever engine backs it) and the renderer
> (`src/components`, `src/positioning`, `src/svg`, `src/store`, `src/utils`).
> Derived from `03-context-api-contract.md` (per-method consumer table),
> `04-parser-layer.md` (semantic method implementations), and
> `07-risk-map.md` (R1–R12 runtime rows + Part 3.4 facade design rules).
> The Stage-3 facade classes `implements` these interfaces; this document
> explains *why* the contract looks the way it does and how it evolves.

---

## 1. Purpose: v1 is ANTLR-shaped **by design**

The v1 IR is not an idealized AST. It is the exact surface the renderer
consumes **today** — dual-arity accessors, `null` sentinels, inclusive stop
offsets, method-presence type discrimination, `instanceof`-able classes,
prototype-style semantic methods (`Owner()`, `From()`, `SignatureText()`, …).

Why freeze the awkward shape instead of designing a clean one (07 §3.2–3.3):

1. **Blast radius.** ~25 distinct methods are called across ~40 renderer files,
   plus `start.start`/`stop.stop` reads in 18 more locations. A clean-API
   rewrite forces all of them to change in the same commit as the parser swap —
   an unreviewable big-bang.
2. **The test suite only proves parity through this shape.** The 34-spec suite
   navigates `block().stat(0).message().messageBody().func().signature()[0]`,
   asserts `getAncestors()` length 7, checks `instanceof`, and compares node
   identity with `===`. Keeping the shape keeps the suite as the migration's
   parity oracle.
3. **Reversibility.** With both engines satisfying the same contract,
   `RootContext` can A/B between ANTLR and Langium during stabilization, and
   rollback is one line.

So: **v1 declares the status quo; v2 (the `@v2` tags) declares the exit.**
The contract file is the binding artifact — if the facade and this document
disagree, doc 03 (the survey) is the evidence base and the contract file must
be corrected against it.

What the contract adds over the status quo: parser internals (ANTLR runtime
types, generated context classes, token streams, Langium `$cstNode`/`$type`)
are **not visible** through any member. The renderer can be type-checked
against `contract.ts` alone.

## 2. Scope

In scope (everything in `contract.ts`):

- `TokenView` and the base node surface (`IrNode`).
- One interface per context kind with ≥1 external consumer (03 §5/§10) —
  50 node-kind interfaces, listed in §4.
- Tree-derived service shapes the renderer holds: `ParticipantsCollection`,
  `ParticipantView`, `AssignmentView`, `IrPosition`.
- Entry points: `RootContextFn`, `ParserModule` (incl. live `Errors` /
  `ErrorDetails` arrays and `Participants`/`Depth`), `GeneratedParserShim`
  (the five classes renderer files import for `instanceof`), and
  `ContextsFixtureModule` (sub-rule parse entry points used by specs).

Deliberately **excluded** (no external consumer; risk-map "delete, don't
migrate" list): `Key()`, `returnedValue()`, `ClosestAncestorBlock()`,
`isParamValid()`, `ParticipantListener.ts`, `messageBody().assignment()` /
`messageBody().fromTo()` (facade-internal navigation), `dividerNote()`
(internal to `Note()`), `participant.width()` (ToCollector-internal). If a
facade class implements these for internal reasons, they are not contract.

## 3. Binding conventions

### 3.1 Offsets (07 §R1/R2 — risk rank #4)

- `start.start` / `stop.stop` are 0-based char offsets into the exact parsed
  string; `stop.stop` is **inclusive** (consumers slice with `stop.stop + 1`).
- `line` 1-based, `column` 0-based (column of the token's *first* char;
  `CodeRange.from` derives end column as `stop.column + stop.text.length`).
- Offsets are the cross-layer currency: statement keys
  (`${start.start}-${stop.stop}`, parsed back via `split("-")` in
  `Block.tsx:101-103`), message selection (`selectedMessageAtom`), inline
  editing (`code.slice(0, start) + text + code.slice(end + 1)`), and every
  DSL transform. One off-by-one breaks editing everywhere.
- Langium mapping (for the implementer): `start.start = $cstNode.offset`,
  `stop.stop = $cstNode.end - 1`, `line = range.start.line + 1`,
  `column = range.start.character`.

### 3.2 Identity (07 §R8)

Same child accessor on the same node returns the **same object** (`===`) every
call. Arrays may be fresh per call but elements are identical objects.
Consumers that break otherwise: `VerticalCoordinates.ts:16` +
`StatementVM.ts:70-71` (`block === this.runtime.rootBlock`),
`StatementVM.isFirstStatement` (`statements[0] === statCtx`), BlockVM reorder
keys, React hook deps (`useFragmentData.ts:79-81`, `Occurrence.tsx:71-73`,
`FragmentAlt.tsx:27-35`). Implementation rule: one per-parse `WeakMap` from
AST node (plus `(astNode, wrapperKind)` for synthesized wrappers) to facade
instance. Fresh-wrapper-per-call is forbidden.

Conversely, identity changes **across** parses — `rootContextAtom` recomputes
per code change and components rely on the new identity for `useEffect` resets.

### 3.3 Null vs absent (07 §R7) and method placement (03 §8.2)

Two orthogonal rules that must not be conflated:

- **Absent child** → the accessor exists and returns `null` (never
  `undefined`): `utils/Context.ts:16` discriminates with strict `!== null`.
- **Absent capability** → the method itself does not exist on that kind.
  The renderer uses *method presence* as a type discriminator:
  `typeof ctx.messageBody === "function"` (ReturnStatementVM.ts:51),
  `typeof ctx.Assignment !== "function"` (Occurrence.tsx:78),
  `typeof ctx.alt !== "function"` (StatementVM.ts:81),
  `typeof titleContext.content !== "function"` (Store.ts:56),
  `!context?.getComment` (StatementVM.ts:17).
  A facade that hoists `messageBody`/`Assignment`/`alt`/`content` onto a
  common base silently breaks dispatch. The per-kind interface layout in
  `contract.ts` **is** the contract.
- Exception encoded in the types: `EndpointContext.name?()` and
  `EmojiContext.name?()` are optional methods (grammar-alternative dependent);
  the renderer probes them with `?.()`.

Dual arity: repeated-rule accessors (`stat`, `signature`, `elseIfBlock`,
`catchBlock`, `participant`, `parameter`, `name` on ref) return the array with
no argument and a single child (or `null`) with an index. Everything else
returns a single node or `null`.

Bracket access: `stats[0]["ret"]()` (Occurrence.tsx:60) — discriminator
methods must be reachable by string key (normal class methods are; exotic
proxies must take care).

### 3.4 Comment semantics — the exact `getComment()` algorithm

Reference implementation: `src/parser/index.js:51-66`. The facade must
reproduce it byte-for-byte; comments carry rendering directives
(`// [bold,#red] text` → `messageStyle`/`messageClassNames`) and add vertical
layout height, so wrong attachment visibly breaks diagrams (07 §G4, risk R5).

Algorithm, normatively:

1. Anchor token = the node's **first** token. **Special case:** for
   `BraceBlockContext` the anchor is the node's **last** token (the comment
   sits before the closing `}` — "comment before end of block").
2. Collect the contiguous run of hidden-channel comment tokens
   (`COMMENT_CHANNEL`, i.e. `//…`-to-end-of-line tokens) immediately to the
   **left** of the anchor token. If there are none, return `null`
   (ANTLR's `getHiddenTokensToLeft` returns `null`, and the method returns it
   through the `&&`).
3. For each comment token, strip **exactly the two leading characters** `//`
   (`t.text.substring(2)`). **Leading spaces after `//` are preserved** —
   they carry indentation/marker semantics; do not trim.
4. Join the stripped lines with `"\n"` (multi-line comment blocks stay
   multi-line). Per-token text otherwise untouched.

Defined on **every** node (base interface): `StatementVM.ts:17` duck-checks
`!context?.getComment` and treats a missing method as comment height 0 — the
facade must define it everywhere so that path never silently activates.

Implementation notes for Langium (not contract, but binding guidance from
07 §G4): hidden terminals are spliced into the CST; collect contiguous
`SL_COMMENT` leaves via a previous-node scan. Do **not** use Langium's default
`CommentProvider` (single-comment, `multilineCommentRules`-driven). The
internal ANTLR `constructor.name === "BraceBlockContext"` string check is a
do-not-port (minification-fragile); use an explicit kind flag.

### 3.5 Text reconstruction (07 §R6)

Two distinct reconstructions, both contract:

- `getText()` — token concatenation **without** hidden content (no whitespace
  between tokens): `hasmoreitems`, `user.role=="admin"`. Quoted names keep
  their quotes here.
- `getFormattedText()` — raw source slice `[start.start, stop.stop + 1)`
  **with** original spacing, passed through `formatText`
  (`src/utils/StringUtil.ts`, shared and unmodified): newlines → space,
  whitespace collapsed, spaces stripped around `,;.()`, trailing whitespace
  stripped, one pair of surrounding double quotes stripped. The
  quote-stripping makes `"Order Service"` and `Order Service` the same
  participant — load-bearing.
- `ParametersContext` **overrides** `getFormattedText()` with parameter-aware
  formatting (named parameter → `id=expr`, declaration → `type id`, joined
  `","`). Per-kind override of a base method is itself part of the contract.

### 3.6 Tree shape and upward walks (07 §G8)

`parentCtx` walks traverse the exact ANTLR wrapper chain
(stat → block → braceBlock → message/creation). `getAncestors()` returns
exactly 7 nodes for the `AncestorPath.spec.ts` pinned input — this freezes the
wrapper-chain depth. The facade synthesizes wrapper levels (`stat`, `fromTo`,
`dividerNote`, …) regardless of how idiomatic the `.langium` grammar is;
grammar design is thereby decoupled from renderer compatibility.

### 3.7 Errors and partial trees (07 §R12/G5/P13)

`RootContext(code)` effectively always returns a (partial) tree for non-empty
input; error recovery must keep half-typed DSL renderable. `Errors` /
`ErrorDetails` are **live module-level arrays** (`{line, column, msg}` for
details) that accumulate across parses and are cleared by `core.tsx` via
`.length = 0` — the live-reference import shape is contract until Stage 6.

## 4. Per-kind method placement table

Kind-specific members only; every kind also carries the base surface
(`start`, `stop`, `parentCtx`, `children`, `getText`, `getFormattedText`,
`getComment`, `getAncestors`, `ClosestAncestorStat`). Consumers abbreviated —
full file:line lists are in the contract JSDoc and 03 §10.

| Kind | Members | Primary consumers |
|---|---|---|
| `ProgContext` | `title()`, `head()`, `block()`, `Starter()`, `Origin()` | Store.ts, SeqDiagram.tsx, DiagramFrame.tsx, VerticalCoordinates.ts, participantInsertTransform.ts |
| `TitleContext` | `content()` | Store.ts (titleAtom), DiagramTitle |
| `HeadContext` | `participant()` (dual), `starterExp()`, raw `children` (Group/Participant source-order interleave) | LifeLineLayer.tsx, participantStyleTransform.ts, ParticipantStylePanel.tsx, participantInsertTransform.ts |
| `StarterExpContext` | `starter()` | participantInsertTransform.ts |
| `StarterContext` | (base only) | offsets + formatted text |
| `ParticipantContext` | `name()`, `participantType()`, `COLOR()`, `label()`, `stereotype()`, `emoji()` | participantStyleTransform.ts, ParticipantStylePanel.tsx; `instanceof` in LifeLineLayer.tsx |
| `GroupContext` | `name()` | LifeLineGroup.tsx; `instanceof` in LifeLineLayer.tsx |
| `LabelContext` / `StereotypeContext` | `name()` | participantStyleTransform.ts |
| `EmojiContext` | `name?()` (optional method) | participantStyleTransform.ts |
| `ParticipantTypeContext` / `NameContext` | (base only) | formatted text + offsets |
| `BlockContext` | `stat()` (dual) | Block.tsx, BlockVM, StatementVM, Numbering.ts, insert*InDsl.ts, Occurrence.tsx |
| `BraceBlockContext` | `block()`; `getComment()` anchors on the **closing** token | Occurrence.tsx, StatementVM, Fragment bodies, insertMessageInDsl.ts |
| `StatContext` | 13 discriminators (`loop/alt/par/opt/section/critical/tcf/ref/creation/message/asyncMessage/divider/ret`), `Origin()`, `children[0]` = concrete statement | Statement.tsx, Context.ts, createStatementVM.ts, Occurrence.tsx (bracket access), LocalParticipants.ts; `instanceof` in useArrow.ts |
| `MessageContext` | `messageBody()` (kind test), `braceBlock()`, `Owner()`, `From()`, `ProvidedFrom()`, `To()`, `SignatureText()`, `Assignment()` (kind test), `Statements()`, `isCurrent()`, `Body()` | Interaction.tsx, SelfInvocation.tsx, useArrow/useFragmentData, Occurrence.tsx, StylePanel.tsx, SyncMessageStatementVM; `instanceof` in 2 files |
| `MessageBodyContext` | `func()` | Interaction.tsx, SelfInvocation.tsx, StylePanel.tsx |
| `FuncContext` | `signature()` (dual) | Interaction.tsx, SelfInvocation.tsx |
| `SignatureContext` | (base only) | selection ranges + label text |
| `AsyncMessageContext` | `content()`, `to()`, `from()`, `Owner()`, `From()`, `ProvidedFrom()`, `To()`, `SignatureText()` | Interaction-async.tsx, SelfInvocationAsync.tsx, AsyncMessageStatementVM, StylePanel.tsx |
| `ReturnAsyncMessageContext` | same surface as AsyncMessageContext | Return.tsx, ReturnStatementVM, MessageCollector |
| `EndpointContext` | `name?()` (optional method) | Interaction-async.tsx, AsyncMessageStatementVM |
| `ContentContext` | (base only); exported class for `instanceof` | Return.tsx |
| `CreationContext` | `creationBody()` (kind test), `braceBlock()`, `Owner()`, `From()`, `SignatureText()`, `ParametersText()`, `Assignment()` (kind test), `Statements()`, `isCurrent()`, `Body()`, `To()`, `Assignee()`, `AssigneePosition()`, `Constructor()` | Creation.tsx, useArrow/useFragmentData, CreationStatementVM, StylePanel.tsx; `instanceof` in 2 files |
| `CreationBodyContext` | `parameters()` | Creation.tsx, StylePanel.tsx |
| `RetContext` | `asyncMessage()`, `returnAsyncMessage()`, `expr()`, `Signature()`, `SignatureText()`, `ReturnTo()`, `From()`, `To()`, `Owner()` | Return.tsx, ReturnStatementVM, MessageCollector |
| `ExprContext` | (base only) | Return.tsx |
| `AtomExprContext` | `atom()`; exported class for `instanceof` | Return.tsx |
| `AtomContext` | (base only) | FragmentSection.tsx, Return.tsx |
| `AltContext` | `ifBlock()`, `elseIfBlock()` (dual), `elseBlock()` | FragmentAlt.tsx, FragmentAltVM, StatementVM |
| `IfBlockContext` | `parExpr()`, `braceBlock()`, `Statements()` | FragmentAlt.tsx, FragmentAltVM |
| `ElseIfBlockContext` | `parExpr()`, `braceBlock()` | FragmentAlt.tsx, FragmentAltVM |
| `ElseBlockContext` | `braceBlock()` | FragmentAlt.tsx, FragmentAltVM |
| `OptContext` / `ParContext` / `CriticalContext` | `parExpr()`, `braceBlock()` | FragmentOpt/Par/Critical.tsx, FragmentSingleBlockVM |
| `LoopContext` | `parExpr()`, `braceBlock()`, `Statements()` | FragmentLoop.tsx, FragmentSingleBlockVM |
| `SectionContext` | `atom()`, `braceBlock()` | FragmentSection.tsx |
| `TcfContext` | `tryBlock()`, `catchBlock()` (dual), `finallyBlock()` | FragmentTryCatchFinally.tsx, FragmentTryCatchVM |
| `TryBlockContext` / `FinallyBlockContext` | `braceBlock()` | FragmentTryCatchFinally.tsx |
| `CatchBlockContext` | `invocation()`, `braceBlock()` | FragmentTryCatchFinally.tsx, FragmentTryCatchVM |
| `InvocationContext` | `parameters()` | FragmentTryCatchFinally.tsx |
| `ParametersContext` | `parameter()` (dual), `getFormattedText()` **override** | FragmentTryCatchFinally.tsx, Creation.tsx |
| `ParameterContext` | (base only) | via ParametersText/override |
| `ParExprContext` | `condition()` | all conditional fragments |
| `ConditionContext` | (base only) | ConditionLabel.tsx (label + edit offsets) |
| `RefContext` | `name()` (dual), `Content()`, `Participants()` | FragmentRef.tsx, ToCollector |
| `DividerContext` | `Note()` (**throws** on non-`==` text — kept for parity, see `@v2`) | Divider.tsx |

Entry points: `ParserModule` (`RootContext`, `Errors`, `ErrorDetails`,
`Participants`, `Depth`, class exports `ProgContext`/`GroupContext`/
`ParticipantContext`), `GeneratedParserShim` (`MessageContext`,
`CreationContext`, `StatContext`, `AtomExprContext`, `ContentContext` for the
3 renderer files importing `@/generated-parser`), `ContextsFixtureModule`
(8 sub-rule fixtures: Prog, Title, Stat, AsyncMessage, SyncMessage, Divider,
Creation, Ret).

## 5. Semantic method semantics (normative cross-references)

The walk semantics behind `Owner`/`From`/`ProvidedFrom`/`Origin`/`Starter`/
`ReturnTo`/`SignatureText`/`ParametersText`/`Assignment`/`Statements`/
`isCurrent`/`Note`/`Content` are specified in 04 §3 (per module) and pinned by
the parser spec suite. Contract-level highlights:

- `Origin()` exists **only** on `StatContext` and `ProgContext`. The generic
  `ParserRuleContext.Origin` is a latent infinite loop and is not contract
  (do-not-port).
- Creation `Owner()` composes `"assignee:Type"` — that composite string IS the
  participant name for created instances; `"Missing Constructor"` is the
  fallback.
- Pinned quirks that must survive (07 latent-behavior list): async
  `SignatureText()` keeps the leading space (`" message"`); creation
  `«create»`/`«params»` guillemets; quote-stripping in `getFormattedText`;
  `Signature()` returns `undefined` when empty while `SignatureText()` returns
  `""`.
- `Divider.Note()` throws on notes not starting with `==` and `Divider.tsx`
  does not catch — kept through the migration for parity, softened post-cutover
  (`@v2`).

## 6. v2 evolution path

The `@v2` JSDoc tags in `contract.ts` are the complete map of ANTLR-inherited
awkwardness. They are **not** deprecations today — v1 facade classes implement
them fully. Post-cutover (Stage 6+), call sites migrate **file-by-file,
test-gated**, each PR shrinking the v1 surface:

| v1 member (`@v2`-tagged) | v2 replacement | Migration shape |
|---|---|---|
| `stat()` / `stat(i)` dual arity (also `signature`, `elseIfBlock`, `catchBlock`, `participant`, `parameter`, `name`) | `statements: readonly StatContext[]` etc. (plain readonly array properties) | Mechanical per call site; the indexed form is `array[i]` |
| Inclusive `stop.stop` + `TokenView` pair | Exclusive `{ offset, end }` range on the node | One conversion point per file; kills the `+ 1` ritual at ~18 sites |
| `getFormattedText()` naming + embedded quote-stripping | `formattedText` property; explicit `displayName()` for the quote-stripped participant-name concern | Rename + audit of which sites actually want quote-stripping |
| Raw `children` reads | `HeadContext.members: readonly (Group\|Participant)[]`; `StatContext.statement` | Only 2 renderer sites (LifeLineLayer, useArrow) |
| 13 nullable discriminators + `typeof` probes + bracket access | Discriminated union with a `kind` tag; `getContextType` becomes `statement.kind` | Rewrite `Statement.tsx` dispatch, `Context.ts`, `createStatementVM.ts`, the five `typeof` probes |
| `Body()` aliases | Call `messageBody()`/`creationBody()` directly | Trivial |
| `isCurrent(cursor)` | Renderer-side pure range check over node offsets | Move into the two callers |
| `Signature()` vs `SignatureText()` empty-value split | Single member, single convention | Return.tsx + MessageCollector |
| `Divider.Note()` throw | Safe value for malformed-but-parsed notes | One component |
| Live `Errors`/`ErrorDetails` arrays | Per-parse `{ root, errors }` result | `core.tsx` refactor (already flagged in 03 §1) |
| `Depth` public export | Drop with CHANGELOG note | No renderer consumers found |
| `TitleContext.content()` method | `title: string` property | Store.ts duck-check + DiagramTitle |
| `RefContext.name()[0]`-is-label positional encoding | `label` + `participants` members | FragmentRef.tsx |

Sequencing rule: a `@v2` member may be removed only when grep proves zero
call sites remain and `bun run test` + the Playwright suite are green. The
facade shrinks until deletable; the `.langium`-generated `ast.ts` types then
become the only tree API.

## 7. NON-goals

1. **The IR does not abstract over tree shape.** It deliberately exposes
   `parentCtx`, wrapper nodes, raw `children`, and char offsets, because the
   positioning engine *is* a lazy tree walker: `FrameBuilder` re-walks
   subtrees per fragment, `getLocalParticipantNames` calls
   `ctx.Origin() + Participants(ctx)` per node, VMs walk `parentCtx` chains,
   and `getAncestors()` length is pinned at 7. A flattened/projected IR
   (e.g. a render-command list) would require rewriting the positioning
   layer — exactly the coupled big-bang the facade strategy exists to avoid
   (07 §3.2: the dominant risk is the ~30 renderer files calling tree methods
   directly, and the test suite only proves parity through that shape).
2. **The IR is not a stable public API for embedders.** `onMessageClick`
   leaks a context object today (03 §6); that remains an internal type. No
   semver promise attaches to `contract.ts` members beyond the migration.
3. **The IR does not normalize errors.** The live-array error shape is kept
   verbatim (07 §G5); per-parse diagnostics are a v2 concern.
4. **The IR does not fix latent bugs behind the boundary** (singleton
   collector state, the generic-`Origin` loop) — those are implementation
   do-not-ports (07 Part 2), invisible at this boundary.
5. **No new capabilities.** Nothing is added that today's renderer does not
   already call; excluded dead members are listed in §2.

## 8. Verification

- `src/parser/ir/contract.ts` is interfaces/types only — no runtime code, no
  imports; it cannot change any build output.
- Type-checked standalone (`tsc --strict --noUnusedLocals`) and as part of
  `tsconfig.app.json` (no new diagnostics over the pre-existing baseline).
- Coverage cross-check against 03 §10: every row of the call-site index maps
  to a contract member (see the row-by-row checklist in the PR/working notes
  for this change).
- Gate alignment: Stage-3 facade classes must `implements` these interfaces;
  Gate 3 (legacy parser specs unchanged) and Gate 4 (full unit suite) remain
  the behavioral proof — the contract is the *typed* half of that gate.
