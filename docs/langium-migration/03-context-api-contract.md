# 03 — Context API Contract (ANTLR → Langium migration)

This document maps the **complete external API** that non-parser code (`src/components`, `src/store`, `src/positioning`, `src/utils`) calls on parse-tree context objects. It is the source of truth for the Langium AST facade design: every method/property listed here must either be reproduced on the new AST nodes, or every call site listed here must be rewritten.

All paths are rooted at `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration`.

Evidence basis: full reads of `src/parser/index.js`, `src/store/Store.ts`, all prototype-augmentation modules imported by `src/parser/index.js`, the three components importing `@/generated-parser` (`useFragmentData.ts`, `Return.tsx`, `useArrow.ts`), plus exhaustive greps of the four renderer directories for context-shaped calls (`.X()`, `.start`, `.stop`, `.parentCtx`, `.children`, `.getText()`, `getFormattedText`, `getComment`, `Owner`, `Origin`, etc.).

---

## 1. Entry points and module exports (`src/parser/index.js`)

| Export | Kind | Semantics | Consumers outside parser |
|---|---|---|---|
| `RootContext(code)` (also default `.RootContext`) | function | Lexes + parses `code`, returns `parser.prog()` (a `ProgContext`) or `null` if `parser._syntaxErrors`. Attaches a `SeqErrorListener` that pushes into module-level arrays. | `src/store/Store.ts:48-52` (`rootContextAtom`) — the only renderer-side parse trigger. |
| `Errors` / `ErrorDetails` | **module-level mutable arrays** (singletons) | Accumulate `{line, column, msg}` for every syntax error across *all* parses; never auto-cleared. | `src/core.tsx:245-250` clears with `.length = 0`, copies, reports. **Reimplementation note:** replace with per-parse diagnostics returned alongside the AST (Langium gives `parseResult.parserErrors` / `lexerErrors` per document — adapt to `{line, column, msg}` shape). The singleton is a latent re-entrancy bug; do not replicate. |
| `ProgContext`, `GroupContext`, `ParticipantContext` | class references | Exposed for `instanceof` checks. | `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/LifeLineLayer.tsx:14,44-51` (`GroupContext`, `ParticipantContext`). |
| `Participants(ctx)` | function | `ToCollector.getParticipants(ctx)` — walks subtree, returns a `Participants` collection object (see §7). Accepts `null` (returns empty collection). | `Store.ts:62-66` (`participantsAtom`), `src/positioning/LocalParticipants.ts:15`, `LifeLineLayer.tsx` (`Participants(child).First()`). |
| `Depth(ctx)` | function | Counts max nesting depth of fragments inside `ctx` via `ChildFragmentDetector` (listener counting enter/exit of tcf/opt/par/alt/loop/section/critical). | Not called from the four renderer dirs (parser-internal + tests only). Keep available on the facade for API parity, low priority. |

Three renderer files import the **generated parser class directly** for `instanceof`:
- `src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/useArrow.ts` — `MessageContext`, `CreationContext`, `StatContext`
- `src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Fragment/useFragmentData.ts` — `MessageContext`, `CreationContext`
- `src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Return/Return.tsx` — `AtomExprContext`, `ContentContext`

---

## 2. ANTLR built-ins relied upon (must be reproduced on the Langium facade)

