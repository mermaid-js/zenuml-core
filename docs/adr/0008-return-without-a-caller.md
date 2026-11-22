# 0008 — `return A: msg` draws an async return from the current participant

Date: 2026-11-23
Status: Accepted by the maintainer on 2026-11-23. Implemented in the same change.

## Context

ADR 0007 made `return <from>-><to>: <message>` read exactly like `@return <from>-><to>: <message>`. It left
`return <to>: <message>` (no caller) open, because the two parsers read it differently (#722):

| DSL | ANTLR (renders the diagram) | Langium (editor) |
|---|---|---|
| `return A: msg` | an empty `return`, then a separate async message `->A: msg` | `return A`; `: msg` is dropped |

Neither parser reports an error. The diagram shows an empty return and a solid self-message, which is not what
a reader means.

`@return <to>: <message>` already exists. Both parsers read it as an async return with no `from`, and the
renderer draws it from the current participant (the owner of the enclosing method): inside `B.n() { … }`,
`@return A: msg` draws the same return as `@return B->A: msg`.

In 2115 private customer diagrams (counts only), `return Name: msg` occurs 0 times and `@return Name: msg`
occurs 0 times.

## Decision

1. `return <to>: <message>`, on one line, reads exactly like `@return <to>: <message>`: an async return from
   the current participant to `<to>`.
2. This extends the rule of ADR 0007: a `return` followed on its line by a message reads like `@return`. The
   line rule of ADR 0007 (a `return` reads only its own line) is unchanged.

| DSL | Read after this decision |
|---|---|
| `return A: msg` | async return to `A` from the current participant (**changed**) |
| `return "A a": msg` | the same, with a quoted name (**changed**) |
| `return A->B: msg` | unchanged (ADR 0007) |
| `return A` + newline + `: msg` | unchanged: the `:` is on the next line |
| `return x` | unchanged |

## Consequences

- Both parsers read the form the same way, which closes #722.
- A diagram with `return A: msg` today draws an empty return and a solid message; after the change it draws one
  dashed return. The corpus has 0 such lines.
- Implementation: one more rule in the shared token plan (`src/parser/headerRecovery.ts`): a `return` followed
  on its line by a name and `:` takes the token kind of `@return`. No grammar change.

## Alternatives rejected

- **Report a syntax error and suggest `return A->B: msg`.** It would make `return` stricter than `@return`,
  which accepts the same form, and users would need a second rule for the two keywords.
- **Keep today's ANTLR reading and make Langium match.** It keeps a drawing that no reader means.
