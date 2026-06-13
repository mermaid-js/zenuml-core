# 05 — The Executable Test Contract for the Langium Migration

This document inventories every unit/component spec that pins parser behavior, plus the E2E
setup, in the worktree rooted at
`/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration`.
It is the source of truth for designers/implementers of the ANTLR4 → Langium migration: the
behaviors below are what "done" means. Tests run via `bun run test` (which runs
`bun test src test/unit`); E2E via `bun pw` (Playwright, **not** part of `bun run test`).

A critical meta-observation up front: **the specs do not test an abstract AST — they test the
ANTLR parse-tree facade directly.** Call chains like
`root.block().stat(0).message().messageBody().func().signature()[0].methodName().getText()`
appear in dozens of tests, alongside prototype extensions (`Owner()`, `From()`, `Key()`,
`getComment()`, `getFormattedText()`, `Statements()`, `ClosestAncestorStat()`, …) that
`src/parser/*` monkey-patches onto generated context classes. The Langium parser must either
(a) expose a compatibility facade with the exact same method names, arities (`stat()` array vs
`stat(0)` indexed), and null/undefined conventions, or (b) every one of these specs plus all
consuming renderer code must be rewritten. The tests below are enumerated assuming (a).

---

## 1. Shared test fixtures (the parse entry points the contract relies on)

### 1.1 `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/test/unit/parser/fixture/Fixture.ts`
- `Fixture.firstStatement(code)` = `RootContext(code).block().stat()[0]` — the dominant entry
  point. Note `stat()` returns an array here, while other specs call `stat(0)` with an index;
  both call styles must work (ANTLR generates dual-mode accessors).
- `Fixture.firstChild(code)` navigates `children[0].braceBlock().block().stat()[0]` — i.e. raw
  `children` array access on a parse-tree node is part of the contract.
- `Fixture.firstGrandChild(code)` uses `children[0].Statements()[0]` (custom `Statements()`
  extension).
- `stubWidthProvider`: width stub that parses the trailing number out of names like `A300`
  (returns 300) and returns `MOCK_CREATE_MESSAGE_WIDTH = 100` for the literal `«create»`
  message text. All positioning specs depend on this convention.

### 1.2 `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/parser/ContextsFixture.ts`
Builds a raw `antlr4` lexer/parser per call and exposes **sub-rule entry points**:
`ProgContextFixture` (`parser.prog()`), `TitleContextFixture` (`parser.title()`),
`StatContextFixture`, `AsyncMessageContextFixture` (`parser.asyncMessage()`),
`SyncMessageContextFixture` (`parser.message()`), `DividerContextFixture`
(`parser.divider()`), `CreationContextFixture`, `RetContextFixture`. Several specs (Money,
NumberUnit, NamedParameter, digit-leading-name) also construct lexers/parsers inline and call
`parser.atom()`, `parser.parameters()`, `parser.message()`, or inspect the raw token stream.
**Langium has no direct equivalent of "parse starting from an arbitrary sub-rule"** — the
migration needs either configurable entry rules or rewritten fixtures.

Also imported by many specs: `RootContext` from
`/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/parser/index.ts`
(side-effectful import that installs all prototype extensions).

---

## 2. Spec inventory — `src/parser/**`

### 2.1 `/…/src/parser/key/Key.spec.ts` (8 lines)
Pins `message.Key()` returning a **token-index range string** — `"0:7"` for `A.method`.
Keys are derived from token positions, so Langium must reproduce a stable token/offset
indexing scheme (used as React keys / cache keys downstream).

### 2.2 `/…/src/parser/Message.SignatureText.spec.ts`
`Fixture.firstStatement("A.m1.m2").message().SignatureText()` → `"m1.m2"`. Pins chained
method calls (`func: signature (DOT signature)*`) being flattened back into a dotted
signature string.

### 2.3 `/…/src/parser/utils/cloest-ancestor/ClosestAncestor.spec.ts`
`ctx.ClosestAncestorStat()` returns the nearest enclosing `stat` whose `.start.start` /
`.stop.stop` are **absolute character offsets** (e.g. for `"A.m {B.m}"` the first child stat
spans offsets 5–7). Pins offset-accurate start/stop tokens on every node.

