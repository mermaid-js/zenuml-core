# 06 — Langium Capabilities for the ANTLR4 → Langium Migration

> Research date: 2026-06-11. All version numbers, API signatures, and code references were
> verified against npm, the `eclipse-langium/langium` repository (`main` branch), and the
> `mermaid-js/mermaid` repository (`develop` branch) on this date. This document is the
> source of truth for the design/implementation phases — it answers every capability
> question with working code, and flags where Langium differs from our current ANTLR4
> setup (`/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/g4/sequenceLexer.g4`
> and `sequenceParser.g4`).

---

## 0. Versions and Installation

| Package | Latest stable (2026-06-11) | Role |
|---|---|---|
| `langium` | **4.2.4** (`latest` dist-tag; `next` is `4.3.0-next.*`) | Runtime: parser, lexer, services, CST/AST utilities |
| `langium-cli` | **4.2.1** | Build-time code generator (`langium generate`) |
| `chevrotain` | `~12.0.0` (transitive dep of langium 4.2.4) | Underlying lexer/parser engine |
| `chevrotain-allstar` | `~0.4.3` (transitive) | ALL(*) unbounded-lookahead strategy (default in Langium) |

Mermaid's `@mermaid-js/parser` (v1.1.1) currently builds against `langium ^4.2.4` and
`chevrotain ~11.1.2` (their own pin; langium 4.2.4 itself uses chevrotain 12).

Install (this repo uses Bun):

```bash
bun add langium                 # runtime dependency
bun add -d langium-cli          # build-time only
```

`langium`'s full dependency list (verified via `npm view langium dependencies`):
`chevrotain`, `chevrotain-allstar`, `@chevrotain/regexp-to-ast`, `vscode-uri`,
`vscode-jsonrpc`, `vscode-languageserver`, `vscode-languageserver-types`,
`vscode-languageserver-protocol`, `vscode-languageserver-textdocument`.
The LSP-related packages are only pulled into a bundle if you import from the
`langium/lsp` entry point — the core `langium` entry (parser-only usage) does not
reach into `vscode-languageserver` at runtime (mermaid's browser bundle confirms this;
see §6). No Java, no code-generation-of-the-parser-itself: the "generated" artifacts
are TypeScript data modules; the parser is constructed at runtime from the serialized
grammar (see §7).

Langium 4.0 highlights relevant to us (from the TypeFox release post): infix operator
rules (up to ~50% faster parsing of binary expressions vs tree-rewriting), multi-target
references, grammar strict mode (`"validation": { "types": "strict" }` in
`langium-config.json`), and `$type` constants in generated `ast.ts`.

---

## 1. Grammar Language

Langium grammars live in `.langium` files. One file can declare terminals, parser
rules, datatype rules, and fragments; grammars can `import` other grammar files
(mermaid factors shared terminals into `common.langium`, see §9).

### 1.1 Terminal rules

Uppercase by convention, defined with JS regex literals (preferred) or a limited EBNF
notation. A `returns` clause picks the primitive produced by the value converter
(`string` default; also `number`, `boolean`, `bigint`, `Date`):

```langium
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING returns string: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/;
```

EBNF alternatives exist (`'0'..'9'` ranges, `.` wildcard, `'/*' -> '*/'` "until"
operator, `(!'no')` negation, terminal rule calls like `terminal DOUBLE: INT '.' INT;`)
but regex is the documented recommendation.

**Terminal order matters**: terminals are matched in declaration order (Chevrotain
tries token types in vocabulary order). Mermaid's `common.langium` documents this
explicitly: *"When imported, the terminals are considered after the terminals in the
importing grammar"* — i.e., importing-grammar terminals win. Keywords declared in
parser rules are automatically turned into tokens that take precedence over terminals
(with `LONGER_ALT` wired to the overlapping terminal so `titled` still lexes as `ID`
rather than keyword `title` + `d`).

### 1.2 Terminal fragments

Reusable lexer-level building blocks, never emitted as tokens themselves:

```langium
terminal fragment CAPITAL_LETTER: /[A-Z]/;
terminal NAME: CAPITAL_LETTER /[a-z]+/;
```

### 1.3 Hidden terminals (whitespace + comments)

`hidden` terminals are lexed but skipped by the parser everywhere — the direct
equivalent of ANTLR's `-> channel(HIDDEN)` / `-> skip`, declared per-terminal rather
than per-action:

```langium
hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
```

**Hidden tokens are NOT discarded — they are attached to the CST.** This is the
crucial difference from ANTLR's default token stream behavior and it answers the
"can comment text be retrieved after parsing?" question with a firm **yes**:

- `LangiumParser.parse()` ends with `this.nodeBuilder.addHiddenNodes(lexerResult.hidden)`
  (verified in `packages/langium/src/parser/langium-parser.ts`, line ~283). The
  `CstNodeBuilder.addHiddenNodes` implementation splices hidden leaf nodes into the
  CST *before* the node they precede (or into the current composite's content), so
  every comment is positionally anchored in the tree.
- Every `CstNode` has a `hidden: boolean` property: *"Whether the token is hidden,
  i.e. not explicitly part of the containing grammar rule"* (from
  `packages/langium/src/syntax-tree.ts`).

