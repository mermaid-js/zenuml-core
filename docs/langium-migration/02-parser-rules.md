# ANTLR Parser Rules — Complete Inventory (Langium Migration Blueprint)

Source of truth: `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/g4/sequenceParser.g4` (352 lines, parser grammar with `tokenVocab = sequenceLexer`).

Generated parser: `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/generated-parser/sequenceParser.js`.

Companion lexer: `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/g4/sequenceLexer.g4` (254 lines; has two extra lexer modes `EVENT` and `TITLE_MODE`, a HIDDEN whitespace channel, and a `MODIFIER_CHANNEL` for `const`/`readonly`/`static`/`await` — see the lexer doc for details; referenced here only where parser rules consume mode-specific tokens).

This document lists **every parser rule** (47 rules), its exact alternatives, which alternatives exist purely for **error tolerance** (live-typing of incomplete input), labeled alternatives, direct lexer-token references, left recursion, and the context class names the generated parser produces. The Langium grammar must reproduce all of this — especially the error-tolerance shape, which downstream code (`src/parser/*.ts`) and the renderer depend on structurally.

---

## 1. Why error tolerance is a first-class requirement

The parser runs on every keystroke in live editors. Incomplete input like `if(x` with no body must still produce a **usable tree** where surrounding statements stay intact (not swallowed by error recovery). The regression spec proving this contract is:

`/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/parser/IfWithoutBody.spec.ts`

Key assertions from that spec (the Langium parser must satisfy the same tree shape):

- For
  ```
  BookLibService.Borrow(id) {
    User = Session.GetUser()
    if()
    return receipt
  }
  ```
  - `root.block().stat(0).message().braceBlock()` is non-null (the Borrow message keeps its body; no spurious anonymous section).
  - The body has exactly **3 sibling stats**: the assignment-message, the `if`, and the `return`.
  - `ifBlock.parExpr()` non-null, `ifBlock.parExpr().condition()` **null**, `ifBlock.braceBlock()` **null**.
  - `return receipt` is a **sibling** of the `if`, not swallowed into it.
  - `toStringTree` contains no `missing` error-recovery artifacts.
- Same tolerance for `else if()` and bare `else` with no brace block.
- Valid braced `if/else if/else` must not regress.

The grammar comment above `ifBlock` (lines 278–280) explains the mechanism: `braceBlock` was made **optional** in `ifBlock`/`elseIfBlock`/`elseBlock`; otherwise ANTLR error recovery consumed the following statement and the enclosing block's closing `}` into the if/else body.

**General pattern used throughout the grammar**: nearly every rule has an extra alternative or `?` suffix that lets it match a *prefix* of the full construct (keyword alone, keyword + open paren, target + dot with no method, etc.). When porting to Langium, these must be preserved either as optional grammar elements or via Langium/Chevrotain error-recovery configuration — Langium's default recovery is different from ANTLR's, so each tolerance point below should get a dedicated test.

---

## 2. Top-level structure: prog / title / head / block / stat

```
prog → title? (head? block | head)? EOF
title → TITLE TITLE_CONTENT? TITLE_END?
head → (group | participant)+ | (group | participant)* starterExp
block → stat+
stat → alt | par | opt | critical | section | ref | loop | creation
     | message | asyncMessage EVENT_END? | ret | divider | tcf
```

A document is: optional title, optional declaration head (groups/participants/starter), then a block of statements. `block` is the recursive unit — `braceBlock` (bodies of messages, fragments, try/catch) wraps a nested `block?`.

---

## 3. Rule-by-rule inventory

Notation: `(g4 L<n>)` = line in sequenceParser.g4. **[ET]** marks alternatives/optionals that exist for error tolerance per grammar comments or by construction (matching incomplete prefixes). UPPERCASE names are lexer tokens (direct token references). Original `[Perf]` comments are preserved because they record alternatives that were tried and rejected — don't re-add them in Langium.

### 3.1 `prog` (g4 L7–12) — entry rule

| Alt | Body | Notes |
|---|---|---|
| 1 | `title? EOF` | An empty string is a valid prog. **[ET]** |
| 2 | `title? head EOF` | Declarations only, no statements. Comment: `[Perf] Removing this line does not help`. |
| 3 | `title? head? block EOF` | The normal full form. |

A commented-out alternative `LT EOF` notes "Parser auto recover from this". Effective shape: `title? head? block?` with all parts optional. Langium entry rule should be `Prog: title=Title? head=Head? block=Block?` (Langium implicitly anchors at EOF).

### 3.2 `title` (g4 L14–16)

`TITLE TITLE_CONTENT? TITLE_END?`

