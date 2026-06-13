# 10 — ANTLR Context → Langium AST Mapping (Stage-2 Gate Artifact)

> Maps **every ANTLR context kind appearing in the committed tree goldens**
> (`test/unit/parity/__golden__/tree/*.json`, 67 kinds) — plus the full labeled
> `expr`/`atom` alternative sets — to its raw Langium representation
> (`src/parser-langium/zenuml.langium`, generated types in
> `src/parser-langium/generated/ast.ts`) and the planned Stage-3 facade wrapper
> (gap G8 in `07-risk-map.md`: the facade, not the grammar, owns the ANTLR
> tree shape).
>
> Conventions in the tables:
> - **Langium `$type` / value** — what the raw parser produces. "—" means no
>   node exists; the column then names the property that carries the content.
> - **Property path** — where the content sits relative to the parent Langium
>   node (offsets via `$cstNode` or `GrammarUtils.findNodeForProperty`).
> - **Facade plan** — `direct` (wrap the Langium node 1:1), `synthesized`
>   (wrapper level recreated by the facade with no backing node), or
>   `property` (ANTLR child node reconstructed from a string/terminal
>   property and its CST segment).

## 1. Structure rules

| ANTLR context (golden kind) | Langium `$type` / value | Property path | Facade plan |
|---|---|---|---|
| `ProgContext` | `Prog` | parse result `value` | direct |
| `TitleContext` | `Title` | `Prog.title` | direct; `content` string carries the payload (`TITLE_END` dropped — newline hidden) |
| `HeadContext` | — (flattened, see §5.1) | `Prog.headElements[]` + `Prog.starterExp` | **synthesized** from `headElements`/`starterExp`; span = first→last element CST |
| `GroupContext` | `Group` | `Prog.headElements[i]` / `Group.participants[i]` | direct |
| `ParticipantContext` | `Participant` | `Prog.headElements[i]`, `Group.participants[i]` | direct |
| `ParticipantTypeContext` | — | `Participant.participantType` (raw `@…` string) | property (CST segment via `findNodeForProperty`) |
| `StereotypeContext` | `Stereotype` | `Participant.stereotype` | direct |
| `LabelContext` | `Label` | `Participant.label` | direct |
| `EmojiContext` | `Emoji` | `Participant.emoji`, `From/To.emoji`, `MethodName.emoji` | direct. ANTLR's `EMOJI_SHORTCODE` alternative is dropped: the token is referenced by `sequenceParser.g4` but **never defined in the lexer** — it can never match |
| `NameContext` | — (datatype rule `Name returns string`) | `.name` on Participant/Group/Stereotype/Label/Emoji/From/To/MethodName; `Ref.names[]`; `CreationBody.construct`; `Assignment.type`; `Declaration.type` | property |
| `WidthContext` *(not in goldens)* | — | `Participant.width` (raw INT string) | property |
| `StarterExpContext` | `StarterExp` | `Prog.starterExp` | direct |
| `StarterContext` | — | `StarterExp.starter` (string) | property |
| `BlockContext` | `Block` | `Prog.block`, `BraceBlock.block` | direct |
| `StatContext` | — (union rule `Stat` flattens) | `Block.stats[i]` is the concrete node (`Alt`/`Message`/…) | **synthesized** wrapper per stat (G8/P9); span = child span (ANTLR's trailing `EVENT_END` newline is dropped — see §5.2) |
| `BraceBlockContext` | `BraceBlock` | `.braceBlock` on Message/Creation/fragments; `TryBlock/CatchBlock/FinallyBlock.braceBlock`; `Section.braceBlock` | direct |

## 2. Statement rules

| ANTLR context | Langium `$type` / value | Property path | Facade plan |
|---|---|---|---|
| `AltContext` | `Alt` | `Block.stats[i]` | direct |
| `IfBlockContext` | `IfBlock` | `Alt.ifBlock` | direct |
| `ElseIfBlockContext` | `ElseIfBlock` | `Alt.elseIfBlocks[i]` | direct |
| `ElseBlockContext` | `ElseBlock` | `Alt.elseBlock` | direct |
| `ParContext` | `Par` | `Block.stats[i]` | direct |
| `OptContext` | `Opt` | `Block.stats[i]` | direct |
| `CriticalContext` | `Critical` | `Block.stats[i]` | direct |
| `SectionContext` | `Section` | `Block.stats[i]` | direct (covers named, anonymous-brace, and bare-keyword alternatives) |
| `RefContext` | `Ref` | `Block.stats[i]`; names in `Ref.names[]` | direct |
| `LoopContext` | `Loop` | `Block.stats[i]` | direct |
| `TcfContext` | `Tcf` | `Block.stats[i]` | direct |
| `TryBlockContext` | `TryBlock` | `Tcf.tryBlock` | direct |
| `CatchBlockContext` | `CatchBlock` | `Tcf.catchBlocks[i]` | direct |
| `FinallyBlockContext` | `FinallyBlock` | `Tcf.finallyBlock` | direct |
| `CreationContext` | `Creation` | `Block.stats[i]`; also `CreationExpr.creation` | direct |
| `CreationBodyContext` | `CreationBody` | `Creation.body` | direct; `construct` is a string property; the `(OPAR parameters? CPAR)` group is inline like ANTLR |
| `ConstructContext` | — | `CreationBody.construct` (string) | property |
| `MessageContext` | `Message` | `Block.stats[i]` | direct |
| `MessageBodyContext` | `MessageBody` | `Message.body` | direct (`assignment`/`fromTo`/`func` properties mirror the ANTLR accessors) |
| `FromToContext` | `FromTo` | `MessageBody.fromTo` | direct |
| `FromContext` | `From` | `FromTo.from`, `AsyncMessage.from`, `ReturnAsyncMessage.from` | direct |
| `ToContext` | `To` | `FromTo.to`, `AsyncMessage.to`, `ReturnAsyncMessage.to`, `FuncExpr.to` | direct |
| `FuncContext` | `Func` | `MessageBody.func`, `FuncExpr.func` | direct (see §5.3 left-factoring — `$type` is always `Func`) |
| `SignatureContext` | `Signature` | `Func.signatures[i]` | direct |
| `MethodNameContext` | `MethodName` | `Signature.methodName` | direct |
| `InvocationContext` | `Invocation` | `Signature.invocation`, `CatchBlock.invocation` | direct |
| `AssignmentContext` | `Assignment` | `MessageBody.assignment`, `CreationBody.assignment`, `AssignmentExpr.assignment` | direct |
| `TypeContext` | — | `Assignment.type` / `Declaration.type` (string) | property |
| `AssigneeContext` | `Assignee` | `Assignment.assignee` (`atom` \| `ids[]` \| bare-`NEW` node) | direct. Dropped vs ANTLR: the shadowed `CSTRING`/`USTRING` alts (atom's stringAtom always won) and single-ID comma lists (a lone ID is always the atom alt) — output identical |
| `AsyncMessageContext` | `AsyncMessage` | `Block.stats[i]`, `Ret.asyncMessage` | direct (`content` string property; `EVENT_END` dropped) |
| `ContentContext` | — | `AsyncMessage.content` / `ReturnAsyncMessage.content` (raw payload string incl. leading space) | property |
| `RetContext` | `Ret` | `Block.stats[i]` | direct (three alternatives keep `expr`/`asyncMessage`/`returnAsyncMessage` properties) |
| `ReturnAsyncMessageContext` | `ReturnAsyncMessage` | `Ret.returnAsyncMessage` | direct |
| `DividerContext` | `Divider` | `Block.stats[i]` | direct |
| `DividerNoteContext` | — | `Divider.note` (raw DIVIDER token text) | **synthesized** (two-level ANTLR wrapper rebuilt from the `note` property) |
| `ParametersContext` | `Parameters` | `Invocation.parameters`, `CreationBody.parameters` | direct |
| `ParameterContext` | — (union rule flattens) | `Parameters.parameters[i]` is `NamedParameter` \| `Declaration` \| an `Expr` subtype | **synthesized** wrapper (G8) |
| `NamedParameterContext` | `NamedParameter` | `Parameters.parameters[i]` | direct (`value` absent for the dangling `m(a=)` tolerance) |
| `DeclarationContext` *(not in goldens)* | `Declaration` | `Parameters.parameters[i]` | direct |

## 3. `expr` labeled alternatives (ANTLR §3.47 → layered precedence rules)

All binary alternatives are produced by left-associative tree-rewriting
actions; `op` carries the operator token text. `#plusExpr` is **dropped**
(dead — shadowed by `#additiveExpr`; 07 §2 do-not-port list).

| ANTLR label / context | Langium `$type` | Property path | Facade plan |
|---|---|---|---|
| `#atomExpr` / `AtomExprContext` | `AtomExpr` | `.atom` | direct |
| `#unaryMinusExpr` / `UnaryMinusExprContext` | `UnaryMinusExpr` | `.expr` | direct |
| `#notExpr` / `NotExprContext` | `NotExpr` | `.expr` | direct |
| `#multiplicationExpr` / `MultiplicationExprContext` | `MultiplicationExpr` | `.left`, `.op` (`*`/`/`/`%`), `.right` | direct |
| `#additiveExpr` / `AdditiveExprContext` | `AdditiveExpr` | `.left`, `.op` (`+`/`-`), `.right` | direct |
| `#relationalExpr` / `RelationalExprContext` | `RelationalExpr` | `.left`, `.op` (`<=`/`>=`/`<`/`>`), `.right` | direct |
| `#equalityExpr` / `EqualityExprContext` | `EqualityExpr` | `.left`, `.op` (`==`/`!=`), `.right` | direct |
| `#andExpr` / `AndExprContext` | `AndExpr` | `.left`, `.op` (`&&`), `.right` | direct |
| `#orExpr` / `OrExprContext` | `OrExpr` | `.left`, `.op` (`\|\|`), `.right` | direct |
| `#plusExpr` / `PlusExprContext` | **dropped** (unreachable in ANTLR) | — | none |
| `#funcExpr` / `FuncExprContext` | `FuncExpr` | `.to?`, `.func` | direct |
| `#creationExpr` / `CreationExprContext` | `CreationExpr` | `.creation` | direct |
| `#parenthesizedExpr` / `ParenthesizedExprContext` | `ParenthesizedExpr` | `.expr` | direct |
| `#assignmentExpr` / `AssignmentExprContext` | `AssignmentExpr` | `.assignment`, `.expr` | direct |

## 4. `atom`, `parExpr`, `condition`

| ANTLR label / context | Langium `$type` | Property path | Facade plan |
|---|---|---|---|
| `#numberAtom` / `NumberAtomContext` | `NumberAtom` | `.value` (INT/FLOAT raw text — identity ValueConverter, no number coercion) | direct |
| `#numberUnitAtom` / `NumberUnitAtomContext` | `NumberUnitAtom` | `.value` | direct |
| `#moneyAtom` / `MoneyAtomContext` | `MoneyAtom` | `.value` | direct |
| `#booleanAtom` / `BooleanAtomContext` | `BooleanAtom` | `.value` | direct |
| `#idAtom` / `IdAtomContext` | `IdAtom` | `.value` | direct |
| `#digitLeadingNameAtom` / `DigitLeadingNameAtomContext` | `DigitLeadingNameAtom` | `.value` | direct |
| `#stringAtom` / `StringAtomContext` | `StringAtom` | `.value` (quotes retained) | direct |
| `#nilAtom` / `NilAtomContext` | `NilAtom` | `.value` (`nil`/`null` raw) | direct |
| `ParExprContext` | `ParExpr` | `.condition?` (absent for `if()`), CPAR tolerated missing | direct |
| `ConditionContext` | — (union flattens; **`atom` alt folded into Expr**, see §5.4) | `ParExpr.condition` is an `Expr` subtype \| `InExpr` \| `TextExpr` | **synthesized** wrapper; `condition.atom()` unwraps `AtomExpr.atom` (the ANTLR direct-atom alternative is mechanically `AtomExpr` minus the wrapper) |
| `InExprContext` | `InExpr` | `.left`, `.right` (strings) | direct |
| `TextExprContext` | `TextExpr` | `.words[]` | direct (requires ≥2 words — a single word is always the atom/Expr alternative in ANTLR) |

## 5. Documented grammar-shape deviations (all output-equivalent unless noted)

### 5.1 `head` flattened into `Prog`
chevrotain-allstar is **SLL-only** (no ANTLR-style full-context LL fallback):
lookahead configs that pop out of the rule containing a decision become inert
"stop configs", so a `Head` rule could not see the block continuation and
`A\nA.m()` mis-parsed as two participants. Declarations, starter, and
`block=Block?` now live in one `Prog` rule; the boundary decision resolves
exactly like ANTLR (verified by the 198-case corpus). Facade synthesizes
`HeadContext`.

### 5.2 `EVENT_END`/`TITLE_END` dropped
The EVENT/TITLE mode-pop newlines are hidden terminals in the parser
vocabulary (TokenBuilder maps them to Chevrotain group `hidden`). ANTLR's
`stat: asyncMessage EVENT_END?` made the trailing newline part of the
statement span; the facade/offset consumers must use the statement node's CST
span (see `grammar-offsets.spec.ts` normalization). Cosmetic side effect: a
second consecutive newline after a payload lexes as `EVENT_END` instead of
`CR` in the parser vocabulary (both hidden; the Stage-1 stream is unaffected).

### 5.3 `messageBody`/`funcExpr` left-factored
A bare func in leading position cannot start with `methodName DOT` (those are
always `fromTo`/`to DOT`, which is exactly how ANTLR's alternative order
resolved it). In expression position the bare-name signature is additionally
folded into `atom` (ANTLR's atom alternative always won); the only bare
signatures kept there are invoked (`m(...)`) and emoji-prefixed (`[e]m`,
which atom cannot match). `$type` is always `Func`/`Signature`/`MethodName`.

### 5.4 `condition`'s leading `atom` alternative folded into `Expr`
`if(x)` produces `AtomExpr(IdAtom)` instead of ANTLR's direct
`ConditionContext > IdAtomContext`. Purely mechanical unwrap for the facade's
`.atom()` accessor. Also `textExpr` requires ≥2 words (single words are
atoms in ANTLR — unreachable as textExpr).

### 5.5 `stereotype` closer required in the name-bearing alternative
ANTLR's full-context prediction binds `<<name` (unclosed) as stereotype `<<`
plus PARTICIPANT name `name` (golden `tol-05c`); the grammar encodes this by
requiring `>>`/`>` after the stereotype name. Residual divergence: `<<a b`
(two words, never closed) binds `a` to the participant here while ANTLR would
swallow `a` into the stereotype — not corpus-reachable, live-typing edge only.

### 5.6 `participant` left-factored
Type-led / stereotype-led / name-led alternatives (token-deterministic, same
property set, same language including the bare-`@Actor` / bare-`<<x>>`
tolerances).

### 5.7 Dropped dead alternatives
`#plusExpr` (shadowed); `assignee: CSTRING|USTRING` (shadowed by atom);
`emoji: EMOJI_SHORTCODE` (token never defined by the lexer); single-ID
assignee comma-list (always the atom alternative). `starterExp: ANNOTATION`
is **kept** (ANTLR keeps it; head-position ambiguity resolves to participant
in both engines).

## 6. Resolved ambiguities (chevrotain-allstar inventory)

Dev-mode parse of the full 198-case corpus logs exactly **12** ambiguity
reports in **2** decision classes — both are ambiguities ANTLR itself has and
resolves by alternative order; chevrotain-allstar's min-alternative resolution
picks the identical parse (proven by the corpus/offsets specs):

| Decision | Count | Resolution (same as ANTLR) |
|---|---|---|
| `Prog` head loop (declaration vs first statement, e.g. bare `A` or `@Actor` at EOF) | 8 | loop-continue preferred → participant binds, matching `prog: head` order |
| `Parameter` (`a=1`: namedParameter vs expr→assignmentExpr) | 4 | first alternative `NamedParameter` wins, matching ANTLR's documented order |

Production mode (`langium-config.json "mode": "production"`, mermaid's
posture) silences the logs at runtime; the resolutions stay pinned by
`grammar-corpus.spec.ts` / `grammar-offsets.spec.ts` / `grammar-tolerance.spec.ts`.

## 7. Recovery-shape differences (gap G7, expected)

Grammar-strict inputs recover differently from ANTLR's `DefaultErrorStrategy`
— asserted as "statements outside the damage survive", never as tree
equality:

| Input | ANTLR golden | Langium/Chevrotain |
|---|---|---|
| `A.m {` | message + orphan anonymous section | single message with recovered braceBlock (CBRACE inserted) |
| `new A(` | creation + recovery artifact | single creation (CPAR inserted) |
| `try` | bare Tcf via recovery | Tcf with OBRACE/CBRACE insertion |
| `A ~>` | error nodes only (no head) | participant `A` + parser errors (`~` is OTHER in both) |
| `if(x) { if(y() {}}` | recovery tree (WidthOfContext pin) | parses with zero errors (`y()` funcExpr condition + braceBlock) — Stage-4 must re-check `WidthOfContext.spec.ts` against the facade |