| Property / method | ANTLR semantics | Called from (representative; non-exhaustive only where marked "everywhere") | Notes for reimplementation |
|---|---|---|---|
| `ctx.start` | First `Token` of the rule. Fields used: `.start` (0-based char offset of first char), `.line` (1-based), `.column` (0-based), `.tokenIndex`, `.text`. | Everywhere. Notably: `Message.tsx:43`, `Return.tsx:38-40`, `Interaction.tsx:31`, `Interaction-async.tsx:104,117`, `Creation.tsx:36`, `SelfInvocation.tsx:24`, `SelfInvocationAsync.tsx:18`, `ConditionLabel.tsx:26`, `FragmentRef.tsx:21`, `DiagramTitle/index.tsx:24`, `StylePanel.tsx:210,256-266`, `positioning/vertical/StatementIdentifier.ts:2-5`, `utils/participantStyleTransform.ts:60`, `utils/participantInsertTransform.ts:102-115`, `utils/insertMessageInDsl.ts:42`, `utils/insertDividerInDsl.ts:42`, `parser/CodeRange.ts` | Langium nodes carry `$cstNode` with `offset`/`end`/`range`. Facade must expose `start.start` = `$cstNode.offset`, `start.line` = `range.start.line + 1`, `start.column` = `range.start.character`. **`tokenIndex` has no Langium equivalent** — only needed by `getComment()` (§3); reimplement comments differently. |
| `ctx.stop` | Last `Token`. Fields used: `.stop` (0-based char offset of the **last char, inclusive**), `.line`, `.column`, `.text`, `.tokenIndex`. | Same set as above; every label-edit/DSL-transform site does `stop.stop + 1` to get an exclusive slice end (`DiagramTitle/index.tsx:25-27`, `ConditionLabel.tsx` `code.slice(end + 1)`, `participantStyleTransform.ts:61`, `participantInsertTransform.ts:103,117`, `Interaction-async.tsx:117`, `IsCurrent.js`). `CodeRange.from` uses `stop.column + stop.text.length`. | Inclusive-end convention is load-bearing. Map `stop.stop` = `$cstNode.end - 1`. `stop.text` only used in `CodeRange.from`; can compute end column from `range.end` instead. |
| `ctx.parentCtx` | Parent rule context (`undefined`/`null` at root). | `positioning/vertical/vm/ReturnStatementVM.ts:42-54`, `StatementVM.ts:70-76`, plus parser-side augmentations (`Owner.js`, `Origin.js`, `RetContext.js`, `From.ts`, `ClosestAncestor.ts`, `AncestorPath.ts`) that the renderer invokes indirectly. | Langium: `$container`. Note the renderer walks **through intermediate wrapper rules** (stat → block → braceBlock → message). If the Langium grammar flattens any wrapper, every upward walk changes. |
| `ctx.children` | Raw ordered child array (rule contexts + terminal nodes interleaved). | `LifeLineLayer.tsx:43-51` (filters `head()` children by `instanceof GroupContext/ParticipantContext` **preserving source order across the two types**); `parser/TitleContext.js` (`children[1].getText()`); `useArrow.ts:38` (`context?.children?.[0]` — first child of a `StatContext`, i.e. the concrete statement context). | Langium AST has no unified ordered `children` array mixing types. For `LifeLineLayer` provide an ordered head-members list; for `useArrow` provide "the single concrete statement under a stat node". |
| `ctx.getText()` | Concatenated source text of the node, **without** hidden-channel content (no whitespace between tokens). | Renderer-side: `utils/participantStyleTransform.ts:43` (`ctx.COLOR?.()?.getText()` on a terminal). Parser-side (invoked by renderer flows): `TitleContext.js`, `SignatureText.ts` (`ID().getText()`, `type().getText()`). (`SelfInvocation.tsx:20` `Assignment()?.getText()` is the custom `Assignment` class method, not ANTLR.) | For terminals, equals the token image. Langium: cross-reference/property values or `$cstNode.text` (beware: `$cstNode.text` *includes* interior hidden text; ANTLR `getText()` does not — only matters for multi-token nodes). |
| `ctx.getSourceInterval()` + `this.parser.getTokenStream().getText(interval)` | Source text spanning the rule **including hidden-channel tokens between first and last token** (original spacing). | Only inside `getFormattedText` (`parser/index.js:44-48`); renderer calls `getFormattedText` pervasively (§3). | Equivalent: raw document text slice `[offset, end)` of the node's CST range. |
| Token stream `getHiddenTokensToLeft(tokenIndex, channel)` | Comment lookup on hidden channel `COMMENT_CHANNEL`. | Only inside `getComment` (`parser/index.js:52-67`); renderer calls `getComment` (§3). | Langium: hidden terminals appear as CST nodes; reimplement as "collect contiguous `//`-comment CST tokens immediately preceding the statement's first token". |
| Rule accessor returning `null` for absent child | e.g. `stat.loop()` → `null` when not a loop. | `Statement.tsx:38-62` dispatch (`Boolean(props.context.loop())` …), `utils/Context.ts:16` (`context[x]() !== null`), `Occurrence.tsx:60` (`stats[0]["ret"]() == null`), `createStatementVM.ts` (optional-call style). | Facade accessors must return `null`/`undefined` (both pass the `Boolean()` and `!= null` checks used; but `Context.ts` uses strict `!== null` — return `null`, not `undefined`, or change that line). |
| Repeated-rule accessor returning an **array** when called without index | `block.stat()`, `func.signature()`, `ref.name()`, `alt.elseIfBlock()`, `tcf.catchBlock()`, `parameters.parameter()`, `head.participant()` | `Block.tsx:32`, `Interaction.tsx:30`, `FragmentAlt.tsx`, `FragmentTryCatchFinally.tsx`, `StylePanel.tsx:241`, `participantStyleTransform.ts:26`, `RefContext.ts` | Langium gives arrays natively for `+=` assignments. |
| Stable child identity across calls | `getTypedRuleContext` returns the same child object every call; arrays are fresh but elements identical. | `VerticalCoordinates.ts:16` + `StatementVM.ts:70-71` (`block === this.runtime.rootBlock`), `StatementVM.isFirstStatement` (`statements[0] === statCtx`), `BlockVM` reorder keys, React `useEffect`/`useMemo` deps on contexts (`useFragmentData.ts:79-81`, `Occurrence.tsx:71-73`, `FragmentAlt.tsx:27-35`). | Langium AST nodes are naturally stable objects. **Facade must not synthesize fresh wrapper objects per accessor call** — memoize wrappers per AST node or the rootBlock identity check and React deps break. |
| `instanceof` on context classes | Class identity discriminates node kinds. | `useArrow.ts:11,20-21,34`, `useFragmentData.ts:20-21`, `Return.tsx:36,39`, `LifeLineLayer.tsx:44-51`, plus parser internals (`Owner.js`, `Origin.js`, `RetContext.js`, `ClosestAncestor.ts`). | Langium: `$type` string + generated `isX()` guards. Either keep facade classes so `instanceof` works, or rewrite the 4 renderer files (they are few — rewriting is cheaper than faking classes, but parser-layer reimplementation also needs kind checks). |
| `this.constructor.name === "BraceBlockContext"` | String class-name check inside `getComment`. | `parser/index.js:55`. | **Fragile under minification** in the current code (library builds keep class names today). Replace with an explicit kind check in the new implementation. |

---

## 3. Universal prototype augmentations (defined on `antlr4.ParserRuleContext.prototype` — i.e. available on *every* context)