- `TITLE` token pushes the lexer into `TITLE_MODE`; `TITLE_CONTENT` is rest-of-line, `TITLE_END` is the newline that pops the mode.
- `TITLE_CONTENT?` and `TITLE_END?` optional: **[ET]** tolerates `title` typed with no text yet, and EOF before newline.

### 3.3 `head` (g4 L18–21)

| Alt | Body |
|---|---|
| 1 | `(group | participant)+` |
| 2 | `(group | participant)* starterExp` |

i.e. one-or-more declarations, optionally terminated by a single `starterExp`. Note alt 2 allows *zero* declarations + starter. `head` cannot be empty (prog handles `head?`).

### 3.4 `group` (g4 L25–27)

`GROUP name? (OBRACE participant* CBRACE?)?`

Left-factored single alternative (comment L23–24). Tolerances baked in: **[ET]** `name?` (bare `group`), entire brace section optional (`group A` with no body), `participant*` may be empty, `CBRACE?` optional (unclosed `group {`). Comment: keeps behavior that `group { A }` parses as a group declaration, not an anonymous block.

### 3.5 `starterExp` (g4 L30–33)

| Alt | Body | Notes |
|---|---|---|
| 1 | `STARTER_LXR (OPAR starter? CPAR)?` | `@Starter` / `@starter`; arg list optional **[ET]**, starter inside parens optional **[ET]** (`@Starter()` while typing). |
| 2 | `ANNOTATION` | Any bare `@word` is accepted as a starter expression. |

Comment: `[Perf] Changing starter to name does not help.`

### 3.6 `starter` (g4 L35–37)

`name` — single alternative, pure wrapper (exists so downstream code can call `.starter()`).

### 3.7 `participant` (g4 L39–43)

| Alt | Body | Notes |
|---|---|---|
| 1 | `participantType? stereotype? emoji? name width? label? COLOR?` | Full form; everything except `name` optional. |
| 2 | `stereotype` | **[ET]** stereotype alone (e.g. `<<interface>>` typed before the name). |
| 3 | `participantType` | **[ET]** annotation alone (e.g. `@Actor` with no name yet). |

Direct token: `COLOR` (a `#rrggbb`-style token).

### 3.8 `stereotype` (g4 L45–49)

| Alt | Body | Notes |
|---|---|---|
| 1 | `SOPEN name SCLOSE` | `<<name>>` complete. |
| 2 | `SOPEN name GT?` | **[ET]** unclosed: `<<name` or `<<name>`. |
| 3 | `(LT | SOPEN) (GT | SCLOSE)?` | **[ET]** comment: "Some people may write `<<>>` first then put in the interface name" — matches `<`, `<<`, `<>`, `<<>>`, `<< >`, etc. |

Direct tokens: `SOPEN` (`<<`), `SCLOSE` (`>>`), `LT` (`<`), `GT` (`>`). Note `LT`/`GT` are also relational operators in `expr` — context-dependent reuse, a known migration hazard.

### 3.9 `label` (g4 L51–54)

| Alt | Body | Notes |
|---|---|---|
| 1 | `AS name` | `A as Alice`. |
| 2 | `AS` | **[ET]** bare `as` while typing the alias. |

### 3.10 `participantType` (g4 L56–58)

`ANNOTATION` — single token wrapper (`@Actor`, `@Database`, `@EC2`, … any `@word`).

### 3.11 `name` (g4 L60–62)

`ID | DIGIT_LEADING_NAME | CSTRING | USTRING` — token-only rule. `CSTRING` is double-quoted, `USTRING` is single/unicode-quoted (see lexer). `DIGIT_LEADING_NAME` allows names like `3DService`.

### 3.12 `width` (g4 L64–66)

`INT` — token-only rule (participant column width hint).

### 3.13 `emoji` (g4 L68–71)

| Alt | Body |
|---|---|
| 1 | `LBRACKET name RBRACKET` (e.g. `[smile]`) |
| 2 | `EMOJI_SHORTCODE` (e.g. `:smile:` lexer token) |

### 3.14 `block` (g4 L76–78)

`stat+` — comment: changed from `stat*` to `stat+` per a perf article; "This change however does not improve the perf." Emptiness is handled by callers (`prog` alt 3 makes block itself optional; `braceBlock` has `block?`).

### 3.15 `ret` (g4 L80–84)

| Alt | Body | Notes |
|---|---|---|
| 1 | `RETURN expr? SCOL?` | `return x;` — expr **[ET]**-optional (`return` alone), semicolon optional. |
| 2 | `ANNOTATION_RET asyncMessage EVENT_END?` | `@Return A->B: msg` form (`@Return`/`@return`/`@Reply`/`@reply`). |
| 3 | `returnAsyncMessage EVENT_END?` | `A->B: msg` in return position via `RETURN_ARROW`. |

