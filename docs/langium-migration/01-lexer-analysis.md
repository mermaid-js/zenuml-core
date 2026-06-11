# Lexer Analysis: `sequenceLexer.g4` → Langium/Chevrotain Migration

Source of truth for the ANTLR4 → Langium lexer migration. Everything below was read
directly from:

- Grammar: `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/g4/sequenceLexer.g4` (254 lines)
- Generated lexer: `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/generated-parser/sequenceLexer.js`
- Channel consumer: `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/parser/index.js`
- Parser grammar (token usage cross-check): `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/g4/sequenceParser.g4`
- Divider consumer: `/Users/pengxiao/workspaces/zenuml/mmd-zenuml-core/.claude/worktrees/langium-migration/src/parser/Divider/DividerContext.ts`

Designers/implementers should NOT need to re-read the source after reading this doc.

---

## 1. Top-level structure of the lexer

```
lexer grammar sequenceLexer;
channels { COMMENT_CHANNEL, MODIFIER_CHANNEL }
@members { isTitle(), isNameStartAhead() }   // JS semantic-predicate helpers
... default-mode rules ...
mode EVENT;        // entered via COL (':')
mode TITLE_MODE;   // entered via TITLE ('title' at start of doc)
```

### 1.1 Channels (from generated `sequenceLexer.js`)

| Index | Channel name            | Tokens routed there                          |
|-------|-------------------------|----------------------------------------------|
| 0     | `DEFAULT_TOKEN_CHANNEL` | everything else                              |
| 1     | `HIDDEN`                | `WS`, `CR`                                   |
| 2     | `COMMENT_CHANNEL`       | `COMMENT`                                    |
| 3     | `MODIFIER_CHANNEL`      | `CONSTANT`, `READONLY`, `STATIC`, `AWAIT`    |

Generated constants: `sequenceLexer.COMMENT_CHANNEL = 2`, `sequenceLexer.MODIFIER_CHANNEL = 3`.

### 1.2 Modes (from generated `sequenceLexer.js`)

`modeNames = [ "DEFAULT_MODE", "EVENT", "TITLE_MODE" ]`, with constants
`sequenceLexer.EVENT = 1`, `sequenceLexer.TITLE_MODE = 2`.

Mode transitions:

| Trigger token | Action            | Mode entered | Exit token  | Exit action |
|---------------|-------------------|--------------|-------------|-------------|
| `COL` (`:`)   | `pushMode(EVENT)` | `EVENT`      | `EVENT_END` (`[\r\n]`) | `popMode` |
| `TITLE` (`title`, predicated) | `pushMode(TITLE_MODE)` | `TITLE_MODE` | `TITLE_END` (`[\r\n]`) | `popMode` |

Note: if the file ends while inside `EVENT`/`TITLE_MODE` (no trailing newline), the
mode is never popped — the parser grammar therefore makes `EVENT_END` and `TITLE_END`
optional (`messageBody: ... asyncMessage EVENT_END?`, `title: TITLE TITLE_CONTENT? TITLE_END?`).

### 1.3 Token type numbering (generated)

75 token types, 1..75 in this order (needed if anything compares token type ints):
`WS=1, CONSTANT=2, READONLY=3, STATIC=4, AWAIT=5, TITLE=6, COL=7, SOPEN=8, SCLOSE=9,
RETURN_ARROW=10, ARROW=11, COLOR=12, LBRACKET=13, RBRACKET=14, OR=15, AND=16, EQ=17,
NEQ=18, GT=19, LT=20, GTEQ=21, LTEQ=22, PLUS=23, MINUS=24, MULT=25, DIV=26, MOD=27,
POW=28, NOT=29, SCOL=30, COMMA=31, ASSIGN=32, OPAR=33, CPAR=34, OBRACE=35, CBRACE=36,
TRUE=37, FALSE=38, NIL=39, IF=40, ELSE=41, WHILE=42, RETURN=43, NEW=44, PAR=45,
GROUP=46, OPT=47, CRITICAL=48, SECTION=49, REF=50, AS=51, TRY=52, CATCH=53, FINALLY=54,
IN=55, STARTER_LXR=56, ANNOTATION_RET=57, ANNOTATION=58, DOT=59, ID=60, INT=61,
FLOAT=62, MONEY=63, NUMBER_UNIT=64, DIGIT_LEADING_NAME=65, CSTRING=66, USTRING=67,
CR=68, COMMENT=69, OTHER=70, DIVIDER=71, EVENT_PAYLOAD_LXR=72, EVENT_END=73,
TITLE_CONTENT=74, TITLE_END=75`.

---

## 2. Semantic predicates and embedded actions (`@members`)

These are the single biggest migration problem — ANTLR semantic predicates have no
Langium-grammar equivalent and must become Chevrotain custom token patterns.

### 2.1 `isTitle()` — gates the `TITLE` token

```
TITLE : {this.isTitle()}? 'title' -> pushMode(TITLE_MODE) ;
```

Exact behavior of `isTitle()` (lines 10–30 of the .g4, duplicated verbatim into the
generated lexer constructor):

1. Take all input text *before* the current token start (`_input.getText(0, currentPos-1)`).
2. Strip line comments with `replace(/\/\/[^\n]*(?:\n|$)/g, '')`, then `trim()`.
3. If anything non-empty remains → NOT a title (so `title` must be the first
   meaningful word of the document; only whitespace, newlines and `//` comments may
   precede it).
4. Look ahead starting at offset 6 (1-based `LA`; i.e., the char right after the
   5-char keyword `title`), skip spaces (32) and tabs (9).
5. It IS a title iff the next significant char is EOF or is **not** one of
   `.` (46), `=` (61), `(` (40).

Rationale (comment in grammar): `title` must be at the beginning, and `title.method()`,
`title = x`, `title(...)` must still lex as plain `ID` so a participant/variable can be
named "title".

