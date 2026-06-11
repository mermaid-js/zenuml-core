# 07 — Consolidated Migration Risk Map (ANTLR4 → Langium)

> Synthesis of the six survey documents in
> `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/docs/langium-migration/`:
>
> - `01-lexer-analysis.md` — lexer rules, modes, channels, predicates, Chevrotain blueprints
> - `02-parser-rules.md` — all 47 parser rules, 25 error-tolerance points, 82 context classes
> - `03-context-api-contract.md` — every method/property the renderer calls on contexts
> - `04-parser-layer.md` — the 31 modules of `src/parser/`, REWRITE/PORT classification
> - `05-test-contract.md` — the 34-spec executable contract + E2E layer
> - `06-langium-capabilities.md` — verified Langium 4.2.4 capabilities and mermaid precedent
>
> This document is the decision record for: (1) the complete ANTLR-feature → Langium
> mapping, (2) the hard gaps and chosen workarounds, (3) the adapter strategy
> (facade vs rewrite), and (4) the staged implementation order with verification gates.
> Designers and implementers should work from this document plus the six sources;
> nothing here requires re-reading `src/`.

---

## 1. Part One — Feature Map: every ANTLR feature in use → Langium equivalent

Legend for **Fit**:
- **native** — Langium has a direct equivalent; mechanical port.
- **pattern** — no direct syntax, but a documented Langium/Chevrotain pattern covers it.
- **GAP** — no equivalent; needs custom code. All GAP rows are expanded in Part Two.

### 1.1 Lexer features