`EVENT_END` is the newline token emitted when the lexer pops `EVENT` mode (entered by `COL`).

### 3.16 `returnAsyncMessage` (g4 L86–89)

| Alt | Body | Notes |
|---|---|---|
| 1 | `from RETURN_ARROW to COL content?` | `A ~> B: result` (RETURN_ARROW is `~>` per lexer). `content?` **[ET]**. |
| 2 | `from RETURN_ARROW to?` | **[ET]** `A ~>` or `A ~> B` with no colon yet. |

### 3.17 `divider` (g4 L95–97) and `dividerNote` (g4 L99–101)

`divider → dividerNote`; `dividerNote → DIVIDER`. Two-level wrapper around the single `DIVIDER` token (`==` at column 0 + rest of line; the lexer uses a `this.column === 0` predicate — a semantic predicate Langium cannot express directly; needs custom token or lexer hook). Design comments L91–94: triggered with `==`+`=`*, any char except newline as note text, treated as a statement.

### 3.18 `stat` (g4 L104–120) — the statement dispatcher

13 alternatives, all plain rule refs except one:

`alt | par | opt | critical | section | ref | loop | creation | message | asyncMessage EVENT_END? | ret | divider | tcf`

- Comment L103: `[Perf] Removing par and opt would improve if/else by about 10%; consider merging loop, par and opt.` (They share the shape `KEYWORD parExpr? braceBlock` — a real consolidation opportunity in Langium via a single `FragmentStat` rule with a keyword kind.)
- Comment L114–115 on `EVENT_END?`: "Without 'EVENT_END' the change line char cannot match anything and results error. This change line is lexed as EVENT_END because it was in Event_Mode." I.e. after `A->B: text`, the trailing newline arrives as an `EVENT_END` token and must be consumable here.
- **Ordering matters** for ambiguity resolution: `creation` before `message` (both can start with `assignment`), `message` before `asyncMessage` (both can start with `name`). ANTLR's adaptive prediction resolves these; Langium/Chevrotain needs explicit lookahead or backtracking (`GATE`s) — this is one of the riskiest parts of the migration.

### 3.19 `par` (g4 L122–125)

| Alt | Body | Notes |
|---|---|---|
| 1 | `PAR parExpr? braceBlock` | `par { ... }`; parExpr rarely used but allowed. |
| 2 | `PAR` | **[ET]** bare keyword while typing. |

### 3.20 `opt` (g4 L127–130)

Identical shape to `par`: `OPT parExpr? braceBlock | OPT` (alt 2 **[ET]**).

### 3.21 `critical` (g4 L132–135)

Identical shape: `CRITICAL parExpr? braceBlock | CRITICAL` (alt 2 **[ET]**).

### 3.22 `section` (g4 L138–142)

| Alt | Body | Notes |
|---|---|---|
| 1 | `SECTION (OPAR atom? CPAR)? braceBlock` | `section(name) { ... }`; arg is an `atom`, not parExpr; parens optional, atom inside optional **[ET]**. |
| 2 | `braceBlock` | **Anonymous section** — a bare `{ ... }` block is a statement. Comment: "mostly for error tolerance (e.g. `ref(x) { m1 }`)" — when a construct loses its header, the orphan braces still parse. **[ET]** but also a real feature (anonymous grouping). |
| 3 | `SECTION` | **[ET]** bare keyword. |

`SECTION` token matches `'section' | 'frame'`.

### 3.23 `creation` (g4 L144–146)

`creationBody (SCOL | braceBlock)?` — a creation optionally followed by `;` or a body block.

### 3.24 `ref` (g4 L148–150)

`REF OPAR (name (COMMA name*)*) CPAR SCOL?`

- Requires parens and at least one name (no bare-`REF` tolerance — incomplete `ref` falls into other recovery paths; `ref(x) { m1 }` relies on `section` alt 2 for the trailing block).
- Note the odd nested star: `(name (COMMA name*)*)` permits `ref(a, b c, d)`-ish sequences — commas with zero-or-more names after each. Effectively a lenient comma list; Langium can model as `name+=Name (',' name+=Name?)*`-style leniency, but exact token acceptance should be matched by tests.

### 3.25 `creationBody` (g4 L160–163)

| Alt | Body | Notes |
|---|---|---|
| 1 | `assignment? NEW construct (OPAR parameters? CPAR)?` | `x = new A(p1)`; arg list optional **[ET]** (`new A`), parameters optional **[ET]** (`new A()`). |
| 2 | `assignment? NEW` | **[ET]** comment: "Added this so we can parse `x = new { m1 }` correctly, even though it is invalid." Bare `new` / `a = new`. |

