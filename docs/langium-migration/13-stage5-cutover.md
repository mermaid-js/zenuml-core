# Stage 5 — Cutover: Langium is the default engine

The parser engine default flipped from ANTLR to Langium
(`src/parser-langium/engine-flag.ts`: `DEFAULT_ENGINE = "langium"`). ANTLR
remains a one-step rollback lever (`ZENUML_PARSER=antlr`, or flip
`DEFAULT_ENGINE`) until Stage 6 decommission.

## Gate results

| Gate | Result |
|---|---|
| Full unit suite, **default (Langium)** — `bun run test` | **1597 pass / 3 skip / 0 fail** (1600) |
| Full unit suite, **rollback** — `ZENUML_PARSER=antlr bun run test` | 1597 pass / 3 skip / 0 fail (1600) |
| **E2E visual snapshots** — `bun pw` | **120 passed, zero snapshot updates** |
| Library build — `bun run build` (lib ESM/UMD + CLI SSR) | green |
| Dual-run A/B (`scripts/parity/dualrun-diff.mjs`) | 190 identical / 8 explained (G7) / 0 unexplained |

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

| metric | ANTLR (ms) | Langium (ms) | speedup |
|---|---:|---:|---:|
| Sum of per-case medians | 3,931.9 | 36.8 | **107×** |
| Full-corpus single pass | 3,974.7 | 37.6 | **106×** |
| `synthetic-cjk-heavy` (283 lines) | 444.6 | 5.0 | 89× |
| `synthetic-large-520` (694 lines) | 1,393.9 | 14.5 | 96× |
| `demo1-smoke` (60 lines) | 150.5 | 0.84 | 180× |

Chevrotain (SLL, no ALL(\*) adaptive prediction) is ~100× faster than ANTLR's
JS runtime — consistent with the Stage-1 lexer finding (~80–100×). The earlier
"zero performance upside" concern is **disproven for parse time**.

Caveat (stated for honesty): `RootContext` builds the facade root and parses;
facade nodes materialise lazily as the renderer walks them. The ANTLR number is
eager full-tree construction. The numbers above therefore overstate the
end-to-end render delta — but the E2E suite (full render path) completing in
~28.5 s with identical output confirms there is **no perf regression**; parse is
decisively faster. Regenerate: `bun scripts/parity/bench-parse.mjs` (default
Langium) and `ZENUML_PARSER=antlr bun scripts/parity/bench-parse.mjs`.

## Bundle — `gzip -9` vs Stage-0 baseline (08-baselines.md §5)

| artifact | base gz | now gz | delta |
|---|---:|---:|---:|
| `dist/zenuml.esm.mjs` | 460,638 | 604,897 | **+144,259 (+31.3%)** |
| `dist/zenuml.js` (UMD) | 859,172 | 979,239 | +120,067 (+14.0%) |
| `dist/cli/zenuml.mjs` | 87,944 | 110,474 | +22,530 (+25.6%) |

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

Stage 5 cutover is **functionally complete**: Langium ships by default, all unit
and E2E gates green, perf vastly improved, bundle within the documented R7
envelope. Remaining: **Stage 6 decommission** (separate PR) — remove antlr4,
`src/generated-parser/`, `src/g4/`, the `bun antlr` script, the engine flag and
both-engine plumbing; retire the `instanceof` shim by renaming facade classes /
exporting them as the generated-parser names.