### 2.4 `/…/src/parser/MessageContext/MessageContext.spec.ts` and `/…/src/parser/Messages/MessageContext.spec.ts`
Two near-duplicate suites. Pin, on async messages parsed via `AsyncMessageContextFixture`:
- `getFormattedText()` reconstructs `"Alice -> Bob: Hello World"` **with normalized spacing**
  and **excluding comments**.
- `getComment()` returns the text of preceding `//` comment(s) **with the leading space kept
  and the `//` stripped**: `"// comment \n…"` → `" comment "`; two comment lines aggregate to
  `" comment1 \n comment2 "` (joined with `\n`, each line keeps its leading space). Comments
  live on a hidden channel in ANTLR; Langium must capture and associate them with the
  following statement.
- `Messages/MessageContext.spec.ts` additionally pins `SyncMessageContextFixture("A.method").Statements()`
  → `[]` and `"A.method { m1 m2 }"` → 2 statements whose `getText()` are `"m1"` / `"m2"`
  (note `getText()` = raw concatenation, no spaces).

### 2.5 `/…/src/parser/AncestorPath.spec.ts`
`firstChild("A.method() { C->C.method }").getAncestors()` (no predicate) returns **exactly 7
ancestors** with the first being a `StatContext` — this pins the *depth and shape of the parse
tree* between `stat` and the nested message, including intermediate rule layers. With a
predicate `ctx instanceof sequenceParser.MessageContext` it returns 1 `MessageContext` whose
`getFormattedText()` is the whole outer message. Also pins `instanceof`-based node-type
checks against exported context classes.

### 2.6 `/…/src/parser/Divider/DividerContext.spec.ts`
`DividerContextFixture(code).Note()` extracts divider notes: `"==A==="`→`"A"`, tolerates
leading spaces/newlines (`"  ==A==="`, `"\n ==A==="`), multi-word `"===A B==="`→`"A B"`, and
(known quirk, TODO in source) `"===A, B==="`→`"A,B"` — comma loses its trailing space.
From a full parse, `Fixture.firstStatement("==A, B==").divider().Note()` → `"A,B"`.
`DividerContextFixture("a ==A===").Note()` **throws** `"Divider note must start with =="`.

### 2.7 `/…/src/parser/CodeRange.spec.ts`
`CodeRange.from(messageCtx)` pins position semantics: **lines are 1-based, columns 0-based**;
`stop.col` points *after* the last token's text (e.g. `A.m` stops at col 3). For a multi-line
block `A.m1{\n B.m2}` the outer message's stop is the `}` at line 2 col 6; the nested message
spans line 2 cols 1–5.

### 2.8 `/…/src/parser/EmojiParser.spec.ts`
Via `RootContext` + `ToCollector.getParticipants`: `[rocket] Production` sets participant
`emoji: "rocket"`; no-emoji participant → `emoji` undefined; combines with type
(`@Database [fire] HotDB` → type `Database`, emoji `fire`) and stereotype
(`<<service>> [lock] Auth`). Inline emoji on first message usage works
(`A->[rocket]B.call()` → B has `rocket`), and **declaration wins over inline** when both
present (`[fire] B\nA->[rocket]B.call()` → `fire`, implemented via `||=` first-write-wins).

### 2.9 `/…/src/parser/Messages/Assignment.spec.ts`
Pure model class (no parsing): `new Assignment(assignee, type, labelPos, typePos)` —
`getText()` is `"A:B"` or `"A"`; throws `"assignee must be defined if type is defined"`;
`labelPosition` aliases `assigneePosition` (backward compat); positions are `[start, end]`
pairs, `[-1,-1]` is the "no position" sentinel. The Langium-side builder must keep producing
these position pairs.

### 2.10 `/…/src/parser/Participants.spec.ts`
Pure `Participants` collection semantics: `Add(name)` preserves insertion order
(`ImplicitArray()`), `Starter()` undefined unless added with `isStarter: true`; re-adding an
existing participant **merges** (keeps `isStarter: true` from first add, gains
`explicit: true`, accumulates `positions` as a `Set` of `[start,end]` pairs). `blankParticipant`
defines the default shape of a participant value object.