| Method | Defined where | Called from (renderer dirs) | Semantics | Reimplementation notes |
|---|---|---|---|---|
| `getFormattedText()` | `src/parser/index.js:44-48` | `Interaction-async.tsx:96,100`, `SelfInvocationAsync.tsx:53`, `FragmentSection.tsx:30`, `FragmentRef.tsx:19`, `ConditionLabel.tsx:23`, `FragmentTryCatchFinally.tsx:31`, `LifeLineGroup.tsx:137`, `ParticipantStylePanel.tsx:137`, `utils/participantStyleTransform.ts:28,42,44-46,52`, `positioning/vertical/vm/AsyncMessageStatementVM.ts:28`, `ReturnStatementVM.ts:24`; plus pervasively inside parser augmentations the renderer triggers (`Owner`, `From`, `SignatureText`, `Signature`, `Starter`, `Note`, …). | Token-stream text over the rule's source interval, then `formatText` (`src/utils/StringUtil.ts:1-8`): newlines→space, collapse whitespace, strip spaces around `,;.` and `()`, strip trailing whitespace, strip one pair of surrounding double quotes. | The single most-used method. Implement once on the facade base: take raw doc text `[offset, end)`, apply identical `formatText`. Keep `formatText` shared. Note quote-stripping (`"foo bar"` → `foo bar`) is relied on for participant names and conditions. |
| `getComment()` | `src/parser/index.js:52-67` | `Statement.tsx:23` (every rendered statement → `Comment` object: styling brackets `// [bold,red] text` drive `messageStyle`/`messageClassNames` consumed by all statement components), `positioning/vertical/vm/StatementVM.ts:17-18` (comment height). | Joins text of hidden-channel `COMMENT_CHANNEL` tokens immediately left of `this.start.tokenIndex` (for `BraceBlockContext`: left of `stop.tokenIndex` — comment before the closing `}`), each stripped of leading `//`, joined with `\n`. Returns `null`-ish when none. Multi-line comments and indentation are preserved per token text. | Needs a comment-attachment pass over the Langium CST: comments preceding a statement attach to it. The `BraceBlockContext` special case (`returnedValue` flow, currently unused by renderer) can be dropped if `returnedValue` is dropped. Note `StatementVM.ts:17` duck-checks `context?.getComment` existence — facade must define it on all nodes (or the VM treats it as height 0). |
| `getAncestors(predicate)` | `src/parser/AncestorPath.ts` | `useArrow.ts:18-31` (`depthOnParticipant` — occurrence-bar layer counting), `useFragmentData.ts:18-29` (same, local copy). | Returns `[self, ...ancestors]` filtered by predicate — **includes the receiver itself**, walks `parentCtx` to root. | Trivial over `$container`. Self-inclusion is load-bearing for layer counts. |
| `ClosestAncestorStat()` | `src/parser/utils/cloest-ancestor/ClosestAncestor.ts` | Not called directly from renderer dirs, but invoked by `From()`/`ReturnTo()`/`Origin()` chains the renderer uses on every message. | Returns `this` if it *is* a `StatContext`, else nearest `StatContext` ancestor, else `undefined`. | Keep on facade (or inline into From/Origin reimplementation). |
| `ClosestAncestorBlock()` | same file | No renderer callers found (parser/tests only). | Parent block of closest stat. | Optional. |
| `Origin()` (generic) | `src/parser/Origin.js:9-15` (on `ParserRuleContext.prototype`) | `positioning/LocalParticipants.ts:15` calls `ctx.Origin()` where `ctx` is normally a `StatContext` (statement contexts from `Block.tsx`) — resolves to the `StatContext` override (§5). | **Latent bug**: the generic version loops `ctx = this.parentCtx` (never advances) — infinite loop if first parent is not Stat/Prog. In practice only Stat/Prog overrides run. | Do **not** replicate. Implement `Origin()` only for statement-level nodes + Prog; see §5. |
| `Key()` | `src/parser/key/Key.ts` | No callers in the four renderer dirs (renderer builds its own key via `createStatementKey`, same format). | `` `${start.start}:${stop.stop}` ``. | Optional; keep for parser-side compat. |
| `returnedValue()` | `src/parser/index.js:69-71` | No renderer callers found. | `braceBlock().block().ret().value()`. | Candidate for deletion. |

---

## 4. Per-context custom augmentations (domain methods the renderer calls)

