/**
 * Stage-1 lexer benchmark: Chevrotain (src/parser-langium/lexer) vs ANTLR.
 *
 * Reuses the corpus + median-of-5 harness from bench-parse.mjs (all 148
 * compare-cases plus the CJK-heavy and large synthetic cases) and measures,
 * in the SAME process for a fair same-load comparison:
 *   - antlr-lex:       sequenceLexer + CommonTokenStream.fill() (all channels)
 *   - chevrotain-raw:  lexer.tokenize(code) only (no group merging)
 *   - chevrotain-full: lexWithLangium(code) (tokenize + channel-group merge,
 *                      the parity adapter shape)
 *
 * Run:  bun scripts/parity/bench-lex-langium.mjs [--json]
 *
 * Gate-1 budget (docs/langium-migration/08-baselines.md): Chevrotain raw
 * tokenize ≤ 1.5× ANTLR lex on the fresh same-process ANTLR numbers.
 */
import {
  buildCjkCase,
  buildLargeCase,
  benchCorpus,
  lexWithAntlr,
} from "./bench-parse.mjs";
import { CASES } from "../../e2e/data/compare-cases.js";
import { lexer, lexWithLangium } from "../../src/parser-langium/lexer/index.ts";

const BUDGET_RATIO = 1.5;

function tokenizeRaw(code) {
  return lexer.tokenize(code);
}

function fmt(ms) {
  return ms.toFixed(3);
}

function ratio(a, b) {
  return b === 0 ? "n/a" : (a / b).toFixed(2);
}

function main() {
  const corpus = {
    ...CASES,
    "synthetic-cjk-heavy": buildCjkCase(),
    "synthetic-large-520": buildLargeCase(),
  };
  const caseCount = Object.keys(corpus).length;

  const antlr = benchCorpus(corpus, lexWithAntlr);
  const raw = benchCorpus(corpus, tokenizeRaw);
  const full = benchCorpus(corpus, lexWithLangium);

  const verdict = {
    budgetRatio: BUDGET_RATIO,
    rawVsAntlrSum: raw.sumOfMediansMs / antlr.sumOfMediansMs,
    fullVsAntlrSum: full.sumOfMediansMs / antlr.sumOfMediansMs,
    withinBudget: raw.sumOfMediansMs <= BUDGET_RATIO * antlr.sumOfMediansMs,
  };

  if (process.argv.includes("--json")) {
    console.log(
      JSON.stringify(
        {
          bun: Bun.version,
          platform: process.platform,
          arch: process.arch,
          caseCount,
          antlr,
          chevrotainRaw: raw,
          chevrotainFull: full,
          verdict,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`# Chevrotain vs ANTLR lex benchmark (Stage 1)`);
  console.log(`bun ${Bun.version} | ${process.platform} ${process.arch} | ${caseCount} cases`);
  console.log(`warmup=2 timed=5 (median); same process, ANTLR re-run fresh`);
  console.log("");
  console.log(
    "| case | lines | chars | antlr lex (ms) | chevrotain raw (ms) | chevrotain merged (ms) | raw/antlr |",
  );
  console.log("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < antlr.perCase.length; i++) {
    const a = antlr.perCase[i];
    const r = raw.perCase[i];
    const f = full.perCase[i];
    console.log(
      `| ${a.name} | ${a.lines} | ${a.chars} | ${fmt(a.medianMs)} | ${fmt(r.medianMs)} | ${fmt(f.medianMs)} | ${ratio(r.medianMs, a.medianMs)} |`,
    );
  }
  console.log("");
  console.log(
    `Sum of per-case medians: antlr ${fmt(antlr.sumOfMediansMs)} ms, ` +
      `chevrotain raw ${fmt(raw.sumOfMediansMs)} ms (${ratio(raw.sumOfMediansMs, antlr.sumOfMediansMs)}x), ` +
      `chevrotain merged ${fmt(full.sumOfMediansMs)} ms (${ratio(full.sumOfMediansMs, antlr.sumOfMediansMs)}x)`,
  );
  console.log(
    `Full-corpus pass (median of 5): antlr ${fmt(antlr.totalPassMedianMs)} ms, ` +
      `chevrotain raw ${fmt(raw.totalPassMedianMs)} ms, chevrotain merged ${fmt(full.totalPassMedianMs)} ms`,
  );
  console.log(
    `Budget (raw ≤ ${BUDGET_RATIO}× antlr sum): ${verdict.withinBudget ? "PASS" : "FAIL"} ` +
      `(${ratio(raw.sumOfMediansMs, antlr.sumOfMediansMs)}x)`,
  );
}

main();