### 2.11 `/…/src/parser/From.spec.ts`
Pins the computed `From()` (message origin) up the tree:
- Root `A.method` → `undefined`; `A->B.method` → `"A"`; async `A->B: message` → `"A"`;
  `new A` → `undefined`.
- Nested: inside `A.method { … }`, children inherit `"A"` as from (`B.method` from `A`,
  `new B` from `A`), unless explicitly `B->C…` (then `"B"`).
- **Return arrow shortcut** `A-->B:msg` parses as `ret()` with `returnAsyncMessage()`,
  `From()`=`"A"`, `ReturnTo()`=`"B"`, `Signature()`=`"msg"`; inside a block,
  `B-->A: response` keeps the **leading space** in `Signature()` → `" response"`.
- `ProvidedFrom()` returns only the explicitly written from (`A->B.method`→`"A"`,
  `A.method`→`undefined`).

### 2.12 `/…/src/parser/Title/Title.spec.ts`
`title Hello World` → `content()` `"Hello World"`; bare `title` → `""`; leading spaces ok.
**`title` is a soft keyword**: must still work as method name (`A.title()`), positional and
named parameter (`A.method(title, value)`, `A.method(title="My Title")`), assignment target
(`title = A.getValue()`), and participant name (`A->title.method()`). A title directive and a
`title` method coexist in one program; title parses after leading comments.

### 2.13 `/…/src/parser/Atom/Money.spec.ts`
Lexer-level: `$100`, `$0`, `$1000000`, `$01`, `$1.50`, `$0.50`, **`$.50`** all lex as one
`MONEY` token (verified via `symbolicNames[token.type] === "MONEY"`) and parse as `atom`.
Tests read `ast.MONEY().symbol` — terminal accessor + token object are part of the surface.

### 2.14 `/…/src/parser/Atom/NumberUnit.spec.ts`
Lexer-level `NUMBER_UNIT` token: `1kg`, `0kg`, `100day`, `5km`, `01h`, `010hours`, `1.5kg`,
`0.5h`, **`.5m`** are single `NUMBER_UNIT` tokens; bare `kg` parses as an atom too (as ID).
Implies a maximal-munch lexer rule of `number + known-unit-ish suffix` (see also 3.4 for the
boundary against `DIGIT_LEADING_NAME`).

### 2.15 `/…/src/parser/FrameBuilder.spec.ts`
`FrameBuilder(orderedParticipants).getFrame(statCtx)` builds nested fragment frames with
`{type, left, right, children}` where left/right are the leftmost/rightmost **participants
touched inside the fragment**, resolved against the given participant order (including
`_STARTER_`). Covers nested `if` chains and an anonymous `section(x)` fragment whose
left/right are both `_STARTER_`. Depends on tree-walking fragment contexts.

### 2.16 `/…/src/parser/IfWithoutBody.spec.ts` — **THE error-tolerance spec**
Regression suite for incomplete input while typing. For
```
BookLibService.Borrow(id) {
  User = Session.GetUser()
  if()
  return receipt
}
```
pins that: the outer message **keeps its braceBlock** (no spurious anonymous section); the
body has exactly **3 sibling stats**; `stat(1).alt().ifBlock()` has `parExpr()` non-null but
`condition()` **null** and `braceBlock()` **null**; `stat(2).ret().expr().getText()` is
`"receipt"` (NOT swallowed into the if); and the string tree contains **no `"missing"`
error-recovery artifacts**. Same tolerance for `else if()` and bare `else` with no body
(braced `if` keeps its body; alt + following `return` stay siblings). Valid braced
if/else-if/else must not regress. In ANTLR this was solved by making `braceBlock` optional in
the grammar; Langium needs equivalent optionality + recovery so typing states parse cleanly.

### 2.17 `/…/src/parser/OrderedParticipants.spec.ts`
Pins the full participant-ordering algorithm over `OrderedParticipants(RootContext(code))`,
returning `{name, left, label}` models (`left` = name of the participant to the left, `""`
for first):
- Implicit starter: `A.m` → `[_STARTER_, A]`; `_STARTER_` is an invisible pseudo-participant.
- `@return A->B:m` and the `A-->B:m` shortcut yield `[A, B]` with **no** `_STARTER_`.
- Declarations order first: `A as A1 B C.m` → `_STARTER_, A(label A1), B, C` — `as` label
  captured, missing label is `undefined` (sometimes key absent, sometimes explicit undefined —
  both shapes appear in expectations).
