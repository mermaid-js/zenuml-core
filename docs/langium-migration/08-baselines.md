# 08 — Stage-0 Performance & Bundle Baselines (ANTLR)

Recorded at Stage 0 of the ANTLR4 → Langium migration, **before any Langium code
exists**. Every number below is from the current production ANTLR parser. Later
stages (Gate 1 lexer benchmark, Gate 5 launch budgets — see `07-risk-map.md` R7)
diff against these tables.

## 1. Environment

| | |
| --- | --- |
| Date | 2026-06-11 |
| Machine | Apple M4, 10 cores, 32 GB RAM |
| OS | macOS 15.5 (darwin arm64) |
| Runtime | Bun 1.2.22 |
| antlr4 (npm) | ~4.11.0 |
| Branch / commit | `codex/parser-renderer-performance` worktree, on top of `59c115c0` |

## 2. Method

- Script: `scripts/parity/bench-parse.mjs` (run with `bun scripts/parity/bench-parse.mjs`,
  add `--json` for machine-readable output). The timing harness (`benchCorpus`) is
  parser-agnostic: it times any `(code) => result` function, so the Langium
  implementation is benchmarked later by passing its own `parse`/`lex` functions
  over the same corpus.
- Corpus: all 148 compare-case DSLs from `e2e/data/compare-cases.js` plus two
  synthetic cases built by the script:
  - `synthetic-cjk-heavy` — 283 lines / 8,616 chars of Chinese participant
    names, messages, and named parameters (lexer worst case: every identifier
    character exercises the `UNICODE_RANGE` alternatives).
  - `synthetic-large-520` — 694 lines / 12,810 chars, 520+ statements mixing
    sync calls, async messages, fragments, creation, return, comments.
- **parse** = `RootContext(code)` from `src/parser/index.js` (full tree, the
  production entry point; no memoization — verified, every call re-parses).
- **lex** = `new sequenceLexer(new antlr4.InputStream(code))` →
  `CommonTokenStream.fill()` (all channels), no parser.
- Per case: 2 warm-up runs, then median of 5 timed runs (`performance.now()`).
- Run-to-run variance for the aggregate is roughly ±15% on this machine
  (two consecutive full runs gave parse sums of 4,142 ms and 4,777 ms);
  per-case medians on small inputs jitter more. Treat small-case numbers as
  order-of-magnitude, the synthetic/large cases as the stable signal.
- Note: a handful of compare-cases intentionally contain grammar-invalid input
  (e.g. emoji `[...]` prefixes trigger "no viable alternative at input '[:'" on
  stderr). The errors are recoverable; timing includes ANTLR error recovery,
  which is representative of production behaviour.

## 3. Headline numbers

| metric | lex (ms) | parse (ms) |
| --- | ---: | ---: |
| Sum of per-case medians (150 cases) | 443.4 | 4,777.3 |
| Full-corpus single pass (median of 5) | 443.3 | 4,242.5 |
| `synthetic-cjk-heavy` (283 lines) | 70.2 | 497.5 |
| `synthetic-large-520` (694 lines) | 178.5 | 1,476.2 |
| Largest real case `demo1-smoke` (60 lines) | 11.9 | 192.0 |

Parse time is ~10× lex time across the corpus: ANTLR adaptive prediction
(ALL(*)) dominates total cost, not tokenization. Per line, CJK lexing
(70.2 ms / 283 lines ≈ 0.25 ms/line) and ASCII lexing
(178.5 ms / 694 lines ≈ 0.26 ms/line) are comparable on this grammar —
the `UNICODE_RANGE` alternatives do not blow up ANTLR's lexer ATN the way
`\p{L}` regexes are expected to hit Chevrotain's optimizer (R7). The Gate-1
CJK budget should be set against the 70.2 ms lex / 497.5 ms parse figures.

## 4. Per-case results

