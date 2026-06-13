# ANTLR4 → Langium Migration Plan

Source of truth: `07-risk-map.md` (synthesized from docs 01–06).
Strategy: Langium 4.2.4 grammar + custom TokenBuilder + **ANTLR-context-compatible facade**;
renderer (`src/components`, `src/positioning`, `src/store`) and all existing specs stay untouched.
ANTLR remains the live engine until Stage 5 cutover; rollback = one-line flag flip until Stage 6.

Decisions on open questions (07 §6):
1. G1: previous-token-keyed custom pattern first; Chevrotain multi-mode TokenBuilder as fallback.
2. Perf budget: Gate 1 lexer ≤1.5× ANTLR; Gate 5 parse-time reported vs baseline, regression is a blocker to resolve.
3. Generated Langium files are committed (matches `src/generated-parser/` convention).
4. `Depth()` kept on facade (exported from package entry).
5. Dual-run diff harness stays in-tree until Stage 6 review.

## Stage 0: Golden harnesses + baselines (ANTLR only)
**Goal**: token-stream/tree-shape/comment/text goldens committed; perf+bundle baselines; dead code deleted.
**Success Criteria**: `bun run test` green incl. new parity specs asserting ANTLR == goldens.
**Tests**: test/unit/parity/* against committed __golden__ JSON.
**Status**: In Progress

## Stage 1: Lexer parity (terminals + ZenTokenBuilder)
**Goal**: Chevrotain lexer reproduces ANTLR token streams exactly (G1–G3, G5, G6).
**Success Criteria**: golden token-stream harness 100%; token-order snapshot; CJK benchmark ≤1.5×.
**Status**: Not Started

## Stage 2: Parser grammar parity (raw Langium AST)
**Goal**: full .langium grammar with all 25 tolerance points; generate step in bun scripts.
**Success Criteria**: tree-shape goldens match modulo documented mapping; tolerance checklist as raw-AST tests; IfWithoutBody raw equivalent.
**Status**: Not Started

## Stage 3: Compatibility facade
**Goal**: memoized per-kind facade classes, RootContext/Errors/Participants compat exports, comment attachment (G4), ContextsFixture on parse(text,{rule}).
**Success Criteria**: all src/parser/** specs pass unchanged against Langium; dual-run A/B diff empty/explained.
**Status**: Complete — dual-run 190 identical / 8 explained (G7) / 0 unexplained; `instanceof` shim added (src/parser-langium/instanceof-shim.ts) so facade nodes satisfy `instanceof sequenceParser.<Kind>Context`. One accepted exception (`A.m(` recovery), see 12-stage34-exceptions.md.

## Stage 4: Parser-layer services + downstream suites
**Goal**: visitor rewrites of ToCollector/MessageCollector/FrameBuilder/ChildFragmentDetector (re-entrant).
**Success Criteria**: entire `bun run test` green with Langium engine in tests.
**Status**: Complete — `ZENUML_PARSER=langium bun test src/parser test/unit` = 1210 pass / 1 fail (documented `A.m(` G7 exception) / 2 skip; default ANTLR full suite unchanged at 1597/0 (1600).

## Stage 5: Cutover
**Goal**: RootContext default = Langium; core.tsx errors verified; lib build green.
**Success Criteria**: `bun pw` green with zero snapshot updates; perf/bundle deltas reported vs Stage 0.
**Status**: Complete (rebased onto `main` b5100138) — default flipped to Langium (`engine-flag.ts`), full unit suite 1601/0 under both engines, `bun pw` 120/120 zero snapshot updates, goldens regenerated unchanged, lib build green. **Perf rationale neutralized by main's ANTLR perf commits**: new ANTLR (SLL two-stage) is ~12× faster cold on large input than Langium; both memoize on repeat. Bundle +145 KB gz ESM (both engines; ~+89 KB after Stage 6). Migration now justified on tooling/maintenance only — go/no-go before Stage 6. Details in 13-stage5-cutover.md. ANTLR rollback = `ZENUML_PARSER=antlr`.

## Stage 5b: Revert cutover → dual-parser architecture (supersedes Stage 6)
**Decision**: after rebasing onto `main`, main's own ANTLR perf work made the
existing parser faster than Langium, so the full cutover was reverted. End state:
ANTLR ships in production; Langium is a build-time side-car for the LSP server +
the CI consistency gate.
**Done**: `src/parser/*` reverted to ANTLR-only (engine flag + instanceof shim
deleted); library ESM bundle back to baseline (460,986 B gz, zero Chevrotain);
`src/parser-langium/` kept as isolated side-car; CI gate `bun run parity:dualrun`
wired into `cd.yml` (190 identical / 8 G7 / 0 unexplained). Full doc:
14-dual-parser-architecture.md.
**Status**: Complete.

## Stage 6: Decommission — CANCELLED
Not doing it. Removing ANTLR was the whole point of the original cutover; under
the dual-parser model ANTLR is the production parser and stays. Langium lives on
as the LSP side-car.
**Status**: Cancelled (replaced by Stage 5b).

## Langium LSP server — DONE
Built on `src/parser-langium/lsp/`: validation (duplicate-participant warning +
automatic syntax diagnostics), participant-name completion, hover. Node stdio
server `dist/lsp/main.js` (`bun run build:lsp`). 8 `langium/test` feature tests +
stdio boot smoke (in `bun run test`); CI runs `build:lsp`. Library bundle stays
ANTLR-only. Full doc: 14-dual-parser-architecture.md.
Optional next: VS Code extension packaging; go-to-def / semantic tokens / outline.
