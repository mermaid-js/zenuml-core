/**
 * Stage-0 parser performance baseline (ANTLR).
 *
 * Measures, for every compare-case DSL plus two synthetic cases (CJK-heavy,
 * large), the median-of-5 wall time of:
 *   - full parse: RootContext(code) from src/parser/index.js
 *   - raw lex:    sequenceLexer + CommonTokenStream.fill() (all channels)
 *
 * Run:  bun scripts/parity/bench-parse.mjs [--json]
 *
 * The harness is parser-agnostic: `benchCorpus(corpus, fn)` times any
 * `(code) => result` function, so a future Langium parser can be benchmarked
 * against the exact same corpus by passing its own parse/lex functions.
 */
import antlr4 from "antlr4";
import { CASES } from "../../e2e/data/compare-cases.js";
import { RootContext } from "../../src/parser/index.js";
import sequenceLexer from "../../src/generated-parser/sequenceLexer.js";

// --- Synthetic cases -------------------------------------------------------

/** 200+ lines of Chinese participant names / messages (lexer worst case:
 *  every identifier char goes through the UNICODE_RANGE alternatives). */
export function buildCjkCase(lines = 220) {
  const participants = ["用户服务", "订单服务", "库存服务", "支付网关", "通知中心"];
  const verbs = ["创建订单", "查询库存", "扣减库存", "发起支付", "发送通知", "更新状态"];
  const out = ["title 中文压力测试用例"];
  for (let i = 0; i < lines; i++) {
    const a = participants[i % participants.length];
    const b = participants[(i + 1) % participants.length];
    const v = verbs[i % verbs.length];
    if (i % 7 === 3) {
      out.push(`${a}.${v}请求第${i}号(参数甲="值${i}", 参数乙=${i}) {`);
      out.push(`  ${b}.处理${v}结果第${i}号`);
      out.push(`}`);
    } else {
      out.push(`${a} -> ${b}: ${v}消息编号${i} 含中文负载内容测试`);
    }
  }
  return out.join("\n");
}

/** 500+ statements: sync calls, async messages, fragments, creation, return. */
export function buildLargeCase(statements = 520) {
  const out = ["title large synthetic case"];
  let count = 0;
  let i = 0;
  while (count < statements) {
    const a = `Svc${i % 12}`;
    const b = `Svc${(i + 5) % 12}`;
    switch (i % 8) {
      case 0:
        out.push(`${a}.method${i}(id=${i}, name="n${i}")`);
        count += 1;
        break;
      case 1:
        out.push(`${a} -> ${b}: async message number ${i}`);
        count += 1;
        break;
      case 2:
        out.push(`if (condition${i}) {`);
        out.push(`  ${a}.guarded${i}()`);
        out.push(`}`);
        count += 2; // fragment + inner statement
        break;
      case 3:
        out.push(`while (busy${i}) {`);
        out.push(`  ${b}.poll${i}()`);
        out.push(`}`);
        count += 2;
        break;
      case 4:
        out.push(`new ${a}Worker${i}(${i})`);
        count += 1;
        break;
      case 5:
        out.push(`${a}.outer${i}() {`);
        out.push(`  ${b}.inner${i}()`);
        out.push(`  return ok${i}`);
        out.push(`}`);
        count += 3;
        break;
      case 6:
        out.push(`// comment for statement ${i}`);
        out.push(`${b}.commented${i}()`);
        count += 1;
        break;
      default:
        out.push(`${a}->${b}.call${i}`);
        count += 1;
        break;
    }
    i++;
  }
  return out.join("\n");
}

// --- Timing harness (parser-agnostic) ---------------------------------------

const WARMUP_RUNS = 2;
const TIMED_RUNS = 5;

export function medianOf(samples) {
  const s = [...samples].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Time `fn(code)` for one case: 2 warm-ups then median of 5. */
export function benchCase(code, fn) {
  for (let i = 0; i < WARMUP_RUNS; i++) fn(code);
  const samples = [];
  for (let i = 0; i < TIMED_RUNS; i++) {
    const t0 = performance.now();
    fn(code);
    samples.push(performance.now() - t0);
  }
  return medianOf(samples);
}

/**
 * Bench a whole corpus with any `(code) => result` function.
 * Returns { perCase: [{name, lines, chars, medianMs}], sumOfMediansMs,
 *           totalPassMedianMs } where totalPassMedianMs is the median-of-5
 * of parsing the entire corpus back-to-back (after 2 warm-up passes).
 */
export function benchCorpus(corpus, fn) {
  const perCase = [];
  for (const [name, code] of Object.entries(corpus)) {
    perCase.push({
      name,
      lines: code === "" ? 0 : code.split("\n").length,
      chars: code.length,
      medianMs: benchCase(code, fn),
    });
  }
  const fullPass = () => {
    for (const code of Object.values(corpus)) fn(code);
  };
  for (let i = 0; i < WARMUP_RUNS; i++) fullPass();
  const totals = [];
  for (let i = 0; i < TIMED_RUNS; i++) {
    const t0 = performance.now();
    fullPass();
    totals.push(performance.now() - t0);
  }
  const sumOfMediansMs = perCase.reduce((acc, c) => acc + c.medianMs, 0);
  return { perCase, sumOfMediansMs, totalPassMedianMs: medianOf(totals) };
}

// --- ANTLR entry points ------------------------------------------------------

/** Full-tree parse via the production entry point. */
export function parseWithAntlr(code) {
  return RootContext(code);
}

/** Raw lexing only: tokenize all channels and fill the token stream. */
export function lexWithAntlr(code) {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  tokens.fill();
  return tokens.tokens;
}

// --- Main --------------------------------------------------------------------

function fmt(ms) {
  return ms.toFixed(3);
}

function main() {
  const corpus = {
    ...CASES,
    "synthetic-cjk-heavy": buildCjkCase(),
    "synthetic-large-520": buildLargeCase(),
  };
  const caseCount = Object.keys(corpus).length;

  const lex = benchCorpus(corpus, lexWithAntlr);
  const parse = benchCorpus(corpus, parseWithAntlr);

  const asJson = process.argv.includes("--json");
  if (asJson) {
    console.log(
      JSON.stringify(
        { bun: Bun.version, platform: process.platform, arch: process.arch, caseCount, lex, parse },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`# ANTLR parse/lex baseline`);
  console.log(`bun ${Bun.version} | ${process.platform} ${process.arch} | ${caseCount} cases`);
  console.log(`warmup=${WARMUP_RUNS} timed=${TIMED_RUNS} (median)`);
  console.log("");
  console.log("| case | lines | chars | lex (ms) | parse (ms) |");
  console.log("| --- | ---: | ---: | ---: | ---: |");
  for (let i = 0; i < parse.perCase.length; i++) {
    const p = parse.perCase[i];
    const l = lex.perCase[i];
    console.log(`| ${p.name} | ${p.lines} | ${p.chars} | ${fmt(l.medianMs)} | ${fmt(p.medianMs)} |`);
  }
  console.log("");
  console.log(`Sum of per-case medians: lex ${fmt(lex.sumOfMediansMs)} ms, parse ${fmt(parse.sumOfMediansMs)} ms`);
  console.log(
    `Full-corpus pass (median of ${TIMED_RUNS}): lex ${fmt(lex.totalPassMedianMs)} ms, parse ${fmt(parse.totalPassMedianMs)} ms`,
  );
}

if (import.meta.main) main();