| case | lines | chars | lex (ms) | parse (ms) |
| --- | ---: | ---: | ---: | ---: |
| empty | 0 | 0 | 0.124 | 0.074 |
| single-participant | 1 | 1 | 0.084 | 0.769 |
| sync-call | 1 | 3 | 0.217 | 1.192 |
| simple-messages | 4 | 57 | 1.146 | 3.797 |
| named-params | 7 | 273 | 2.993 | 29.385 |
| nested-sync | 3 | 25 | 0.518 | 5.369 |
| self-sync | 5 | 44 | 0.754 | 8.000 |
| demo5-self-named | 1 | 28 | 0.505 | 6.411 |
| nested-occurrence | 6 | 67 | 0.862 | 11.858 |
| interaction | 11 | 133 | 1.917 | 33.718 |
| nested-fragment | 12 | 195 | 1.998 | 33.297 |
| nested-outbound | 12 | 198 | 2.052 | 35.490 |
| if-then-continue | 6 | 35 | 0.927 | 12.933 |
| participant-width | 1 | 26 | 0.101 | 0.922 |
| async-1 | 9 | 107 | 1.194 | 5.752 |
| async-2 | 22 | 299 | 3.567 | 51.576 |
| async-3 | 18 | 235 | 2.922 | 46.943 |
| async-self | 1 | 15 | 0.129 | 0.576 |
| async-self-nested | 3 | 26 | 0.387 | 3.794 |
| demo6-async-styled | 3 | 41 | 0.383 | 1.676 |
| repro-alt-simple | 5 | 53 | 0.920 | 4.592 |
| repro-alt-branches | 7 | 93 | 1.466 | 10.463 |
| repro-alt-tcf-only | 10 | 131 | 2.045 | 24.308 |
| repro-alt-nested-tcf | 14 | 197 | 3.019 | 18.726 |
| if-fragment | 6 | 123 | 0.739 | 6.068 |
| fragment-loop | 4 | 53 | 0.716 | 4.693 |
| fragment-tcf | 9 | 98 | 1.581 | 13.452 |
| fragment | 19 | 244 | 3.181 | 42.081 |
| fragments-return | 14 | 140 | 2.417 | 31.642 |
| fragment-issue | 14 | 371 | 2.653 | 40.206 |
| nested-fragment-indent | 9 | 72 | 1.475 | 19.075 |
| creation | 4 | 38 | 0.703 | 8.484 |
| creation-return | 3 | 28 | 0.653 | 8.138 |
| creation-rtl | 5 | 50 | 0.938 | 12.271 |
| creation-long-name | 1 | 47 | 0.165 | 0.794 |
| comment-creation | 4 | 35 | 0.615 | 5.644 |
| defect-406 | 18 | 171 | 2.990 | 70.110 |
| return | 14 | 261 | 2.528 | 54.377 |
| return-in-nested-if | 8 | 75 | 1.270 | 23.277 |
| return-single-explicit | 4 | 35 | 0.650 | 18.953 |
| return-two-explicit | 6 | 66 | 1.058 | 15.774 |
| return-nested-then-direct | 7 | 87 | 1.309 | 22.963 |
| return-only-two | 5 | 56 | 0.883 | 12.883 |
| return-assign-rtl | 6 | 57 | 1.122 | 22.292 |
| return-assign-ltr | 4 | 40 | 0.816 | 14.224 |
| return-keyword-ltr | 6 | 57 | 1.107 | 20.341 |
| repro-return-after-creation | 4 | 58 | 0.575 | 7.979 |
| vertical-1 | 4 | 32 | 0.487 | 3.039 |
| vertical-2 | 2 | 14 | 0.169 | 0.513 |
| vertical-3 | 16 | 112 | 2.190 | 15.269 |
| vertical-4 | 21 | 167 | 3.093 | 23.320 |
| vertical-5 | 19 | 201 | 3.007 | 40.077 |
| vertical-6 | 8 | 51 | 1.180 | 5.670 |
| vertical-7 | 4 | 31 | 0.486 | 2.178 |
| vertical-8 | 9 | 168 | 1.418 | 13.774 |
| vertical-9 | 2 | 18 | 0.219 | 0.995 |
| vertical-10 | 10 | 77 | 1.557 | 26.877 |
| vertical-11 | 6 | 68 | 0.971 | 11.173 |
| smoke | 17 | 513 | 3.263 | 32.948 |
| demo1-smoke | 60 | 1470 | 11.914 | 191.995 |
| demo3-nested-fragments | 38 | 427 | 7.268 | 132.958 |
| demo4-fragment-span | 16 | 216 | 3.386 | 106.048 |
| repro-participant-y | 1 | 13 | 0.189 | 0.775 |
| repro-occ-basics | 1 | 10 | 0.157 | 1.983 |
| repro-occ-height | 6 | 33 | 0.858 | 12.686 |
| repro-creation-width | 3 | 39 | 0.976 | 6.548 |
| repro-comment | 8 | 86 | 1.311 | 10.009 |
| repro-msg-y | 1 | 11 | 0.200 | 0.720 |
| repro-occ-depth2 | 7 | 68 | 1.423 | 21.846 |
| repro-comment-async-self | 4 | 48 | 0.541 | 5.714 |
| repro-debt-drift | 9 | 107 | 1.754 | 33.790 |
| repro-fragment-section-debt | 9 | 101 | 1.708 | 32.803 |
| repro-creation-in-try | 12 | 159 | 2.607 | 36.728 |
| occ-bar-length | 9 | 112 | 1.737 | 31.214 |
| return-after-block | 11 | 170 | 2.232 | 40.186 |
| repro-assign-return | 5 | 70 | 1.036 | 15.413 |
| repro-occ-empty | 4 | 34 | 0.686 | 8.861 |
| repro-occ-sync | 5 | 48 | 0.976 | 25.146 |
| repro-occ-return | 5 | 56 | 0.897 | 14.074 |
| repro-occ-mixed | 6 | 70 | 1.137 | 21.153 |
| repro-occ-mixed-keyword | 6 | 66 | 1.038 | 34.314 |
| repro-occ-mixed-2ret | 7 | 94 | 1.364 | 63.149 |
| repro-occ-mixed-mid | 7 | 86 | 1.312 | 56.961 |
| repro-creation-params | 1 | 8 | 0.186 | 1.201 |
| repro-just-B | 1 | 1 | 0.034 | 0.618 |
| repro-starter-B | 1 | 3 | 0.095 | 2.156 |
| repro-starter-B-long | 1 | 45 | 0.098 | 1.332 |
| repro-color-boundary | 3 | 85 | 0.501 | 2.676 |
| repro-ec2-stereotype-color | 2 | 62 | 0.518 | 5.779 |
| repro-service-icons | 3 | 107 | 0.385 | 6.578 |
| repro-group-container | 5 | 99 | 0.691 | 6.075 |
| order-service | 24 | 513 | 4.285 | 146.613 |
| repro-label-dy | 7 | 103 | 1.389 | 18.611 |
| repro-creation-return-arrow | 4 | 46 | 0.841 | 12.014 |
| repro-comment-pos | 6 | 94 | 0.799 | 4.821 |
| repro-nested-fragment | 11 | 131 | 1.821 | 53.286 |
| repro-icon-stereo-group | 9 | 197 | 1.601 | 16.273 |
| repro-par-divider | 6 | 52 | 0.994 | 15.527 |
| divider | 4 | 52 | 0.477 | 1.545 |
| emoji-participant | 2 | 39 | 0.361 | 2.925 |
| emoji-multi-participants | 5 | 91 | 0.829 | 6.472 |
| emoji-with-type | 3 | 68 | 0.652 | 4.305 |
| emoji-with-stereotype | 3 | 72 | 0.768 | 3.987 |
| emoji-no-emoji-baseline | 5 | 68 | 0.466 | 5.133 |
| emoji-async-message | 3 | 28 | 0.260 | 3.006 |
| emoji-alt-condition | 6 | 64 | 0.677 | 7.349 |
| emoji-comment | 4 | 39 | 0.329 | 2.820 |
| icons | 10 | 108 | 1.496 | 24.708 |
| emoji-sync-call | 3 | 44 | 0.701 | 7.688 |
| emoji-nested-calls | 5 | 79 | 1.175 | 15.055 |
| emoji-async-return | 4 | 115 | 0.790 | 7.670 |
| emoji-with-fragment | 7 | 157 | 1.587 | 16.065 |
| emoji-divider-case | 3 | 77 | 0.810 | 18.426 |
| emoji-group-case | 3 | 89 | 1.108 | 30.267 |
| emoji-group-case-2groups | 4 | 114 | 1.301 | 11.572 |
| group-minimal | 1 | 11 | 0.219 | 2.325 |
| group-single-participant | 3 | 80 | 0.923 | 7.938 |
| emoji-comment-styled | 4 | 102 | 0.900 | 5.615 |
| emoji-colon-override | 3 | 52 | 0.482 | 0.610 |
| emoji-icon-combo | 3 | 63 | 0.739 | 6.299 |
| emoji-long-names | 3 | 127 | 0.915 | 7.123 |
| emoji-simple-async | 2 | 45 | 0.450 | 1.694 |
| emoji-self-call | 3 | 49 | 0.597 | 7.269 |
| emoji-title | 2 | 58 | 0.441 | 4.979 |
| emoji-nested-sync-deep | 7 | 107 | 1.618 | 30.703 |
| emoji-async-many | 5 | 106 | 0.971 | 7.048 |
| emoji-if-else | 6 | 122 | 1.433 | 11.340 |
| emoji-tcf | 9 | 132 | 2.193 | 20.015 |
| emoji-loop | 5 | 93 | 1.367 | 14.614 |
| emoji-par | 6 | 92 | 1.283 | 40.992 |
| emoji-return-chain | 6 | 126 | 1.420 | 21.213 |
| emoji-creation-simple | 3 | 30 | 0.619 | 5.737 |
| emoji-color | 3 | 63 | 0.711 | 3.454 |
| emoji-stereotype-only | 3 | 65 | 0.846 | 6.192 |
| emoji-method-name | 3 | 65 | 1.002 | 7.569 |
| emoji-condition-label | 7 | 157 | 1.617 | 12.902 |
| emoji-in-conditions | 7 | 107 | 1.811 | 6.525 |
| emoji-tcf-labels | 9 | 114 | 1.793 | 18.791 |
| emoji-loop-condition | 4 | 78 | 0.953 | 10.614 |
| emoji-opt-critical | 7 | 114 | 1.825 | 14.833 |
| emoji-nested-mixed | 13 | 273 | 3.447 | 52.362 |
| emoji-all-features | 18 | 398 | 3.781 | 33.924 |
| emoji-chained-calls | 1 | 52 | 0.776 | 4.834 |
| emoji-assign-return | 4 | 94 | 1.261 | 13.391 |
| emoji-multi-async | 4 | 115 | 0.903 | 3.396 |
| emoji-named-params | 2 | 98 | 1.239 | 11.250 |
| emoji-self-sync | 5 | 76 | 1.266 | 24.086 |
| emoji-fragments-return | 7 | 111 | 1.773 | 13.125 |
| synthetic-cjk-heavy | 283 | 8616 | 70.158 | 497.533 |
| synthetic-large-520 | 694 | 12810 | 178.529 | 1476.232 |

