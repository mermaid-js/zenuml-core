# Stage 5 — Cutover: Langium is the default engine

The parser engine default flipped from ANTLR to Langium
(`src/parser-langium/engine-flag.ts`: `DEFAULT_ENGINE = "langium"`). ANTLR
remains a one-step rollback lever (`ZENUML_PARSER=antlr`, or flip
`DEFAULT_ENGINE`) until Stage 6 decommission.

> Branch state: rebased onto `main` (`b5100138`, incl. the perf commits
> `d163803b`/`db1038ad`). Gate numbers and the performance section below reflect
> that rebase. Test counts grew to 1604 because `main` added `RootContext.spec.ts`
> + benchmark specs; the new `RootContext.spec.ts` was made engine-aware (the
> SLL-vs-LL test is ANTLR-only; the memoization test passes once the Langium
> `RootContext` gained the same error-free result cache — `compat.ts`).

## Gate results

| Gate | Result |
|---|---|
| Full unit suite, **default (Langium)** — `bun run test` | **1601 pass / 3 skip / 0 fail** (1604) |
| Full unit suite, **rollback** — `ZENUML_PARSER=antlr bun run test` | 1601 pass / 3 skip / 0 fail (1604) |
| **E2E visual snapshots** — `bun pw` | **120 passed, zero snapshot updates** |
| Library build — `bun run build` (lib ESM/UMD + CLI SSR) | green |
| Dual-run A/B (`scripts/parity/dualrun-diff.mjs`) | 190 identical / 8 explained (G7) / 0 unexplained |
| Goldens regenerated from rebased ANTLR | 0 changes (lexer-predicate move is token-output-equivalent) |

The E2E suite (HTML rendering, SVG parity, interaction, measurement) passing
with **zero snapshot updates** is the decisive proof: the Langium facade renders
byte-identically to ANTLR through the full parser → renderer → SVG/HTML pipeline.

### Fixes required for cutover (beyond the Stage 3+4 parser-scope oracle)

The Stage 3+4 oracle scoped to `src/parser + test/unit`; the full suite added
`src/components`, `src/positioning`, `src/svg`, `src/cli`. Flipping the default
surfaced 38 further failures, all fixed:

1. **Generic `Origin()` (36 failures: renderToSvg, VerticalCoordinates,
   geometry).** ANTLR augments `ParserRuleContext.prototype.Origin` so *every*
   node has it; the positioning/SVG layers (`LocalParticipants`, async VMs,
   `walkStatements`) call `.Origin()` on arbitrary node kinds. The facade had
   put `Origin` only on Stat/Prog. Added a generic `Origin()` to the base `Ctx`
   that walks to the nearest Stat/Prog and delegates — porting ANTLR's intent
   without its latent infinite-loop bug (`ctx = this.parentCtx`).
2. **CLI `--parse` AST dump (2 failures).** `serializeParseTree` read
   ANTLR-only fields (`node.symbol`, `node.parser.ruleNames`, `node.ruleIndex`).
   Added a facade path: `ruleName` from the facade class name, terminals
   synthesized from each node's directly-owned leaves, interleaved with rule
   children in source order.

## Performance — parse over the 150-case corpus (same machine/session)

**⚠️ The parse-speed rationale was neutralized by main's own ANTLR perf work,
discovered when this branch was rebased onto `main`.** The Stage-0 baseline
(08-baselines.md: ANTLR parse 4,777 ms) was recorded against the old ALL(\*)
ANTLR. Between then and now, `main` landed `d163803b` (two-stage SLL parsing +
layout caching, "render time −85-95%"), `db1038ad` (lexer DFA caching,
"84 ms → 0.3 ms lexing"), and per-code result memoization — making the *existing*
ANTLR parser one to three orders of magnitude faster. The pre-rebase "107×
faster" claim compared Langium to a parser that no longer exists.

Re-measured against current `main`'s ANTLR (cold parse, memoization defeated with
a unique trailing comment per run; median of 9):