- `@Starter(A)`/`@Starter("B")` semantics: starter is pulled left-most **unless** already
  declared (then declaration position wins: `A B @Starter(C) C.m` → A,B,C; `A B @Starter(B) …`
  → A,B,…). Quoted starter names allowed.
- Expressions are **not** participants: parameters (`A.m(B.m)` → only A), conditions
  (`if(B.m1){A.m2}` → only A), and `return x` (no x participant).

### 2.18 `/…/src/parser/ChineseSupport.spec.ts`
Unicode identifier support, all through deep facade chains
(`context.head().participant(i).name(0).getText()`,
`message.messageBody().fromTo().to()`, `func().signature(0).methodName()`,
`assignment().assignee()`, `creation().creationBody().construct()`, `asyncMessage().from()/to()`):
- Chinese participant, method, parameter, condition, loop-condition, assignment, creation
  (`订单 = new 订单对象()`), async message names.
- Quoted Chinese strings **with spaces** as participants and method names
  (`"用户 服务"."获取 信息"()` — quotes retained in `getText()`).
- `return 成功` and `return "操作 成功"` via `ret().expr().getText()`.
- Japanese, Korean, Arabic, Cyrillic identifiers.
- Backward compat: ASCII, underscores, trailing digits (`service123.method456()`).
The lexer's ID rule must cover these Unicode ranges.

### 2.19 `/…/src/parser/NamedParameter.spec.ts`
Via raw `parser.parameters()` / `parser.message()`:
- `userId=123` → 1 parameter with `namedParameter()`, `ID()` `"userId"`, `expr()` `"123"`.
- Multiple/mixed positional+named params keep order; positional ones have `expr()` truthy and
  `namedParameter()` falsy.
- Complex value expressions: `isAdmin=user.role == "admin"` — `expr().getText()` is
  `'user.role=="admin"'` (raw, no spaces). `==`/`!=` supported, `===` not.
- **Error tolerance for missing values**: `A.method(p=)`, `userId=`, `userId=, name="John"`,
  `p1=, p2=, p3=123` all parse without throwing; the dangling named parameter has `ID()` set
  and `expr()` **falsy**. Param count is still correct (e.g. 3 for `p1=, p2=, p3=123`).
- `123=value` must **not** become a named parameter (number can't be a name; falls back to
  expression parameter).

---

## 3. Spec inventory — `test/unit/**`

### 3.1 `/…/test/unit/parser/addons/Owner.spec.ts`
`Owner()` = the participant that owns the activation: sync `A.m` → `"A"`; `self` inside
`A.m {self}` → `"A"`; async `B->A:m` → `"A"` (the **target**); `new A` → `"A"`.

### 3.2 `/…/test/unit/parser/condition/Condition.spec.ts`
- Multi-line complex condition `a == 1 && b != 2 || c = A.isGood(B.isBad())` →
  `condition().getFormattedText()` reconstructs it **on one line with single spaces** —
  pins operator tokens (`==`, `!=`, `&&`, `||`, `=`) and formatted-text spacing rules.
- `forEach(x in xes)` → loop condition `getFormattedText()` `"x in xes"` (the `in` expression).

### 3.3 `/…/test/unit/parser/textExpr.spec.ts`
Natural-language (unquoted multi-word) conditions parse as `textExpr`:
`if(has more items)` → `condition().textExpr().getText()` `"hasmoreitems"` —
**`getText()` concatenates tokens without whitespace** (renderer recovers spacing elsewhere).
Same for `forEach(streaming response)` and `par(concurrent processing)`; long text conditions
survive. The grammar must prefer `expr`/`inExpr` when they apply and fall back to `textExpr`
for word soup (see 3.5–3.8 for the disambiguation matrix).

### 3.4 `/…/test/unit/parser/digit-leading-name.spec.ts` (uses `bun:test` + raw token stream)
Pins the **three-way lexer split** between `INT`, `NUMBER_UNIT`, and `DIGIT_LEADING_NAME`:
- `5xx_error` as a condition: `condition().getFormattedText()` `"5xx_error"` and
  `condition().atom().DIGIT_LEADING_NAME()` present.
