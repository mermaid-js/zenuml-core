# 0006 — Soft-deprecate `@Starter` in favour of an explicit caller

Date: 2026-11-22
Status: Proposed. Not implemented.

## Context

`@Starter(X)` names the caller of every message whose caller is left implicit at the top level of a diagram:

```
@Actor Client
@Starter(Client)
OrderService.create(req) {
  return order
}
Billing.charge(order)
```

The same diagram can be written without the annotation, because a message can name its caller:

```
@Actor Client
Client->OrderService.create(req) {
  return order
}
Client->Billing.charge(order)
```

Users must remember a rule that the second form makes visible on each line. Annotations are the part of the
DSL that costs users the most rules to remember (see also ADR 0005).

Evidence from a private corpus of customer diagrams (counts only; no diagram source leaves the corpus):

| Finding | Count |
|---|---|
| Diagrams with `@Starter`, in the corpus with the heaviest use | 182 of 428 |
| Of those, `@Starter` once, before the first message | 181 |
| Of those, one top-level call only | 148 |
| Rewritten to explicit `X->` and rendered: pixel-identical | 172 of 182 |
| Not identical because the rewrite script missed `a, b = X.m()` or a bare `m()` self call | 7 |
| Cannot be rewritten: a top-level `return` whose owner is the starter | 3 (one diagram) |
| Other tenants: diagrams with `@Starter`, before and after the Confluence default example dropped it (2025-10-18) | 67% before, 13% after |

The default example for new Confluence diagrams contained `@Starter` from 2022-03 to 2025-10-18. Most use
outside one team came from that example.

## Decision

1. The parser keeps `@Starter` without an end date. Diagrams already stored in Confluence and other hosts
   render as they do today.
2. The documentation marks `@Starter` as a legacy form and teaches `X->A.m()` for the first caller.
3. Editor autocomplete stops suggesting `@Starter`.
4. Editors may offer a quick fix, "Replace @Starter with an explicit caller". The fix is offered only when the
   rewritten text renders the same as the original. Diagrams that do not pass (for example a top-level
   `return` owned by the starter) keep `@Starter`.
5. The renderer shows no warning for `@Starter`. The reader of a diagram is often not its author and cannot
   change it.

## Consequences

- No stored diagram changes.
- The quick fix needs a rewrite that handles every caller-less form at the top level and inside top-level
  fragments: `A.m()`, `x = A.m()`, `a, b = A.m()`, bare `m()`, and `new A()`.
- A top-level `return` has no annotation-free owner. If a later decision adds a caller-named return, such as
  `return A->B: msg`, it closes that gap and the quick fix can cover those diagrams too.
- Re-measure the share of new diagrams that use `@Starter` each quarter. Consider stronger steps only when it is
  near zero.

## Alternatives rejected

- **Remove `@Starter` from the grammar.** About four in ten diagrams of the heaviest user would change.
  Confluence diagrams are rarely edited again.
- **Infer the starter from the first explicit `X->` message.** Diagrams that start with `X->A.m()` and later
  have caller-less top-level calls would draw those calls from `X` instead of the anonymous starter. Their
  rendering would change.
- **Replace `@Starter` with a keyword such as `starter X`.** It keeps the hidden rule and only changes its
  spelling.