| Method | Receiver context(s) | Defined where | Called from (renderer) | Semantics | Reimplementation notes |
|---|---|---|---|---|---|
| `Owner()` | `MessageContext`, `CreationContext`, `AsyncMessageContext`, `ReturnAsyncMessageContext`, `RetContext` | `src/parser/Owner.js` | `useArrow.ts:12,26`, `useFragmentData.ts:25`, `Interaction.tsx:28`, `Creation.tsx:33,43,87(SignatureText)`, `vm/SyncMessageStatementVM.ts:22`, `vm/AsyncMessageStatementVM.ts:27`, `vm/CreationStatementVM.ts:20`; also by `MessageCollector`. | The message **receiver**. Message: `To()` (explicit `fromTo().to()` name) else nearest ancestor Message/Creation's `Owner()` (walks `parentCtx`). Creation: `assignee:Type` or `Type`, `"Missing Constructor"` fallback. Async/ReturnAsync: explicit `to()` else ancestor owner. Ret: `ReturnTo()` else ancestor owner. | Core layout semantic. Names come through `getFormattedText()` (quote stripping!). The upward walk must skip wrapper nodes identically. |
| `From()` | `MessageContext`, `AsyncMessageContext`, `ReturnAsyncMessageContext`, `RetContext`, `CreationContext` | `src/parser/From.ts` | `useArrow.ts:13` (`ctx.From?.()`), `Interaction.tsx:27`, `Return.tsx:30`, `vm/SyncMessageStatementVM.ts:21`, `vm/AsyncMessageStatementVM.ts:22`, `vm/ReturnStatementVM.ts:22`; `MessageCollector`. | Sender. Message/Async/ReturnAsync: `ProvidedFrom()` (explicit `from`) else `ClosestAncestorStat().Origin()`. Ret: inner asyncMessage `From()` else origin. Creation: origin if parent is a stat, else `undefined`. | |
| `ProvidedFrom()` | `MessageContext`, `AsyncMessageContext`, `ReturnAsyncMessageContext` | `src/parser/From.ts` | `Interaction-async.tsx:97`, `vm/AsyncMessageStatementVM.ts:23`. | Only the *explicitly written* source (`A->B`), `undefined` otherwise. Distinguishes "out-of-band" messages (see doc comment in `Interaction-async.tsx:5-70`). | |
| `Origin()` | `StatContext`, `ProgContext` | `src/parser/Origin.js` | `positioning/LocalParticipants.ts:15` (→ `useFragmentData`, `FrameBuilder`, `TotalWidth`, `StatementVM.findLeftParticipant`, fragment left-edge resolution). | Stat: walk ancestors; first Message/Creation ancestor's `Owner()`; if reach Prog → `Starter()`. Prog: `Starter()`. | The "current lifeline" of a statement. |
| `Starter()` | `ProgContext` | `src/parser/ProgContext.js` | Indirect via `Origin()`/`ReturnTo()`. | `head().starterExp().starter()` formatted text — the `@Starter(X)` participant, else `undefined`. See the long design comment in `ProgContext.js` (default `_STARTER_` is a renderer concern, not parser). | |
| `SignatureText()` | `MessageContext`, `AsyncMessageContext`, `CreationContext`, `RetContext`, `ReturnAsyncMessageContext` | `src/parser/SignatureText.ts` | `Interaction.tsx:25`, `SelfInvocation.tsx:59`, `Creation.tsx:87`; `MessageCollector` (drives `Coordinates` message widths). | Message: `messageBody().func().signature().map(getFormattedText).join(".")` (method-chain text). Async/ReturnAsync: `content()` text. Creation: `«params»` or `«create»`. Ret: content/expr text. | Width calculations depend on exact string equality between collector output and component labels. |
| `ParametersText()` | `CreationContext` | `SignatureText.ts` | `Creation.tsx:124`. | Formatted parameter list; named params as `name=value`, declarations as `Type id`. | |
| `isParamValid()` | `CreationContext` | `SignatureText.ts` | No renderer callers found. | `parameters().parameter().length > 0`. | Optional. |
| `getFormattedText()` **override** | `ParametersContext` | `SignatureText.ts` (bottom) | Indirect: `FragmentTryCatchFinally.tsx:31` (`invocation().parameters().getFormattedText()`), `Creation.tsx` via params. | Overrides the base method to use named-parameter formatting. | Subclass override must survive the migration (facade-level polymorphism). |
| `Signature()` | `RetContext` | `src/parser/RetContext.js` | `Return.tsx:29`. | content of asyncMessage/returnAsyncMessage else `expr()` text. | Near-duplicate of `RetContext.SignatureText()`. |
| `ReturnTo()` | `RetContext` | `Return.tsx:32`, `vm/ReturnStatementVM.ts:25`. | `src/parser/RetContext.js` | Explicit async `to`, else walks `parentCtx` (stat→block→blockParent): Prog → `Starter()`; ancestor Message → its `from` name else stat origin. | One of the hairiest upward walks; port with tests (`RetContext` specs exist). |
| `Assignment()` | `MessageContext`, `CreationContext` | `src/parser/Messages/Assignment.ts` | `SelfInvocation.tsx:20` (`.getText()`), `Occurrence.tsx:81-92` (assignee/type/positions → editable return label), `vm/SyncMessageStatementVM.ts:25`, `vm/CreationStatementVM.ts:43`; `MessageCollector`. | Returns an `Assignment` **plain class** `{assignee, type, labelPosition, assigneePosition, typePosition, getText()}` built from `assignee()`/`type()` sub-contexts with `[start.start, stop.stop]` positions, or `undefined` if no assignee. | Pure data object — keep the class as-is; only its construction reads contexts. Note `Occurrence.tsx:78` duck-checks `typeof props.context?.Assignment === "function"` to distinguish message/creation contexts from others. |
| `Statements()` | `MessageContext`, `CreationContext`, `IfBlockContext`, `LoopContext` | `src/parser/Messages/MessageContext.ts` | `Occurrence.tsx:94,99` (numbering + insert index). | `braceBlock()?.block()?.stat() || []`. | |
| `isCurrent(cursor)` | `MessageContext`, `CreationContext` | `src/parser/IsCurrent.js` | `Interaction.tsx:26`, `Creation.tsx:34`. | `start.start <= cursor <= Body().stop.stop + 1` (Body = messageBody/creationBody alias), try/catch → false. | Cursor comes from `cursorAtom` (char offset into the code string). |
| `Body()` | `MessageContext` (`= messageBody`), `CreationContext` (`= creationBody`) | `IsCurrent.js` | Indirect only. | Alias. | |
| `To()` | Message/Creation/Async/ReturnAsync/Ret | `Owner.js` | Indirect (`Owner` uses it). | Explicit receiver name (formatted) or `undefined`. | |
| `Assignee()` / `AssigneePosition()` / `Constructor()` | `CreationContext` | `Owner.js` | Indirect via `Owner()` and `Participants` collection. | Formatted assignee text; `[start, stop+1]`; constructor name. | |
| `Note()` | `DividerContext` | `src/parser/Divider/DividerContext.ts` | `Divider.tsx:22`. | `dividerNote()` formatted text; **throws** if it doesn't start with `==`; strips leading/trailing `=`. | Keep the throw? `Divider.tsx` doesn't catch — a malformed divider that parses but fails the check would crash the component. Recommend returning a safe value instead. |
| `Content()` / `Participants()` | `RefContext` | `src/parser/RefContext.ts` | `FragmentRef.tsx:18` (`Content()` → first `name()` child). | `name()[0]` and `name().slice(1)`. | |
| `content()` | `TitleContext` | `src/parser/TitleContext.js` | `Store.ts:54-60` (`titleAtom`), `DiagramTitle/index.tsx:13`. | `children[1].getText().trim()` — text after the `title` keyword, empty string if fewer than 2 children. Note `titleAtom` defensively checks `typeof titleContext.content === "function"`. | In Langium this becomes a plain string property on the title node; facade should expose `content()`. |

---

## 5. Generated rule accessors used by non-parser code (grammar shape contract)

Direct call sites in the four renderer dirs. The Langium grammar/AST must preserve this navigational shape (or the facade must emulate it).

### ProgContext (root, from `rootContextAtom`)
| Accessor | Called from | Notes |
|---|---|---|
| `title()` | `Store.ts:55`, `DiagramFrame.tsx:57`, `utils/participantInsertTransform.ts:99` | Returns `TitleContext` or null. `participantInsertTransform` also reads `title.stop.stop`. |
| `head()` | `SeqDiagram.tsx:107,116,140` (passed to `LifeLineLayer`), `utils/participantStyleTransform.ts:26`, `utils/participantInsertTransform.ts:97`, `ParticipantStylePanel.tsx:136` | Head = declarations section. `head.participant()` → array; `head.starterExp?.()`; `head.start.start`/`head.stop.stop`; raw `head.children` (LifeLineLayer §2). |
| `block()` | `SeqDiagram.tsx:111,145` (root `Block`), `VerticalCoordinates.ts:16`, `utils/participantInsertTransform.ts:98` | Root statement block. `VerticalCoordinates` falls back to `rootContext` itself if `block` is absent and later compares identity (`StatementVM.isRootLevelStatement`). |