Note `titles`, `titleX` etc. never hit this predicate problem in ANTLR because `ID`
matches longer and maximal munch prefers it. (In Chevrotain this needs `longer_alt`,
see §6.)

### 2.2 `isNameStartAhead()` — gates the second `FLOAT` alternative

```
FLOAT
 : DIGIT+ '.' DIGIT*
 | '.' DIGIT+ {!this.isNameStartAhead()}?
 ;
```

`isNameStartAhead()` returns true if the next char (LA(1)) exists and matches
`/[\p{L}_]/u`. So `.5` is a FLOAT only when NOT immediately followed by a letter or
underscore — `.5abc` must not lex as `FLOAT(".5") ID("abc")`; instead `.` lexes as
`DOT` and `5abc` as `DIGIT_LEADING_NAME` (member access on a digit-leading name).
This is a trailing-context (negative lookahead) predicate.

### 2.3 `this.column === 0` — gates `DIVIDER`

```
DIVIDER: {this.column === 0}? HWS* '==' ~[\r\n]*;
```

A divider line (`== some text ==`) is only recognized when the token starts at
**column 0** (start of a line). Mid-line `==` lexes as `EQ`. The grammar comment cites
https://stackoverflow.com/a/74752939/529187 and explains: divider notes can contain
arbitrary characters, so they must be captured wholesale by the lexer, not parsed.
`DIVIDER` consumes optional leading horizontal whitespace, then `==`, then everything
up to (not including) the newline. The parser uses it directly
(`divider : DIVIDER`, sequenceParser.g4 line ~100) and
`DividerContext.prototype.Note()` strips leading/trailing `=` characters from the
formatted text.

Although DIVIDER is declared *last* in the grammar (after `OTHER`), ANTLR's
longest-match rule means it wins at column 0 against `WS`/`EQ`/`OTHER` because it
matches the whole line.

---

## 3. Complete rule inventory — DEFAULT_MODE

Legend: channel ∅ = default channel (visible to parser). "Used by parser?" is from
grepping `sequenceParser.g4`.

### 3.1 Fragments (not tokens; inlined)

| Fragment | Pattern | Notes |
|----------|---------|-------|
| `HWS` | `[ \t]` | horizontal whitespace |
| `HEX` | `[0-9a-fA-F]` | |
| `DIGIT` | `[0-9]` | ASCII digits only (NOT `\p{Nd}`) |
| `KNOWN_UNIT` | `TIME_UNIT \| SIZE_UNIT \| LENGTH_UNIT \| MASS_UNIT` | |
| `TIME_UNIT` | `'milliseconds'\|'millisecond'\|'ms'\|'seconds'\|'second'\|'secs'\|'sec'\|'s'\|'minutes'\|'minute'\|'mins'\|'min'\|'hours'\|'hour'\|'hrs'\|'hr'\|'h'\|'days'\|'day'\|'d'\|'weeks'\|'week'\|'w'` | |
| `SIZE_UNIT` | `'KiB'\|'MiB'\|'GiB'\|'TiB'\|'KB'\|'MB'\|'GB'\|'TB'\|'kb'\|'mb'\|'gb'\|'tb'\|'B'` | mixed-case exact spellings; e.g. `Kb` is NOT a unit |
| `LENGTH_UNIT` | `'rem'\|'em'\|'px'\|'mm'\|'cm'\|'km'\|'m'` | |
| `MASS_UNIT` | `'mg'\|'kg'\|'g'` | |

### 3.2 Whitespace / hidden

| Token | Pattern | Channel | Used by parser? |
|-------|---------|---------|-----------------|
| `WS` | `HWS+` (i.e. `[ \t]+`) | HIDDEN | no |
| `CR` | `[\r\n]` (single char per token) | HIDDEN | no |

Newlines are *hidden* in DEFAULT_MODE but are *significant* (default channel) inside
EVENT/TITLE_MODE (`EVENT_END`, `TITLE_END`). This asymmetry is core to the design.

### 3.3 Modifier keywords (MODIFIER_CHANNEL)

| Token | Pattern | Channel |
|-------|---------|---------|
| `CONSTANT` | `'const'` | MODIFIER_CHANNEL |
| `READONLY` | `'readonly'` | MODIFIER_CHANNEL |
| `STATIC` | `'static'` | MODIFIER_CHANNEL |
| `AWAIT` | `'await'` | MODIFIER_CHANNEL |

**Crucial finding:** grepping all of `src/` (excluding `generated-parser/`), NOTHING
ever reads MODIFIER_CHANNEL. `src/parser/index.js` only reads COMMENT_CHANNEL. So the
*only* observable effect of these four rules is to **delete those words from the
default token stream** while keeping them in the original text. E.g.
`await a.method()` parses exactly like `a.method()`, but `getFormattedText()`
(which calls `tokenStream.getText(sourceInterval)` — an *input-text* based API that
includes all channels) still returns text containing `await`. Migration can treat
these as hidden terminals, with one caveat: hidden-token text must still be part of
the CST text used to rebuild labels (Langium's `$cstNode.text` is offset-based over
the original document, so it includes hidden tokens — equivalent behavior).

Word-boundary caveat: in ANTLR, `constant`, `awaits`, `statics` lex as `ID` (longer
match). A naive Chevrotain `/const/` pattern would steal the prefix — needs
`longer_alt` (§6).

### 3.4 Mode-entering tokens

| Token | Pattern | Action | Channel |
|-------|---------|--------|---------|
| `TITLE` | `{isTitle()}? 'title'` | `pushMode(TITLE_MODE)` | ∅ |
| `COL` | `':'` | `pushMode(EVENT)` | ∅ |

`COL` means **every** `:` in DEFAULT_MODE flips the lexer into EVENT mode and the rest
of the line becomes one opaque `EVENT_PAYLOAD_LXR` token. This is how message labels
(`A->B: any text here (){}<>"`) swallow arbitrary content.