- `2FAService.3DSecure()` — digit-leading participant **and** method names.
- Async target `API->5xx_error: retry` and `return 5xx_error`
  (`ret().expr().atom().DIGIT_LEADING_NAME()`).
- Token-level table: `1kg 100day 0.5h .5m 10ms` are `NUMBER_UNIT`;
  `5xx 5xx_error 2FAService 404Page` are `DIGIT_LEADING_NAME`;
  `1_000` is **two tokens**: `INT` `1` + `ID` `_000`.
Whatever Langium terminal rules are written must reproduce these exact boundaries, including
the unit whitelist (`kg/day/h/m/ms/...`) vs status-code-like names.

### 3.5 `/…/test/unit/parser/if-text-condition.spec.ts`
`if`/`else`/`else if` with text conditions (`user is authenticated` → `"userisauthenticated"`
via `textExpr().getText()`); `elseIfBlock()[0]` array access; nesting; backward compat —
`if(count > 0)` is `expr()`, `if("some condition")` is `atom()` (quoted string condition).

### 3.6 `/…/test/unit/parser/loop-text-condition.spec.ts`
`forEach`/`loop` text conditions; nested loops report the outer condition; backward compat
`forEach(count < 10)` → `expr()`, `forEach(x in xes)` → `inExpr()`; **`loop()` with empty
parens → `condition()` is `null`** (not an empty textExpr).

### 3.7 `/…/test/unit/parser/par-condition.spec.ts`
`par(text…)` → textExpr; `par(threads > 1)` → expr; `par()` → `parExpr()` defined but
`condition()` null; **`par { }` without parens → `parExpr()` itself null**; nested par.

### 3.8 `/…/test/unit/parser/critical-condition.spec.ts` and `/…/test/unit/parser/opt-condition.spec.ts`
Same matrix for `critical` and `opt`: text condition, expression condition
(`opt(role == "admin")`, `critical(lock.acquired && timeout < 1000)`), empty parens →
`condition()` null, no parens → `parExpr()` null, nesting, opt-inside-if.

### 3.9 `/…/test/unit/specs/Participant.spec.tsx` (component)
React `Participant` click toggles selection in the Jotai store (`selectedAtom`). Parser is
incidental (`codeAtom` set to `"abc"`), but the store pipeline re-parses code, so the parser
must not crash on a bare word.

### 3.10 `/…/test/unit/positioning/MatrixBasedAlgorithm.spec.ts`
Pure math (`distance`, `final_pos` on adjacency matrices) — no parser dependency; unaffected
by migration but part of `bun run test` green-ness.

### 3.11 `/…/test/unit/utils/pendingEditableRange.spec.ts`
`resolveAutoEditToken(pending, start, end)` matches a pending edit range `{start, end, token}`
by **exact start/end positions**. Indirect contract: the positions stored by the editor come
from parser-reported token positions; they must remain stable across the migration.

### 3.12 `/…/test/unit/scripts/analyze-compare-case.spec.ts` (uses `bun:test`)
Covers the E2E diff-analyzer tooling (`scripts/analyze-compare-case*`): CLI arg parsing,
native pixel-diff classification, panel-diff color classes, report assembly, stdout modes.
No parser dependency, but it's in the unit-test gate.

---

## 4. Component / positioning / svg / utils specs that parse DSL (grep: `RootContext`)