### StatContext (elements of `block.stat()`)
| Accessor | Called from | Notes |
|---|---|---|
| `stat()` (on BlockContext) | `Block.tsx:32`, `vm/BlockVM.ts:11`, `vm/StatementVM.ts:76`, `vm/ReturnStatementVM.ts:43`, `utils/Numbering.ts:4-6`, `utils/insertDividerInDsl.ts:21`, `utils/insertMessageInDsl.ts:39`, `Occurrence.tsx:58` | Array of statements. |
| `loop()/alt()/par()/opt()/section()/critical()/tcf()/ref()/creation()/message()/asyncMessage()/divider()/ret()` | `Statement.tsx:38-62` (dispatch), `utils/Context.ts` (`getContextType`, strict `!== null`), `vm/createStatementVM.ts:22-80`, `Occurrence.tsx:60` (`stats[0]["ret"]()` — **bracket access**), `Statement.tsx:28` (`!props.context.ret()`), `vm/StatementVM.ts:81-89`, `vm/ReturnStatementVM.ts:12`, `vm/FragmentRefVM.ts:8` | One non-null per stat. This is the **statement discriminator API**. |

### MessageContext
| Accessor | Called from | Notes |
|---|---|---|
| `messageBody()` | `Interaction.tsx:30`, `SelfInvocation.tsx:22`, `StylePanel.tsx:241` (duck-typed `messageBody?.()`), `vm/ReturnStatementVM.ts:51` (duck-typed `typeof ctx.messageBody === "function"` as a *kind test*) | `messageBody().func()`, `.assignment()`, `.fromTo().from()/.to()` (parser side). |
| `braceBlock()` | `Occurrence.tsx:55,183,186`, `vm/StatementVM.ts:54`, `vm/SyncMessageStatementVM.ts:23`, `utils/insertMessageInDsl.ts:38` | `braceBlock().block()` → nested `BlockContext`. |
| `func().signature()` | `Interaction.tsx:30` (`signature()[0]` start/stop for selection range), `SelfInvocation.tsx:22-24` (func start/stop), `StylePanel.tsx:241` | `signature()` is an array (method chain `a.b()`). |

### CreationContext
| Accessor | Called from | Notes |
|---|---|---|
| `creationBody()` | `Creation.tsx:35` (`creationBody()?.parameters()` start/stop), `StylePanel.tsx:243` (duck-typed), `vm/ReturnStatementVM.ts:51` (`typeof ctx.creationBody === "function"` kind test) | |
| `braceBlock()` | `vm/CreationStatementVM.ts:32`, `Occurrence.tsx` (same component as messages) | |

### AsyncMessageContext / ReturnAsyncMessageContext
| Accessor | Called from | Notes |
|---|---|---|
| `content()` | `Interaction-async.tsx:96,103`, `SelfInvocationAsync.tsx:15`, `Return.tsx:34`, `StylePanel.tsx:242` (duck-typed) | Label text + `[start.start, stop.stop]` selection range. |
| `to()` / `from()` | `Interaction-async.tsx:99-100`, `vm/AsyncMessageStatementVM.ts:28`, `vm/ReturnStatementVM.ts:24` | `toCtx?.name?.()?.getFormattedText() \|\| toCtx?.getFormattedText()` — the `name?.()` optional-call pattern means `to()` may or may not have a `name()` accessor depending on grammar alternative. |
| `start/stop` | `Interaction-async.tsx:116-117` (isCurrent highlight) | |

### RetContext
| Accessor | Called from | Notes |
|---|---|---|
| `asyncMessage()` / `returnAsyncMessage()` | `Return.tsx:27`, `vm/ReturnStatementVM.ts:21`; `MessageCollector.enterRet` | Ret can wrap an async message (`return X: msg` forms). |
| `expr()` | `Return.tsx:34` | `expr` may be `AtomExprContext` (then `.atom()` start/stop used) or other expr kinds; `ContentContext` checked via `instanceof` (`Return.tsx:36-41`). |

### Fragment contexts
| Accessor | Called from | Notes |
|---|---|---|
| `alt().ifBlock()` / `.elseIfBlock()` (array) / `.elseBlock()` | `FragmentAlt.tsx:22-43`, `vm/FragmentAltVM.ts:25-55`, `vm/StatementVM.ts:84-88` | Each branch: `.parExpr()?.condition()` (label) and `.braceBlock()?.block()`. |
| `loop().parExpr()?.condition()` / `.braceBlock()` | `FragmentLoop.tsx:30-32` | |
| `opt().parExpr()?.condition()` / `.braceBlock()` | `FragmentOpt.tsx:19-20,70` | |
| `par().parExpr()?.condition()` / `.braceBlock()` | `FragmentPar.tsx:30-31,73-77` | |
| `critical().parExpr()?.condition()` / `.braceBlock()` | `FragmentCritical.tsx:29-32` | |
| `section().atom()` / `.braceBlock()` | `FragmentSection.tsx:28-31` | `atom()?.getFormattedText()` is the section label. |
| `tcf().tryBlock()` / `.catchBlock()` (array) / `.finallyBlock()` | `FragmentTryCatchFinally.tsx:37-39,46-49`, `vm/FragmentTryCatchVM.ts:23-41` | catchBlock: `.invocation()?.parameters()?.getFormattedText()` (exception label) + `.braceBlock()?.block()`. |
| `ref().name()` (array) | via `RefContext.Content()` — `FragmentRef.tsx:18` | |
| generic single-block fragments | `vm/FragmentSingleBlockVM.ts:23-28`: `fragment?.parExpr?.()?.condition?.()`, `fragment?.braceBlock?.()?.block?.()` | Used for loop/opt/par/section/critical VMs. |
| `condition` context | `ConditionLabel.tsx:23-27`: `getFormattedText()`, `start.start`, `stop.stop` (inline editing: `code.slice(0,start)+text+code.slice(end+1)`) | |

