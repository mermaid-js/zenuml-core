# 0007 — `return A->B: msg` draws an async return, on one line

Date: 2026-11-22
Status: Proposed. Not implemented.

## Context

An async return message can be written two ways today, and users must learn both rules:

| Form | Meaning |
|---|---|
| `@return B->A: msg` (alias `@reply`) | async return from `B` to `A` |
| `B-->A: msg` | the same |
| `return x` | return from the current method, with an optional value |

The keyword `return` is the one users already know. Annotations are the part of the DSL that costs users the
most rules (ADR 0005, ADR 0006). In a private corpus of 647 customer ZenUML diagrams (counts only), users who
draw an async return almost always write `@return B->A: msg` on one line, and `B-->A: msg` appears in 4
diagrams.

Measured on `main` (0a82d61), ANTLR parser:

| DSL | Read today |
|---|---|
| `return B->A: msg` | an empty `return`, then a separate async message `B->A: msg`; no error |
| `return` + newline + `B->A: msg` | the same as the row above |
| `return` + newline + `C.c()` | `return C.c()`: the call on the next line becomes the return value |
| `return x` + newline + `C.c()` | `return x`, then the call `C.c()` |
| `return` + newline + `}` | an empty `return` |

Newlines are hidden from the parser, so the first two rows cannot be told apart today.

In the corpus, `return` followed by an arrow on the same line occurs 0 times, and a bare `return` is followed
by `}` in all 84 occurrences.

## Decision

1. `return <from>-><to>: <message>`, on one line, draws an async return from `<from>` to `<to>`. It renders the
   same as `@return <from>-><to>: <message>`. Whether `return <to>: <message>` (no caller) is also
   accepted is left to the implementation; it must be decided with a test of how it reads today.
2. `return` reads only what is on its own line. A `return` with nothing after it on its line is an empty
   return, and the next line is the next statement. This applies to every form of `return`, not only the new
   one.
3. `@return`, `@reply` and `-->` stay in the grammar without an end date. The documentation teaches
   `return A->B: msg` and marks the other two as legacy forms.
4. ADR 0005 is unchanged: an annotation still applies to the next element, on its own line or a later one.
   `return` is a keyword, not an annotation, so it does not take the next line.

| DSL | Read after this decision |
|---|---|
| `return B->A: msg` | async return from `B` to `A` (**changed**) |
| `return` + newline + `B->A: msg` | an empty `return`, then the async message `B->A: msg` (unchanged) |
| `return` + newline + `C.c()` | an empty `return`, then the call `C.c()` (**changed**) |
| `return x` + newline + `C.c()` | unchanged |
| `return` + newline + `}` | unchanged |
| `@return` + newline + `B->A: msg` | async return (unchanged, ADR 0005) |

## Consequences

- A diagram that has `return B->A: msg` on one line today draws two arrows: an empty return and a solid
  async message. After the change it draws one dashed return. The corpus has 0 such lines.
- A diagram that has `return` and a statement on the next line stops swallowing that statement. The corpus has
  0 such cases. While a user types `return` above an existing line, that line no longer flickers into the
  return value.
- Both parsers need the change: the ANTLR grammar (`src/g4/sequenceParser.g4`, rule `ret`) and the Langium
  grammar (`src/parser-langium/zenuml.langium`), with the facade (`src/parser-langium/facade/nodes.ts`) and
  editor autocomplete.
- The same-line rule needs the line of each token, because the lexer hides newlines. In ANTLR this can be a
  semantic predicate on the alternatives of `ret` that compares token lines. Langium needs an equal rule.
- ADR 0006 named one gap: a top-level `return` whose owner is the `@Starter` participant. A return that names
  its owner, `return X->X: value`, may close that gap. This is not verified; check it with a rendering test
  when this is built.
- Implementation must render before and after for the cases in the table, on both parsers, and must add
  parity tests between ANTLR and Langium.

## Alternatives rejected

- **`return A to B: msg`.** `to` would become a keyword. Today `return to` returns a value named `to`, so the
  change would break that reading. The arrow form reuses message syntax that users already know.
- **Allow the arrow on the next line.** `return` + newline + `B->A: msg` would become an async return. A user
  typing `return` above an existing async message would turn that message into a return. Unlike an
  annotation, `return` alone is already a complete statement.
- **Remove `@return` and `-->`.** Hundreds of stored diagrams use `@return`. Confluence diagrams are rarely
  edited again.