Retrieval, three ways (all verified against `packages/langium/src/utils/cst-utils.ts`
and `packages/langium/src/documentation/comment-provider.ts`):

```ts
import { CstUtils, GrammarUtils } from 'langium';
// CstUtils re-exports: findCommentNode, isCommentNode, getPreviousNode, getNextNode,
// flattenCst, streamCst, findLeafNodeAtOffset, ...

// (a) The comment node directly preceding an AST node's CST node:
const comment = CstUtils.findCommentNode(astNode.$cstNode, ['ML_COMMENT', 'SL_COMMENT']);
if (comment) {
  console.log(comment.text);          // raw comment text, e.g. "// red note"
  console.log(comment.range);         // LSP Range {start:{line,character}, end:{...}}
  console.log(comment.offset, comment.end);
}

// (b) Via the CommentProvider service (used by Langium itself for hover docs).
//     DefaultCommentProvider.getComment(node) === findCommentNode(node.$cstNode,
//     grammarConfig.multilineCommentRules)?.text
const text = services.documentation.CommentProvider.getComment(astNode);

// (c) Manual walk — find ALL hidden tokens (e.g. several stacked // comments),
//     not just the directly preceding one:
const comments: CstNode[] = [];
let prev = CstUtils.getPreviousNode(astNode.$cstNode!, /* includeHidden */ true);
while (prev?.hidden) {
  if (CstUtils.isCommentNode(prev, ['SL_COMMENT'])) comments.unshift(prev);
  prev = CstUtils.getPreviousNode(prev, true);
}
```

Caveat for (b): `DefaultCommentProvider` consults `GrammarConfig.multilineCommentRules`,
which by default contains only terminals whose pattern can span lines. Our ZenUML
comments are single-line (`// ...`) and carry semantics (message styling like
`// [red] comment text`), so we will use (a)/(c) with explicit rule names, or override
`CommentProvider` in our module. Since hidden nodes sit in `CompositeCstNode.content`
in document order, reconstructing "all comments attached above statement X" is a
simple ordered scan — strictly better than ANTLR's
`BufferedTokenStream.getHiddenTokensToLeft(tokenIndex, COMMENT_CHANNEL)` because it
needs no token-index bookkeeping.

### 1.4 Datatype rules

Parser rules that return a primitive instead of an AST node. Unlike terminals they are
context-sensitive and allow hidden terminals (whitespace/comments) between elements:

```langium
QualifiedName returns string:
    ID ('.' ID)*;
```

Mermaid uses this for `EOL returns string: NEWLINE+ | EOF;` — note **`EOF` is usable
inside datatype rules**, which is handy for "line ends or file ends" languages like
ours. Datatype rules are the right tool for ZenUML constructs like dotted method
chains and parameter lists where we only need the text.

### 1.5 Parser rules, assignments, fragments, entry rule

```langium
grammar ZenSequence

entry SequenceDiagram:
    (statements+=Statement)*;

Statement:
    Participant | Message | AltFragment | LoopFragment | Divider;

Message:
    (from=ID '->')? to=ID ('.' method=MethodCall)? (':' label=EventText)?;

fragment Details:                 // parser-level fragment: inlined, no AST type
    firstName=ID lastName=ID;
```

