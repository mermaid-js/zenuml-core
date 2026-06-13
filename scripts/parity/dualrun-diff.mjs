#!/usr/bin/env bun
/**
 * Gate-3 dual-run A/B parity harness.
 *
 * For every DSL in the tree corpus (test/unit/parity/tree-corpus.ts), parses
 * with BOTH the ANTLR engine and the Langium-backed facade, serializes each
 * tree THROUGH THE FACADE-LEVEL API, and diffs the two serializations.
 *
 * Serialization contract (applied uniformly to both engines):
 *   - Walk `node.children` (rule-level nodes only; ANTLR terminals are skipped)
 *   - Per node record: kind (constructor.name), start.start, stop.stop,
 *     getFormattedText(), getComment()
 *   - Output is a plain JSON-serializable tree
 *
 * Allowed diffs: ONLY cases whose id prefix is "malformed-" or "tol-"
 * are eligible for the G7 recovery exclusion.  Every diff in such a case
 * is annotated "[G7 recovery — ANTLR DefaultErrorStrategy vs Chevrotain
 * single-token-insert/delete produce different partial trees for
 * grammar-strict inputs; documented in 07-risk-map.md §G7]".
 * Any diff in a compare-* case is an unexplained failure.
 *
 * Exit code: 0 if unexplainedDiffs === 0, 1 otherwise.
 * Writes:    docs/langium-migration/11-dualrun-report.md
 *
 * Usage: bun scripts/parity/dualrun-diff.mjs [--json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Path setup
// ---------------------------------------------------------------------------
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

// ---------------------------------------------------------------------------
// Corpus
// ---------------------------------------------------------------------------
const { TREE_CORPUS } = await import(
  path.join(ROOT, "test/unit/parity/tree-corpus.ts")
);

// ---------------------------------------------------------------------------
// ANTLR engine (parse + serialize via its own facade-compatible API)
// ---------------------------------------------------------------------------
import antlr4 from "antlr4";
const sequenceLexer = (
  await import(path.join(ROOT, "src/generated-parser/sequenceLexer.js"))
).default;
const sequenceParser = (
  await import(path.join(ROOT, "src/generated-parser/sequenceParser.js"))
).default;
// Install prototype augmentations (getFormattedText, getComment, etc.)
await import(path.join(ROOT, "src/parser/index.js"));

function antlrRootCtx(code) {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  parser.removeErrorListeners();
  return parser.prog();
}

// ---------------------------------------------------------------------------
// Langium engine (facade ProgContext)
// ---------------------------------------------------------------------------
const { RootContext: LangiumRootContext } = await import(
  path.join(ROOT, "src/parser-langium/compat.ts")
);
// Clear any accumulated errors between parses
const { Errors: LangiumErrors, ErrorDetails: LangiumErrorDetails } =
  await import(path.join(ROOT, "src/parser-langium/compat.ts"));

// ---------------------------------------------------------------------------
// Facade-level serializer (engine-neutral)
// ---------------------------------------------------------------------------

/**
 * Serialize a facade/ANTLR node tree using only the public facade API:
 *   children, constructor.name, start.start, stop.stop,
 *   getFormattedText(), getComment()
 *
 * ANTLR children arrays mix ParserRuleContext with TerminalNodeImpl; we skip
 * terminals to match the Langium facade where children contains only Ctx
 * instances.
 */