Perf comment L152–159: removing alternative rules improved parse perf by 1/3 (2.1s → 1.4s); incomplete inputs `new`, `a = new`, `new A(` parse "correctly (with correct errors)". Note `new A(` *without* close paren is **not** matched by alt 1 (invocation requires CPAR) — it ends up an error, accepted as "correct errors".

### 3.26 `message` (g4 L165–167)

`messageBody (SCOL | braceBlock)?` — sync message optionally followed by `;` or nested body block.

### 3.27 `messageBody` (g4 L175–179)

| Alt | Body | Notes |
|---|---|---|
| 1 | `assignment (fromTo func? | func)?` | `ret = do()`, `ret = A->B.m()`, `ret = A->B.` **[ET]**, or bare `ret =` **[ET]** (the trailing group is fully optional). |
| 2 | `fromTo func?` | `A->B.m()` or `A->B.` / `B.` with no method yet **[ET]** (`func?`). |
| 3 | `func` | `m()` — self message on current participant. |

Design comment L169–174: structured to reduce backtracking and keep runtime API stable; `func` is flattened at this level (not inside `fromTo`) so `messageBody().func()` remains available to callers. **API contract**: downstream code calls `.assignment()`, `.fromTo()` (or `.from()`/`.to()` via fromTo), and `.func()` on this node — the Langium AST must expose equivalent properties.

### 3.28 `fromTo` (g4 L182–184)

`(from ARROW)? to DOT` — only the source arrow part is optional; **`to DOT` is required**. So `B.m`, `A->B.m`. Trailing-dot tolerance (`A->B.`) comes from `func?` being optional in `messageBody`, not from this rule.

### 3.29 `func` (g4 L187–189)

`signature (DOT signature)*` — method chain: `m1().m2().m3()`. Comment: func is also used in `expr` as `(to DOT)? func` (funcExpr).

### 3.30 `from` (g4 L191–193) and `to` (g4 L195–197)

Both: `emoji? name`. Identical shape, separate rules so the tree distinguishes source vs target.

### 3.31 `signature` (g4 L199–201)

`methodName invocation?` — invocation **[ET]**-optional: `A.method` without parens is a valid message.

### 3.32 `invocation` (g4 L204–206)

`OPAR parameters? CPAR` — comment L203: "We have removed the alternative rule with single OPAR as we are improving the editor to always close the brackets." So **unclosed `(` in an invocation is NOT tolerated at the grammar level** (editors auto-close). `parameters?` optional for `()`.

### 3.33 `assignment` (g4 L208–210)

`(type? assignee ASSIGN)` — optional type annotation, assignee, `=`. The parens are grouping only (single alt).

### 3.34 `asyncMessage` (g4 L212–215)

| Alt | Body | Notes |
|---|---|---|
| 1 | `(from ARROW)? to COL content?` | `A->B: msg`, `B: msg`, and `A->B:` with no payload **[ET]** (`content?`). `COL` switches the lexer into `EVENT` mode; payload is `EVENT_PAYLOAD_LXR`. |
| 2 | `from (MINUS | ARROW) to?` | **[ET]** comment: "`A - B`. This is an intermediate state when user add 'from'." Tolerates `A -`, `A ->`, `A - B`, `A -> B` with no colon. Note `MINUS` (a math operator token) is accepted as a half-typed arrow. |

### 3.35 `content` (g4 L217–219)

`EVENT_PAYLOAD_LXR` — token-only rule; rest-of-line payload from lexer `EVENT` mode.

### 3.36 `construct` (g4 L221–223) and `type` (g4 L225–227)

Both: `name` — pure wrappers for tree-API naming (`construct()` is the class being instantiated; `type()` is the declared type in assignments/declarations).

### 3.37 `assignee` (g4 L229–232)

| Alt | Body | Notes |
|---|---|---|
| 1 | `atom` | Any atom (numbers, booleans, strings, ids…). |
| 2 | `(ID | DIGIT_LEADING_NAME) (COMMA (ID | DIGIT_LEADING_NAME))*` | Comma list: `a, b = m()` (destructuring-ish). |
| 3 | `CSTRING` | |
| 4 | `USTRING` | |
| 5 | `NEW` | Comment: "allowing `new = method()`" — the keyword `new` as a variable name. **Keyword-as-identifier**: a known Langium pain point (needs keyword in the Name rule or token reordering). |

### 3.38 `methodName` (g4 L234–236)

`emoji? name` — method names may carry an emoji prefix.

### 3.39 `parameters` (g4 L238–240)

`parameter (COMMA parameter)* COMMA?` — trailing comma tolerated **[ET]** (`m(a,` while typing → with auto-closed paren becomes `m(a,)`).

### 3.40 `parameter` (g4 L244–246)

