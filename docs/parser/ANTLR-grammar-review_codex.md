# ANTLR Grammar Review — sequenceLexer.g4 and sequenceParser.g4

Scope: `src/g4/sequenceLexer.g4`, `src/g4/sequenceParser.g4`, and runtime usage in `src/parser/*`.

This review focuses on readability, maintainability, and performance. Each recommendation includes rationale and concrete snippets you can adapt.

---

## Summary of High-Impact Wins

- Replace comment rule with a newline-safe, EOF-safe pattern.
- Split `STRING` into closed vs. unclosed variants to reduce ambiguity and avoid consuming newlines.
- Remove parser-side `console.log` actions; use error listeners instead.
- Collapse error-tolerant alternations (e.g., `parExpr`) into optional forms to reduce ATN complexity.
- Deduplicate `ID | STRING` usages via a single `name` rule and reuse it consistently.
- Use fragments (e.g., `HWS`) inside lexer tokens instead of referencing full token rules like `WS`.

---

## Lexer Recommendations

### 1) Line Comments: make newline/EOF safe and faster

Current:

```g4
COMMENT
 : '//' .*? '\\n' -> channel(COMMENT_CHANNEL)
 ;
```

Issues:
- `.*?` is slower than a negated character set.
- Requires a trailing newline; fails for EOF without newline.

Recommendation:

```g4
COMMENT: '//' ~[\r\n]* -> channel(COMMENT_CHANNEL);
```

If you need to include the newline with the comment token, handle the newline via a separate rule or post-processing, but avoid `.*?` here.

### 2) Whitespace fragments; avoid token references inside tokens

Current `DIVIDER` references `WS` (a token) inside another token. Use fragments instead.

Add a reusable fragment and use it where needed:

```g4
fragment HWS: [ \t];
WS: HWS+ -> channel(HIDDEN);
```

Then update places like `DIVIDER` to use `HWS` rather than `WS`.

### 3) Divider at start of line: robust and readable

Current:

```g4
DIVIDER: {this.column === 0}? WS* '==' ~[\r\n]*;
```

Issues:
- Uses a token (`WS`) inside another token.
- `column === 0` matches only true SOL, not indented dividers.

Recommendations (choose one):

- If divider must start at true column 0:

```g4
DIVIDER: {this.column === 0}? HWS* '==' ~[\r\n]*;
```

- If divider may be indented but must be at start-of-line (after optional spaces), use a boolean flag in the lexer (JS target) that tracks whether we are at SOL, and predicate on it:

```g4
// Pseudocode — implement atLineStart in @lexer::members
DIVIDER: {this.atLineStart}? HWS* '==' ~[\r\n]*;
```

Document the intended behavior (strict column 0 vs. SOL ignoring leading spaces) and test it.

### 4) Strings: split closed vs unclosed

Current:

```g4
STRING: '"' (~["\r\n] | '""')* ('"'|[\r\n])?;
```

Issues:
- Can consume a newline as part of the token.
- Greedy and harder to reason about; ambiguous during incremental editing.

Recommendation:

```g4
CSTRING: '"' ( '""' | ~["\r\n] )* '"';
USTRING: '"' ( '""' | ~["\r\n] )*; // unclosed; ends at EOL/EOF
```

Update parser rules that accept strings to reference both, e.g. via `name` (see Parser section). This improves predictability and preserves editor-friendly tolerance.

### 5) Event mode coupling: document and validate

- `COL: ':' -> pushMode(EVENT)` and `EVENT_END: [\r\n] -> popMode` are a clear coupling. Document this near both rules with examples.
- Validate there are no other syntactic `:` uses that would incorrectly push mode. If you foresee others, consider whether narrowing the trigger is feasible (often not in lexer-only context), or add clear guidance in docs and tests.

### 6) Token vs. fragment reuse, token order

- Keep fragments like `DIGIT`, `UNIT`, `HWS` and reuse them in composed tokens.
- Verify token ordering ensures intended matches: e.g., `ARROW: '->'` before `MINUS: '-'` and `GT: '>'` so `->` is a single token.
- Be mindful of `FLOAT` vs. `DOT` interactions. Your current `FLOAT` forms are fine, but adding tests around `.5` and method chaining (e.g., `a.b`) helps prevent regressions.

---

## Parser Recommendations

### 1) `prog` factoring for clarity

Current:

```g4
prog
 : title? EOF
 | title? head EOF
 | title? head? block EOF
 ;
```

Suggested (equivalent, more compact):

```g4
prog: title? (head? block | head)? EOF;
```

Add a brief comment that empty input is valid and why.

### 2) Deduplicate `ID | STRING` via `name`

You already have `name: ID | STRING;` but many rules repeat `ID | STRING` (e.g., `from`, `to`, `construct`, `methodName`, `type`). Replace with `name` for consistency and easier maintenance.

If you adopt closed/unclosed strings, define:

```g4
name: ID | CSTRING | USTRING;
```

Then reuse `name` in:
- `from`, `to`, `construct`, `methodName`, `type`
- Anywhere that previously used `ID | STRING`

### 3) Simplify error-tolerant parentheses/braces

Current `parExpr` uses 4 alternatives:

```g4
parExpr
 : OPAR condition CPAR
 | OPAR condition
 | OPAR CPAR
 | OPAR
 ;
```

Simplify:

```g4
parExpr: OPAR condition? CPAR?;
```

This reduces alternatives and prediction overhead without losing tolerance.

Likewise, consider:

```g4
loop: WHILE parExpr? braceBlock?; // if consistent with your UI/editor semantics
```