| # | ANTLR feature (where used) | Langium equivalent / workaround | Fit | Source |
|---|---|---|---|---|
| L1 | Terminal rules with regex-ish patterns (71 default-mode tokens) | `terminal X: /…/;` JS regexes in `.langium` | native | 01 §3, 06 §1.1 |
| L2 | Lexer fragments (`HWS`, `DIGIT`, `KNOWN_UNIT`, unit families) | `terminal fragment` | native | 01 §3.1, 06 §1.2 |
| L3 | `HIDDEN` channel (`WS`, `CR`) | `hidden terminal WS / NEWLINE` — but keep newline semantics in mind (see L13) | native | 01 §3.2, 06 §1.3 |
| L4 | `COMMENT_CHANNEL` (`//…`) + `getHiddenTokensToLeft` readback in `getComment()` | `hidden terminal SL_COMMENT` — hidden tokens ARE spliced into the CST (`addHiddenNodes`); retrieve via `CstUtils.getPreviousNode(cst, true)` scan. Multi-line join + BraceBlock stop-token special case must be reimplemented by hand | **GAP G4** | 01 §3.10/§7.1, 03 §3, 04 §1.1, 06 §1.3 |
| L5 | `MODIFIER_CHANNEL` (`const`/`readonly`/`static`/`await`) — verified read by NOTHING downstream | One hidden terminal `/(?:const|readonly|static|await)(?![\p{L}\p{Nd}_])/u`. Do NOT promote to parser grammar (06 suggested it as an option; 01's grep proves nothing consumes them — hidden terminal is the zero-behavior-change choice) | pattern | 01 §3.3/§7.1 |
| L6 | `mode EVENT` (`:` → rest-of-line payload `EVENT_PAYLOAD_LXR`, newline pops) | Keyword-anchored rest-of-line terminal (mermaid `TITLE` trick) and/or previous-token-keyed Chevrotain custom pattern; fallback: custom `TokenBuilder` returning `IMultiModeLexerDefinition` | **GAP G1** | 01 §4/§7.2, 06 §2/§8.2 |
| L7 | `mode TITLE_MODE` (predicated `title` → rest-of-line `TITLE_CONTENT`) | Same as L6 plus the `isTitle()` predicate (L8) | **GAP G1+G2** | 01 §5/§7.3, 06 §2.2 |
| L8 | Semantic predicate `isTitle()` (title only at doc start, not followed by `.`/`(`/`=`) | Chevrotain custom token pattern function porting the exact preceding-text logic (comment-strip regex + trim + lookahead skip of spaces/tabs), `longer_alt: ID` for `titles` | **GAP G2** | 01 §2.1/§7.3 |
| L9 | Semantic predicate `!isNameStartAhead()` on `FLOAT` (`.5` vs `.5abc`) | Regex negative lookahead baked in: `/\d+\.\d*|\.\d+(?![\p{L}_])/u` — no custom function needed | pattern | 01 §2.2/§7.4 |
| L10 | Semantic predicate `{this.column === 0}?` on `DIVIDER`, incl. the bare-`==`-line tie-break (lexes as `EQ`, not `DIVIDER`; ` ==` with leading space lexes as `DIVIDER`) | Custom pattern with begin-of-line back-scan over `[ \t]` + the explicit bare-`==` carve-out | **GAP G2** | 01 §2.3/§7.5 |
| L11 | Maximal-munch (longest match wins across ALL rules; declaration order breaks ties) — relied on by every keyword (`WHILE` = 5 aliases, `NIL`, `SECTION`/`frame`), units (`3s` vs `3sx`), annotations (`@Starter` vs `@Starters`), operators (`-->`>`->`>`-`), `CSTRING`>`USTRING` | Chevrotain is first-match: hand-ordered token list (blueprint in 01 §8) + `longer_alt` chains or `(?![\p{L}\p{Nd}_])`-style lookaheads on every keyword/unit/annotation. Langium auto-`longer_alt` only covers parser-rule keywords — most of ours are alternation terminals, so override the `TokenBuilder` and snapshot-test the generated token order | **GAP G3** | 01 §6.1/§8 |
| L12 | `OTHER: '.'` catch-all — lexer never fails; garbage becomes parser errors collected by `SeqErrorListener` | Last-position terminal `/[\s\S]/` injected via TokenBuilder (Langium may prune unreferenced terminals from the grammar file). Chevrotain otherwise skips unmatchable chars into `lexerErrors` — different diagnostics surface | **GAP G5** | 01 §3.10/§7.7 |
| L13 | Newlines hidden in DEFAULT_MODE, significant (`EVENT_END`/`TITLE_END`) inside modes | If G1 uses rest-of-line terminals, payload terminals exclude `[\r\n]` and newline stays a hidden terminal everywhere; the parser grammar drops `EVENT_END?`/`TITLE_END?` (already optional in ANTLR). Facade must still answer `stop.stop` correctly for async messages (the payload token becomes `stop`) | pattern | 01 §1.2/§7.2, 02 §3.2/§3.18 |
| L14 | Unicode identifiers `\p{L}\p{Nd}` (CJK participant names) incl. `DIGIT_LEADING_NAME` (`3DService`, `1号机`) | `u`-flag regexes work, but defeat Chevrotain's first-char optimizer (`ensureOptimizations` warning) — benchmark CJK lexing; consider `start_chars_hint` | pattern (perf risk R7) | 01 §3.8/§7.10 |
| L15 | `CSTRING`/`USTRING` doubled-quote escapes, closed-vs-unclosed split for editor tolerance; odd-quote case `"abc""` resolves to `USTRING(6)` by longest-match but to `CSTRING(5)`+`"` under JS greedy backtracking | One combined custom matcher computing the longest of the two forms and tagging the type | **GAP G6** | 01 §3.9/§7.6 |
| L16 | Token type integers + `symbolicNames` (asserted by Money/NumberUnit/digit-leading-name specs via raw token streams) | No equivalent numbering. Provide a token-stream test adapter (lex with Chevrotain, map `tokenType.name`) or rewrite those ~4 lexer-level specs against the new lexer API | pattern | 01 §1.3, 05 §2.13–2.14/§7 |
| L17 | Case-sensitive everything (no case-insensitivity anywhere) | Langium default; do NOT enable `caseInsensitive` | native | 01 §3.6 |

### 1.2 Parser features

| # | ANTLR feature (where used) | Langium equivalent / workaround | Fit | Source |
|---|---|---|---|---|
| P1 | 47 parser rules; statement-list shape `prog → title? head? block?` | Direct port; `entry Prog: …` (Langium anchors at EOF implicitly) | native | 02 §2/§3.1 |
| P2 | 25 grammar-encoded error-tolerance points (optional suffixes, bare-keyword alts — full checklist 02 §8) | Optionality syntax ports 1:1 (`?`, alternative ordering). Each of the 25 points gets a dedicated parity test | native (test-gated) | 02 §8 |
| P3 | ANTLR `DefaultErrorStrategy` recovery for inputs the grammar leaves strict (`A.m {` unclosed brace, `m(a` unclosed paren, bare `try`) | Chevrotain recovery (`recoveryEnabled: true`, Langium hard default; single-token insert/delete + re-sync). Only a boolean toggle — no strategy hooks (langium #1742). Trees WILL differ for strict inputs; characterize current behavior first, gate via IfWithoutBody-style specs + `WidthOfContext` malformed-input spec + E2E | **GAP G7** | 02 §9.1, 05 §2.16/§6.1/§6.15, 06 §3 |
| P4 | ALL(*)-resolved stat-level prefix ambiguities (`creation` vs `message` vs `asyncMessage` share `assignment`/`name` prefixes; `parameter`: `namedParameter` vs `expr` for `a=1`; `condition` alternative ladder) | Langium defaults to `chevrotain-allstar` (ALL(*) too) — likely OK, but alternative-order semantics differ; expect ambiguity warnings; resolve with explicit alternative ordering/refactors. Pin with the six condition-matrix spec files + NamedParameter spec | pattern (risk R6) | 02 §3.18/§3.40/§9.2, 06 §10 |
| P5 | Left-recursive `expr` (7 binary alts, `op=` labels, left-assoc) + 14 labeled alternatives; `atom` 8 labeled alternatives | Langium 4 infix operator rules or layered precedence rules. AST shape differs from ANTLR's labeled Context subclasses → facade maps `$type` to `AtomExprContext`-style kinds. Drop dead alt `#plusExpr` (shadowed by `additiveExpr`) after grepping `PlusExprContext` is unreferenced | pattern | 02 §3.47–3.48, 06 §0 |
| P6 | Keyword-as-identifier: `new` as assignee; soft keyword `title` usable as method/param/variable/participant; `WHILE`/`SECTION`/`NIL` alias folding | Token-level: predicates + `longer_alt` (G2/G3); grammar-level: include `NEW` in the assignee rule as ANTLR does. Title softness comes entirely from the `isTitle()` predicate | pattern | 02 §3.37/§9.4, 05 §2.12 |
| P7 | Token reuse across contexts: `LT`/`GT` = stereotype brackets AND relational ops; `MINUS` = math AND half-typed arrow | Same tokens referenced from multiple parser rules — fine in Langium; risk only via G3 ordering | native | 02 §9.5 |
| P8 | Lenient comma list in `ref`: `(name (COMMA name*)*)` accepts `ref(a, b c, d)` | Same EBNF expressible; characterize exact token acceptance with tests before porting | native (test-gated) | 02 §3.24 |
| P9 | Wrapper rules with no content (`stat`, `dividerNote`, `starter`, `construct`, `type`, `fromTo`) that exist purely so downstream calls `.stat(i)`, `.dividerNote()`, etc. | Langium unassigned rule calls FLATTEN (child node returned directly, no wrapper AST node). Either assign explicitly (`Stat: stmt=(Alt|…)`) or synthesize wrapper levels in the facade. Decision: synthesize in the facade (keeps the `.langium` grammar idiomatic; the facade owns the ANTLR shape, incl. `getAncestors()` returning exactly 7 nodes for the pinned input) | **GAP G8** | 02 §3.18, 03 §9.6, 05 §2.5 |
| P10 | Sub-rule parse entry points (`parser.atom()`, `parser.title()`, `parser.message()`, … used by `ContextsFixture.ts` and inline in specs) | `LangiumParser.parse(text, { rule: 'Atom' })` — ParserOptions supports named entry rules (verified 06 §4). Rebuild `ContextsFixture` on top of it; rules used as entry points may need `entry`-reachability kept | native | 04 §4.9, 05 §1.2, 06 §4 |
| P11 | `block → stat+` / `braceBlock → OBRACE block? CBRACE` nesting (recursion unit) | Direct port; facade must preserve the stat→block→braceBlock→message upward-walk chain (P9/G8) | native | 02 §3.14/§3.45 |
| P12 | Deliberate NON-tolerances (unclosed `{` after message, unclosed `(` in invocation, bare try/catch/finally, bare `ref`, removed `B:m` syntax — 13× perf) | Port the same strictness; do NOT "improve". Recovery trees for these inputs differ (G7) | native | 02 §8 end, 05 §4.2/§6.15 |

### 1.3 Runtime / tree-API features (the renderer-facing contract)

| # | ANTLR feature (where used) | Langium equivalent / workaround | Fit | Source |
|---|---|---|---|---|
| R1 | `ctx.start.start` / `ctx.stop.stop` — 0-based char offsets, **inclusive** stop; the universal currency (selection, inline editing, drag keys parsed back via `split('-')`, DSL transforms) | `$cstNode.offset` / `$cstNode.end - 1` (Langium `end` is exclusive). Facade exposes `start`/`stop` token-like objects. One off-by-one breaks editing everywhere | native (high-care, risk R4) | 03 §2/§9.1 |
| R2 | `start.line` (1-based) / `start.column` (0-based) / `stop.text` (`CodeRange.from`) | `$cstNode.range` is 0-based lines → `+1` conversion; end column from `range.end` instead of `stop.column + stop.text.length` | native | 03 §2, 04 §4.6 |
| R3 | `start.tokenIndex` (only consumer: `getComment`) | No equivalent; not needed once getComment is CST-based (G4) | n/a | 03 §2 |
| R4 | `ctx.parentCtx` upward walks through the exact wrapper chain | `$container` + facade-synthesized wrappers (G8) | pattern | 03 §2/§9.6 |
| R5 | `ctx.children` raw ordered mixed array (`LifeLineLayer` head ordering; `useArrow` first child; `TitleContext.children[1]`; `Fixture.firstChild`) | No unified array on Langium AST. Facade provides per-need ordered views: head members in source order, the concrete statement under a stat, title content property | pattern | 03 §2, 05 §1.1 |
| R6 | `getText()` — concatenation WITHOUT hidden content (`"hasmoreitems"`, `'user.role=="admin"'`) vs `getSourceInterval()`+token-stream text — WITH original spacing (inside `getFormattedText`) | Two different reconstructions: `getFormattedText` = raw doc slice `[offset, end)` + `formatText` (identical); `getText` must STRIP hidden content — `$cstNode.text` includes it, so facade `getText()` concatenates non-hidden leaf texts. Both asserted verbatim by specs | pattern | 03 §2, 05 §6.7 |
| R7 | Rule accessors: `null` for absent child (strict `!== null` in `utils/Context.ts`); arrays for repeated rules; dual call style `stat()` array / `stat(i)` indexed | Facade accessors return `null` (never `undefined`) for absent alternatives; support both arities | pattern | 03 §2/§9.4, 05 §1.1 |
| R8 | Stable child identity (`block() === block()`, `statements[0] === statCtx`, React hook deps, Occurrence drag spec `===`) | Memoize facade wrappers per underlying AST node (WeakMap). Fresh-wrapper-per-call is forbidden | pattern | 03 §2/§9.2, 05 §4.1 |
| R9 | `instanceof` generated classes (4 renderer files: `useArrow`, `useFragmentData`, `Return.tsx`, `LifeLineLayer`) + `constructor.name === 'BraceBlockContext'` | Facade classes ARE classes — export them under the same names from `@/parser` and a shim at `@/generated-parser`; `instanceof` keeps working untouched. Replace the `constructor.name` check internally with a kind flag (minification-fragile anyway) | pattern | 03 §1/§2, 04 §1.1 |
| R10 | ~30 prototype-augmented semantic methods (`Owner/From/ProvidedFrom/Origin/Starter/ReturnTo/SignatureText/ParametersText/Signature/Assignment/Statements/isCurrent/Note/Content/content/getFormattedText/getComment/getAncestors/ClosestAncestorStat/Key/…`) called from ~30 renderer/positioning/svg/store files | Methods on facade classes, placed **per node kind** (method PRESENCE is a type discriminator: `typeof ctx.messageBody === 'function'`, `typeof ctx.Assignment !== 'function'`, `typeof ctx.alt !== 'function'`, `!context?.getComment`). `ParametersContext` overrides `getFormattedText` — per-kind override required | pattern (core of Part Three) | 03 §3–4/§8, 04 §3 |
| R11 | Listener walks (`ToCollector`, `MessageCollector`, `FrameBuilder`, `ChildFragmentDetecotr` over `sequenceParserListener` + `ParseTreeWalker`) | Explicit recursive visitors over the facade (or `AstUtils.streamAllContents`). Blind-mode (skip parameters/conditions) becomes "don't descend" — simpler. Fix non-re-entrant singletons while rewriting | pattern | 04 §2 |
| R12 | `RootContext(code)` → tree-or-null; module-level `Errors`/`ErrorDetails` live mutable arrays (cleared by `core.tsx` via `.length = 0`) | `parse()` returns `{value, lexerErrors, parserErrors}` per call. Keep the live-array export shape initially (adapter maps diagnostics into the same arrays, same `{line, column, msg}`), then refactor `core.tsx` in cleanup. Keep nullable `RootContext` convention for blank code | pattern | 03 §1, 04 §1.1, 05 §7 |
| P13 | Partial tree on any error (the `_syntaxErrors` check runs before `prog()` so a tree is always returned; live typing renders best-effort) | `parse()` always returns a (partial) AST with `recoveryEnabled: true` — same philosophy, different recovery shapes (G7) | native (test-gated) | 04 §1.1, 06 §3 |

### 1.4 Build / toolchain

| # | ANTLR | Langium | Fit |
|---|---|---|---|
| B1 | `bun antlr` (Java + ANTLR jar) → committed `src/generated-parser/` | `langium generate` (langium-cli 4.2.1, no Java) → `ast.ts`/`grammar.ts`/`module.ts`; parser assembled at runtime from grammar data. Pre-step in bun scripts, `--watch` for dev | native |
| B2 | antlr4 runtime ~28 KB gz | langium+chevrotain ~143 KB gz (mermaid's shipped floor) → **+115 KB gz**, partially offset by deleting `src/generated-parser/` (measure ours); lazy-load the parser chunk like mermaid if first-paint matters | risk R7 |
| B3 | — | Import ONLY from `langium` (never `langium/lsp`) + `EmptyFileSystem`, or `vscode-languageserver` lands in the browser bundle | pattern |

---

## 2. Part Two — Gap List: where Langium has NO direct equivalent

Each gap: chosen workaround, fallback, and what proves it works.

### G1 — Lexer modes `EVENT` and `TITLE_MODE` (severity: critical)

The `:` → rest-of-line payload is THE mechanism for message labels; `title` is the same shape.
Langium's grammar language has no modes (langium discussion #692, unplanned).

**Chosen workaround (two-tier):**
1. **First try keyword-anchored rest-of-line terminals** (mermaid's `TITLE` trick, 06 §8.2):
   the payload regex is anchored on the introducing token. For `:` this means a single
   terminal whose match covers `:` + payload, with the facade splitting `COL` and content,
   or a previous-token-keyed custom pattern (01 §7.2 Option A) where `EVENT_PAYLOAD`
   matches `[^\r\n]+` only when the last emitted token is `COL`. Both work because each
   mode is exactly **one payload token long** (01's key insight).
2. **Fallback:** custom `TokenBuilder` returning a Chevrotain `IMultiModeLexerDefinition`
   with `PUSH_MODE`/`POP_MODE` (worked example in 06 §2.2; in-tree reference:
   `IndentationAwareTokenBuilder`). Beware cross-mode `LONGER_ALT` validation errors
   (langium discussion #1411).

`EVENT_END`/`TITLE_END` become hidden newlines; the parser grammar drops them (they are
already optional in ANTLR). **Design constraint:** if the grammar ever grows a mode with
more than one interior token, the previous-token trick breaks — document this in the
token builder.

**Proven by:** golden token-stream corpus (01 §9): `A->B: hello // not a comment`,
`A->B:` at EOF, `:`+newline, CRLF, leading spaces in payload.

### G2 — Semantic predicates `isTitle()`, `column===0` (severity: high)

**Chosen workaround:** Chevrotain custom token pattern functions, ported byte-for-byte:
- `TITLE`: exact preceding-text logic (comment-strip regex `\/\/[^\n]*(?:\n|$)` + trim
  must remain identical — do not "improve"), lookahead skipping spaces/tabs then rejecting
  `.`/`(`/`=`, plus `longer_alt: ID` so `titles` stays `ID` (01 §7.3 has the full function).
- `DIVIDER`: begin-of-line check via back-scan over `[ \t]` (option (b) in 01 §7.5 so the
  hidden `WS` terminal can stay first-in-order), **plus the bare-`==` carve-out**: a line
  that is exactly `==` with zero leading whitespace lexes as `EQ` (ANTLR rule-order
  tie-break), while ` ==` lexes as `DIVIDER`. Encode and unit-test this exact quirk.
- `FLOAT` predicate needs no function — regex lookahead (L9).

**Proven by:** title spec matrix (`title Hello`, `// c\ntitle X`, `title.method()`,
`title = 1`, `title(x)`, `titles`, title-as-param), divider matrix (`== d ==`, `  == d`,
bare `==`, mid-line `a == b`), `x.5`-class maximal-munch cases — all in the golden harness.

### G3 — Maximal-munch vs first-match (severity: high, breadth-driven)

Not one feature but a global semantics difference. Every keyword (incl. alternation
tokens `WHILE`='while|for|foreach|forEach|loop', `NIL`, `SECTION`), every unit suffix,
every annotation needs `longer_alt` or a `(?![\p{L}\p{Nd}_])` lookahead, and the whole
token list must follow the dependency order in 01 §8 (e.g. `RETURN_ARROW` < `ARROW` <
`MINUS`; `NUMBER_UNIT` < `FLOAT` < `DIGIT_LEADING_NAME` < `INT`; `STARTER_LXR` <
`ANNOTATION_RET` < `ANNOTATION`; `CSTRING` < `USTRING`; `COMMENT` < `DIV`). Any omission
**silently** changes tokenization (`form` → `WHILE`+`ID`).

**Chosen workaround:** custom `TokenBuilder` that (a) constructs/sorts the token list
explicitly per the 01 §8 blueprint, (b) snapshot-tests the resulting token order, and
(c) the mandatory golden token-stream harness (below). 01 demonstrated with the `x.5`
case that outcomes cannot be predicted by reading — only the harness is authoritative.

**Proven by:** the golden token-stream test harness — run the corpus through the ANTLR
lexer FIRST, record `[type, text, hidden?]` triples, then assert the Chevrotain lexer
produces the identical stream. Corpus checklist is 01 §9. This is Stage 1's exit gate.

### G4 — Comment channel readback / `getComment()` (severity: high)

`getComment()` joins `//`-comment tokens immediately left of a statement's first token
(stop token for `BraceBlockContext`), strips `//` per line **keeping leading spaces**,
joins with `\n`. Comments carry rendering directives (`// [bold,#red] text`) and add
vertical layout height — wrong attachment visibly breaks diagrams.

**Chosen workaround:** hidden terminal + a from-scratch attachment pass over the CST:
walk `CstUtils.getPreviousNode($cstNode, true)` while `hidden`, collect contiguous
`SL_COMMENT` leaves, reverse, strip `//`, join `\n`. Do NOT use the default
`CommentProvider` (it returns only the single directly-preceding comment and consults
`multilineCommentRules`, which excludes our single-line comments). The BraceBlock
"comment before closing `}`" special case feeds only the unused `returnedValue()` flow —
verify and drop with it, or reimplement on the facade's BraceBlock kind.

**Proven by:** `MessageContext.spec.ts` comment assertions (leading space kept,
multi-line joined with `\n`), `Statement.spec.tsx` (`[red]` directive coloring),
`StatementVM` comment-height behavior, plus a new parity spec for comment-before-`}`.

### G5 — Infallible lexer (`OTHER` catch-all) + error array shape (severity: medium)

ANTLR never fails to lex; stray chars (`?`, single `|`/`&`, backtick, emoji-symbols)
become 1-char `OTHER` tokens on the default channel and surface as PARSER errors with
line/col via `SeqErrorListener` into the exported `Errors`/`ErrorDetails` arrays.
Chevrotain instead skips unmatchable input into `lexerErrors`.

**Chosen workaround:** inject a last-position `OTHER: /[\s\S]/` token via the
TokenBuilder (grammar-file declaration risks unused-terminal pruning), and an error
adapter that maps both `lexerErrors` and `parserErrors` into the existing
`{line, column, msg}` shape, written into the same live-reference exported arrays until
`core.tsx` is refactored (R12).

**Proven by:** stray-char corpus in the golden harness + a `core.tsx`-level test that
`Errors`/`ErrorDetails` still populate and clear.

### G6 — CSTRING/USTRING odd-quote longest-match divergence (severity: medium)

For `"abc""`, ANTLR yields `USTRING(6)`; a greedy JS regex backtracks to `CSTRING(5)` +
dangling `"`. Affects incremental-typing tolerance only.

**Chosen workaround:** one custom matcher that computes both candidate matches and emits
the longer, tagging the token type (01 §7.6). Unit cases: `"a"`, `"a`, `"a""b"`, `"a""`,
`""`, `"""`, `"中文"`.

### G7 — Error-recovery semantics for grammar-strict inputs (severity: critical)

The 25 grammar-encoded tolerance points (P2) port mechanically. The danger is everything
**outside** the grammar: `A.m {` (unclosed brace → currently parses as three messages),
`new A(` (accepted as "correct errors"), `if(x) { if(y() {}}` (typo'd input with exact
pinned widths in `WidthOfContext.spec.ts`). Those trees come from ANTLR's
`DefaultErrorStrategy`; Chevrotain's single-token-insert/delete + re-sync will produce
**different** partial trees, and there is no strategy hook to tune (boolean
`recoveryEnabled` only; langium #1742).

**Chosen workaround:**
1. Maximize grammar-level tolerance first (the 25 points + statement-list shape with
   newline-ish re-sync boundaries) so recovery is the fallback, not the mechanism.
2. Characterize current ANTLR behavior with a malformed-input corpus BEFORE porting
   (tree-shape snapshots for: unclosed `{`, unclosed `(`, bare try, half arrows, the
   `WidthOfContext` typo case).
3. Where Chevrotain's recovered tree differs and a downstream contract depends on it,
   fix by adding grammar optionality (the ANTLR grammar itself solved if-without-body
   this way) — never by relying on recovery internals.
4. The `IfWithoutBody.spec.ts` sibling-statement contract (3 siblings, `condition()` null,
   `braceBlock()` null, zero `missing` artifacts) must be re-proven, not assumed.

**Proven by:** IfWithoutBody spec, NamedParameter dangling-value spec,
`WidthOfContext.spec.ts` malformed case, `VerticalCoordinates` never-throws smoke,
then the full Playwright visual suite as the final gate.

### G8 — ANTLR tree shape (wrapper rules, labeled alts, 82 context classes) vs Langium AST shape (severity: critical — drives Part Three)

Langium flattens unassigned rule calls, has no labeled-alternative subclasses, no unified
`children` array, no `stat(i)` accessors, no per-rule classes to `instanceof`. Meanwhile
34 spec files and ~30 renderer files navigate the exact ANTLR shape — including
`getAncestors()` returning **exactly 7** nodes for a pinned input, which freezes the
wrapper-chain depth itself.

**Chosen workaround:** the compatibility facade (Part Three). The facade — not the
`.langium` grammar — owns the ANTLR shape: it synthesizes wrapper levels (`stat`,
`fromTo`, `dividerNote`, …) and label-kind discrimination (`AtomExprContext` etc. as
facade classes keyed on `$type`/operator), memoized per AST node.

### G9 — Test infrastructure deltas (severity: low-medium)

- Sub-rule entry points: covered natively by `parse(text, {rule})` (P10) — port
  `ContextsFixture.ts` onto it.
- Raw token-stream assertions (`symbolicNames`, `token.channel`,
  `CommonTokenStream.fill()`): no equivalent; provide a lexer test adapter or rewrite
  those few specs (L16).
- Mixed runners (`bun:test` imports + vitest globals under `bun test`): unaffected by
  the parser swap but both must keep passing; don't consolidate mid-migration.

### Latent behaviors: port vs do-not-port (explicit decisions)

**Port verbatim (quirks pinned by tests — fixing them FAILS the suite):**
divider `"A,B"` comma quirk; async signatures keeping the leading space (`" message"`);
`self()` keeping parens; `A.m1.m2` flattening to `"m1.m2"`; creation `«create»`
guillemets; `1_000` lexing as `INT`+`ID`; `Participant.mergeOptions` `||=`
first-writer-wins (incl. emoji "declaration wins over inline"); bare-`==` line lexing as
`EQ`; blind-mode NOT applied to ref/starter/ret in ToCollector; `getText()` quote
retention for quoted names.

**Do NOT port (latent bugs):**
generic `ParserRuleContext.Origin()` infinite loop (loop never advances — implement
`Origin` only on stat/prog kinds); module-level singleton listener state in
`ToCollector`/`ChildFragmentDetector` (make visitors re-entrant); `Errors`/`ErrorDetails`
unbounded accumulation (per-parse behind the compat shape);
`constructor.name === 'BraceBlockContext'` string check (kind flag instead). Decide-and-
document: `DividerContext.Note()` throwing on non-`==` text (uncaught in `Divider.tsx`) —
keep the throw for parity through the migration, soften afterwards as a separate change.
Delete, don't migrate: `ParticipantListener.ts` (zero importers), `key/Key.ts` (no
non-spec consumers — confirm, then drop spec too), `returnedValue()` (no callers),
`plusExpr` dead grammar alt.

---

## 3. Part Three — Adapter Strategy: facade over Langium AST (recommended), not a renderer rewrite

### 3.1 The decision

**Build a memoized facade layer that wraps Langium AST nodes in ANTLR-context-compatible
classes, exported under the existing names from `@/parser` (plus a shim module replacing
`@/generated-parser` imports). `src/components`, `src/positioning`, `src/svg`,
`src/store`, `src/utils`, and all 34 spec files stay untouched in the migration PR.**
Rewriting `src/parser`'s public API is deferred to a post-migration refactor, if ever.

### 3.2 The argument, concretely from the 03/04 contracts

1. **Blast radius.** Doc 04's bottom line: the dominant risk "is NOT inside `src/parser/`
   — it is that ~30 renderer/positioning/svg/store files call the augmented prototype
   methods directly on parse-tree nodes." Doc 03's call-site index (§10) lists ~25
   distinct methods across ~40 files, plus `start.start`/`stop.stop` reads in 18 more
   locations. A public-API rewrite forces all of those to change **in the same commit**
   as the parser swap — an unreviewable big-bang that violates every incremental-progress
   rule this repo works by.

2. **The test suite only proves parity through the facade.** Doc 05's meta-observation:
   the specs do not test an abstract AST, they navigate
   `block().stat(0).message().messageBody().func().signature()[0].methodName()`,
   `children[0]`, `getAncestors()` length 7, `instanceof sequenceParser.MessageContext`,
   and `===` node identity. With a facade, the existing 34-file suite runs unchanged and
   becomes the migration's parity oracle — exactly what we need most, because the highest
   risks (G7 recovery, G3 lexing) are behavioral, not structural. With a rewrite, we'd
   have to rewrite the oracle and the system under test simultaneously, destroying the
   evidence chain.

3. **The contract is satisfiable by a facade — every hard requirement has a mechanical
   answer:**
   - *Method presence as type discriminator* (03 §8.2): facade classes per node kind,
     methods defined only on the kinds that have them today (e.g. `messageBody` only on
     `MessageContext`, `Assignment` only on Message/Creation). A common-base design is
     forbidden; the per-kind class layout IS the contract.
   - *`instanceof` + class exports* (03 §2): facade classes are real classes; exporting
     them as `MessageContext`, `CreationContext`, `StatContext`, `AtomExprContext`,
     `ContentContext`, `GroupContext`, `ParticipantContext`, `ProgContext` keeps the 4
     renderer files and `AncestorPath.spec.ts` working with zero edits.
   - *Identity stability* (03 §9.2, 05 §4.1): one WeakMap from AST node (plus synthetic
     wrapper key) to facade instance; accessors return memoized children. `block() ===
     block()` and the Occurrence drag `===` check hold.
   - *Null-vs-undefined and array/index dual accessors* (03 §9.4/§9.7): facade accessors
     return `null` for absent alternatives, arrays for `+=` children, and accept an
     optional index argument.
   - *Wrapper-chain shape* (G8): the facade synthesizes `stat`/`fromTo`/`dividerNote`
     levels so `parentCtx` walks and the 7-ancestor pin hold regardless of how idiomatic
     the `.langium` grammar is. This decouples grammar design from renderer compatibility
     — the single most valuable property of the facade approach.
   - *Per-kind method override* (`ParametersContext.getFormattedText`, 03 §11.9): plain
     class inheritance.
   - *Offsets* (R1): facade `start`/`stop` objects computed once per node from `$cstNode`.

4. **The facade is small relative to the alternative.** It re-expresses the ~1,150
   REWRITE lines of `src/parser/` (04 §7) in one cohesive layer; the ~430 pure lines
   (`Participants`, `OrderedParticipants` logic, `OwnableMessage`, `IParticipantModel`,
   `CodeRange`, `Assignment`) port as-is on top of it. A rewrite saves none of that work
   — it adds renderer churn on top of it.

5. **Reversibility.** With a facade, ANTLR and Langium can run side by side behind
   `RootContext` (same return surface), enabling A/B tree-shape diffing during
   stabilization and a one-line rollback. A rewritten renderer API forecloses that.

### 3.3 What the rewrite option would buy, and why it loses anyway

A native-API rewrite gives typed AST access (generated `ast.ts`), kills the duck-typing,
and avoids a permanent indirection layer. Those are real long-term wins — but they are
**separable**: once the facade-based migration is green and shipped, call sites can be
moved off the facade incrementally (file by file, test-gated), and the facade shrinks
until deletable. Doing it inside the migration couples the riskiest change (parser swap)
with the widest change (renderer API), and 05 §6.2 says exactly what happens then:
"nearly every spec and the renderer break at once."

### 3.4 Facade design rules (binding for the implementer)

1. One facade class per ANTLR context name that has ≥1 external consumer (03 §5/§10 is
   the authoritative list); kinds with zero consumers may share a generic node class.
2. All construction goes through a per-parse `WeakMap` cache; synthetic wrappers (stat,
   fromTo, …) are cached under `(astNode, wrapperKind)` keys.
3. `start`/`stop` are lightweight token-view objects: `{start, stop, line, column, text}`
   derived from `$cstNode` with the inclusive-stop convention; computed lazily, cached.
4. `getText()` excludes hidden leaf text; `getFormattedText()` is raw `[offset, end)`
   slice + the existing `formatText` (shared, unmodified).
5. Comment attachment (G4) is computed in one pass at facade-root construction (or
   lazily per statement) — never via token indices.
6. The facade module also exports the compat error arrays (G5) and `RootContext`,
   `Participants`, `Depth` with today's signatures (03 §1).
7. No Langium types leak through the facade's public surface (mirrors mermaid's
   bundling posture, 06 §8.4).

---

## 4. Part Four — Staged implementation order with verification gates

Principle: each stage lands independently green (`bun run test` passes throughout —
ANTLR stays the live parser until Stage 5's flip). Golden harnesses are built against
ANTLR *before* any Langium code exists, so parity is always measured, never assumed.

### Stage 0 — Baselines and golden harnesses (no Langium yet)

**Build:**
- Golden **token-stream harness**: corpus from 01 §9 (+ every lexer-level spec input)
  → `[type, text, hidden?]` snapshots recorded from the ANTLR lexer.
- Golden **tree-shape harness**: serializer that walks an ANTLR tree dumping
  `{kind, start, stop, children}`; run over (a) all ~148 compare-case DSLs from
  `e2e/data/compare-cases.js`, (b) a malformed-input corpus (G7 list: unclosed `{`,
  unclosed `(`, bare try, half arrows, `if(x) { if(y() {}}`), (c) the 25 tolerance
  inputs from 02 §8.
- Golden **comment-attachment** and **getFormattedText/getText** snapshots over the
  same corpus.
- Bundle-size and parse-time baseline numbers (this branch exists for perf — record
  antlr4 lexing/parsing time on the compare-case corpus, incl. a CJK-heavy case).
- Delete dead code now (`ParticipantListener.ts`; confirm-then-delete `key/Key.ts` +
  spec, `returnedValue`), so it is never migrated.

**Gate 0:** harness snapshots committed; `bun run test` green; baseline perf/size
numbers recorded in the doc set.

### Stage 1 — Lexer parity (Langium grammar terminals + ZenTokenBuilder)

**Build:** `.langium` terminal section + custom `TokenBuilder` implementing G1–G3, G5,
G6 (token order per 01 §8, custom patterns for TITLE/DIVIDER/payloads, combined string
matcher, injected `OTHER`, hidden MODIFIER/COMMENT/WS/NEWLINE). Token-order snapshot test.

**Gate 1 (unit subsets):** golden token-stream harness passes 100% against the
Chevrotain lexer; lexer-level spec content reproduced via the test adapter
(`Money.spec.ts`, `NumberUnit.spec.ts`, `digit-leading-name.spec.ts` token table);
CJK lexing benchmark within agreed budget vs Stage-0 baseline (define the budget
number before starting — suggest ≤1.5× until tuned, with `start_chars_hint` as the
first lever).

### Stage 2 — Parser grammar parity (raw Langium AST, no facade)

**Build:** full `.langium` parser rules mirroring 02 §3 (incl. all 25 tolerance points;
expr via infix/layered precedence; `plusExpr` dropped; deliberate non-tolerances kept);
`langium-config.json` + generate step wired into bun scripts; resolve ALL(*)/ambiguity
warnings by explicit ordering.

**Gate 2 (new parity tests, not the legacy suite):** tree-shape goldens for the
compare-case corpus match modulo the documented shape mapping (a mapping table from
ANTLR kind → Langium `$type`+wrapper plan is the gate artifact); the 25-point tolerance
checklist passes as raw-AST assertions; IfWithoutBody-equivalent raw-AST test (3
siblings, null condition, null braceBlock, no recovery damage); NamedParameter dangling
values; condition-matrix inputs produce the right alternative kinds; malformed-input
corpus produces *renderable* trees (statements outside the damage survive) — exact
ANTLR equivalence NOT required here, only the downstream contracts.

### Stage 3 — Compatibility facade

**Build:** facade per Part Three §3.4; `RootContext`/`Errors`/`ErrorDetails`/
`Participants`/`Depth` compat exports; `@/generated-parser` shim exporting facade
classes; comment-attachment pass (G4); ported `ContextsFixture` on `parse(text, {rule})`.
The semantic methods (`Owner`, `From`, `Origin`, `ReturnTo`, `SignatureText`, …) are
reimplemented as facade methods, porting the walk semantics from 04 §3 exactly (minus
the do-not-port bugs).

**Gate 3 (the legacy suite, parser scope, dual-run):** all 20 `src/parser/**` specs pass
against the Langium-backed facade **unchanged** — notably `IfWithoutBody`,
`AncestorPath` (exactly 7), `ClosestAncestor` (char offsets), `MessageContext` (comments),
`Divider`, `CodeRange`, `From`, `Title`, `ChineseSupport`, `EmojiParser`,
`OrderedParticipants`, `FrameBuilder`, `Participants`, `Assignment`,
`Message.SignatureText`, `NamedParameter`. Dual-run A/B: `RootContext` flag parses with
both engines and diffs facade-serialized trees over the compare-case corpus; diff list
must be empty or every entry explained and accepted in writing.

### Stage 4 — Parser-layer services + downstream unit suites

**Build:** visitor rewrites of `ToCollector`/`MessageCollector`/`FrameBuilder`/
`ChildFragmentDetector` over the facade (re-entrant, blind-mode by non-descent); break
the parser↔positioning cycle (`LocalParticipants`) deliberately while rewiring;
keep the per-fragment `Participants()` call pattern's outputs identical even if
restructured (perf improvements are allowed only if outputs are byte-identical).

**Gate 4 (full unit gate):** entire `bun run test` green with Langium as the backing
engine in tests: all `test/unit/**` specs (Owner, Condition, textExpr, digit-leading,
if/loop/par/opt/critical matrices), positioning specs (`Coordinates` incl. the 462.5
half-pixel pin, `MessageCollector`, `VerticalCoordinates`), `WidthOfContext` (incl.
malformed input), `buildGeometry` (ret gap 33, numbering 1.1→1.4), component specs
(`Occurrence` identity/drag, `InteractionAsync`, `Statement` comments/colors,
`Participant`), `utils` transform specs (insert/divider/style — the offset round-trip
proof). Both `bun:test` and vitest-global specs pass.

### Stage 5 — Cutover: store/core flip, E2E, perf, bundle

**Build:** flip `RootContext` default to Langium; `core.tsx` error reporting verified
against the compat arrays; production build via `vite.config.lib.ts` with the
generate pre-step; optional lazy parser chunk if size budget demands.

**Gate 5:** full `bun pw` Playwright suite green with **zero snapshot updates**
(any pixel change must be analyzed via `scripts/analyze-compare-case.mjs` and justified
per the repo's snapshot policy — the expectation is none); interaction suites green
(they exercise offsets/editable ranges/DSL rewriting through the live UI); parse-time
on the compare-case corpus and bundle delta reported against Stage-0 baselines with
explicit accept/reject against pre-agreed budgets (suggest: parse time ≤ ANTLR baseline
given this is a perf branch — if Langium is slower, that's a launch blocker to resolve,
not a footnote; bundle +≤120 KB gz net after deleting `src/generated-parser/`).

### Stage 6 — Decommission and follow-ups (separate PRs)

Remove antlr4 dependency, `src/generated-parser/`, `src/g4/`, `bun antlr` script and
Java toolchain docs; keep the dual-run harness code in tests as historical parity
evidence or delete it; update `src/parser/CONTEXT.md` and the two `CLAUDE.md` parser
sections; THEN (optional, incremental) migrate call sites off the facade toward
generated `ast.ts` types file-by-file; soften `Divider.Note()` throw; replace the
`Errors` live arrays with per-parse results in `core.tsx`.

**Rollback plan:** until Stage 6, the ANTLR path stays in-tree behind the `RootContext`
flag; any post-cutover regression flips the flag back in one line.

---

## 5. Part Five — Consolidated risk register (ranked)

| # | Risk | Severity × Likelihood | Mitigation (stage) |
|---|---|---|---|
| R1 | **Facade contract breadth**: ~40 renderer/spec files depend on exact method placement, `null` conventions, dual accessors, `instanceof`, `children`, identity, 7-deep ancestor chain — one wrong detail breaks layout silently (e.g. a common-base facade flips the `typeof` discriminators) | Critical × High | Facade strategy + per-kind class rules (Part 3 §3.4); legacy suite unchanged as oracle (Gate 3); dual-run diffing |
| R2 | **Error-recovery parity** for grammar-strict inputs; IfWithoutBody sibling contract; no Chevrotain strategy hooks | Critical × Medium | G7 plan: tolerance-by-grammar first, malformed corpus characterized at Stage 0, raw-AST gates at Stage 2, E2E at Stage 5 |
| R3 | **Lexer modes + predicates + maximal-munch**: highest-effort lexer area; silent mis-tokenization risk across every keyword/unit | High × High | G1–G3 with golden token-stream harness as the only accepted proof (Gate 1) |
| R4 | **Char-offset off-by-one** (inclusive `stop.stop` vs exclusive `$cstNode.end`) breaking selection/editing/drag/transforms everywhere | High × Medium | Single conversion point in facade token-views; transform/interaction specs (Gates 3–5) |
| R5 | **Comment attachment regression** (styling directives + layout height) | High × Medium | G4 custom pass; comment specs + Statement.spec.tsx (Gates 3–4) |
| R6 | **Ambiguity resolution drift** (creation/message/asyncMessage prefixes, namedParameter vs expr, condition ladder) under chevrotain-allstar | High × Medium | Explicit ordering at Stage 2; condition-matrix + NamedParameter specs (Gates 2/4) |
| R7 | **Performance/bundle regression** on a perf-dedicated branch: +115 KB gz floor; `\p{L}` defeats Chevrotain optimizer; per-keystroke parse latency | High × Medium | Stage-0 baselines, Gate-1 lexer benchmark, Gate-5 budgets as launch blockers; lazy chunk option |
| R8 | **Singleton/live-array API shape** (`Errors`/`ErrorDetails` mutable exports, ToCollector re-entrancy) — consumers depend on the import shape | Medium × Medium | Compat arrays behind adapter (G5), re-entrant visitors (Stage 4), refactor deferred to Stage 6 |
| R9 | **Quirk regression in either direction**: fixing a pinned quirk (divider `A,B`, leading-space signatures, `«create»`, bare-`==`-as-EQ) fails tests; porting a latent bug (Origin infinite loop) freezes the UI | Medium × Medium | Explicit port/do-not-port lists (Part 2 end) reviewed at each gate |
| R10 | **Test-infra drift**: sub-rule entry fixtures, token-stream assertions, mixed bun/vitest runners | Medium × Low | `parse({rule})` fixtures + lexer test adapter (Stages 1/3); no runner consolidation mid-migration |
| R11 | **LSP leakage into browser bundle** (`langium/lsp` import pulls vscode-languageserver) | Medium × Low | Import-lint rule + bundle-content check at Gate 5 |
| R12 | **Mode-emulation fragility**: previous-token-keyed payload tokens only work while modes are one token long; future grammar evolution could break the design invisibly | Low × Low (now), High (later) | Documented invariant in TokenBuilder + a guarding test; multi-mode fallback kept on the shelf (G1 tier 2) |

---

## 6. Open questions for the design phase

1. **G1 tier choice**: keyword-anchored terminal vs previous-token custom pattern for the
   `:` payload — prototype both in Stage 1 and pick on harness results + perf.
2. **Perf budget numbers** for Gates 1 and 5 — must be agreed before Stage 1 starts
   (this branch's reason for existing is parser/renderer performance).
3. **Generated files policy**: commit `src/parser-langium/generated/` (like today's
   `src/generated-parser/`) or gitignore + CI-generate (mermaid's choice). Committing
   matches current repo convention.
4. **`Depth()` consumer check** (04 §2.4 found no non-parser consumers) — verify and
   either keep on the facade for API parity or drop with a CHANGELOG note (it is exported
   from the package entry).
5. **Whether Gate 3's dual-run diff harness stays in-tree permanently** as a regression
   net or is deleted at Stage 6.