Sum of per-case medians: lex 443.408 ms, parse 4777.330 ms
Full-corpus pass (median of 5): lex 443.304 ms, parse 4242.508 ms

```
Sum of per-case medians:           lex 443.408 ms   parse 4777.330 ms
Full-corpus pass (median of 5):    lex 443.304 ms   parse 4242.508 ms
```

## 5. Bundle baseline

`bun run build` (= `build:lib` via `vite.config.lib.ts` + `build:cli` via
`vite.config.cli.ts`), Vite 6.4.1. Gzip via `gzip -9 -c <file> | wc -c`.

| artifact | raw (bytes) | gzip -9 (bytes) |
| --- | ---: | ---: |
| `dist/zenuml.esm.mjs` (library ESM) | 2,447,171 | 460,638 |
| `dist/zenuml.js` (UMD, self-contained) | 3,455,768 | 859,172 |
| `dist/cloud-icons-*.js` (lazy chunk) | 1,575,958 | 471,618 |
| `dist/cli/zenuml.mjs` (CLI, unminified SSR) | 467,309 | 87,944 |

No source maps are emitted by the lib build, so the antlr4/generated-parser
share was estimated with **probe bundles**: `bun build --minify --target browser`
over an entry that imports only the modules in question (same minifier class,
not byte-identical to Vite/Rollup output — treat as ±10% estimates):