### ParticipantContext (under `head()`)
| Accessor | Called from | Notes |
|---|---|---|
| `name()` | `ParticipantStylePanel.tsx:137`, `utils/participantStyleTransform.ts:28,52` | `name()?.getFormattedText()` — quote-stripped name. |
| `participantType()` | `participantStyleTransform.ts:42` | `@Actor` etc.; `.replace("@","")`. |
| `COLOR()` | `participantStyleTransform.ts:43` | Terminal: `COLOR?.()?.getText()` (`#ff0000`). |
| `label()` / `stereotype()` / `emoji()` | `participantStyleTransform.ts:44-46` | each `?.name()?.getFormattedText()` (emoji via `name?.()`). |
| `start/stop` | `participantStyleTransform.ts:60-61` (rewrite declaration range) | |

### GroupContext
| Accessor | Called from | Notes |
|---|---|---|
| `name()` | `LifeLineGroup.tsx:137` | Group label; `getFormattedText()`. |

### HeadContext
| Accessor | Called from | Notes |
|---|---|---|
| `participant()` (array) | `participantStyleTransform.ts:26`, `ParticipantStylePanel.tsx:136` | Explicit declarations. |
| `starterExp()` | `participantInsertTransform.ts:104` (+ `ProgContext.Starter()`) | `starter.start.start`/`stop.stop` used for insert offsets. |
| raw `.children` | `LifeLineLayer.tsx:43` | Ordered Group/Participant interleaving. |

---

## 6. Store contract (`src/store/Store.ts` — read fully)

| Atom | Context dependency | Notes |
|---|---|---|
| `rootContextAtom` (l.48) | `RootContext(code)`; `null` for blank code. | Recomputed per code change → **all downstream context references change identity per parse**. Components rely on this for `useEffect` reset (e.g. collapse state). |
| `titleAtom` (l.54) | `rootContext?.title()` + duck-check `typeof content === "function"` + `content()`. | |
| `participantsAtom` (l.62) | `Participants(rootContext)`, tolerates `null`. | |
| `coordinatesAtom` (l.68) | `new Coordinates(rootContext, widthProvider)` — internally `OrderedParticipants(ctx)` + `AllMessages(ctx)` (listener walks). | |
| `verticalCoordinatesAtom` (l.74) | `new VerticalCoordinates(rootContext)` — `rootContext?.block?.()`, `OrderedParticipants`, `AllMessages`, then the VM tree (§5 accessors + `parentCtx` + identity checks). | |
| `selectedMessageAtom` / `pendingEditableRangeAtom` (l.144,154) | `{start, end, token}` — **char offsets that must equal context `start.start`/`stop.stop`** (set from contexts in `Message.tsx`, `SelfInvocation*.tsx`, `StylePanel.tsx`; consumed by `EditableLabelField`/`GapHandleZone`). | Offsets are the cross-layer currency; any off-by-one in the facade breaks selection + inline editing. |
| `createMessageDragAtom` (l.168) | carries `blockContext` / `hostContext` raw contexts from `Occurrence.tsx` → `MessageCreateControls` → `utils/insertMessageInDsl.ts` (`hostContext.start.start`, `hostContext.stop.stop`, `blockContext.stat()`). | Raw contexts cross the store as `any`. |
| `onMessageClickAtom` (l.140) | callback receives `(context, element)` — `StylePanel.tsx:206-275` duck-types it (`messageBody?.()`, `content?.()`, `creationBody?.()`, `start.start`, `stop.stop`). | Public embedder-facing callback also receives the context (API surface!). |
| `onElementClickAtom` (l.134) | receives `CodeRange.from(context)` (`start.line/column`, `stop.line/column + stop.text.length`) — `Return.tsx:52`, `Interaction-async.tsx`, `Creation.tsx`. | Line/column are 1-based line, 0-based column (ANTLR convention). |

---

## 7. Boundary functions that *take* a context (tree-walking services)

These are parser-layer modules, but they define the renderer-visible contract for whole-tree derived data. All use `antlr4.tree.ParseTreeWalker` + generated `sequenceParserListener` — Langium needs an equivalent visitor (e.g. `AstUtils.streamAllContents`).

| Function | File | Renderer call sites | Output contract |
|---|---|---|---|
| `Participants(ctx)` → collection | `src/parser/ToCollector.js` + `src/parser/Participants.ts` | `Store.ts`, `LocalParticipants.ts`, `LifeLineLayer.tsx` | Collection API used by renderer: `Names()`, `ImplicitArray()`, `First()`, `Get(name)`, `GetPositions(name)`, `GetAssigneePositions(name)` (`Participant.tsx:45-48`), participant fields `{name,label,type,stereotype,color,emoji,explicit,isStarter,groupId,positions,assigneePositions}` (+ `blankParticipant` template). Positions are `[start, stop+1]` tuples. |
| `OrderedParticipants(ctx)` / `_STARTER_` | `src/parser/OrderedParticipants.ts` | `Coordinates.ts`, `VerticalCoordinates.ts`, `GapHandleZone.tsx:75`, `MessageCreateControls.tsx:37`, `ParticipantInsertControls.tsx:85`, `ParticipantStylePanel.tsx:133` | `IParticipantModel[]` in render order, `_STARTER_` sentinel injected when needed. |
| `AllMessages(ctx)` | `src/parser/MessageCollector.ts` | `MessageLayer.tsx:23`, `WidthOfContext.ts` (`TotalWidth`), `Coordinates.ts`, `VerticalCoordinates.ts` | `OwnableMessage[] {from: ctx.From(), to: ctx.Owner(), signature: ctx.SignatureText() (assignment-prefixed for self), type}` — note it calls the §4 methods on every message context. |
| `FrameBuilder(participants).getFrame(ctx)` | `src/parser/FrameBuilder.ts` | `useFragmentData.ts:39-41,90`, `WidthOfContext.ts`, `SeqDiagram.tsx:59` | Nested `Frame {type,left,right,children}` for fragment border math (`FrameBorder`). Uses `getLocalParticipantNames` (→ `Origin()` + `Participants()`) per fragment. |
| `getLocalParticipantNames(ctx)` | `src/positioning/LocalParticipants.ts` | `useFragmentData.ts`, `WidthOfContext.ts`, `vm/StatementVM.ts` | `[ctx.Origin() \|\| _STARTER_, ...Participants(ctx).Names()]`. |
| `CodeRange.from(ctx)` | `src/parser/CodeRange.ts` | `Return.tsx`, `Creation.tsx`, `Interaction-async.tsx` (→ `onElementClick`) | `{start:{line,col}, stop:{line,col}}` with `stop.col = stop.column + stop.text.length`. |
| `createStatementKey(stat)` | `src/positioning/vertical/StatementIdentifier.ts` | `Block.tsx:144` (DOM `data-statement-key`, drag-reorder), `VerticalCoordinates.recordCoordinate` | `` `${start.start}-${stop.stop}` ``; `Block.tsx:101-103` **parses it back** with `split("-").map(Number)` and feeds `reorderMessageInDsl` char ranges. |
| `blockLength(block)` / `getContextType(stat)` | `src/utils/Numbering.ts`, `src/utils/Context.ts` | `FragmentAlt.tsx`, `FragmentTryCatchFinally.tsx` | Counts non-divider statements; `getContextType` probes all 13 statement accessors with strict `!== null`. |

