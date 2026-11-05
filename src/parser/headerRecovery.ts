// Newlines are hidden from the parsers, so a fragment header that is still being
// typed reads the next line as its own text: `if(a ==` + `A.c()` becomes the
// condition `a == A.c()`, and `try` + `A.c()` takes every later statement as
// its body (issue #670). The grammar cannot stop that with bounded lookahead,
// because `if(a ==\n  b) {}` is valid DSL.
//
// This plan looks at the whole token list instead. A header that never closes
// ends at the end of its line, and the tokens the grammar needs are added there.
// Complete DSL is never rewritten: every edit needs a `(` with no matching `)`,
// or a keyword with its `(` or `{` missing. Both engines apply the same plan, in
// HeaderRecoveringLexer (ANTLR) and ZenLexer (Langium). This file imports
// neither, so the browser bundle of one engine does not pull in the other.

/** A token the parser sees. Comments and whitespace are not part of the list. */
export interface HeaderToken {
  /** Token name, the same in both engines. The list ends with kind `EOF`. */
  kind: string;
  line: number;
}

export interface HeaderRecoveryPlan {
  /** Replace tokens `first`..`last` with one ID holding their source text. */
  merges: { first: number; last: number }[];
  /** Token kinds to add, with no width and no text, after a token index. */
  insertions: Map<number, string[]>;
  /** Syntax errors to report: `missing <expected> at <token at index>`. */
  errors: { at: number; expected: string }[];
}

interface HeaderRule {
  /** The grammar has no form of this keyword without `(`. */
  parenRequired?: boolean;
  /** Parens are part of the header (`opt(x)`), not only of a bare keyword. */
  hasParens?: boolean;
  /**
   * `always`: no form without `{`. `withParens`: bare `opt` is fine, `opt(x)`
   * is not. Unset: the grammar makes the block optional (`if`, `while`).
   */
  body?: "always" | "withParens";
}

const HEADER_RULES = new Map<string, HeaderRule>([
  ["IF", { hasParens: true, parenRequired: true }],
  ["WHILE", { hasParens: true }],
  ["OPT", { hasParens: true, body: "withParens" }],
  ["PAR", { hasParens: true, body: "withParens" }],
  ["CRITICAL", { hasParens: true, body: "withParens" }],
  ["SECTION", { hasParens: true, body: "withParens" }],
  ["REF", { hasParens: true, parenRequired: true }],
  ["TRY", { body: "always" }],
  ["CATCH", { hasParens: true, body: "always" }],
  ["FINALLY", { body: "always" }],
]);

// Tokens the `atom` rule takes alone. A header text of one such token keeps its
// own kind, so `if(3` stays a number and `if("a b` stays a string.
const ATOM_KINDS = new Set([
  "ID",
  "DIGIT_LEADING_NAME",
  "CSTRING",
  "USTRING",
  "INT",
  "FLOAT",
  "MONEY",
  "NUMBER_UNIT",
  "TRUE",
  "FALSE",
  "NIL",
]);

function matchingBrace(tokens: readonly HeaderToken[], open: number): number {
  let depth = 0;
  for (let index = open; index < tokens.length; index++) {
    const { kind } = tokens[index];
    if (kind === "OBRACE") depth++;
    else if (kind === "CBRACE" && --depth === 0) return index;
  }
  return -1;
}

// A brace ends the search: a condition holds no block, except that of a
// creation (`if(new A() {}) {}`), which the grammar allows inside an expression.
function matchingClose(tokens: readonly HeaderToken[], open: number): number {
  let depth = 0;
  let creationDepth = -1;
  for (let index = open; index < tokens.length; index++) {
    const { kind } = tokens[index];
    if (kind === "OPAR") depth++;
    else if (kind === "CPAR") {
      if (--depth === 0) return index;
    } else if (kind === "NEW") creationDepth = depth;
    else if (kind === "OBRACE" && creationDepth === depth) {
      index = matchingBrace(tokens, index);
      if (index < 0) return -1;
      creationDepth = -1;
    } else if (kind === "OBRACE" || kind === "CBRACE") return -1;
  }
  return -1;
}

export function planHeaderRecovery(
  tokens: readonly HeaderToken[],
): HeaderRecoveryPlan {
  const plan: HeaderRecoveryPlan = {
    merges: [],
    insertions: new Map(),
    errors: [],
  };
  const insertAfter = (index: number, ...kinds: string[]) => {
    plan.insertions.set(index, [
      ...(plan.insertions.get(index) ?? []),
      ...kinds,
    ]);
  };

  // Ends an unclosed header at the end of its line. Returns the index of the
  // last header token, or -1 when nothing follows or the line has its block.
  const closeHeaderLine = (open: number, isRef: boolean): number => {
    const { line } = tokens[open];
    let end = open;
    while (
      tokens[end + 1].kind !== "EOF" &&
      tokens[end + 1].kind !== "OBRACE" &&
      tokens[end + 1].line === line
    ) {
      end++;
    }
    const following = tokens[end + 1];
    if (following.kind === "EOF") return -1;
    if (following.kind === "OBRACE" && following.line === line) return -1;

    if (isRef) {
      // A ref header is a list of names, not free text: `ref(x,` is complete
      // once closed. The grammar requires one name and a `)`.
      insertAfter(end, ...(end === open ? ["ID", "CPAR"] : ["CPAR"]));
      plan.errors.push({ at: end + 1, expected: "')'" });
      return end;
    }

    const isSingleAtom = end === open + 1 && ATOM_KINDS.has(tokens[end].kind);
    if (end > open && !isSingleAtom) {
      // `a ==` has no expression form, and `)` would not end it: ANTLR would
      // drop that `)` and take the next line as the right operand. The text of
      // an unfinished line becomes one free-text name.
      plan.merges.push({ first: open + 1, last: end });
    }
    insertAfter(end, "CPAR");
    return end;
  };

  for (let index = 0; index < tokens.length; index++) {
    const keyword = tokens[index];
    const rule = HEADER_RULES.get(keyword.kind);
    if (!rule) continue;
    const next = tokens[index + 1];
    if (next.kind === "EOF") break; // Nothing follows, so nothing can be swallowed.

    let headerEnd = index;
    let hasParens = false;
    if (rule.hasParens && next.kind === "OPAR") {
      hasParens = true;
      const close = matchingClose(tokens, index + 1);
      headerEnd =
        close >= 0 ? close : closeHeaderLine(index + 1, keyword.kind === "REF");
      if (headerEnd < 0) continue;
    } else if (rule.parenRequired) {
      // `if x {` on one line keeps the grammar's own recovery.
      if (next.line === keyword.line) continue;
      insertAfter(
        index,
        ...(keyword.kind === "REF" ? ["OPAR", "ID", "CPAR"] : ["OPAR", "CPAR"]),
      );
      plan.errors.push({ at: index + 1, expected: "'('" });
    }

    const needsBody =
      rule.body === "always" || (rule.body === "withParens" && hasParens);
    const following = tokens[headerEnd + 1];
    if (needsBody && following.kind !== "EOF" && following.kind !== "OBRACE") {
      insertAfter(headerEnd, "OBRACE", "CBRACE");
      plan.errors.push({ at: headerEnd + 1, expected: "'{'" });
    }
    index = headerEnd;
  }
  return plan;
}

/** Whether the plan changes the token list at all. */
export function isEmptyPlan(plan: HeaderRecoveryPlan): boolean {
  return plan.merges.length === 0 && plan.insertions.size === 0;
}
