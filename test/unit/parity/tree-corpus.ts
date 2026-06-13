/**
 * Corpus for the golden tree-shape parity harness (Stage 0).
 *
 * Three groups:
 *   compare-*   — ALL compare-case DSLs from e2e/data/compare-cases.js
 *                 (the single source of truth for E2E comparison pages).
 *   malformed-* — the G7 malformed-input corpus from
 *                 docs/langium-migration/07-risk-map.md (error-recovery
 *                 behavior comes from ANTLR's DefaultErrorStrategy, NOT the
 *                 grammar — these trees must be characterized before porting).
 *   tol-NN-*    — the 25 grammar-encoded error-tolerance points from
 *                 docs/langium-migration/02-parser-rules.md §8 (one entry per
 *                 input variant; NN is the checklist row number).
 *
 * Each entry's id is the golden filename:
 *   test/unit/parity/__golden__/tree/<id>.json
 * Regenerate with: bun scripts/parity/regen-tree-goldens.mjs
 */
import { CASES } from "../../../e2e/data/compare-cases.js";

export interface TreeCorpusEntry {
  id: string;
  code: string;
}

const compareCases: TreeCorpusEntry[] = Object.entries(
  CASES as Record<string, string>,
).map(([name, code]) => ({ id: `compare-${name}`, code }));

// G7 list (07-risk-map.md): inputs the grammar is deliberately strict about,
// whose current trees are produced by ANTLR's DefaultErrorStrategy.
const malformedCases: TreeCorpusEntry[] = [
  { id: "malformed-unclosed-brace-after-message", code: "A.m {" },
  { id: "malformed-unclosed-paren-in-creation", code: "new A(" },
  { id: "malformed-bare-try", code: "try" },
  { id: "malformed-half-arrow", code: "A -" },
  { id: "malformed-nested-if-typo", code: "if(x) { if(y() {}}" },
  { id: "malformed-if-unclosed-paren", code: "if(x" },
];

// 02-parser-rules.md §8 — the 25 tolerance points. Rows listing several input
// variants get one entry per variant (suffix a/b/c…).
const toleranceCases: TreeCorpusEntry[] = [
  { id: "tol-01-empty-file", code: "" },
  { id: "tol-02-title-no-text", code: "title" },
  { id: "tol-03a-group-bare", code: "group" },
  { id: "tol-03b-group-named", code: "group A" },
  { id: "tol-03c-group-unclosed", code: "group A {" },
  { id: "tol-04a-starter-annotation", code: "@Starter" },
  { id: "tol-04b-starter-annotation-parens", code: "@Starter()" },
  { id: "tol-05a-stereotype-open", code: "<<" },
  { id: "tol-05b-stereotype-empty", code: "<<>>" },
  { id: "tol-05c-stereotype-partial", code: "<<name" },
  { id: "tol-06-as-no-alias", code: "A as" },
  { id: "tol-07a-bare-annotation-participant", code: "@Actor" },
  { id: "tol-07b-bare-stereotype-participant", code: "<<x>>" },
  { id: "tol-08-return-no-expr", code: "return" },
  { id: "tol-09a-return-async-half-arrow", code: "A ~>" },
  { id: "tol-09b-return-async-no-colon", code: "A ~> B" },
  { id: "tol-10a-bare-par", code: "par" },
  { id: "tol-10b-bare-opt", code: "opt" },
  { id: "tol-10c-bare-critical", code: "critical" },
  { id: "tol-10d-bare-section", code: "section" },
  { id: "tol-11a-anonymous-section", code: "{ A.m }" },
  { id: "tol-11b-orphan-block-after-ref", code: "ref(x) { m1 }" },
  { id: "tol-12a-bare-new", code: "new" },
  { id: "tol-12b-assign-new", code: "a = new" },
  { id: "tol-13-assignment-nothing-after", code: "ret =" },
  { id: "tol-14a-fromto-dot-no-method", code: "A->B." },
  { id: "tol-14b-target-dot-no-method", code: "B." },
  { id: "tol-15-method-no-parens", code: "A.method" },
  { id: "tol-16-async-no-payload", code: "A->B:" },
  { id: "tol-17a-half-arrow-minus", code: "A -" },
  { id: "tol-17b-half-arrow-no-target", code: "A ->" },
  { id: "tol-17c-half-arrow-minus-target", code: "A - B" },
  { id: "tol-18-trailing-comma", code: "m(a,)" },
  { id: "tol-19-named-param-no-value", code: "m(a=)" },
  { id: "tol-20-if-empty-condition", code: "if()" },
  { id: "tol-21-if-unclosed-paren", code: "if(x" },
  { id: "tol-22a-if-no-body", code: "if(x)" },
  {
    id: "tol-22b-if-no-body-siblings",
    // IfWithoutBody.spec.ts contract: following stats stay siblings.
    code: `BookLibService.Borrow(id) {
  User = Session.GetUser()
  if()
  return receipt
}`,
  },
  { id: "tol-22c-else-if-no-body", code: "if(x){} else if(y)" },
  { id: "tol-22d-else-no-body", code: "if(x){} else" },
  { id: "tol-23a-bare-while", code: "while" },
  { id: "tol-23b-while-no-body", code: "while(x)" },
  { id: "tol-24-empty-braces", code: "{}" },
  { id: "tol-25-free-text-condition", code: "while(no more retries)" },
];

export const TREE_CORPUS: TreeCorpusEntry[] = [
  ...compareCases,
  ...malformedCases,
  ...toleranceCases,
];

// Guard: ids double as golden filenames — they must be unique.
const seen = new Set<string>();
for (const { id } of TREE_CORPUS) {
  if (seen.has(id)) {
    throw new Error(`tree-corpus: duplicate corpus id "${id}"`);
  }
  if (!/^[A-Za-z0-9._-]+$/.test(id)) {
    throw new Error(`tree-corpus: id "${id}" is not filesystem-safe`);
  }
  seen.add(id);
}