---

## 8. Duck-typing patterns the facade must satisfy

The renderer never imports context *types* (everything is `any`); instead it probes capabilities:

1. **Optional-call probes**: `ctx.Owner?.()`, `ctx.From?.()`, `statement.loop?.()`, `context?.braceBlock?.()?.block?.()`, `toCtx?.name?.()`, `head.starterExp?.()`, `rootContext?.head?.()?.participant?.()`, `ctx.label?.()`, `ctx.emoji?.()?.name?.()`. → Methods may be absent on some node kinds; absent must mean `undefined` property, not a throwing method.
2. **`typeof` kind tests**: `typeof ctx.messageBody === "function"` / `typeof ctx.creationBody === "function"` (`vm/ReturnStatementVM.ts:51` — "is inside an occurrence"), `typeof props.context?.Assignment !== "function"` (`Occurrence.tsx:78`), `typeof ctx?.alt !== "function"` (`vm/StatementVM.ts:81`), `typeof titleContext.content !== "function"` (`Store.ts:56`), `!context?.getComment` (`vm/StatementVM.ts:17`). → **The mere presence of a method is used as a type discriminator.** A facade exposing all methods on a common base would silently break these; method placement per node kind is part of the contract.
3. **Bracket access**: `stats[0]["ret"]()` (`Occurrence.tsx:60`).
4. **`instanceof`** (§2 last row) and **`constructor.name`** (`parser/index.js:55`).

---

## 9. Invariants (cross-cutting)

1. **Char offsets are the universal currency.** `start.start` / `stop.stop` (inclusive) must index into the exact `codeAtom` string. Consumers: statement keys, drag-reorder ranges, message selection, inline label/condition/title editing (`code.slice(0, start) + text + code.slice(end + 1)`), DSL transforms (insert participant/message/divider, style rewrite). One off-by-one breaks editing everywhere.
2. **Node identity is stable within one parse.** Same accessor → same object (`block() === block()`); statements compared with `===`; contexts used as React hook deps. Fresh-wrapper-per-call facades are forbidden unless memoized per underlying AST node.
3. **Formatted text is normalized identically everywhere** (`formatText`), including the quote-stripping that makes `"Order Service"` and `Order Service` the same participant.
4. **Accessors return `null` for absent alternatives** (strict `!== null` in `utils/Context.ts:16`).
5. **Comments ride a hidden channel** and attach to the *following* statement; comment text drives both styling (`// [bold,#red] note`) and vertical layout height.
6. **The upward walk shape (stat → block → braceBlock → message/creation)** is baked into `ReturnTo`, `Origin`, `Owner` fallback, `ReturnStatementVM`, `StatementVM.isRootLevelStatement/isFirstStatement`. Grammar flattening changes all of them.
7. **Lists**: `stat()`, `signature()`, `elseIfBlock()`, `catchBlock()`, `participant()`, `parameter()`, `name()` (ref) return arrays; everything else returns a single context or null.

---

## 10. Full call-site index (method → renderer files)