| probe bundle (minified) | raw (bytes) | gzip -9 (bytes) | share of ESM gzip |
| --- | ---: | ---: | ---: |
| antlr4 runtime only | 109,847 | 28,204 | ~6.1% |
| antlr4 + `src/generated-parser/` (lexer, parser, listener) | 261,041 | 54,694 | ~11.9% |
| → generated parser increment | 151,194 | ~26,490 | ~5.8% |

Source sizes for reference: `src/generated-parser/` = 254,856 bytes unminified
(lexer 50,899 + parser 189,664 + listener 14,293); antlr4 npm `src/antlr4/` =
804 KB on disk.

**Interpretation for R7 (07-risk-map):** the ANTLR stack costs ~55 KB gzipped
inside the ESM bundle today. A Langium/Chevrotain stack must be compared
against this 55 KB figure, not against zero.

## 6. How to regenerate

```sh
bun scripts/parity/bench-parse.mjs          # human-readable tables
bun scripts/parity/bench-parse.mjs --json   # machine-readable
bun run build                                # then gzip -9 -c dist/<f> | wc -c
```

## 7. Stage 1 results — Chevrotain lexer vs ANTLR lex (Gate 1)

Recorded 2026-06-11 on the same machine/runtime as §1 (Apple M4, Bun 1.2.22),
after the Chevrotain lexer at `src/parser-langium/lexer/` reached 100%
token-stream parity (`test/unit/parity/lexer-parity-langium.spec.ts`,
100/100 goldens green).

