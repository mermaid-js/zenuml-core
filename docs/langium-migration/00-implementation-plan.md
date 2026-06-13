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
**Status**: Complete — default flipped to Langium (`engine-flag.ts`), full unit suite 1597/0 under both engines, `bun pw` 120/120 with zero snapshot updates, lib build green. Parse ~107× faster than ANTLR; bundle +144 KB gz ESM (both engines shipped; ~+89 KB after Stage 6). Details in 13-stage5-cutover.md. ANTLR rollback = `ZENUML_PARSER=antlr`.

## Stage 6: Decommission (separate PR)
**Goal**: remove antlr4, src/generated-parser/, src/g4/, `bun antlr`; update docs.
**Status**: Not Started
