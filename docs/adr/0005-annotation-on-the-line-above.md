# 0005 — An annotation may stand on the line above what it modifies

Date: 2026-11-22
Status: Accepted by the maintainer on 2026-11-22.

## Context

ZenUML annotations start with `@`: participant types (`@Actor`, `@Database`, any other `@Name`), `@Starter`,
and `@return` / `@reply` for async return messages. Java and .NET put an annotation (or attribute) on its own
line above the declaration it modifies, as often as on the same line:

```java
@Override
public String toString() { ... }
```

ZenUML users bring that habit. Newlines are hidden from the parser, so both placements already parse the same
way on `main` (fbc957f7):

| DSL | Result |
|---|---|
| `@Actor Alice` | `Alice` is an actor |
| `@Actor` + newline + `Alice` | `Alice` is an actor |
| `@return B->A: reply` | async return `reply` |
| `@return` + newline + `B->A: reply` | async return `reply` |

Issue #713 proposed ending a bare `@return` at the end of its line, so that typing `@return` above an existing
message would not turn that message into a return. That rule breaks the second and fourth rows.

## Decision

1. An annotation modifies the next element, whether that element is on the same line or on a following line.
   Both placements are valid DSL and render the same.
2. Parser recovery and editor features must not treat the line break after an annotation as the end of a
   statement. A bare annotation line followed by an element is complete, not unfinished.
3. While someone types an annotation above an existing element, that element takes the annotation. That is the
   correct reading of the text at that moment, not damage to other lines.

## Consequences

- #713 is not fixed by a line-end rule. Its main case (`@return` typed above `B->A: reply`) is the intended
  reading.
- A comment between an annotation and its element is lost today: `@return` + `// note` + `B->A: reply` draws
  the return but not the comment. Java and .NET keep such a comment. This is a separate bug, open under #713.
- New annotations, and any future rule that uses line breaks (for example in header recovery, see
  `src/parser/headerRecovery.ts`), must keep both placements.

## Alternatives rejected

- Line-end rule for a bare `@return`, with a warning that names `return` and the one-line `@return` form:
  rejected by this decision.