- Script: `scripts/parity/bench-lex-langium.mjs` (reuses the corpus +
  median-of-5/2-warmup harness from `bench-parse.mjs`; run with `--json` for
  machine-readable output).
- Same 150-case corpus as §2 (148 compare-cases + `synthetic-cjk-heavy` +
  `synthetic-large-520`). The ANTLR side was **re-run fresh in the same
  process** for a fair same-load comparison — its numbers below (sum 429 ms)
  match the §3 baseline (443 ms) within the documented ±15% variance.
- `chevrotain raw` = `lexer.tokenize(code)` only. `chevrotain merged` = the
  full `lexWithLangium` parity adapter (tokenize + channel-group merge by
  startOffset + plain-object mapping).
- The lexer runs with `safeMode: true` (first-char optimization OFF — required
  for correctness of the `\p{L}` custom patterns, see `lexer/index.ts`) and
  `positionTracking: "onlyOffset"`. No further tuning
  (`start_chars_hint`, `ensureOptimizations`) was needed.

### Headline numbers

| metric | antlr lex (ms) | chevrotain raw (ms) | chevrotain merged (ms) | raw vs antlr |
| --- | ---: | ---: | ---: | ---: |
| Sum of per-case medians (150 cases) | 429.2 | 5.38 | 5.35 | 0.013× |
| Full-corpus single pass (median of 5) | 415.3 | 4.93 | 5.38 | 0.012× |
| `synthetic-cjk-heavy` (283 lines) | 68.6 | 0.81 | 0.86 | 0.012× |
| `synthetic-large-520` (694 lines) | 164.1 | 1.72 | 1.87 | 0.010× |
| `demo1-smoke` (60 lines, largest real case) | 13.1 | 0.13 | 0.13 | 0.010× |

(raw vs merged differences are inside run-to-run jitter — the group-merge
adapter overhead is negligible.)

### Verdict

**PASS — far within budget.** The Gate-1 budget was Chevrotain ≤ 1.5× ANTLR;
the measured ratio is **~0.013× (≈80–100× faster)** on every aggregate and
every individual case, including the CJK worst case that risk R7 flagged for
Chevrotain's `\p{L}` handling. Even with `safeMode: true` disabling the
first-char bucket optimization, the custom sticky-`u`-regex patterns are two
orders of magnitude faster than the ANTLR JS lexer ATN. No Lexer config tuning
was applied, so token order and patterns are untouched; the parity spec
(100/100) was re-run green after the benchmark-only export change
(`export const lexer` in `src/parser-langium/lexer/index.ts`).

Sanity check accompanying the numbers: for all 150 corpus cases, ANTLR
token count (EOF excluded) == merged adapter count == raw tokens+groups count,
with zero Chevrotain lex errors.

### How to regenerate

```sh
bun scripts/parity/bench-lex-langium.mjs          # human-readable table
bun scripts/parity/bench-lex-langium.mjs --json   # machine-readable
bun test test/unit/parity/lexer-parity-langium.spec.ts  # parity guard
```