`namedParameter | declaration | expr` — comment L242–243: "both namedParameter and expr could match 'a=1'. namedParameter provides more semantic context and better error recovery." **Order matters** (namedParameter wins for `a=1`). Another ambiguity to resolve explicitly in Langium.

### 3.41 `namedParameter` (g4 L248–250)

`(ID | DIGIT_LEADING_NAME) ASSIGN expr?` — `expr?` **[ET]**: `m(a=)` while typing.

### 3.42 `declaration` (g4 L252–254)

`type (ID | DIGIT_LEADING_NAME)` — e.g. `int x` as a parameter.

### 3.43 `tcf` (g4 L257–259), `tryBlock` (L261–263), `catchBlock` (L265–267), `finallyBlock` (L269–271)

```
tcf          → tryBlock catchBlock* finallyBlock?
tryBlock     → TRY braceBlock
catchBlock   → CATCH invocation? braceBlock
finallyBlock → FINALLY braceBlock
```

- `catchBlock*` zero-or-more, `finallyBlock?` optional — `try {}` alone is valid.
- `catch` takes an optional `invocation` (i.e. `catch(Exception e)` parses the parens as an invocation whose parameters use `declaration`).
- Note: `braceBlock` here is **required** (unlike if/else/loop) — bare `try`/`catch`/`finally` keywords without `{` are not tolerated.

### 3.44 `alt` (g4 L273–275), `ifBlock` (L280–282), `elseIfBlock` (L284–286), `elseBlock` (L288–290)

```
alt         → ifBlock elseIfBlock* elseBlock?
ifBlock     → IF parExpr braceBlock?
elseIfBlock → ELSE IF parExpr braceBlock?
elseBlock   → ELSE braceBlock?
```

- **The flagship error-tolerance design** (comment L278–280): `braceBlock` optional in all three so that `if()`, `else if()`, `else` with no body don't trigger ANTLR error recovery that "consumes the following statement and the enclosing block's closing brace into the if/else body". Guarded by `IfWithoutBody.spec.ts` (see §1).
- `parExpr` is **required** in `ifBlock`/`elseIfBlock` (bare `if` without `(` is an error), but `parExpr` itself tolerates empty/unclosed parens (§3.46).
- `elseIfBlock` is two tokens `ELSE IF`, not a combined token.

### 3.45 `braceBlock` (g4 L295–297)

`OBRACE block? CBRACE` — `block?` optional (empty `{}`), but **CBRACE required**. Comment L292–294: after removing an unclosed-`OBRACE` alternative, `A.m {` is parsed as three messages; "We have improved our editors to always add the closing bracket (except for JetBrains IDE plugin). Note this is different from what the ANTLR plugin gives." **Migration risk**: unclosed `{` is intentionally NOT grammar-tolerated; the JetBrains plugin caveat means real users can still produce it — behavior under Langium recovery must be checked against current behavior.

### 3.46 `loop` (g4 L300–302)

`WHILE parExpr? braceBlock?` — comment: "Simplified: tolerate missing parens and/or block during typing." Both optional **[ET]**: bare `while`, `while(x)` with no body, `while {}` with no condition. `WHILE` token matches `'while' | 'for' | 'foreach' | 'forEach' | 'loop'`.

### 3.47 `expr` (g4 L306–321) — **LEFT-RECURSIVE, labeled alternatives**

The only left-recursive rule in the grammar, and the only rule (with `atom`) using `#label` alternatives. ANTLR 4 rewrites the left recursion with precedence climbing (top = highest precedence... actually in ANTLR, earlier alternatives bind tighter):

| # | Alternative | Label (`#name`) | Generated context class |
|---|---|---|---|
| 1 | `atom` | `atomExpr` | `AtomExprContext` |
| 2 | `MINUS expr` | `unaryMinusExpr` | `UnaryMinusExprContext` |
| 3 | `NOT expr` | `notExpr` | `NotExprContext` |
| 4 | `expr op=(MULT \| DIV \| MOD) expr` | `multiplicationExpr` | `MultiplicationExprContext` |
| 5 | `expr op=(PLUS \| MINUS) expr` | `additiveExpr` | `AdditiveExprContext` |
| 6 | `expr op=(LTEQ \| GTEQ \| LT \| GT) expr` | `relationalExpr` | `RelationalExprContext` |
| 7 | `expr op=(EQ \| NEQ) expr` | `equalityExpr` | `EqualityExprContext` |
| 8 | `expr AND expr` | `andExpr` | `AndExprContext` |
| 9 | `expr OR expr` | `orExpr` | `OrExprContext` |
| 10 | `expr PLUS expr` | `plusExpr` | `PlusExprContext` — **dead/shadowed**: alt 5 (additiveExpr) already matches `+` with higher precedence, so `plusExpr` can never be produced. Drop in Langium (verify nothing references `PlusExprContext` — grep shows the class exists in generated code but should be unreachable). |
| 11 | `(to DOT)? func` | `funcExpr` | `FuncExprContext` — method call as a value: `x = A.calc()` inside expressions/parameters. |
| 12 | `creation` | `creationExpr` | `CreationExprContext` — `new A()` as a value. |
| 13 | `OPAR expr CPAR` | `parenthesizedExpr` | `ParenthesizedExprContext` |
| 14 | `assignment expr` | `assignmentExpr` | `AssignmentExprContext` — assignment inside an expression (e.g. parameter `x = a = 1` shapes). |