### 3.5 Operators and punctuation

| Token | Pattern | Token | Pattern |
|-------|---------|-------|---------|
| `SOPEN` | `'<<'` | `SCLOSE` | `'>>'` |
| `RETURN_ARROW` | `'-->'` | `ARROW` | `'->'` |
| `LBRACKET` | `'['` | `RBRACKET` | `']'` |
| `OR` | `'\|\|'` | `AND` | `'&&'` |
| `EQ` | `'=='` | `NEQ` | `'!='` |
| `GT` | `'>'` | `LT` | `'<'` |
| `GTEQ` | `'>='` | `LTEQ` | `'<='` |
| `PLUS` | `'+'` | `MINUS` | `'-'` |
| `MULT` | `'*'` | `DIV` | `'/'` |
| `MOD` | `'%'` | `POW` | `'^'` |
| `NOT` | `'!'` | `SCOL` | `';'` |
| `COMMA` | `','` | `ASSIGN` | `'='` |
| `OPAR` | `'('` | `CPAR` | `')'` |
| `OBRACE` | `'{'` | `CBRACE` | `'}'` |
| `DOT` | `'.'` | | |

Maximal-munch resolves all prefix overlaps in ANTLR: `-->` > `->` > `-`;
`>>` > `>=` > `>`; `<<` > `<=` > `<`; `==` > `=`; `!=` > `!`; `||` over two `|`?
(single `|` is not a token at all — it lexes as `OTHER`); `&&` likewise (single `&`
→ `OTHER`). `//` is always `COMMENT`, so `DIV DIV` can never occur adjacently without
whitespace.

| Token | Pattern | Notes |
|-------|---------|-------|
| `COLOR` | `'#' HEX+` | e.g. `#FF0000`, `#0a0`; `#xyz` → `OTHER('#') ID('xyz')` |

### 3.6 Keywords (default channel)

All case-sensitive, single fixed spellings unless noted:

| Token | Pattern |
|-------|---------|
| `TRUE` | `'true'` |
| `FALSE` | `'false'` |
| `NIL` | `'nil' \| 'null'` |
| `IF` | `'if'` |
| `ELSE` | `'else'` |
| `WHILE` | `'while' \| 'for' \| 'foreach' \| 'forEach' \| 'loop'` (note mixed-case `forEach`) |
| `RETURN` | `'return'` |
| `NEW` | `'new'` |
| `PAR` | `'par'` |
| `GROUP` | `'group'` |
| `OPT` | `'opt'` |
| `CRITICAL` | `'critical'` |
| `SECTION` | `'section' \| 'frame'` |
| `REF` | `'ref'` |
| `AS` | `'as'` |
| `TRY` | `'try'` |
| `CATCH` | `'catch'` |
| `FINALLY` | `'finally'` |
| `IN` | `'in'` |

The grammar is **case-sensitive** throughout. There is no case-insensitivity option
anywhere; `If`, `TRUE`, `Loop` are plain `ID`s.

Several keyword tokens fold multiple surface keywords into one token type
(`NIL`, `WHILE`, `SECTION`). Langium handles this fine with terminal alternation, but
JS regex alternation is leftmost-first, so longer alternatives must come first
(`forEach|foreach|for`, not `for|foreach`), and `longer_alt` must point at `ID` so
`form`, `loops`, `nullable`, `framework`, `inbox`, `astronaut` keep lexing as `ID`.

### 3.7 Annotations

| Token | Pattern | Notes |
|-------|---------|-------|
| `STARTER_LXR` | `'@Starter' \| '@starter'` | exactly two case variants |
| `ANNOTATION_RET` | `'@Return' \| '@return' \| '@Reply' \| '@reply'` | exactly four variants |
| `ANNOTATION` | `'@' [a-zA-Z_0-9]*` | ASCII-only tail (not unicode); `'@'` alone is a valid ANNOTATION (tail is `*`) |

ANTLR resolution: `@Starter` matches both `STARTER_LXR` and `ANNOTATION` at equal
length → first-declared (`STARTER_LXR`) wins. `@Starters` matches `ANNOTATION` longer
(9 chars) → `ANNOTATION` wins. Migration must reproduce both behaviors (`longer_alt`
chain, §6).

### 3.8 Identifiers and numbers — the Unicode/Chinese support story

| Token | Pattern | Notes |
|-------|---------|-------|
| `ID` | `[\p{L}_] [\p{L}\p{Nd}_]*` | **Full Unicode**: any Unicode letter start (Chinese, Japanese, Korean, Greek, …), continued by Unicode letters, Unicode decimal digits (`\p{Nd}`), `_`. Grammar comment explicitly calls out CJK support. The generated ATN literally enumerates hundreds of codepoint ranges (visible in `sequenceLexer.js` serializedATN: `19968,40869`-style CJK ranges etc.). |
| `INT` | `DIGIT+` | ASCII digits only |
| `FLOAT` | `DIGIT+ '.' DIGIT*` \| `'.' DIGIT+ {!isNameStartAhead()}?` | `1.`, `1.5`, `.5` all FLOATs; `.5x` is NOT (predicate, §2.2) |
| `MONEY` | `'$' (INT \| FLOAT)` | `$100`, `$99.99`, `$.5`; bare `$` → `OTHER` |
| `NUMBER_UNIT` | `(DIGIT+ '.' DIGIT* \| '.' DIGIT+ \| DIGIT+) KNOWN_UNIT` | `300ms`, `1.5h`, `.5px`, `2KiB` |
| `DIGIT_LEADING_NAME` | `DIGIT+ [\p{L}] [\p{L}\p{Nd}_]*` | names that start with digits, e.g. `3DService`, `2fa`, `1号服务` (digit + Unicode letters). Used everywhere the parser accepts a name (`name : ID \| DIGIT_LEADING_NAME \| CSTRING \| USTRING`). |

