# 14 — Dual-parser architecture: ship ANTLR, side-car Langium for LSP

## Decision

After rebasing onto `main` showed that `main`'s own ANTLR perf work (two-stage
SLL parsing + lexer DFA caching + memoization) made the existing parser faster
than the Langium replacement (see 13-stage5-cutover.md), the full cutover was
**reverted**. The end state instead keeps **both** parsers with different jobs:

- **ANTLR is the production parser.** The published library (`@zenuml/core`) and
  the CLI parse with ANTLR — fast, and no bundle cost beyond today's baseline.
- **Langium is a build-time side-car** (`src/parser-langium/`) used to generate
  the **LSP server** (Langium's native strength) and as the reference for the
  CI consistency gate. It is **never imported by any production code path**, so
  it adds **zero bytes** to the shipped bundle.
- **CI enforces that the two parsers agree**, so they cannot drift as the DSL
  evolves.

This realises the value of the migration work (a declarative `.langium` grammar
+ modern LSP tooling) without the bundle cost or the perf regression a full
cutover would have introduced.

## What ships vs what is side-car

| Concern | Engine | Entry |
|---|---|---|
| Library render (`@zenuml/core`) | ANTLR | `src/parser/index.js` (ANTLR-only) |
| CLI | ANTLR | `src/cli/zenuml.ts` → `@/parser` |
| LSP server (planned) | Langium | `src/parser-langium/` (grammar + services) |
| CI consistency oracle | both | `scripts/parity/dualrun-diff.mjs` |

`src/parser/index.js` and the parser-layer modules (`MessageCollector`,
`ToCollector`, `FrameBuilder`, `ContextsFixture`) are ANTLR-only again — the
Stage-5 engine-flag wiring and the `instanceof` shim were removed, and
`src/parser-langium/engine-flag.ts` + `instanceof-shim.ts` deleted. Verified:
the library ESM bundle is **460,986 B gz (baseline 460,638; +348 B noise)** with
**zero Chevrotain** in the output.

## The consistency gate

Two layers, both run in `cd.yml`'s `test` job (gating publish/deploy):

1. **`bun run test`** — includes `test/unit/parity/*`, which checks each engine's
   lexer token stream, parse-tree shape, and text/comment output against the
   committed `__golden__` JSON (313 goldens). Catches drift of either engine
   away from the recorded ANTLR truth.
2. **`bun run parity:dualrun`** (`scripts/parity/dualrun-diff.mjs`) — parses all
   198 corpus cases with **both** live engines and diffs the trees through a
   shared facade-level API (kind, `start.start`, `stop.stop`,
   `getFormattedText()`, `getComment()`). Exits non-zero on any **undocumented**
   divergence. Current: **190 identical / 8 explained (G7 recovery) / 0
   unexplained**.

The 8 explained diffs are error-recovery-shape differences on grammar-invalid
input (ANTLR `DefaultErrorStrategy` vs Chevrotain single-token recovery),
classified by the committed goldens themselves carrying error nodes — see
07-risk-map.md §G7 and 12-stage34-exceptions.md.

### Scope of the guarantee (honest boundary)

The gate proves **structural + positional + text/comment parity** of the parse
trees. It does **not** currently compare the renderer-derived aggregates
(`Participants()`, `AllMessages()`, `Depth()`, `Owner()`/`Origin()`) across
engines — those were proven equal during Stage 3+4 (full legacy suite ran green
under the facade) but are not re-checked by the side-car gate, because the
legacy specs now run under ANTLR only (the engine flag that let them run under
Langium was removed for bundle isolation).

For the **LSP use case this is the right boundary**: an LSP consumes the AST
structure and token positions, not the renderer's `SignatureText`/`Owner`. If
stronger behavioural parity is wanted later, extend `dualrun-diff.mjs` to also
diff `Participants(tree)` / `AllMessages(tree)` per case — both engines expose
those (`@/parser` for ANTLR, `compat.ts` for Langium), no production re-coupling
needed.

## Maintenance contract

When the ZenUML DSL changes, **both grammars must change**: `src/g4/*.g4`
(ANTLR) and `src/parser-langium/zenuml.langium`. The CI gate fails if they
diverge, so a missed update on either side is caught before merge — the
discipline is "edit both, let CI prove they agree."

## Status / next steps

- ✅ Production reverted to ANTLR-only; bundle at baseline; side-car isolated.
- ✅ CI consistency gate wired (`parity:dualrun` in `cd.yml`).
- ⏭️ Build the Langium LSP server on `src/parser-langium/` (completion, hover,
  diagnostics, go-to-definition for participants/messages) — separate effort.
- ⏭️ Optional: behavioural dual-run (Participants/AllMessages) if the LSP grows
  to need renderer-equivalent semantics.
- The Stage-5 cutover doc (13) is retained as the historical record of why the
  cutover was attempted and then reverted.