Assignment operators: `=` (single value), `+=` (array), `?=` (boolean presence,
e.g. mermaid's `showData?="showData"?`). The generated `ast.ts` gives a fully typed
AST interface per rule, with `$type` string literals and `isXyz()` type guards —
this replaces our hand-rolled visitor/context-helper layer's type guessing.

---

## 2. Lexer Modes — Not in the Grammar Language; TokenBuilder Is the Escape Hatch

**Confirmed: the `.langium` grammar language has NO lexer-mode syntax** (no
`pushMode`/`popMode`/`mode` sections). GitHub discussion
[eclipse-langium/langium#692](https://github.com/eclipse-langium/langium/discussions/692)
("Code actions: pushMode/popMode") is the canonical thread: maintainers state that
lexing and parsing are separate phases, native mode support is **unplanned** as of
2026, and the sanctioned approach is a **custom `TokenBuilder`** returning a
Chevrotain `IMultiModeLexerDefinition`.

This works because the `TokenBuilder.buildTokens` return type is Chevrotain's
`TokenVocabulary = TokenType[] | TokenTypeDictionary | IMultiModeLexerDefinition`,
and Langium's `DefaultLexer` handles the multi-mode case natively — verified in
`packages/langium/src/parser/lexer.ts`:

```ts
// langium source (lexer.ts):
export function isIMultiModeLexerDefinition(tokenVocabulary: TokenVocabulary): tokenVocabulary is IMultiModeLexerDefinition {
    return tokenVocabulary && 'modes' in tokenVocabulary && 'defaultMode' in tokenVocabulary;
}
// DefaultLexer.toTokenTypeDictionary flattens Object.values(buildTokens.modes).flat()
```

Langium itself ships a production example of this exact pattern:
`IndentationAwareTokenBuilder` (`packages/langium/src/parser/indentation-aware.ts`)
overrides `buildTokens`, sets `PUSH_MODE`/`POP_MODE` on individual token types, and
returns an `IMultiModeLexerDefinition`:

```ts
// langium source (indentation-aware.ts, abridged — the pattern to copy):
override buildTokens(grammar: Grammar, options?: TokenBuilderOptions): TokenVocabulary {
    const tokenTypes = super.buildTokens(grammar, options);
    // ... mark mode-switching tokens:
    //   tokenType.PUSH_MODE = LexingMode.IGNORE_INDENTATION;
    //   tokenType.POP_MODE = true;
    const multiModeLexerDef: IMultiModeLexerDefinition = {
        modes: {
            [LexingMode.REGULAR]: [dedent, indent, ...otherTokens, ws],
            [LexingMode.IGNORE_INDENTATION]: [...otherTokens, ws],
        },
        defaultMode: LexingMode.REGULAR,
    };
    return multiModeLexerDef;
}
```

### 2.1 What our grammar needs (from `src/g4/sequenceLexer.g4`)

Our ANTLR lexer uses:
- `mode TITLE_MODE` — entered on `'title'` keyword, exits on newline (`popMode`);
  inside, everything to EOL is `TITLE_CONTENT`.
- `mode EVENT` — entered on `':'`, exits on newline; everything to EOL is `EVENT_PAYLOAD`.
- Channels: `COMMENT_CHANNEL`, `MODIFIER_CHANNEL`, `HIDDEN`.
- Semantic predicates: `{this.isTitle()}?` (title only at start of line/file, not
  followed by `.`/`(`/`=`) and `{this.column === 0}?` on `DIVIDER`.

### 2.2 Worked equivalent: multi-mode TokenBuilder for ZenUML

```ts
// src/parser-langium/zen-token-builder.ts
import { DefaultTokenBuilder, type GrammarAST, type TokenBuilderOptions } from 'langium';
import type { Grammar } from 'langium';
import type { IMultiModeLexerDefinition, TokenType, TokenVocabulary } from 'chevrotain';

const REGULAR = 'regular_mode';
const TITLE = 'title_mode';
const EVENT = 'event_mode';

export class ZenTokenBuilder extends DefaultTokenBuilder {
  override buildTokens(grammar: Grammar, options?: TokenBuilderOptions): TokenVocabulary {
    const tokens = super.buildTokens(grammar, options);
    if (!Array.isArray(tokens)) throw new Error('expected TokenType[]');

    const byName = new Map(tokens.map(t => [t.name, t]));
    const get = (n: string): TokenType => {
      const t = byName.get(n);
      if (!t) throw new Error(`token ${n} not found`);
      return t;
    };

    // 'title' keyword pushes TITLE mode; TITLE_CONTENT's trailing NEWLINE pops it.
    get('title').PUSH_MODE = TITLE;
    get('TITLE_EOL').POP_MODE = true;        // terminal TITLE_EOL: /\r?\n/; (declared in grammar)
    get('COLON').PUSH_MODE = EVENT;          // ':' keyword token
    get('EVENT_EOL').POP_MODE = true;

    const regular = tokens.filter(t => !['TITLE_CONTENT', 'TITLE_EOL', 'EVENT_PAYLOAD', 'EVENT_EOL'].includes(t.name));

    const def: IMultiModeLexerDefinition = {
      modes: {
        [REGULAR]: regular,
        [TITLE]:  [get('TITLE_EOL'), get('TITLE_CONTENT')],
        [EVENT]:  [get('EVENT_EOL'), get('EVENT_PAYLOAD')],
      },
      defaultMode: REGULAR,
    };
    return def;
  }
}
```

Wired up via the language module (see §5). The mode-only terminals
(`TITLE_CONTENT: /[^\r\n]+/;` etc.) still must be *declared* in the `.langium` grammar
so they exist as token types and can be referenced by parser rules; the multi-mode
definition controls *when* they are active. Caveats found in the wild:

- Chevrotain validates multi-mode definitions strictly; e.g. *"A MultiMode Lexer
  cannot be initialized with a longer_alt on token outside of mode"* — when moving
  keyword tokens between modes you may need to prune `LONGER_ALT` references that
  point across modes (discussion
  [#1411](https://github.com/eclipse-langium/langium/discussions/1411)).
- Chevrotain has no on-the-fly token mutation; modes are static sets. Anything truly
  dynamic must use a Chevrotain **custom pattern function**
  (`PATTERN: (text, offset, tokens, groups) => ...`), which `DefaultTokenBuilder.
  buildTerminalToken` already produces for regexes with unsupported flags — we can
  hand-assign custom patterns in the TokenBuilder too. This is the replacement for
  ANTLR **semantic predicates**: e.g. `DIVIDER` "column === 0" becomes a custom
  pattern that checks `offset === 0 || text[offset - 1] === '\n'`, and the
  `isTitle()` predicate becomes a custom pattern on the `title` keyword token.

```ts
// Replacing {this.column === 0}? on DIVIDER with a Chevrotain custom pattern:
const divider = get('DIVIDER');
const dividerRe = /==[^\r\n]*/y;
divider.PATTERN = (text: string, offset: number) => {
  // only match at start of line (ANTLR: this.column === 0)
  if (offset !== 0 && text[offset - 1] !== '\n' && text[offset - 1] !== '\r') return null;
  dividerRe.lastIndex = offset;
  return dividerRe.exec(text);
};
divider.LINE_BREAKS = false;
```

### 2.3 ANTLR channels → Langium

There is no channel concept. The mapping:

| ANTLR channel use (ours) | Langium equivalent |
|---|---|
| `WS -> channel(HIDDEN)` | `hidden terminal WS: /[ \t]+/;` |
| `'// ...' -> channel(COMMENT_CHANNEL)` then `getHiddenTokensToLeft` | `hidden terminal SL_COMMENT: ...` + `CstUtils.findCommentNode` / hidden-CST scan (§1.3) |
| `'await' -> channel(MODIFIER_CHANNEL)` (modifiers parsed out-of-band) | Make modifiers part of the parser grammar (preferred — they become typed AST properties), or hidden terminals recovered from the CST like comments |

Chevrotain token `GROUP`s (the rough analogue of channels — `DefaultTokenBuilder`
sets `GROUP: 'hidden'` for hidden terminals) could emulate extra channels, but tokens
in a custom group are *not* added to the CST by Langium, so hidden terminals + CST
scanning is the supported route.

---

## 3. Error Recovery — Partial ASTs Are the Default

Langium parses with Chevrotain's ANTLR-style error recovery **enabled by default**.
Verified in `packages/langium/src/parser/langium-parser.ts`:

```ts
// langium source:
const defaultConfig: IParserConfig = {
    recoveryEnabled: true,
    nodeLocationTracking: 'full',
    skipValidations: true,
    errorMessageProvider: new LangiumParserErrorMessageProvider()
};
```

Behavior with incomplete/broken input:

- `LangiumParser.parse(text)` **never throws** for user input errors. It returns
  `ParseResult` with whatever AST could be built plus the error lists:

  ```ts
  export type ParseResult<T = AstNode> = {
      value: T,                              // partial AST — populated even on errors
      parserErrors: IRecognitionException[], // Chevrotain recognition exceptions
      lexerErrors: ILexingError[],
      lexerReport?: LexingReport
  }
  ```

- **Lexer tolerance**: Chevrotain's lexer skips unexpected characters, records an
  `ILexingError` (offset/line/column/length/message), and keeps tokenizing. No lexer
  error ever aborts the parse.
- **Parser tolerance**: Chevrotain implements single-token insertion/deletion and
  "re-sync" recovery (skipping tokens until a following-set token). Statement-list
  grammars like ours recover especially well: a broken statement is abandoned and
  parsing re-syncs at the next statement. Recovered-over regions simply produce AST
  nodes with missing properties (Langium's `assignMandatoryProperties` fills mandatory
  arrays with `[]` and booleans with `false`, so the AST shape stays navigable).
- This is exactly what the LSP mode relies on — every keystroke in a Langium editor
  reparses a broken document and still produces an AST for validation/highlighting.

How to maximize tolerance for our renderer-while-typing use case:

1. Keep `recoveryEnabled: true` (default — do not override it away).
2. Shape the grammar as `entry Root: (statements+=Statement)*;` with line-ish
   statement boundaries (NEWLINE-terminated rules give Chevrotain clean re-sync
   points). Our current ANTLR grammar is already statement-oriented.
3. Make trailing parts optional in the grammar (`(':' label=EventText)?` etc.) so
   half-typed lines parse without recovery at all — recovery is the fallback, not
   the primary tolerance mechanism. Our ANTLR grammar already does this aggressively
   (e.g. optional closing braces); the same idioms port directly.
4. Custom recovery is limited — Chevrotain exposes `recoveryEnabled` as a boolean,
   not a strategy interface (Langium issue #1742 tracks better customization). If a
   specific construct recovers badly, the fix is grammar-level (more optionality),
   not hook-level.
5. Error messages are customizable via the `ParserErrorMessageProvider` service
   (override in the module, see discussion
   [#1894](https://github.com/eclipse-langium/langium/discussions/1894)).

Note: Chevrotain CSTs mark recovered nodes with `recoveredNode`; Langium builds its
own CST and does not surface that flag — use `parserErrors[i].token` /
`.resyncedTokens` to locate damaged regions if we need to render "error markers".

---

## 4. Synchronous Parsing Outside the LSP

`LangiumParser.parse` is **fully synchronous** — verified signature from
`langium-parser.ts`:

```ts
parse<T extends AstNode = AstNode>(input: string, options: ParserOptions = {}): ParseResult<T>
// ParserOptions = { rule?: string }  — parse starting from any named rule, not just entry
```

The async machinery (`DocumentBuilder`, workspace, indexing, linking of
cross-references) is only needed for LSP/workspace scenarios. For a
text-in/AST-out library like ours, you create the services once and call
`parse()` synchronously per render. The only async step Langium imposes is *module
initialization* if you choose to lazy-load the language chunk (mermaid does; see
their `parse.ts` in §9.3 — `parser.parse<T>(text)` itself is sync).

Minimal browser-safe setup (no filesystem, no LSP), exactly mirroring mermaid's
generated-module wiring:

```ts
// src/parser-langium/zen-module.ts
import {
  EmptyFileSystem, createDefaultCoreModule, createDefaultSharedCoreModule, inject,
  type DefaultSharedCoreModuleContext, type LangiumCoreServices,
  type LangiumSharedCoreServices, type Module, type PartialLangiumCoreServices,
} from 'langium';
import { ZenSequenceGeneratedModule, ZenGeneratedSharedModule } from './generated/module.js';
import { ZenTokenBuilder } from './zen-token-builder.js';

interface ZenAddedServices {
  parser: { TokenBuilder: ZenTokenBuilder };
}
export type ZenServices = LangiumCoreServices & ZenAddedServices;

export const ZenModule: Module<ZenServices, PartialLangiumCoreServices & ZenAddedServices> = {
  parser: {
    TokenBuilder: () => new ZenTokenBuilder(),
    // ValueConverter, ParserErrorMessageProvider, etc. override here too
  },
};

export function createZenServices(context: DefaultSharedCoreModuleContext = EmptyFileSystem) {
  const shared: LangiumSharedCoreServices = inject(
    createDefaultSharedCoreModule(context), ZenGeneratedSharedModule);
  const Zen: ZenServices = inject(
    createDefaultCoreModule({ shared }), ZenSequenceGeneratedModule, ZenModule);
  shared.ServiceRegistry.register(Zen);
  return { shared, Zen };
}
```

```ts
// src/parser-langium/parse.ts — synchronous facade for the renderer
import type { ParseResult } from 'langium';
import { createZenServices } from './zen-module.js';
import type { SequenceDiagram } from './generated/ast.js';

const parser = createZenServices().Zen.parser.LangiumParser;  // build once (~ms)

export function parseZen(code: string): ParseResult<SequenceDiagram> {
  return parser.parse<SequenceDiagram>(code);   // SYNC — returns partial AST on errors
}
```

Key API notes:

- `createDefaultCoreModule` / `createDefaultSharedCoreModule` (from plain `langium`)
  are the non-LSP service modules. The LSP variants (`createDefaultModule`,
  `createDefaultSharedModule`) live in `langium/lsp` — **don't import them** and the
  bundler never sees `vscode-languageserver`. (There is no function literally named
  `createLangiumServices`; the generated scaffold names it `create<ProjectName>Services`.)
- `EmptyFileSystem` is the stock no-op `FileSystemProvider` for browsers.
- There is also `createServicesForGrammar({ grammar: '...' })` (in
  `langium/grammar`) which builds services from a grammar *string* at runtime —
  useful for prototyping/tests, not for production (slower startup, ships the whole
  grammar-language infrastructure).
- Cross-references: if the grammar uses `[Participant]` reference syntax, references
  are lazily linked; for parser-only use you can read `ref.$refText` synchronously
  without running the linker. Our DSL doesn't need cross-references for v1 — plain
  `ID` properties match how the ANTLR layer works today.

---

## 5. CST Access — Offsets, Ranges, Parents, Hidden Tokens

The CST is always built (no opt-in needed; `nodeLocationTracking: 'full'` is the
Langium default). Interfaces from `packages/langium/src/syntax-tree.ts`:

```ts
interface CstNode extends DocumentSegment {
  readonly container?: CompositeCstNode;  // parent link
  readonly grammarSource?: AbstractElement; // grammar element that parsed this node
  readonly root: RootCstNode;
  readonly astNode: AstNode;              // owning AST node (walks up if needed)
  readonly hidden: boolean;               // true for comment/whitespace tokens
  readonly text: string;                  // exact source text of this node
  // from DocumentSegment:
  readonly offset: number;                // 0-based start offset
  readonly end: number;                   // end offset (exclusive)
  readonly length: number;
  readonly range: Range;                  // LSP {start/end: {line, character}}
}
interface CompositeCstNode extends CstNode { content: CstNode[]; }
interface LeafCstNode extends CstNode { tokenType: TokenType; }
interface RootCstNode extends CompositeCstNode { fullText: string; } // entire input incl. hidden
```

AST↔CST: every AST node has `$cstNode` (its full text range), `$container`,
`$containerProperty`, `$type`; `GrammarUtils.findNodeForProperty(astNode.$cstNode,
'name')` finds the CST node of a specific assigned property (for precise
underline/click-target ranges).

`CstUtils` (from `'langium'`) — full verified inventory:

- `streamCst(node)` / `flattenCst(node)` — all nodes / all leaves (incl. hidden).
- `findLeafNodeAtOffset(node, offset)` / `findLeafNodeBeforeOffset(node, offset)`.
- `tokenToRange(token)`, `toDocumentSegment(node)`, `compareRange`, `inRange`.
- `findCommentNode(cstNode, commentNames)` — comment directly preceding a node.
- `isCommentNode(cstNode, commentNames)`.
- `getPreviousNode(node, hidden=true)` / `getNextNode(node, hidden=true)` — sibling
  traversal with hidden tokens included or skipped.
- `getStartlineNode(node)` — leftmost node on the same line.
- `getInteriorNodes(start, end)`.

This combination covers everything our current `MessageContext`/comment-attachment
code does with ANTLR token indices (`getHiddenTokensToLeft`), usually more simply:
hidden comment tokens are *physically in* `CompositeCstNode.content` in document
order (see §1.3 for the `addHiddenNodes` evidence), so "comments above this
statement" is `getPreviousNode(stmt.$cstNode, true)` repeated while `hidden`.

---

## 6. Bundle Size — Measured

Measured locally on 2026-06-11 (esbuild/npm-pack, gzip -6):

| Artifact | Minified | Min+gzip |
|---|---|---|
| `antlr4@4.11.0` runtime, esbuild ESM bundle of `src/antlr4/index.js` (what Vite bundles for us today) | 108 KB | **28 KB** |
| Langium+Chevrotain shared chunk inside `@mermaid-js/parser@1.1.1` `dist/chunks/mermaid-parser.esm.min/` (their real-world browser bundle of langium core) | 596 KB | **143 KB** |
| Per-diagram chunk in the same package (grammar data + module + AST helpers, e.g. pie) | ~1–8 KB each | ~0.5–2 KB |
| npm unpacked size, for reference | `antlr4` 448 KB | `langium` 3.88 MB |

Conclusions:

- Expect roughly **+115 KB gzipped** over the current antlr4 runtime (≈143 KB vs
  28 KB) for the langium core, *after* tree-shaking — mermaid's shipping bundle is
  the best available proof of the post-shake floor. The grammar itself adds little
  (generated module is serialized JSON + small TS).
- On the other side of the ledger we delete `src/generated-parser/` (the ANTLR
  generated lexer/parser JS, which is large and un-shakeable) — measure ours before
  quoting a net number.
- Mermaid mitigates cost by **lazy-loading** each language module via dynamic
  `import()` (one shared langium chunk + tiny per-language chunks). We can do the
  same: load the parser chunk on first render.
- Importing only from `langium` (never `langium/lsp`) keeps `vscode-languageserver`
  out of the bundle; `vscode-uri`/`vscode-languageserver-types` are small and do get
  included.

---

## 7. Build-Time Generation — langium-cli with Vite/Bun

`langium generate` does **not** generate a parser. It generates TypeScript *data and
type* modules from the `.langium` grammar:

- `generated/ast.ts` — typed AST interfaces, `$type` constants, type guards, reflection.
- `generated/grammar.ts` — the grammar serialized as data (loaded at runtime to
  construct the Chevrotain parser).
- `generated/module.ts` — `<Lang>GeneratedModule` + `<Project>GeneratedSharedModule`
  for DI.

The actual Chevrotain parser is assembled **at runtime** from `grammar.ts` when
`createZenServices()` first touches `parser.LangiumParser` (milliseconds; mermaid
does it lazily per diagram type). No Java anywhere — `bun antlr` and the Java
toolchain requirement disappear.

`langium-config.json` (ours, modeled on mermaid's):

```json
{
  "projectName": "Zen",
  "languages": [{
    "id": "zen-sequence",
    "grammar": "src/parser-langium/zen-sequence.langium",
    "fileExtensions": [".zen"]
  }],
  "mode": "production",
  "importExtension": ".js",
  "out": "src/parser-langium/generated",
  "chevrotainParserConfig": {
    "recoveryEnabled": true,
    "maxLookahead": 3
  }
}
```

Notes:
- `"mode": "production"` strips dev-time checks; `LanguageMetaData.mode` also flips
  `skipValidations` in the parser wrapper (verified in `langium-parser.ts`).
- `chevrotainParserConfig` is optional (recovery is on by default); setting
  `maxLookahead` switches from the ALL(*) `LLStarLookaheadStrategy` to plain LL(k) —
  leave it unset unless ALL(*) lookahead shows up in profiles.
- `caseInsensitive: true` per language is available if needed.
- The CLI also can emit TextMate/Monarch syntax-highlighting files, railroad
  diagrams, and BNF (`textMate.out`, etc.) — free Monaco highlighting for the demo
  site.

Package scripts (mermaid's, adapted to Bun):

```jsonc
{
  "scripts": {
    "langium:generate": "langium generate",
    "langium:watch": "langium generate --watch",
    "dev": "bun langium:generate && vite",
    "build": "bun langium:generate && vite build --config vite.config.lib.ts"
  }
}
```

Vite integration is trivial because the output is plain TS committed-or-generated
into `src/` — no plugin required. (A community `vite-plugin-langium` exists but the
mermaid approach — run the CLI before vite, optionally `--watch` in dev — is simpler
and battle-tested.) Generated files should be gitignored and produced in CI the same
way `src/generated-parser/` is handled today, or committed — mermaid gitignores them
(`"clean": "rimraf dist src/language/generated"`).

---

## 8. Mermaid's Langium Setup — The Reference Architecture

Highly relevant: **this repo is the mermaid ZenUML plugin**, and mermaid already
migrated 15+ diagram types from Jison to Langium (rationale from
[mermaid#4401](https://github.com/mermaid-js/mermaid/issues/4401): jison unmaintained,
LSP support, cleaner syntax, fully typed AST). New mermaid diagrams **must** use
Langium; Jison grammars are deprecated. Everything below verified from
`mermaid-js/mermaid@develop` `packages/parser/`.

### 8.1 Package layout

```
packages/parser/
├── langium-config.json        # 15 languages, one grammar each, shared out dir
├── package.json               # langium ^4.2.4 (devDep — it is BUNDLED, not a runtime dep!)
│                              # runtime dep: only @chevrotain/types (types for public API)
├── scripts/                   # prepack build (esbuild → dist/*.mjs + chunks)
├── src/
│   ├── index.ts
│   ├── parse.ts               # public parse() facade (lazy per-language init)
│   └── language/
│       ├── common/            # shared grammar + services
│       │   ├── common.langium #   shared terminals: WHITESPACE, YAML, DIRECTIVE, comments…
│       │   ├── tokenBuilder.ts#   AbstractMermaidTokenBuilder
│       │   ├── valueConverter.ts, matcher.ts, index.ts
│       │   ├── (generated/ shared module output)
│       ├── pie/               # one folder per diagram language
│       │   ├── pie.langium    #   grammar (imports ../common/common)
│       │   ├── module.ts      #   createPieServices(EmptyFileSystem) + DI overrides
│       │   ├── tokenBuilder.ts, valueConverter.ts, index.ts
│       ├── gitGraph/ architecture/ packet/ radar/ treemap/ … (same shape)
│       └── index.ts
└── tests/
```

### 8.2 Their grammar patterns worth stealing (`common.langium`)

```langium
EOL returns string: NEWLINE+ | EOF;                  // datatype rule: "line end or EOF"

fragment TitleAndAccessibilities:
  ((accDescr=ACC_DESCR | accTitle=ACC_TITLE | title=TITLE) EOL)+;

terminal TITLE: /[\t ]*title(?:[\t ][^\n\r]*?(?=%%)|[\t ][^\n\r]*|)/;
terminal NEWLINE: /\r?\n/;
hidden terminal WHITESPACE: /[\t ]+/;                 // note: NOT \s+ — newlines are significant
hidden terminal YAML: /---[\t ]*\r?\n(?:[\S\s]*?\r?\n)?---(?:\r?\n|(?!\S))/;
hidden terminal SINGLE_LINE_COMMENT: /[\t ]*%%[^\n\r]*/;
```

Two patterns matter for us:

1. **Mode-avoidance via greedy terminals**: instead of a TITLE lexer mode, mermaid's
   `TITLE` terminal regex swallows the whole rest-of-line itself (with a lookahead to
   stop before `%%` comments). Our `title ...` and `:event payload` modes can often be
   replaced by exactly this trick — a single regex terminal anchored on the keyword —
   which is simpler than the multi-mode TokenBuilder of §2.2. The TokenBuilder route
   remains the fallback for cases regexes can't express. (Decision for the design
   phase: try keyword-anchored terminals first, multi-mode second.)
2. **Newlines are real tokens** (`NEWLINE`), only intra-line whitespace is hidden —
   our DSL is also line-oriented (`DIVIDER`, statement-per-line), same approach applies.

The semantic-predicate replacement they use: `AbstractMermaidTokenBuilder` overrides
`buildKeywordTokens` and rewrites keyword token regexes to require a non-word boundary
(`PATTERN + '(?:(?=%%)|(?!\\S))'`) — i.e., post-hoc token surgery in the TokenBuilder,
the same hook we'd use for our `isTitle()`/column-0 predicates (§2.2).

### 8.3 Their parse facade (`parse.ts`, abridged but verbatim logic)

```ts
const parsers: Record<string, LangiumParser> = {};
const initializers = {
  pie: async () => {
    const { createPieServices } = await import('./language/pie/index.js'); // lazy chunk
    parsers.pie = createPieServices().Pie.parser.LangiumParser;
  },
  // ... one per diagram
} as const;

export async function parse<T extends DiagramAST>(diagramType, text): Promise<T> {
  if (!parsers[diagramType]) await initializers[diagramType]();
  const result: ParseResult<T> = parsers[diagramType].parse<T>(text);  // ← sync call
  if (result.lexerErrors.length > 0 || result.parserErrors.length > 0) {
    throw new MermaidParseError(result);   // they choose strictness; we'd keep the partial AST
  }
  return result.value;
}
```

Note mermaid throws on any error (batch-render philosophy); for our live-editing
renderer we instead *keep* `result.value` and render the partial diagram (§3).

### 8.4 Packaging detail that matters for us

`@mermaid-js/parser` declares `langium` as a **devDependency** and bundles it into
`dist/mermaid-parser.core.mjs` + shared chunks via esbuild, exposing zero langium API.
Since `@zenuml/core` is itself bundled by Vite into ESM/UMD artifacts, we should do
the same: `langium` as a regular dependency in package.json is fine for the library
build (Vite bundles it into `dist/zenuml.js`/`.esm.mjs`), but nothing langium-typed
should leak into our public API.

---

## 9. Direct Answers (Checklist)

1. **Terminal rules / hidden terminals / datatype rules** — full support; comments are
   declared `hidden terminal` and their text **is retrievable post-parse** because
   hidden tokens are spliced into the CST (`addHiddenNodes`) and exposed via
   `CstNode.hidden`, `CstUtils.findCommentNode/isCommentNode/getPreviousNode(…, true)`,
   and the overridable `CommentProvider` service. §1.
2. **Lexer modes** — confirmed absent from the grammar language; the sanctioned escape
   hatch is overriding `DefaultTokenBuilder.buildTokens` to return a Chevrotain
   `IMultiModeLexerDefinition` (`PUSH_MODE`/`POP_MODE` on token types); Langium's own
   `IndentationAwareTokenBuilder` is the in-tree reference implementation. ANTLR
   semantic predicates map to Chevrotain custom pattern functions; channels map to
   hidden terminals + CST scanning. §2.
3. **Error recovery** — `recoveryEnabled: true` is Langium's hard default; `parse()`
   never throws and always returns a (possibly partial) AST in `result.value` next to
   `lexerErrors`/`parserErrors`. Maximize tolerance with statement-list grammar shape,
   optional trailing elements, and NEWLINE-delimited re-sync points. §3.
4. **Sync parsing outside LSP** — `services.Zen.parser.LangiumParser.parse(text)` is
   synchronous; create services once via generated `create<X>Services(EmptyFileSystem)`
   using `createDefaultCoreModule`/`createDefaultSharedCoreModule` from plain
   `langium` (never `langium/lsp` in the browser bundle). §4.
5. **CST access** — offsets/`end`/`length`/LSP `range` on every node, `container`
   parent links, `astNode` back-links, `$cstNode` forward links, `hidden` flag,
   `RootCstNode.fullText`, and a complete `CstUtils` toolkit. §5.
6. **Build-time generation** — `langium generate` (langium-cli 4.2.1) emits
   `ast.ts`/`grammar.ts`/`module.ts` TypeScript; parser is constructed at runtime from
   grammar data; integrate as a pre-step in Bun scripts (`bun langium:generate &&
   vite …`), `--watch` for dev; Java requirement disappears. §7.
7. **Versions/install** — `bun add langium@^4.2.4`, `bun add -d langium-cli@^4.2.1`. §0.
8. **Mermaid precedent** — 15 diagram languages on langium 4.2.x in
   `packages/parser`; shared `common.langium` terminals, per-language
   module/tokenBuilder/valueConverter, lazy per-language service init, langium bundled
   (devDep), throws-on-error facade. Strongest possible prior art since this repo is
   the mermaid ZenUML plugin. §8.

## 10. Migration Risks Specific to This Repo (preview for the design doc)

- **Bundle size**: ~+115 KB gz over antlr4 runtime (143 KB vs 28 KB, measured from
  mermaid's shipped bundle), partially offset by deleting `src/generated-parser/`.
- **Lexer modes + semantic predicates** (`TITLE_MODE`, `EVENT`, `{this.isTitle()}?`,
  `{this.column === 0}?` in `sequenceLexer.g4`): no grammar-level support; needs
  keyword-anchored regex terminals (mermaid's trick) and/or custom TokenBuilder with
  Chevrotain custom-pattern functions. This is the highest-effort, highest-risk area.
- **Channels** (`COMMENT_CHANNEL`, `MODIFIER_CHANNEL`): no equivalent; comments move
  to hidden terminals + CST scanning; modifiers (`const`/`readonly`/`static`/`await`)
  should be promoted into the parser grammar proper — a semantic change to how the
  downstream parser layer reads them.
- **ALL(*) vs ANTLR adaptive prediction**: Langium defaults to `chevrotain-allstar`;
  ambiguities our ANTLR grammar resolves silently may surface as Chevrotain
  ambiguity warnings needing grammar refactoring.
- **Error-recovery parity**: our renderer currently leans on ANTLR's error strategy
  for "render while typing"; Chevrotain recovery is good but different — the E2E
  visual-snapshot suite must gate the cutover.
- **Custom recovery hooks are limited** (boolean `recoveryEnabled` only; langium
  issue #1742) — any bespoke ANTLR `ErrorStrategy` behavior cannot be ported 1:1.

### Sources

- [langium on npm](https://www.npmjs.com/package/langium) · [langium-cli on npm](https://www.npmjs.com/package/langium-cli)
- [Langium grammar language reference](https://langium.org/docs/reference/grammar-language/)
- [Langium 4.0 release post (TypeFox)](https://www.typefox.io/blog/langium-release-4.0/) · [ALL(*) lookahead in Langium](https://www.typefox.io/blog/allstar-lookahead/)
- [eclipse-langium/langium](https://github.com/eclipse-langium/langium) source: `parser/langium-parser.ts`, `parser/lexer.ts`, `parser/token-builder.ts`, `parser/indentation-aware.ts`, `parser/cst-node-builder.ts`, `utils/cst-utils.ts`, `syntax-tree.ts`, `documentation/comment-provider.ts`
- Discussions: [#692 lexer modes](https://github.com/eclipse-langium/langium/discussions/692) · [#1411 longer_alt/multi-mode](https://github.com/eclipse-langium/langium/discussions/1411) · [#1894 parser error customization](https://github.com/eclipse-langium/langium/discussions/1894) · [#412 direct Chevrotain usage](https://github.com/eclipse-langium/langium/discussions/412)
- [mermaid#4401 — reimplement parser in langium](https://github.com/mermaid-js/mermaid/issues/4401) · [mermaid PR #4751 — pie langium parser](https://github.com/mermaid-js/mermaid/pull/4751) · [@mermaid-js/parser on npm](https://www.npmjs.com/package/@mermaid-js/parser)
- [mermaid-js/mermaid `packages/parser`](https://github.com/mermaid-js/mermaid/tree/develop/packages/parser): `langium-config.json`, `package.json`, `src/parse.ts`, `src/language/common/{common.langium,tokenBuilder.ts}`, `src/language/pie/{module.ts,pie.langium}`
- [Chevrotain lexer modes](https://chevrotain.io/docs/features/lexer_modes.html)
- Local measurements: `npm pack antlr4@4.11.0` + esbuild bundle; `npm pack @mermaid-js/parser@1.1.1` chunk sizes (gzip -6)