Interactions resolved by ANTLR maximal munch + declaration order (must be replicated):

- `3s` → both `NUMBER_UNIT` and `DIGIT_LEADING_NAME` match all 2 chars; `NUMBER_UNIT`
  is declared first → `NUMBER_UNIT`.
- `3sx` → `DIGIT_LEADING_NAME` (3 chars) beats `NUMBER_UNIT` (`3s`, 2 chars).
- `3秒` → `DIGIT_LEADING_NAME` (KNOWN_UNIT is ASCII-only).
- `123` → `INT` (NUMBER_UNIT requires a unit).
- `1.5ms` → `NUMBER_UNIT` (its first alt covers the dot) beats `FLOAT`(`1.5`).
- Underscore: `DIGIT_LEADING_NAME` requires a *letter* right after the digits — `1_x`
  is `INT(1)` + `ID(_x)`.

### 3.9 Strings

```
CSTRING : '"' ( '""' | ~["\r\n] )* '"' ;   // closed string
USTRING : '"' ( '""' | ~["\r\n] )* ;        // unclosed (to EOL/EOF)
```

- Escape mechanism is **doubled quotes** (`""`), not backslash.
- Strings cannot span lines (`~["\r\n]`).
- `USTRING` exists deliberately for **editor tolerance**: while the user is typing
  `"abc`, the lexer yields `USTRING` instead of failing or swallowing the newline,
  keeping incremental states parseable. The grammar comment (lines 205–212) states
  that `CSTRING` is declared before `USTRING` so the closed (longer) form is preferred.
  The parser treats them interchangeably (`name`, `stringAtom`, `parameters` all accept
  `CSTRING | USTRING`).
- ANTLR resolution is by longest match: for `"abc"` CSTRING matches 5 chars, USTRING
  matches 4 → CSTRING. For `"abc""def"` the inner `""` is consumed by both; CSTRING
  matches the full 10 chars. Tricky case `"abc""` (odd quotes): CSTRING can match
  `"abc"` … actually CSTRING matches `"abc""`? No — `""` pair then needs a final `"`;
  longest CSTRING match is `"abc"` (5); USTRING matches all 6 (`"abc` + `""`) →
  USTRING wins by length. Chevrotain regex with greedy quantifiers reproduces this
  if USTRING is ordered after CSTRING and both use sticky anchored greedy patterns —
  must be verified with unit tests for odd-quote-count inputs.

### 3.10 Comments and the catch-all

| Token | Pattern | Channel | Notes |
|-------|---------|---------|-------|
| `COMMENT` | `'//' ~[\r\n]*` | COMMENT_CHANNEL | line comments only; no block comments exist |
| `OTHER` | `.` (any single char) | ∅ (default!) | lexer-level error tolerance: ANY character the other rules can't start a match with becomes a 1-char `OTHER` token on the **default channel** |

`OTHER` is never referenced by any parser rule. Its purpose: the lexer never emits a
token-recognition error; garbage characters flow to the parser as `OTHER` tokens and
surface as parser syntax errors (collected by `SeqErrorListener` in
`src/parser/index.js`), which the renderer tolerates. Examples of `OTHER`-producing
chars: `?`, `|` (single), `&` (single), `$` (bare), `~`, backtick, emoji-symbols that
are not `\p{L}`.

**COMMENT consumption** (`src/parser/index.js:52-67`): `getComment()` walks
`getHiddenTokensToLeft(tokenIndex, COMMENT_CHANNEL)` for the first token of a
statement context (or the `stop` token for `BraceBlockContext`), strips the leading
`//` from each token text, and joins with `\n`. Comments drive rendered
annotations/styling above messages (the "most flexible" user content per the inline
comment). Any migration MUST keep per-statement leading-comment retrieval working.

### 3.11 DIVIDER

Covered in §2.3. On the default channel; consumed by parser rule `divider : DIVIDER`.

---

## 4. Rule inventory — EVENT mode

| Token | Pattern | Action | Channel |
|-------|---------|--------|---------|
| `EVENT_PAYLOAD_LXR` | `~[\r\n]+` | — | ∅ |
| `EVENT_END` | `[\r\n]` | `popMode` | ∅ |

After a `:`, the ENTIRE rest of the line — including spaces, quotes, operators,
keywords, comments (`//` is NOT a comment here!) — becomes one `EVENT_PAYLOAD_LXR`
token. Parser: `content : EVENT_PAYLOAD_LXR` (line ~218) and `EVENT_END?` terminates
`messageBody`/`asyncMessage` statements. Leading spaces after `:` are part of the
payload (no WS rule in this mode); `getFormattedText()`'s `formatText` cleanup handles
trimming downstream.

## 5. Rule inventory — TITLE_MODE

| Token | Pattern | Action | Channel |
|-------|---------|--------|---------|
| `TITLE_CONTENT` | `~[\r\n]+` | — | ∅ |
| `TITLE_END` | `[\r\n]` | `popMode` | ∅ |

Identical shape to EVENT mode. Note the char right after `title` (typically a space)
is included in `TITLE_CONTENT` since TITLE_MODE has no WS rule.

---

## 6. ANTLR semantics that Chevrotain/Langium does NOT share (global gotchas)

These apply across many rules and must be designed for once, centrally:

1. **Maximal munch vs. first-match.** ANTLR always picks the longest match over ALL
   rules (rule order only breaks ties). Chevrotain (Langium's lexer engine) walks the
   token list in order and takes the FIRST pattern that matches — length is irrelevant
   unless `longer_alt` is configured. Consequences:
   - Every keyword-like token (`const`, `for`, `nil`, `@Starter`, units…) needs
     `longer_alt: ID` (or `longer_alt: [ID, DIGIT_LEADING_NAME]`/chains) or an
     explicit negative lookahead `(?![\p{L}\p{Nd}_])` baked into the regex.
   - Token order must encode prefix relationships: `RETURN_ARROW` before `ARROW`
     before `MINUS`; `SCLOSE`/`GTEQ` before `GT`; `SOPEN`/`LTEQ` before `LT`; `EQ`
     before `ASSIGN`; `NEQ` before `NOT`; `OR`/`AND` before any future `|`/`&`;
     `CSTRING` before `USTRING`; `NUMBER_UNIT` before `FLOAT`/`INT`;
     `DIGIT_LEADING_NAME` ordering per §3.8; `STARTER_LXR`/`ANNOTATION_RET` before
     `ANNOTATION`; `COMMENT` before `DIV`; `FLOAT` before `DOT`/`INT`; `COLOR` before
     `MOD`-adjacent confusion is N/A but before `OTHER`.
   - Langium auto-generates `longer_alt` for *keywords declared in parser rules*, but
     most of these are **terminals with alternation** (`WHILE`, `NIL`, `SECTION`) or
     channel-routed (`AWAIT`), so do not rely on Langium's automatic keyword handling —
     verify the generated token order and override via a custom `TokenBuilder`.
2. **No channels.** Langium has only `hidden terminal` (Chevrotain `group: Lexer.SKIPPED`
   or a named group). Mapping in §7.
3. **No lexer modes in Langium grammar.** Chevrotain itself supports multi-mode
   lexers (`{ modes: {...}, defaultMode }`), but Langium's grammar language cannot
   express them; you must inject them via a custom `TokenBuilder`/`Lexer` service or
   avoid modes entirely (§7.2).
4. **No semantic predicates.** Replace with Chevrotain *custom token patterns*
   (functions `(text, startOffset, matchedTokens, groups) => RegExpExecArray|null`)
   (§7.3–7.5).
5. **Unicode property escapes** (`\p{L}`, `\p{Nd}`) are supported in JS RegExp with
   the `u` flag, and Chevrotain accepts them, but they defeat Chevrotain's first-char
   optimization. Expect the warning from `ensureOptimizations`; either accept the
   perf hit or provide `start_chars_hint` covering ASCII letters plus a `charCodes`
   sample, or use `Lexer` config `safeMode`. Given this branch is specifically about
   parser/renderer performance (HEAD: `perf: speed up parser and renderer`), benchmark
   lexing of CJK-heavy inputs before/after.
6. **Lexer never fails.** The `OTHER : .` catch-all means ANTLR tokenizes anything.
   Chevrotain reports lexer errors and *skips* unmatchable chunks by default. To
   replicate, declare a final `OTHER: /[\s\S]/` terminal ordered last. In Langium
   grammar: `terminal OTHER: /[\s\S]/;` — it must be referenced by some parser rule or
   Langium may prune/warn; alternatively add it in the custom TokenBuilder only.
   Decide explicitly whether parse-error UX should match ANTLR's (errors collected,
   partial tree still rendered — `rootContext()` returns the tree even with errors as
   long as `parser._syntaxErrors` is falsy… note it returns `null` when there are
   syntax errors counted before `prog()` runs; in practice errors are collected during
   `prog()`); Langium's parser does error recovery differently — flag for the parser
   analysis doc.

---

## 7. Hard cases and proposed Chevrotain solutions

### 7.1 Channels → hidden terminals + comment retrieval

| ANTLR | Langium/Chevrotain proposal |
|-------|------------------------------|
| `WS`, `CR` on HIDDEN | `hidden terminal WS: /[ \t]+/;` `hidden terminal CR: /\r|\n/;` — straightforward. |
| `COMMENT` on COMMENT_CHANNEL | `hidden terminal COMMENT: /\/\/[^\r\n]*/;` Langium keeps hidden tokens in the CST; implement the `getComment()` replacement with Langium's `CommentProvider` / `CstUtils.findCommentNode`, or walk `$cstNode` leading hidden tokens. Must support **multiple stacked comment lines** joined with `\n` and the `BraceBlockContext` special case (comment attaches to the *closing* token's left for brace blocks — i.e., trailing comments inside a block). Write parity tests against `getComment()` behavior before porting. |
| `CONSTANT/READONLY/STATIC/AWAIT` on MODIFIER_CHANNEL | Nothing reads this channel. Treat as hidden terminals so they vanish from the parser stream exactly as today: `hidden terminal MODIFIER: /\b(?:const|readonly|static|await)\b/;` — but `\b` is ASCII-word-boundary; since identifier tails allow `\p{L}\p{Nd}_`, use `(?![\p{L}\p{Nd}_])` with the `u` flag instead, and require start-boundary by Chevrotain ordering (hidden terminal tried before ID) plus `(?<![\p{L}\p{Nd}_])` lookbehind or `longer_alt: ID`. Simplest robust form: one Chevrotain token `{ name: 'MODIFIER', pattern: /(?:const|readonly|static|await)(?![\p{L}\p{Nd}_])/u, group: Lexer.SKIPPED, longer_alt: ID }` — wait: with the lookahead, `longer_alt` is unnecessary; prefer the lookahead. Caveat: lexer-token approach means `await` is stripped even in positions where it's meaningless (matches ANTLR behavior exactly — keep it). |

### 7.2 Lexer modes (EVENT, TITLE_MODE)

Two viable designs; pick A.

**Option A (recommended): mode-emulating custom token patterns using `matchedTokens`.**
Chevrotain custom patterns receive the tokens lexed so far. Define:

```ts
const EVENT_PAYLOAD = createToken({
  name: 'EVENT_PAYLOAD_LXR',
  pattern: (text, offset, matchedTokens) => {
    const last = lastNonHidden(matchedTokens); // helper: skip WS-group tokens? NOTE:
    // hidden/skipped tokens are NOT in matchedTokens when group===SKIPPED, which is
    // ideal here; but COMMENT must not appear between ':' and payload anyway.
    if (!last || last.tokenType.name !== 'COL') return null;
    const re = /[^\r\n]+/y; re.lastIndex = offset;
    return re.exec(text);
  },
  line_breaks: false,
});
```
Order `EVENT_PAYLOAD` FIRST in the token list so that after a `COL` it outcompetes
every other token. Same pattern for `TITLE_CONTENT` keyed on last token `TITLE`.
`EVENT_END`/`TITLE_END` become unnecessary as separate visible tokens *if* the parser
grammar is reworked to not require them (they are already optional in the ANTLR parser
grammar); the newline then falls through to the hidden `CR` terminal. This removes
mode state entirely — the "mode" is recoverable from the previous token, because both
modes are exactly one-token long. This works because EVENT/TITLE modes contain only
`payload? lineEnd` — there is never a second payload token before popMode.
Edge cases to test: `:` at EOF (no payload, no newline); `:` immediately followed by
newline (payload absent — pattern returns null, CR matches); CRLF (`\r` then `\n` are
two CR tokens in ANTLR; keep `[\r\n]` single-char semantics); `:` then spaces then
text (payload includes the leading spaces — `[^\r\n]+` does too — parity OK).

**Option B: true Chevrotain multi-mode lexer** via custom Langium `TokenBuilder`
returning `IMultiModeLexerDefinition` and a custom `Lexer` service. Langium supports
swapping the lexer; this is more faithful but more plumbing, and Langium's own
completion/partial-parsing utilities assume the default lexer shape. Use only if
Option A's previous-token heuristic proves insufficient.

### 7.3 `TITLE` predicate (`isTitle()`)

Custom token pattern:

```ts
const TITLE = createToken({
  name: 'TITLE',
  pattern: (text, offset) => {
    if (!/^title/.test(text.slice(offset, offset + 5 + 1)) ) // cheap prefix check
      // (use text.startsWith('title', offset))
      return null;
    // 1. only whitespace/comments before offset
    const preceding = text.slice(0, offset)
      .replace(/\/\/[^\n]*(?:\n|$)/g, '').trim();
    if (preceding.length) return null;
    // 2. char after 'title' (+ skipped spaces/tabs) must not be . ( =
    let i = offset + 5;
    while (text[i] === ' ' || text[i] === '\t') i++;
    const next = text[i];
    if (next === '.' || next === '(' || next === '=') return null;
    const m = ['title'] as unknown as RegExpExecArray; m.index = offset; return m;
  },
  line_breaks: false,
  longer_alt: ID,   // 'titles' must stay ID
});
```
Port the *exact* preceding-text logic (regex comment-strip + trim) — don't "improve"
it; tests in the repo depend on, e.g., comments before `title` still allowing a title.
Note ANTLR's check uses original text including hidden tokens; the custom pattern's
`text.slice(0, offset)` is identical. Also note `longer_alt` is required because the
custom pattern matches exactly 5 chars and Chevrotain would otherwise emit
`TITLE`+`ID(s)` for `titles` — ANTLR picked `ID` by maximal munch.

### 7.4 `FLOAT` trailing predicate (`!isNameStartAhead()`)

Bake the lookahead into the regex — no custom function needed:

```
FLOAT: /\d+\.\d*|\.\d+(?![\p{L}_])/u
```
This is exactly `isNameStartAhead` negated (`[\p{L}_]`, not `\p{Nd}` — `.5` followed
by a digit can't happen since `\d+` is greedy). Order FLOAT before `DOT` and ensure
`NUMBER_UNIT` is before FLOAT.

### 7.5 `DIVIDER` column-0 predicate

Custom pattern with start-of-line check:

```ts
const DIVIDER = createToken({
  name: 'DIVIDER',
  pattern: (text, offset) => {
    if (offset !== 0) {
      const prev = text.charCodeAt(offset - 1);
      if (prev !== 10 && prev !== 13) return null; // not at column 0
    }
    const re = /[ \t]*==[^\r\n]*/y; re.lastIndex = offset;
    return re.exec(text);
  },
  line_breaks: false,
});
```
**Ordering trap:** at column 0, ANTLR's longest match lets DIVIDER absorb leading
spaces that would otherwise be hidden `WS`. In Chevrotain the WS hidden token is
matched first-match too — if `WS` is tried before `DIVIDER`, `  == x` becomes
`WS` + then DIVIDER's column check FAILS (offset now mid-line after spaces). Two fixes:
(a) order DIVIDER before WS (then DIVIDER's `[ \t]*==` must not match plain spaces —
it requires `==`, fine; but every WS token now pays the custom-pattern call → perf), or
(b) relax the column check to "only WS since line start" by scanning back over
`[ \t]` before requiring BOL — semantically identical to ANTLR (`HWS* '=='` from col 0)
and lets WS stay first. **Recommend (b)**: scan backwards over spaces/tabs from
`offset`, then require offset-of-line-start. Also note `DIVIDER` vs `EQ`: mid-line
`==` must stay `EQ`, and a column-0 `== x` line must NOT lex as `EQ`; ordering DIVIDER
before EQ + the BOL check gives both. ANTLR also prefers DIVIDER over
`EQ EQ ...` by length at BOL — e.g. a line containing just `==` (no note text):
DIVIDER matches 2 chars, EQ matches 2 chars, tie → declaration order… DIVIDER is
declared LAST in the .g4, so ANTLR emits `EQ` for a bare `==` line?? **No** — ties go
to the lowest rule index, so bare `==` at column 0 lexes as `EQ`, not DIVIDER. Wait:
`DividerContext.Note()` requires the formatted text to start with `==`, and parser
rule `divider: DIVIDER`. A bare `==` line is therefore NOT a divider today (it lexes
EQ and likely produces a parse error / OTHER-style recovery). `== x` (3+ chars) lexes
DIVIDER by length. **Replicate, don't fix:** in the custom pattern require `==` plus
at least one more char? No — `'==' ~[\r\n]*` with `*` matches bare `==` too; the tie
is what demotes it. To be bit-exact: in Chevrotain (DIVIDER ordered before EQ), make
the pattern require that the match length exceed 2 + leading-WS (i.e., at least one
char after `==`) OR be followed by EOL… ANTLR tie-break gives `EQ` exactly when the
divider text is empty AND there is no leading whitespace consumed? If there IS leading
WS (` ==`), DIVIDER matches 3 chars vs WS(1)/EQ(2) → DIVIDER wins. So the bit-exact
rule: at BOL, DIVIDER wins unless the line is exactly `==` with zero leading
whitespace. Encode that one carve-out in the custom pattern and cover it with a unit
test. (Check rendering expectations: `Note()` strips `=` and would return `''` anyway.)

### 7.6 `CSTRING`/`USTRING` editor tolerance

Plain regexes, ordered CSTRING first:

```
terminal CSTRING: /"(""|[^"\r\n])*"/;
terminal USTRING: /"(""|[^"\r\n])*/;
```
Both start with `"`; Chevrotain first-match: CSTRING regex on `"abc` fails (no closing
quote) → falls to USTRING. On `"abc"` CSTRING succeeds. On `"abc""` (odd quotes):
CSTRING's greedy `(""|[^"\r\n])*` backtracks to match `"abc"`?? JS regex:
`/"(""|[^"\r\n])*"/` on `"abc""` — greedy loop eats `abc""`… then needs `"` → fails,
backtracks: loop eats `abc` then final `"` matches → CSTRING = `"abc"` (5 chars),
leaving a dangling `"` that lexes as USTRING. **ANTLR gives USTRING(6) here** (longest
match). Divergence! Fix: give CSTRING a possessive-style pattern via custom matcher,
or simpler: implement BOTH as one custom token function that finds the longest of the
two and assigns the type accordingly (Chevrotain custom patterns can set
`payload`/alternate categories), or use a single STRING token + post-lex
classification. Cover with tests: `"a"`, `"a` , `"a""b"`, `"a""`, `""`, `"""`.

### 7.7 `OTHER` catch-all

`terminal OTHER: /[\s\S]/;` ordered dead last (after everything, including after the
hidden terminals — actually hidden WS/CR must be tried first or `OTHER` never being
reached for them; Chevrotain order: all real tokens, then OTHER). Confirm Langium
doesn't drop unused terminals: `OTHER` is not referenced by any parser rule. If
Langium validation complains about an unused terminal, either reference it in a dummy
datatype rule or inject it purely in the custom TokenBuilder. Decide error-reporting
parity: today stray chars become *parser* errors with line/col captured by
`SeqErrorListener` (`src/parser/index.js:24-33`) feeding `Errors`/`ErrorDetails`
exports — the Langium replacement must populate the same arrays from Langium
diagnostics.

### 7.8 `NUMBER_UNIT` / unit fragments

Single regex, alternation sorted longest-first per unit family, ASCII-only, with an
identifier-tail negative lookahead to emulate maximal munch against
`DIGIT_LEADING_NAME`:

```
NUMBER_UNIT: /(\d+\.\d*|\.\d+|\d+)(milliseconds|millisecond|ms|seconds|second|secs|sec|s|minutes|minute|mins|min|hours|hour|hrs|hr|h|days|day|d|weeks|week|w|KiB|MiB|GiB|TiB|KB|MB|GB|TB|kb|mb|gb|tb|B|rem|em|px|mm|cm|km|m|mg|kg|g)(?![\p{L}\p{Nd}_])/u
```
The lookahead makes `3sx` fail NUMBER_UNIT → falls through to DIGIT_LEADING_NAME,
matching ANTLR. Keep within-family longest-first ordering exactly as listed in §3.1
(JS alternation is leftmost-wins). `3s` ties in ANTLR and NUMBER_UNIT wins by rule
order → order NUMBER_UNIT before DIGIT_LEADING_NAME in Chevrotain; with the lookahead
both engines agree.

### 7.9 Annotations

```
STARTER_LXR:    /@[Ss]tarter(?![a-zA-Z0-9_])/
ANNOTATION_RET: /@(?:[Rr]eturn|[Rr]eply)(?![a-zA-Z0-9_])/
ANNOTATION:     /@[a-zA-Z0-9_]*/
```
Lookaheads use ASCII class because ANNOTATION's tail is ASCII (`[a-zA-Z_0-9]*`), so
`@Starter中` in ANTLR: STARTER_LXR(8) vs ANNOTATION(@Starter, 8) tie → STARTER_LXR,
then `中` → ID. The ASCII lookahead reproduces this (`中` doesn't match
`[a-zA-Z0-9_]`). Order: STARTER_LXR, ANNOTATION_RET, then ANNOTATION.

### 7.10 ID / DIGIT_LEADING_NAME Unicode

```
ID:                  /[\p{L}_][\p{L}\p{Nd}_]*/u
DIGIT_LEADING_NAME:  /\d+\p{L}[\p{L}\p{Nd}_]*/u
```
These are the Chinese/CJK support carriers — every participant name like `用户`,
`订单服务` flows through ID. Add lexer unit tests with CJK, Korean, Japanese, accented
Latin, Greek, and digit-leading CJK (`1号机`). Watch Chevrotain optimization warnings
(§6.5). NOTE: `\p{Nd}` covers non-ASCII digits in identifier *tails* only; INT/FLOAT/
NUMBER_UNIT/DIGIT_LEADING_NAME leading digits are ASCII `[0-9]` — keep that asymmetry.

---

## 8. Token order blueprint for the Chevrotain token list

A concrete, dependency-respecting order (first-match semantics):

1. `EVENT_PAYLOAD_LXR` (custom, fires only after `COL`)
2. `TITLE_CONTENT` (custom, fires only after `TITLE`)
3. `DIVIDER` (custom, BOL check; before WS-consumption issue per §7.5 option (b) it can sit here with back-scan)
4. hidden `WS`, hidden `CR`
5. hidden `COMMENT` (`//…`) — before `DIV`
6. hidden `MODIFIER` (`const|readonly|static|await` + lookahead)
7. `TITLE` (custom predicate; before ID via longer_alt)
8. `STARTER_LXR`, `ANNOTATION_RET`, `ANNOTATION`
9. Keywords with lookahead or longer_alt→ID: `TRUE,FALSE,NIL,IF,ELSE,WHILE,RETURN,NEW,PAR,GROUP,OPT,CRITICAL,SECTION,REF,AS,TRY,CATCH,FINALLY,IN`
10. `NUMBER_UNIT` → 11. `FLOAT` → 12. `MONEY` (`/\$(\d+\.\d*|\.\d+|\d+)/`) → 13. `DIGIT_LEADING_NAME` → 14. `INT`
15. `COLOR` (`/#[0-9a-fA-F]+/`)
16. Multi-char operators: `RETURN_ARROW(-->)`, `ARROW(->)`, `SOPEN(<<)`, `SCLOSE(>>)`, `GTEQ`, `LTEQ`, `EQ(==)`, `NEQ`, `OR(||)`, `AND(&&)`
17. Single-char operators/punct: `GT,LT,PLUS,MINUS,MULT,DIV,MOD,POW,NOT,SCOL,COMMA,ASSIGN,OPAR,CPAR,OBRACE,CBRACE,LBRACKET,RBRACKET,DOT,COL`
18. `CSTRING`, `USTRING` (see §7.6 for the odd-quote caveat)
19. `ID`
20. `OTHER` (`/[\s\S]/`) — last

(If Langium's default TokenBuilder ordering fights this, override `buildTokens` and
sort explicitly; Langium orders terminals partly by grammar declaration order and puts
keywords first — verify generated order with a test that snapshots `tokenTypes`.)

---

## 9. Behavioral parity test checklist (lexer-level)

Write a token-stream golden test harness (input → `[type, text, channel/hidden]` list)
against the ANTLR lexer FIRST, then run the same corpus through the Chevrotain lexer:

- `title Order Flow` / `// c\ntitle X` / `title.method()` / `title = 1` / `title(x)` / `titles`
- `A->B: hello world // not a comment` (comment chars inside payload)
- `A->B:` at EOF; `A->B:\n`; CRLF files
- `== divider ==`, `  == d`, bare `==` line, mid-expression `a == b`
- `await A.m()`, `const x = 1`, `readonly`, `constant`, `awaits`
- `300ms`, `1.5h`, `.5px`, `3s`, `3sx`, `3秒`, `2fa`, `$5`, `$.5`, `$1.99`
- `.5`, `.5x`, `1.`, `a.b`, `x.5` (ID DOT INT? — `x.5`: ID(x) DOT FLOAT? no: `.5` after ID — FLOAT `.5` predicate passes (next is EOF) → ID DOT? careful: maximal munch at `.`: FLOAT `.5` (2) beats DOT (1) → ID FLOAT?! verify against ANTLR and lock in)
- `"a"`, `"a`, `"a""b"`, `"a""`, `""`, `"""`, `"中文"`
- CJK names: `用户->订单服务: 下单`, `1号机`
- `@Starter(A)`, `@starter`, `@Starters`, `@Return`, `@reply`, `@custom`, bare `@`
- `#FF0000`, `#xyz`
- stray chars: `?`, `|`, `&`, backtick, emoji
- comment attachment: multi-line `//` runs before a message; comment before `}` of a brace block

The `x.5` case above shows even this doc can't fully predict ANTLR maximal-munch
outcomes from reading alone — the golden harness is mandatory, not optional.

---

## 10. Summary of hard cases ranked by difficulty

| # | Feature | ANTLR mechanism | Langium-native? | Proposed fix |
|---|---------|-----------------|-----------------|--------------|
| 1 | `:`→rest-of-line payload | mode EVENT | No (no modes) | custom token keyed on previous token (§7.2 A) |
| 2 | `title` directive | sem. predicate + mode | No | custom token pattern porting `isTitle()` exactly (§7.3) + payload per #1 |
| 3 | Divider at column 0 | `{column===0}?` predicate | No | custom pattern with BOL back-scan + bare-`==` tie carve-out (§7.5) |
| 4 | COMMENT_CHANNEL → `getComment()` | channel + `getHiddenTokensToLeft` | Partially (hidden terminals kept in CST) | hidden terminal + Langium CommentProvider/CST walk; preserve multi-line join + brace-block stop-token rule (§7.1) |
| 5 | MODIFIER_CHANNEL | channel (never read downstream) | Yes-ish | hidden terminal with boundary lookahead (§7.1) |
| 6 | Maximal munch everywhere | ATN longest-match | No (first-match) | strict token ordering + `longer_alt`/lookaheads (§6, §8) |
| 7 | `OTHER` never-fail lexer | catch-all `.` | Yes | last-position `/[\s\S]/` terminal + error-channel parity (§7.7) |
| 8 | USTRING odd-quote longest-match | longest-match vs backtracking regex | No | combined custom string matcher (§7.6) |
| 9 | FLOAT lookahead predicate | `{!isNameStartAhead()}?` | Yes | regex negative lookahead (§7.4) |
| 10 | Unicode identifiers (CJK) | `\p{L}\p{Nd}` in ATN | Yes | `u`-flag regexes; benchmark Chevrotain optimization loss (§7.10) |