Add comments if you intentionally keep more granular alternatives for user feedback.

### 4) Left-factor `messageBody`

Current has overlapping prefixes and optional parts:

```g4
messageBody
 : assignment? ((from ARROW)? to DOT)? func
 | assignment
 | (from ARROW)? to DOT
 ;
```

A left-factored shape reduces ambiguity:

```g4
messageBody
 : assignment (messageTail)?
 | messageTail
 | func
 ;

messageTail
 : (from ARROW)? to DOT (func)? // allow plain A->B. or A->B.m()
 ;
```

This keeps semantics while reducing ATN branching.

### 5) `creationBody`: keep tolerance, document it

You added an alternative to parse `x = new { m1 }` gracefully. Keep that, and clarify intent in a comment:

```g4
// Error-tolerant: allow NEW without construct/invocation for better UX during typing.
creationBody
 : assignment? NEW construct (OPAR parameters? CPAR)?
 | assignment? NEW
 ;
```

### 6) `ret` and event payload newline

```g4
ret
 : RETURN expr? SCOL?
 | ANNOTATION_RET asyncMessage EVENT_END?
 ;
```

If the editor reliably emits a newline after `asyncMessage` (event mode), consider making `EVENT_END` required to remove an optional lookahead. If not guaranteed, keep it optional and note why in a comment.

---

## Performance Recommendations

- Remove parser-side side effects:
  - In `stat`, this action is hot:
    ```g4
    | OTHER {console.log("unknown char: " + $OTHER.text);}
    ```
  - Prefer error listeners (`antlr4.error.ErrorListener`) or log only under a debug flag outside the grammar.

- Avoid `.*?` in lexer rules:
  - Replace with negated sets (as shown for comments) for linear-time matching and EOF safety.

- Reduce alternatives with optional forms:
  - Applying this to `parExpr`, `loop`, and the left-factoring for `messageBody` reduces DFA/ATN complexity.

- Consider isolating `OTHER`:
  - If you keep `OTHER: .;` to improve recovery, consider sending it to a dedicated channel or handling it in the lexer with minimal impact. Alternatively, skip it and rely on the parser’s error recovery + listeners.

---

## Maintainability Recommendations

- Centralize tolerant patterns:
  - Use optional groups (`?`) where possible instead of duplicating alternatives; add a brief comment explaining the editor-driven tolerance.

- Cohesive naming:
  - Prefer `name` over repeated `ID | STRING`, and keep aliases (`type`, `construct`, etc.) only if they provide semantic clarity.

- Document lexer-mode coupling:
  - Next to `COL` and `EVENT_END`, document that `:` enters event payload until newline; add examples and tests.

- Keyword synonyms:
  - `WHILE: 'while' | 'for' | 'foreach' | 'forEach' | 'loop';` — document intent and consider unit tests so future changes don’t regress behavior.

---

## Concrete Snippets (ready to adapt)

Comment rule:

```g4
COMMENT: '//' ~[\r\n]* -> channel(COMMENT_CHANNEL);
```

Whitespace fragment and reuse:

```g4
fragment HWS: [ \t];
WS: HWS+ -> channel(HIDDEN);
```

Divider at start of line (strict column 0):

```g4
DIVIDER: {this.column === 0}? HWS* '==' ~[\r\n]*;
```

Strings split:

```g4
CSTRING: '"' ( '""' | ~["\r\n] )* '"';
USTRING: '"' ( '""' | ~["\r\n] )*;
name: ID | CSTRING | USTRING;
```

Parenthesized expression:

```g4
parExpr: OPAR condition? CPAR?;
```

Message left-factoring:

```g4
messageBody
 : assignment (messageTail)?
 | messageTail
 | func
 ;

messageTail
 : (from ARROW)? to DOT (func)?
 ;
```

Creation tolerance:

```g4
creationBody
 : assignment? NEW construct (OPAR parameters? CPAR)?
 | assignment? NEW
 ;
```

Remove parser-side logging:

```g4
// Remove this alternative or guard it via a debug flag outside the grammar
// | OTHER {console.log("unknown char: " + $OTHER.text);}
```

---

## Testing & Validation Plan

- Regenerate lexer/parser and run existing tests.
- Add/extend unit tests for:
  - Comments at EOF without trailing newline.
  - Divider recognition at column 0 and with indentation (based on chosen semantics).
  - Closed vs. unclosed strings and their interaction with newlines.
  - `parExpr` tolerance: `(`, `(x`, `(x)`, `()`.
  - `loop` with and without `parExpr`/`braceBlock` if you adopt the optional form.
  - Message forms: `A->B.`, `A->B.m()`, `.m()`, assignments with/without following message tail.

---

## Optional Enhancements

- Introduce a `DEBUG_LEXER`/`DEBUG_PARSER` flag in runtime code to emit diagnostics without grammar actions.
- Consider a small “grammar style guide” in `docs/` for future contributors: naming, use of fragments, tolerance patterns, and mode usage.

---

## Implementation Notes

These suggestions are designed to be incremental. You can adopt them in stages:

1) Lexer safety: change `COMMENT`, add `HWS`, update `DIVIDER`.
2) Parser simplifications: `parExpr`, replace `ID|STRING` with `name`.
3) Remove parser-side logging in `stat`.
4) Split `STRING` and update rules to accept `name` = `ID|CSTRING|USTRING`.
5) Left-factor `messageBody` if desired, backed by tests.

If you want, I can apply step (1)–(3) as a focused PR and run a local smoke test.

