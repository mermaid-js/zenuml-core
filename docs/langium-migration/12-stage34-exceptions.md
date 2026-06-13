# Stage 3+4 — Facade + Visitors: gate result & accepted exceptions

Oracle: `ZENUML_PARSER=langium bun test src/parser test/unit`
Result: **1210 pass / 2 skip / 1 fail (1213 tests, 65 files)**.
Default ANTLR same scope: **1211 pass / 2 skip / 0 fail** — the delta is exactly
the single accepted exception below.
Parity subset under the flag (`test/unit/parity`): **838 pass / 0 fail / 2 skip**.
Dual-run A/B (`scripts/parity/dualrun-diff.mjs`): **190 identical / 8 explained
(G7) / 0 unexplained** across all 198 corpus cases.

The 2 skips are pre-existing and identical under both engines.

## Resolved this round (no longer exceptions)

### `src/parser/AncestorPath.spec.ts` — `instanceof sequenceParser.MessageContext`
The renderer (`useArrow.ts`, `useFragmentData.ts`, `Return.tsx`) and this spec
test node kind with `ctx instanceof sequenceParser.<Kind>Context`, importing the
class from `@/generated-parser/sequenceParser`. Under the Langium engine the live
nodes are facade `Ctx` instances, not ANTLR-generated instances, so the checks
were all false.

Fixed by `src/parser-langium/instanceof-shim.ts` — a `Symbol.hasInstance` on each
generated context class that also recognises the matching facade class while
preserving the native prototype-chain check for genuine ANTLR nodes. Installed
only when `ZENUML_PARSER=langium` (guarded in `src/parser/index.js`); the default
path is never mutated. This is the ANTLR-context compatibility the facade
strategy promises (07-risk-map §3.4), and the renderer depends on it identically
— not a test-only shim.

### Dual-run structural diffs (NameContext children, stop off-by-one, Prog.stop)
The Gate-3 dual-run previously reported 148 unexplained compare-* diffs. Root
causes and fixes (all in `src/parser-langium/facade/nodes.ts`, no spec/golden
touched):

1. **Missing name-bearing children.** `From/To/MethodName/Participant/Group/
   Stereotype/Label/Emoji/Assignment/CreationBody/Starter/Type/Construct` did not
   expose their `name()` (and sibling) children. Added `_buildChildren()`
   overrides matching the exact ANTLR rule child order (e.g. `participant:
   participantType? stereotype? emoji? name width? label?`).
2. **`stop.stop` off by one on rules ending in a hidden END token.** ANTLR keeps
   `EVENT_END`/`TITLE_END` as the rule's stop token; the Langium grammar marks
   them `hidden`, so they sit just past the AST CST span. `_computeViews` now
   adopts the directly-adjacent END leaf as the stop for nodes that consume one
   (`Stat`, `Block`, `Prog`, `Ret`, `Title` via `_trailingEndTypes()`), without
   disturbing `getText()`/`getComment()` (the END leaf stays hidden in the leaf
   stream, so the leftward comment scan still stops at the right boundary).
3. **`ProgContext.stop` null vs 0 on empty input.** ANTLR returns `null` for a
   rule that consumed zero parser-visible tokens; the facade now returns `null`
   from `node.stop` in that case (`TokenView | null`).

## Accepted exception (1)

### `test/unit/parser/simpe-message.spec.js` — `message - incomplete > A.m(`
G7 error-recovery shape divergence (07-risk-map §G7), the same family as the
documented parity exclusions `new A(` and `A.m {`.

Evidence (verified by AST/stat dumps):
- ANTLR `DefaultErrorStrategy` splits `A.m(` into **two** statements; the first
  message's `func()` is **null**. The test asserts `func()` is null.
- Chevrotain single-token-insertion recovers the missing `)` into **one**
  message with `Func` `m(` ( `[2,4)` ), so `func()` is **non-null**.

Why it is not fixed:
- Chevrotain exposes no recovery hooks — only a boolean `recoveryEnabled`
  (langium #1742); the two-statement split is not expressible as LL(k) grammar
  optionality.
- The risk map forbids synthesising tree shape from recovery internals (that
  would be faking the parse, not reproducing it).

Decide-and-document at Stage 5: the spec's own comment notes "the editor should
close the () in most cases"; the live-typing UX (editor auto-closes parens)
makes this transient state rare, and the E2E visual gate (`bun pw`) covers the
rendered output of half-typed input. The accepted behaviour under Langium is the
single recovered message, which renders correctly.