- Alternatives 4–10 are **binary, left-recursive** with named token field `op=` (alts 4–7). Langium handles this with standard layered precedence rules (or infix operator support); the resulting AST shape will differ from ANTLR's labeled-context shape — the parser-layer adapter must map it.
- Note `LT`/`GT` reuse: relational operators share tokens with stereotype's `<`/`>`.
- All binary ops are **left-associative** (ANTLR default for left-recursive alts).

### 3.48 `atom` (g4 L323–332) — labeled alternatives

| Alternative | Label | Generated context class |
|---|---|---|
| `INT \| FLOAT` | `numberAtom` | `NumberAtomContext` |
| `NUMBER_UNIT` | `numberUnitAtom` | `NumberUnitAtomContext` (e.g. `5kg`) |
| `MONEY` | `moneyAtom` | `MoneyAtomContext` (e.g. `$100`) |
| `TRUE \| FALSE` | `booleanAtom` | `BooleanAtomContext` |
| `ID` | `idAtom` | `IdAtomContext` |
| `DIGIT_LEADING_NAME` | `digitLeadingNameAtom` | `DigitLeadingNameAtomContext` |
| `CSTRING \| USTRING` | `stringAtom` | `StringAtomContext` |
| `NIL` | `nilAtom` | `NilAtomContext` (`nil` or `null`) |

Token-only rule; 8 labeled alts.

### 3.49 `parExpr` (g4 L335–337)

`OPAR condition? CPAR?`

- `condition?` **[ET]**: `if()` with empty condition — `IfWithoutBody.spec.ts` asserts `parExpr().condition()` is null in that case.
- `CPAR?` **[ET]**: unclosed `if(x` still parses. Comment: `[Perf tuning] Removing alternative rules does not help.`
- **Contract**: `parExpr` node must exist whenever `(` was typed, with nullable condition and tolerated missing `)`.

### 3.50 `condition` (g4 L339–344)

`atom | expr | inExpr | textExpr` — ordered alternatives:

1. `atom` — single value (also first alt of expr; redundant but gives a direct `.atom()` accessor and faster match).
2. `expr` — full boolean/arithmetic expression.
3. `inExpr` — `x in collection`.
4. `textExpr` — fallback: free-text condition.

### 3.51 `inExpr` (g4 L346–348)

`(ID | DIGIT_LEADING_NAME) IN (ID | DIGIT_LEADING_NAME)` — e.g. `item in items`.

### 3.52 `textExpr` (g4 L350–352)

`(ID | DIGIT_LEADING_NAME | NUMBER_UNIT)+` — one-or-more word tokens; lets `while(no more retries)` work as plain text. Catch-all so arbitrary prose conditions don't error.

---

## 4. Rules referencing lexer tokens directly

Token-only rules (wrappers around tokens): `name`, `width` (INT), `participantType` (ANNOTATION), `dividerNote` (DIVIDER), `content` (EVENT_PAYLOAD_LXR), `atom` (all 8 alts), and `emoji` alt 2 (EMOJI_SHORTCODE).

Rules mixing structure with direct tokens: `title` (TITLE, TITLE_CONTENT, TITLE_END), `group` (GROUP, OBRACE, CBRACE), `starterExp` (STARTER_LXR, OPAR, CPAR, ANNOTATION), `participant` (COLOR), `stereotype` (SOPEN, SCLOSE, LT, GT), `label` (AS), `ret` (RETURN, SCOL, ANNOTATION_RET, EVENT_END), `returnAsyncMessage` (RETURN_ARROW, COL), `stat` (EVENT_END), `par`/`opt`/`critical`/`section`/`ref` (PAR/OPT/CRITICAL/SECTION/REF + OPAR/CPAR/COMMA/SCOL), `creation`/`message` (SCOL), `creationBody` (NEW, OPAR, CPAR), `fromTo` (ARROW, DOT), `func` (DOT), `invocation`/`parameters`/`namedParameter` (OPAR, CPAR, COMMA, ASSIGN), `assignment` (ASSIGN), `asyncMessage` (ARROW, MINUS, COL), `assignee` (ID, DIGIT_LEADING_NAME, COMMA, CSTRING, USTRING, NEW), `declaration` (ID, DIGIT_LEADING_NAME), `tcf` family (TRY, CATCH, FINALLY), `alt` family (IF, ELSE), `braceBlock` (OBRACE, CBRACE), `loop` (WHILE), `expr` (all operator tokens, OPAR/CPAR), `parExpr` (OPAR, CPAR), `inExpr` (IN), `textExpr` (ID, DIGIT_LEADING_NAME, NUMBER_UNIT).