### 4.1 `/…/src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Interaction/Occurrence/Occurrence.spec.tsx`
Renders `Occurrence` with a real `RootContext(code)` message context and pointer-drag events.
Pins: `root.block().stat()[0].message()`, `message.braceBlock().block()` **identity** (the
drag state's `blockContext` must be `===` the same node object obtained twice), nested-child
counting (`insertIndex` 0 with no block, 1 after one existing child). Object identity of
parse-tree nodes across accessor calls is part of the contract (ANTLR accessors return the
same child objects; memoize accordingly).

### 4.2 `/…/src/components/…/InteractionAsync/InteractionAsync.spec.tsx`
Renders async statements from `rootContextAtom` (store-derived root). `A->B:m` →
data-source/target/signature `A`/`B`/`m`; `A->A:m` adds `self-invocation`. A comment in the
spec records that bare `B:m` syntax was **deliberately removed** (13× parse slowdown) — do
not resurrect it in the Langium grammar.

### 4.3 `/…/src/components/…/Statement/Statement.spec.tsx`
Comments render above messages: `// comment \n A->B:m` shows text `"comment"`;
`// [red] comment` extracts a **color directive from the comment** and applies
`rgb(255,0,0)` to both comment and message label. Pins comment text retrieval + `[color]`
prefix parsing out of the comment body.

### 4.4 `/…/src/components/DiagramFrame/SeqDiagram/WidthOfContext.spec.ts`
`TotalWidth(rootContext, coordinates)` with `stubWidthProvider`: exact pixel widths for
self-call (`a300` → 320), fragments (`if(x) {A.method}` → 220), fragment min-width incl. the
**unbalanced input** `"if(x) { if(y() {}}"` (note the typo — parser must tolerate it and
still produce nested fragments), multi-participant fragments, and widest-self-message logic.
Exercises participant collection + fragment frame geometry end-to-end on top of the parser.

### 4.5 `/…/src/positioning/Coordinates.spec.ts`
`new Coordinates(RootContext(code), stubWidthProvider).getPosition(name)` — exact positions
for: single/wide participants, `group {}` (groups don't change absolute positions), unknown
participant → 0, wide method labels pushing targets (`A1.m800`), participant dedup
(`A1.a1 A1.a1 B1.a1`), creation message width (`new A1` uses `«create»` mock width 100),
non-adjacent long messages with even-distribution optimization (B1 at exactly `462.5`), and
`_STARTER_` auto-added left for `A1 B1->A1:m1`. Heavy consumer of `OrderedParticipants` +
`MessageCollector` over the parse tree; also depends on `clearCache()` from RenderingCache.

### 4.6 `/…/src/positioning/MessageCollector.spec.ts`
`AllMessages(rootContext)` yields ordered `{from, to, signature, type}`:
- `@return A->B:m` → AsyncMessage `m` A→B.
- bare `return result` → ReturnMessage with from/to `undefined`, signature `"result"`.
- `@Starter("B")` makes nested `A.mA { self() { C.mB() } }` produce from `B`→`A` (`mA`),
  `A`→`A` (`self()` — **signature keeps its parens**), `A`→`C` (`mB()`).
- `new B` → signature `«create»` (type 2 CreationMessage); async `C->D: message` keeps the
  **leading space**: signature `" message"` (type 1).
- Sync signature text keeps parameters raw without spaces: `m(new B,C.m)`,
  `method(E.m)` — and expressions in parameters/conditions do **not** create messages.

### 4.7 `/…/src/positioning/VerticalCoordinates.spec.ts` (uses `bun:test`)
Smoke + API contract on `new VerticalCoordinates(rootContext)`: must not throw for sync with
nested block, creation with nested block (`A=new A(){ B.c() }`), alt, `try/catch/finally`,
creation with assignment. `entries()` returns stable, snapshot-copied
`[key, {top, height, kind}]` pairs (string keys — derived from context Keys, see 2.1);
`getTotalHeight()` ≥ max bottom.

### 4.8 `/…/src/svg/buildGeometry.spec.ts` (uses `bun:test`)
SVG geometry built from `RootContext` + Coordinates + VerticalCoordinates:
- Return arrow Y spacing: `return ret1` then `@return B->A: ret2` inside a sync block →
  `ret2.y - ret1.y === 33` exactly.
- **Cumulative message numbering across fragments**: in an `if/else if/else` containing a
  `try/catch/finally`, labels number `1.1`, `1.2.1`, `1.2.2`, `1.2.3`, `1.3`, `1.4`. This
  pins statement traversal order across alt sections and tcf blocks.

### 4.9 `/…/src/utils/participantInsertTransform.spec.ts`
`insertParticipantIntoDsl({code, rootContext, insertIndex, name, type})` **rewrites the DSL
source** using parse-tree positions: `"A->C: Ping"` + insert B at index 1 →
`"A\nB\nC\nA->C: Ping"` (implicit participants materialized as declarations);
with `title Demo` prefix the title is preserved and typed insert renders `@Actor B`.
Requires accurate source offsets for the first block statement and participant list.

---

## 5. E2E setup (describe only — not run here)

- Playwright config: `/…/playwright.config.ts` with `testDir: "./tests"`. Commands:
  `bun pw`, `bun pw:ui`, `bun pw:update`, `bun pw:smoke`, `bun pw:ci`.
- `/…/tests/fixtures.ts` wraps the Playwright `test` to forward browser console output.
- `/…/tests/test-cases.ts` re-exports `CASES` from `/…/e2e/data/compare-cases.js` — the
  **single source of truth of ~148 DSL snippets** (keys like `empty`, `single-participant`,
  `sync-call`, `simple-messages`, `named-params`, …). Any Langium grammar divergence shows up
  here first.
- Suites:
  - `tests/visual/` — `html-rendering.spec.ts` (HTML renderer screenshot snapshots over a
    curated subset, per-case thresholds, e.g. smoke at 0.012), `svg-parity.spec.ts` (SVG
    renderer snapshots: fragments, async, self-sync, vertical-*, nested-outbound, …),
    `emoji-messages.spec.ts`, `emoji-participant.spec.ts`. Hundreds of
    `*-chromium-{darwin,linux}.png` golden snapshots.
  - `tests/interaction/` — editable labels (incl. ESC revert, special characters), message
    create/reorder (incl. inside fragments), rename/type/wrap panels, participant insert —
    these exercise **token positions, editable ranges, and DSL rewriting** through the live UI.
  - `tests/regression/defect-406.spec.ts` — fragments under creation messages (snapshot).
  - `tests/measurement/width-provider-comparison.spec.ts` — text measurement comparison.
- Diff tooling: `node scripts/analyze-compare-case.mjs --case <name> --json` provides
  structured attribution for compare-case diffs (unit-covered in 3.12). Per project rules,
  snapshots may only be updated when pixel changes are proven intentional.

---

## 6. The 15 trickiest behaviors to preserve (ranked, hardest/highest-risk first)

1. **Error tolerance for incomplete `if()` / `else if()` / bare `else` while typing**
   (`IfWithoutBody.spec.ts`): following statements stay siblings, the enclosing brace block
   survives, `parExpr()` exists with `condition()` and `braceBlock()` null, and the tree has
   **zero error-recovery artifacts**. Langium's default recovery will not give this for free.
2. **The ANTLR parse-tree facade itself**: dozens of specs navigate
   `block().stat(i)/stat()[i]`, `message().messageBody().func().signature()[0].methodName()`,
   `children[0]`, `getAncestors()` returning **exactly 7** ancestors for a known input,
   `instanceof sequenceParser.MessageContext`, and rely on **node object identity** across
   repeated accessor calls (Occurrence drag spec uses `===`). A compatibility layer must match
   shapes, arities, null conventions, and identity.
3. **Lexer token taxonomy at the digit boundary**: `1kg/.5m/10ms` → `NUMBER_UNIT`;
   `5xx/2FAService/404Page` → `DIGIT_LEADING_NAME`; `1_000` → `INT` + `ID`; `$100/$.50` →
   `MONEY`. Exact maximal-munch boundaries and the unit whitelist are pinned token-by-token.
4. **Comment capture and association**: hidden-channel `//` comments attach to the *following*
   statement; `getComment()` strips `//` but keeps leading spaces and joins multi-line with
   `\n`; `[red]`-style color directives inside comments style both comment and message.
5. **Token/character position contract**: `Key()` `"0:7"` token-index keys (React/cache keys,
   VerticalCoordinates entry keys), `CodeRange` (1-based lines, 0-based cols, stop-after-token),
   `ClosestAncestorStat().start.start/stop.stop` char offsets, `Assignment`
   `[start,end]` position pairs, editable ranges, and `insertParticipantIntoDsl` source
   rewriting. Any off-by-one breaks editing features and E2E interaction suites.
6. **Condition disambiguation ladder** in `if/loop/forEach/par/opt/critical`:
   `expr` (`count > 0`) vs `inExpr` (`x in xes`) vs quoted-string `atom` vs natural-language
   `textExpr` (`has more items`); empty parens → `condition()` null; **no parens →
   `parExpr()` null**. Six specs pin this matrix per fragment keyword.
7. **Two text-rendering modes**: `getText()` = raw token concatenation without spaces
   (`"hasmoreitems"`, `'user.role=="admin"'`, `"m(new B,C.m)"`) vs `getFormattedText()` =
   single-space-normalized, comment-free reconstruction
   (`"a == 1 && b != 2 || c = A.isGood(B.isBad())"`). Both are asserted verbatim.
8. **Participant ordering algorithm**: invisible `_STARTER_` injection (and when it's absent —
   `@return`/`A-->B` cases), declarations-before-implicits, `@Starter` "absolute positioning"
   semantics incl. quoted names and the declared-starter exception, `as` labels, merge-on-readd
   with `||=` first-wins (incl. emoji), and *not* collecting participants from parameters,
   conditions, or `return` expressions.
9. **Named-parameter error tolerance**: `p=`, `userId=, name="John"`, `p1=, p2=, p3=123` parse
   without throwing, keep correct parameter counts, `ID()` set, `expr()` falsy; `123=value`
   must fall back to a positional expression.
10. **Signature text quirks**: async message content **keeps its leading space**
    (`" message"`, `" response"`), `self()` keeps parens, chained `A.m1.m2` flattens to
    `"m1.m2"`, creation synthesizes `«create»` (also the width-stub trigger), return-arrow
    `A-->B:msg` is a `ret()` with `returnAsyncMessage()`.
11. **Unicode + soft keywords**: full CJK/Arabic/Cyrillic identifiers everywhere (participants,
    methods, params, conditions, creation, async), quoted names with spaces keeping their
    quotes in `getText()`, digit-leading Unicode-adjacent names, and `title` (at least) usable
    as method/param/variable/participant while still being a directive at statement start.
12. **Message collection order and typing** (`AllMessages`): traversal order across nested
    blocks, sync(0)/async(1)/creation(2)/return types, `@Starter` rewiring `from`, expressions
    in parameters/conditions excluded — feeds Coordinates; positions are asserted to the
    half-pixel (`462.5`).
13. **Cumulative message numbering across fragment sections** (`buildGeometry`):
    `1.1 → 1.2.1/1.2.2/1.2.3 (try/catch/finally) → 1.3 (else if) → 1.4 (else)` — statement
    walk order through alt sections and tcf must be identical.
14. **Divider parsing**: `==text==` with leading whitespace/newlines, `Note()` extraction with
    the known `"A,B"` comma quirk preserved (a fix would invalidate the pinned expectation),
    and the explicit error `"Divider note must start with =="` for misplaced dividers.
15. **Tolerance of malformed/garbage input in geometry paths**: `"if(x) { if(y() {}}"`
    (typo'd, unbalanced) must still parse into nested fragments with exact widths
    (`WidthOfContext.spec.ts`), and `bun run test`-adjacent smoke (`VerticalCoordinates`)
    must never throw on creation-with-block, tcf, alt. Plus the deliberate **removal** of the
    bare `B:m` syntax (perf) must not creep back in.

---

## 7. Notes for the implementer

- Some specs import from `bun:test` (`digit-leading-name`, `VerticalCoordinates`,
  `buildGeometry`, `analyze-compare-case`), the rest rely on vitest-compatible globals under
  `bun test`. Keep both import styles working.
- Sub-rule parse entry points (`parser.atom()`, `parser.parameters()`, `parser.divider()`,
  `parser.title()`, `parser.message()`, `parser.asyncMessage()`, `parser.ret()`,
  `parser.prog()`) are used directly by specs — Langium needs alternative entry rules or the
  fixtures in `ContextsFixture.ts` / inline lexer constructions must be ported.
- Specs assert against `sequenceParser.symbolicNames` / raw token streams
  (`CommonTokenStream.fill()`, `token.channel`, `antlr4.Token.DEFAULT_CHANNEL`) — a hidden
  comment channel (or equivalent filtered-token concept) is part of the observable surface.
- `RootContext` returns `null`-or-context (`rootContext && rootContext.block()...`), and
  specs guard for it; keep the nullable return convention.