| input | ANTLR SLL (ms) | Langium (ms) | winner |
|---|---:|---:|---:|
| ~500-statement synthetic (~1,500 lines) | **2.3** | 27.7 | ANTLR ~12× faster |
| ~280-line CJK synthetic | **5.9** | 10.9 | ANTLR ~1.8× faster |
| `compare-demo1-smoke` (60 lines) | **0.45** | 1.11 | ANTLR ~2.5× faster |
| `compare-order-service` (24 lines) | **0.12** | 0.37 | ANTLR ~3× faster |

On **repeat** parses of identical code, both engines memoize → effectively
instant (the per-case bench harness now measures cache hits, ~0 ms, for both).

So post-rebase: **Langium has no parse-time advantage — the new ANTLR is faster
cold, and both tie (memoized) on repeat.** The Langium lexer's Stage-1 ~80×
advantage is likewise eroded by `db1038ad`'s lexer DFA fix (lex is a small
fraction of total parse; not re-benchmarked in detail). There is **no perf
regression** (E2E full-render suite passes in ~27 s, byte-identical output), but
the migration can no longer be justified on parse performance. Its remaining
case is qualitative: a declarative `.langium` grammar, no Java/ANTLR build step,
and modern LSP-capable tooling — weighed against the bundle cost below.

Regenerate: cold-parse comparison via the inline script noted in this section's
commit; memoized/aggregate view via `bun scripts/parity/bench-parse.mjs` and
`ZENUML_PARSER=antlr bun scripts/parity/bench-parse.mjs`.

## Bundle — `gzip -9` vs Stage-0 baseline (08-baselines.md §5)

| artifact | base gz | now gz | delta |
|---|---:|---:|---:|
| `dist/zenuml.esm.mjs` | 460,638 | 605,699 | **+145,061 (+31.5%)** |
| `dist/zenuml.js` (UMD) | 859,172 | 979,718 | +120,546 (+14.0%) |
| `dist/cli/zenuml.mjs` | 87,944 | 112,175 | +24,231 (+27.6%) |

This is the **expected, accepted tradeoff** (07-risk-map R7: ANTLR+generated
≈55 KB gz vs langium+chevrotain ~143 KB gz floor). The current bundle ships
**both** engines (ANTLR is still imported as the runtime rollback lever and
cannot be tree-shaken while `USE_LANGIUM` is a runtime value). **Stage 6
decommission removes antlr4 + `src/generated-parser/`, reclaiming ~55 KB gz**,
landing the net ESM delta near +89 KB gz (+19%).

Bundle growth is not a launch *blocker* (the Gate-5 blocker is a parse-time
regression, which did not occur) — it is a product cost that was accepted at the
risk-map stage. Flagged here for explicit sign-off.

## Status

Stage 5 cutover is **functionally complete and correct**: Langium ships by
default, all unit and E2E gates green under both engines, byte-identical
rendering. But the **strategic picture changed after rebasing onto `main`**:

- **Parse performance is no longer a reason to migrate.** `main`'s own ANTLR
  optimizations (two-stage SLL + lexer DFA caching + memoization) made the
  existing parser faster than the Langium replacement (≈12× faster cold on large
  input; tied/instant on memoized repeats).
- **Bundle grows ~+145 KB gz now / ~+89 KB after Stage 6** — a real, permanent
  cost.

Net: the migration is technically done and parity-clean, but its justification
is now **qualitative only** (declarative grammar, no Java/ANTLR build step,
modern tooling), at a bundle cost and with no perf upside. **This warrants an
explicit go/no-go before Stage 6** (which removes the ANTLR rollback lever and is
irreversible-ish). Options: (a) proceed to Stage 6 for the tooling/maintenance
win, accepting the bundle cost; (b) keep both engines behind the flag (ANTLR
default) and treat Langium as opt-in; (c) shelve the migration on `main` given
`main`'s ANTLR is now fast, and keep this branch as a reference.

If proceeding — **Stage 6 decommission** (separate PR): remove antlr4,
`src/generated-parser/`, `src/g4/`, the `bun antlr` script, the engine flag and
both-engine plumbing; retire the `instanceof` shim by renaming facade classes /
exporting them as the generated-parser names.