Mode-coupled tokens the parser consumes (lexer-mode dependency the Langium tokenizer must replicate):

- `TITLE_CONTENT` / `TITLE_END` — TITLE_MODE, entered by `TITLE`.
- `EVENT_PAYLOAD_LXR` / `EVENT_END` — EVENT mode, entered by `COL` (`:`); EVENT_END is the newline that pops back. Consumed in `stat`, `ret`, `content`.
- `DIVIDER` — uses lexer predicate `{this.column === 0}?` (column-0 anchoring). Langium/Chevrotain needs a custom token with a line-start matcher.
- Hidden/channel tokens never reach the parser: `WS`, `COMMENT`, `CR`, `OTHER` (HIDDEN), and `CONSTANT`/`READONLY`/`STATIC`/`AWAIT` (MODIFIER_CHANNEL). Note: `src/parser/` code reads COMMENT tokens off the hidden channel for `// comment` attachment to statements — Langium hidden terminals must remain retrievable from the CST.

## 5. Left recursion

Only `expr` is left-recursive (alts 4–10, binary operators). Everything else is right-/non-recursive. Indirect recursion cycles that are NOT left-recursive but matter for Langium rule structure:

- `block → stat → message → braceBlock → block` (statement nesting)
- `stat → alt/loop/par/opt/critical/section/tcf → braceBlock → block`
- `expr → creation/func/parenthesized → parameters → parameter → expr`

## 6. Labeled alternatives (rules using `#label`)

Exactly two rules: `expr` (14 labels, §3.47) and `atom` (8 labels, §3.48). No other rule uses alternative labels; all other rules produce a single context class named after the rule. No rules use element labels except `op=` inside `expr` (alts 4–7).

## 7. Generated context classes (complete, 82 classes)

From `grep -o 'class [A-Za-z0-9_]*Context' src/generated-parser/sequenceParser.js | sort -u`. The custom parser layer (`src/parser/*.ts`) monkey-patches prototypes of these classes (e.g. `MessageContext`, `ParticipantContext`) — the Langium adapter must provide equivalents for every name that `src/parser/` references.

Per-rule classes (one per rule, rule name capitalized + `Context`):

`AltContext, AssigneeContext, AssignmentContext, AsyncMessageContext, AtomContext, BlockContext, BraceBlockContext, CatchBlockContext, ConditionContext, ConstructContext, ContentContext, CreationBodyContext, CreationContext, CriticalContext, DeclarationContext, DividerContext, DividerNoteContext, ElseBlockContext, ElseIfBlockContext, EmojiContext, ExprContext, FinallyBlockContext, FromContext, FromToContext, FuncContext, GroupContext, HeadContext, IfBlockContext, InExprContext, InvocationContext, LabelContext, LoopContext, MessageBodyContext, MessageContext, MethodNameContext, NameContext, NamedParameterContext, OptContext, ParContext, ParExprContext, ParameterContext, ParametersContext, ParticipantContext, ParticipantTypeContext, ProgContext, RefContext, RetContext, ReturnAsyncMessageContext, SectionContext, SignatureContext, StarterContext, StarterExpContext, StatContext, StereotypeContext, TcfContext, TextExprContext, TitleContext, ToContext, TryBlockContext, TypeContext, WidthContext`

Label-derived subclasses (extend `ExprContext` / `AtomContext`):

`AtomExprContext, UnaryMinusExprContext, NotExprContext, MultiplicationExprContext, AdditiveExprContext, RelationalExprContext, EqualityExprContext, AndExprContext, OrExprContext, PlusExprContext, FuncExprContext, CreationExprContext, ParenthesizedExprContext, AssignmentExprContext` (expr) and `NumberAtomContext, NumberUnitAtomContext, MoneyAtomContext, BooleanAtomContext, IdAtomContext, DigitLeadingNameAtomContext, StringAtomContext, NilAtomContext` (atom).

## 8. Error-tolerance checklist for the Langium grammar (consolidated)

Every item below must parse without leaving recovery artifacts, producing the indicated tree shape. Each deserves a test mirroring `IfWithoutBody.spec.ts`:

| # | Input prefix | Tolerance mechanism in g4 |
|---|---|---|
| 1 | `` (empty file) | `prog: title? EOF` |
| 2 | `title` (no text) | `TITLE_CONTENT?`, `TITLE_END?` |
| 3 | `group`, `group A`, `group A {` (unclosed) | `name?`, `(OBRACE … CBRACE?)?` |
| 4 | `@Starter`, `@Starter()` | `(OPAR starter? CPAR)?` |
| 5 | `<<` / `<<>>` / `<<name` (stereotype while typing) | stereotype alts 2–3 |
| 6 | `A as` (no alias) | `label: AS` |
| 7 | bare `@Actor` / bare `<<x>>` as participant | participant alts 2–3 |
| 8 | `return` (no expr) | `RETURN expr? SCOL?` |
| 9 | `A ~>` / `A ~> B` (no colon) | returnAsyncMessage alt 2 |
| 10 | `par` / `opt` / `critical` / `section` bare keywords | second alternatives |
| 11 | bare `{ ... }` (anonymous section; also orphan blocks like `ref(x) { m1 }`) | section alt 2 |
| 12 | `new`, `a = new` | creationBody alt 2 |
| 13 | `ret =` (assignment, nothing after) | messageBody alt 1 trailing group optional |
| 14 | `A->B.` / `B.` (target + dot, no method) | `fromTo func?` with `func` optional |
| 15 | `A.method` (no parens) | `signature: methodName invocation?` |
| 16 | `A->B:` (no payload) | `content?` |
| 17 | `A -` / `A ->` / `A - B` (half-typed arrow) | asyncMessage alt 2 (MINUS accepted) |
| 18 | `m(a,)` trailing comma | `parameters: … COMMA?` |
| 19 | `m(a=)` named param, no value | `namedParameter: … expr?` |
| 20 | `if()` empty condition | `parExpr: OPAR condition? CPAR?` |
| 21 | `if(x` unclosed paren | `CPAR?` in parExpr |
| 22 | `if(x)` no body; `else if()` no body; `else` no body — **following stats stay siblings** | `braceBlock?` in ifBlock/elseIfBlock/elseBlock + spec §1 |
| 23 | bare `while`, `while(x)` no body | `loop: WHILE parExpr? braceBlock?` |
| 24 | `{}` empty braces | `braceBlock: OBRACE block? CBRACE` |
| 25 | free-text conditions `while(no more retries)` | `textExpr` fallback |

**Deliberately NOT tolerated** (don't add): unclosed `{` after a message (`A.m {`), unclosed `(` in invocation (`m(a`), bare `try`/`catch`/`finally` without braces, bare `ref` without parens. Editors auto-close brackets; these were removed for performance.

## 9. Known migration hazards (summary)

1. **Recovery semantics differ**: ANTLR tolerance here is encoded *in the grammar* (optional suffixes), so most of it ports mechanically. But where the grammar is strict (unclosed `{`, `(`), current behavior comes from ANTLR's `DefaultErrorStrategy` (token deletion/insertion, sync-and-return). Langium/Chevrotain recovery will produce different trees for those inputs — must characterize current behavior with tests first.
2. **stat-level ambiguity**: `creation` vs `message` vs `asyncMessage` share prefixes (`assignment`, `name`); `parameter` ambiguity (`namedParameter` vs `expr` for `a=1`); `condition` ordering. ANTLR ALL(*) resolves by adaptive lookahead + alternative order; Chevrotain is LL(k) with explicit GATEs/backtracking.
3. **Lexer modes & predicates**: EVENT mode (after `:`), TITLE_MODE (after `title`), column-0 `DIVIDER` predicate, HIDDEN channel comments that `src/parser/` reads back, MODIFIER_CHANNEL tokens. Langium needs custom token builders/multi-mode lexing.
4. **Keyword-as-identifier**: `new` as assignee; `WHILE` aliases (`for`, `foreach`, `forEach`, `loop`), `SECTION` alias `frame`, `NIL` alias `null` — keywords vs `ID` conflicts.
5. **Token reuse across contexts**: `LT`/`GT` are both stereotype brackets and relational operators; `MINUS` is both math and half-typed arrow.
6. **Runtime API**: 82 context classes with accessor methods (`.block()`, `.stat(i)`, `.message()`, `.braceBlock()`, `.parExpr()`, `.condition()`, `.func()` etc.) are monkey-patched and called all over `src/parser/` and components. Either generate a compatibility adapter over the Langium AST or rewrite every call site.
7. **Dead rule**: `expr` alt 10 `plusExpr` is shadowed by `additiveExpr` — exclude from the Langium grammar after verifying no references.