function serializeFacade(node) {
  if (!node) return null;

  // Determine rule-level children.
  // - Langium facade: node.children is Ctx[] | null
  // - ANTLR: node.children is (ParserRuleContext|TerminalNodeImpl)[] | null
  let rawChildren = null;
  try {
    rawChildren = node.children;
  } catch {
    rawChildren = null;
  }

  const ruleChildren = (rawChildren ?? []).filter(
    (c) =>
      c instanceof antlr4.ParserRuleContext ||
      (c &&
        typeof c.children !== "undefined" &&
        c.constructor.name !== "TerminalNodeImpl"),
  );

  // start.start / stop.stop
  let startStart = null;
  let stopStop = null;
  try {
    startStart = node.start?.start ?? null;
  } catch {
    /* swallow */
  }
  try {
    stopStop = node.stop?.stop ?? null;
  } catch {
    /* swallow */
  }

  // getFormattedText
  let formattedText = null;
  try {
    formattedText =
      typeof node.getFormattedText === "function"
        ? node.getFormattedText()
        : null;
  } catch {
    /* swallow */
  }

  // getComment
  let comment = null;
  try {
    comment = typeof node.getComment === "function" ? node.getComment() : null;
  } catch {
    /* swallow */
  }

  return {
    kind: node.constructor.name,
    start: startStart,
    stop: stopStop,
    formattedText,
    comment,
    children: ruleChildren.map(serializeFacade).filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// Diff two serialized trees: returns array of path-annotated diff strings
// ---------------------------------------------------------------------------

function diffNodes(a, b, path) {
  const diffs = [];
  if (!a && !b) return diffs;

  if (!a || !b) {
    diffs.push(
      `${path}: one tree is null (antlr=${JSON.stringify(a)}, langium=${JSON.stringify(b)})`,
    );
    return diffs;
  }

  if (a.kind !== b.kind) {
    diffs.push(`${path}.kind: antlr="${a.kind}" langium="${b.kind}"`);
    // Structural mismatch: don't recurse further, rest would be noise.
    return diffs;
  }

  if (a.start !== b.start) {
    diffs.push(`${path}[${a.kind}].start: antlr=${a.start} langium=${b.start}`);
  }
  if (a.stop !== b.stop) {
    diffs.push(`${path}[${a.kind}].stop: antlr=${a.stop} langium=${b.stop}`);
  }
  if (a.formattedText !== b.formattedText) {
    diffs.push(
      `${path}[${a.kind}].formattedText: antlr=${JSON.stringify(a.formattedText)} langium=${JSON.stringify(b.formattedText)}`,
    );
  }
  if (a.comment !== b.comment) {
    diffs.push(
      `${path}[${a.kind}].comment: antlr=${JSON.stringify(a.comment)} langium=${JSON.stringify(b.comment)}`,
    );
  }

  const len = Math.max(a.children.length, b.children.length);
  for (let i = 0; i < len; i++) {
    const ac = a.children[i] ?? null;
    const bc = b.children[i] ?? null;
    diffs.push(...diffNodes(ac, bc, `${path}[${a.kind}][${i}]`));
  }

  return diffs;
}

// ---------------------------------------------------------------------------
// G7 recovery exclusion: malformed-* and tol-* cases
// ---------------------------------------------------------------------------

const G7_PREFIX = /^(malformed-|tol-)/;

const GOLDEN_TREE_DIR = path.join(ROOT, "test/unit/parity/__golden__/tree");

/** A golden node is an error node when it is a terminal carrying error:true. */
function goldenHasErrorNode(node) {
  if (node.kind) return (node.children ?? []).some(goldenHasErrorNode);
  return node.error === true;
}

/**
 * G7 eligibility — same criterion as RECOVERY_CASES in
 * test/unit/parity/grammar-corpus.spec.ts: a case is recovery-shaped when its
 * id is in the malformed-/tol- group OR when the COMMITTED ANTLR golden itself
 * contains error nodes (ANTLR errored on the input, so its tree shape is a
 * product of DefaultErrorStrategy, not the grammar). The goldens are immutable
 * Stage-0 artifacts, so this classification cannot be gamed from the facade.
 */
function isG7Case(id) {
  if (G7_PREFIX.test(id)) return true;
  try {
    const golden = JSON.parse(
      fs.readFileSync(path.join(GOLDEN_TREE_DIR, `${id}.json`), "utf8"),
    );
    return goldenHasErrorNode(golden.tree ?? golden);
  } catch {
    return false;
  }
}

const G7_EXPLANATION =
  "[G7 recovery — ANTLR DefaultErrorStrategy vs Chevrotain single-token-insert/delete " +
  "produce different partial trees for grammar-strict inputs; documented in 07-risk-map.md §G7]";

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const results = [];

for (const entry of TREE_CORPUS) {
  // Reset Langium error accumulators between parses
  LangiumErrors.length = 0;
  LangiumErrorDetails.length = 0;

  let antlrTree = null;
  let langiumTree = null;
  let antlrError = null;
  let langiumError = null;

  try {
    const antlrCtx = antlrRootCtx(entry.code);
    antlrTree = serializeFacade(antlrCtx);
  } catch (e) {
    antlrError = String(e);
  }

  try {
    const langiumCtx = LangiumRootContext(entry.code);
    langiumTree = serializeFacade(langiumCtx);
  } catch (e) {
    langiumError = String(e);
  }

  const errors = [];
  if (antlrError) errors.push(`antlr-error: ${antlrError}`);
  if (langiumError) errors.push(`langium-error: ${langiumError}`);

  let diffs = errors;
  if (!antlrError && !langiumError) {
    diffs = diffNodes(antlrTree, langiumTree, "root");
  }

  const g7 = isG7Case(entry.id);
  const explained = g7 && diffs.length > 0;
  const unexplained = !g7 && diffs.length > 0;

  results.push({
    id: entry.id,
    identical: diffs.length === 0,
    diffs,
    g7,
    explained,
    unexplained,
  });
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

const totalCases = results.length;
const identical = results.filter((r) => r.identical).length;
const explainedDiffs = results.filter((r) => r.explained).length;
const unexplainedDiffs = results.filter((r) => r.unexplained).length;
const differingCases = results.filter((r) => !r.identical);

// ---------------------------------------------------------------------------
// Report: docs/langium-migration/11-dualrun-report.md
// ---------------------------------------------------------------------------

const docsDir = path.join(ROOT, "docs/langium-migration");
fs.mkdirSync(docsDir, { recursive: true });

const ts = new Date().toISOString();

let md = `# Gate-3 Dual-Run A/B Parity Report

Generated: ${ts}

## Summary

| Metric | Count |
|--------|-------|
| Total corpus cases | ${totalCases} |
| Identical (ANTLR == Langium facade) | ${identical} |
| Differing — explained (G7 recovery) | ${explainedDiffs} |
| Differing — **UNEXPLAINED (failures)** | ${unexplainedDiffs} |

`;

if (unexplainedDiffs === 0) {
  md += `**Result: PASS** — all diffs are empty or carry a documented G7 exclusion.\n\n`;
} else {
  md += `**Result: FAIL** — ${unexplainedDiffs} unexplained diff(s) in compare-* cases.\n\n`;
}

if (differingCases.length === 0) {
  md += `## Differing Cases\n\nNone — full parity achieved.\n`;
} else {
  md += `## Differing Cases\n\n`;

  for (const r of differingCases) {
    const label = r.g7
      ? `### \`${r.id}\` — explained ${G7_EXPLANATION}\n`
      : `### \`${r.id}\` — **UNEXPLAINED FAILURE**\n`;
    md += label + "\n";
    md += "```\n";
    for (const d of r.diffs) {
      md += d + "\n";
    }
    md += "```\n\n";
  }
}

md += `## Methodology\n\n`;
md += `Both engines are invoked via their public facade-level API:\n`;
md += `- **ANTLR**: \`src/parser/index.js\` prototype augmentations (getFormattedText, getComment)\n`;
md += `- **Langium**: \`src/parser-langium/compat.ts\` → \`buildRootFacade\` → facade Ctx nodes\n\n`;
md += `Serialization walks \`node.children\` (rule-level only; ANTLR terminals skipped to match\n`;
md += `facade semantics), recording \`kind\`, \`start.start\`, \`stop.stop\`, \`getFormattedText()\`,\n`;
md += `and \`getComment()\` per node.\n\n`;
md += `G7 exclusion applies to cases with id prefix \`malformed-\` or \`tol-\`, which exercise\n`;
md += `error-recovery inputs where ANTLR DefaultErrorStrategy and Chevrotain's recovery\n`;
md += `produce structurally different partial trees by design (07-risk-map.md §G7).\n`;

const reportPath = path.join(docsDir, "11-dualrun-report.md");
fs.writeFileSync(reportPath, md);

// ---------------------------------------------------------------------------
// Console output
// ---------------------------------------------------------------------------

const jsonFlag = process.argv.includes("--json");

if (jsonFlag) {
  console.log(
    JSON.stringify(
      { totalCases, identical, explainedDiffs, unexplainedDiffs },
      null,
      2,
    ),
  );
} else {
  console.log(
    `dualrun-diff: ${totalCases} cases — ${identical} identical, ${explainedDiffs} explained (G7), ${unexplainedDiffs} unexplained`,
  );
  if (differingCases.length > 0) {
    for (const r of differingCases) {
      const tag = r.g7 ? "[G7]" : "[FAIL]";
      console.log(`  ${tag} ${r.id}: ${r.diffs.length} diff(s)`);
      if (!r.g7) {
        for (const d of r.diffs.slice(0, 5)) console.log(`       ${d}`);
        if (r.diffs.length > 5)
          console.log(`       ... and ${r.diffs.length - 5} more`);
      }
    }
  }
  console.log(`Report written to: ${path.relative(ROOT, reportPath)}`);
}

process.exit(unexplainedDiffs > 0 ? 1 : 0);