| Method/property | Renderer call sites (file:line) |
|---|---|
| `getFormattedText()` | Interaction-async.tsx:96,100; SelfInvocationAsync.tsx:53; FragmentSection.tsx:30; FragmentRef.tsx:19; ConditionLabel.tsx:23; FragmentTryCatchFinally.tsx:31; LifeLineGroup.tsx:137; ParticipantStylePanel.tsx:137; participantStyleTransform.ts:28,42,44,45,46,52; AsyncMessageStatementVM.ts:28; ReturnStatementVM.ts:24 |
| `getComment()` | Statement.tsx:23; StatementVM.ts:17,18 |
| `getAncestors(pred)` | useArrow.ts:18; useFragmentData.ts:18 |
| `Owner()` | useArrow.ts:12,26; useFragmentData.ts:25; Interaction.tsx:28; Creation.tsx:33,43; SyncMessageStatementVM.ts:22; AsyncMessageStatementVM.ts:27; CreationStatementVM.ts:20 |
| `From()` / `ProvidedFrom()` | useArrow.ts:13; Interaction.tsx:27; Interaction-async.tsx:97; Return.tsx:30; SyncMessageStatementVM.ts:21; AsyncMessageStatementVM.ts:22,23; ReturnStatementVM.ts:22 |
| `Origin()` | LocalParticipants.ts:15; AsyncMessageStatementVM.ts:24 (defensive) |
| `SignatureText()` | Interaction.tsx:25; SelfInvocation.tsx:59; Creation.tsx:87 |
| `Signature()` / `ReturnTo()` | Return.tsx:29,32; ReturnStatementVM.ts:25 |
| `isCurrent(cursor)` | Interaction.tsx:26; Creation.tsx:34 |
| `Assignment()` | SelfInvocation.tsx:20; Occurrence.tsx:81; SyncMessageStatementVM.ts:25; CreationStatementVM.ts:43 |
| `Statements()` | Occurrence.tsx:94,99 |
| `ParametersText()` | Creation.tsx:124 |
| `Note()` | Divider.tsx:22 |
| `Content()` | FragmentRef.tsx:18 |
| `content()` (title) | Store.ts:59; DiagramTitle/index.tsx:13 |
| `content()` (async) | Interaction-async.tsx:96,103; SelfInvocationAsync.tsx:15; Return.tsx:34; StylePanel.tsx:242 |
| statement discriminators `loop/alt/par/opt/section/critical/tcf/ref/creation/message/asyncMessage/divider/ret` | Statement.tsx:28,38-62; Context.ts:16; createStatementVM.ts:22-80; Occurrence.tsx:60; StatementVM.ts:84; ReturnStatementVM.ts:12; FragmentRefVM.ts:8; Numbering.ts:4 |
| `stat()` | Block.tsx:32; BlockVM.ts:11; StatementVM.ts:76; ReturnStatementVM.ts:43; Occurrence.tsx:58; Numbering.ts:4; insertDividerInDsl.ts:21; insertMessageInDsl.ts:39 |
| `braceBlock()` / `block()` | Occurrence.tsx:55,183,186; FragmentAlt.tsx:25,26,42; FragmentLoop.tsx:31; FragmentOpt.tsx:70; FragmentPar.tsx:73,77; FragmentCritical.tsx:32; FragmentSection.tsx:29,31; FragmentTryCatchFinally.tsx:34,37,38; StatementVM.ts:54; SyncMessageStatementVM.ts:23; CreationStatementVM.ts:32; FragmentAltVM.ts:29,41,48; FragmentTryCatchVM.ts:23,34,38; FragmentSingleBlockVM.ts:26; insertMessageInDsl.ts:38 |
| `messageBody()` / `func()` / `signature()` | Interaction.tsx:30; SelfInvocation.tsx:22; StylePanel.tsx:241 |
| `creationBody()` / `parameters()` | Creation.tsx:35; StylePanel.tsx:243 |
| `asyncMessage()` / `returnAsyncMessage()` / `expr()` / `atom()` | Return.tsx:25,27,34,37; Interaction-async.tsx:95; ReturnStatementVM.ts:21 |
| `to()` / `from()` | Interaction-async.tsx:99; AsyncMessageStatementVM.ts:28; ReturnStatementVM.ts:24 |
| fragment branch accessors (`ifBlock/elseIfBlock/elseBlock/tryBlock/catchBlock/finallyBlock/parExpr/condition/atom/invocation`) | FragmentAlt.tsx:23-43; FragmentLoop.tsx:30-32; FragmentOpt.tsx:19-20; FragmentPar.tsx:30-31; FragmentCritical.tsx:29-32; FragmentSection.tsx:28-31; FragmentTryCatchFinally.tsx:31-49; FragmentAltVM.ts:25-48; FragmentTryCatchVM.ts:23-38; FragmentSingleBlockVM.ts:23; StatementVM.ts:84-88 |
| `head()` / `title()` / `participant()` / `starterExp()` | SeqDiagram.tsx:107,116,140; DiagramFrame.tsx:57; Store.ts:55; participantStyleTransform.ts:26; participantInsertTransform.ts:97-104; ParticipantStylePanel.tsx:136 |
| `name()` / `participantType()` / `COLOR()` / `label()` / `stereotype()` / `emoji()` | LifeLineGroup.tsx:137; ParticipantStylePanel.tsx:137; participantStyleTransform.ts:28,42-46,52; Interaction-async.tsx:100 |
| `.start.start` / `.stop.stop` | Message.tsx:43-44; Return.tsx:38-40; Interaction.tsx:31; Interaction-async.tsx:104,116-117; Creation.tsx:36; SelfInvocation.tsx:24; SelfInvocationAsync.tsx:18; ConditionLabel.tsx:26-27; FragmentRef.tsx:21-22; DiagramTitle/index.tsx:24-25; StylePanel.tsx:210,256-266,271; StatementIdentifier.ts:2-5; participantStyleTransform.ts:60-61; participantInsertTransform.ts:102-117; insertMessageInDsl.ts:42-43,78-81; insertDividerInDsl.ts:39-42 |
| `.parentCtx` | ReturnStatementVM.ts:42,49,54; StatementVM.ts:70,75 |
| `.children` | LifeLineLayer.tsx:43; useArrow.ts:38 |
| `.getText()` | participantStyleTransform.ts:43 (terminal); SelfInvocation.tsx:20 (Assignment class, not ANTLR) |
| `instanceof` parser classes | useArrow.ts:11,20-21,34; useFragmentData.ts:20-21; Return.tsx:36,39; LifeLineLayer.tsx:44-51 |

---

## 11. Reimplementation checklist / risks

1. **Offsets**: implement `start.start`/`stop.stop` (inclusive) from CST ranges and verify with the editing round-trip tests (`messageWrapTransform.spec.ts`, `insertMessageInDsl.spec.ts`, `participantStyleTransform.spec.ts` already exercise offsets).
2. **Comments**: hidden-channel lookup has no direct Langium analog; build a comment-attachment pass and keep the styling-bracket pipeline (`Comment` class) untouched.
3. **Method presence as type test** (§8.2): place facade methods per node kind exactly as today, or rewrite the five `typeof` probes.
4. **`null` vs `undefined`** for absent children: `utils/Context.ts` uses `!== null`.
5. **Stable wrapper identity** (§9.2): memoize facade nodes.
6. **Module-level `Errors`/`ErrorDetails`**: convert to per-parse results; update `core.tsx`.
7. **`Divider.Note()` throws** on non-`==` text — decide to keep or soften.
8. **Generic `ParserRuleContext.Origin` infinite-loop bug** — do not port; implement Origin on stat/prog only.
9. **`ParametersContext.getFormattedText` override** — facade must support per-kind overrides of base methods.
10. **Error recovery difference**: `RootContext` returns a *partial* tree with error listeners collecting diagnostics; renderer renders best-effort. Langium's error recovery differs — the facade must still produce a renderable partial AST for invalid input or mermaid integration UX regresses.
