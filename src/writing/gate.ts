/**
 * The writing gate (ADR 0009, Decision 1). It decides which text the
 * diagram renders for one keystroke: it holds back the line being typed
 * while that line is incomplete, and closes it when that is safe.
 *
 * It reads only the previous and the next text, never a caret API. Ported
 * from the spike's `engine.js` (branch claude/animation-improvement-spike-a9009f,
 * 7de6c3be); every rule there came from a per-key trace of the parser.
 */

export interface Edit {
  /** Line of the caret after the edit. */
  line: number;
  inserted: string;
  removed: string;
  /** The edit inserted or removed two or more line breaks (a paste). */
  bulk: boolean;
}

export interface GateContext {
  /** Participants on screen: a message to any other name is held. */
  names: ReadonlySet<string>;
  /** The dwell timer fired: release what a pause makes safe. */
  dwell: boolean;
}

/** Why a line is held; `null` when the renderer gets it. */
export type HoldReason =
  | "string"
  | "keyword"
  | "divider"
  | "assign"
  | "new-name"
  | "bare"
  | "return"
  | "arrow"
  | "target";

export interface GatedLine {
  text: string;
  reason: HoldReason | null;
}

const newlines = (s: string) => (s.match(/\n/g) || []).length;

export function locateEdit(prev: string, next: string): Edit {
  let p = 0;
  const max = Math.min(prev.length, next.length);
  while (p < max && prev[p] === next[p]) p++;
  let s = 0;
  while (s < max - p && prev[prev.length - 1 - s] === next[next.length - 1 - s])
    s++;
  const inserted = next.slice(p, next.length - s);
  const removed = prev.slice(p, prev.length - s);
  const caret = next.length - s;
  const line = next.slice(0, caret).split("\n").length - 1;
  return {
    line,
    inserted,
    removed,
    bulk: newlines(inserted) >= 2 || newlines(removed) >= 2,
  };
}

const LOOP_HEAD =
  /^(if|else\s+if|while|for|foreach|forEach|loop|section|frame|critical)\s*\(/;
const BLOCK_BARE =
  /^(if|else|while|for|foreach|forEach|loop|section|frame|critical|opt|par|try|catch|finally|group|ref|new)$/;
const KEYWORDS = [
  "if",
  "else",
  "while",
  "for",
  "foreach",
  "forEach",
  "loop",
  "section",
  "frame",
  "critical",
  "opt",
  "par",
  "try",
  "catch",
  "finally",
  "group",
  "ref",
  "new",
  "return",
  "title",
];

/** Closes every open `(` outside quotes, dropping a trailing `,` first. */
export function closeParens(s: string): string {
  let depth = 0;
  let quoted = false;
  for (const ch of s) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === "(") depth++;
    else if (!quoted && ch === ")") depth = Math.max(0, depth - 1);
  }
  const out = depth > 0 ? s.replace(/[\s,]+$/, "") : s;
  return out + ")".repeat(depth);
}

const oddQuotes = (s: string) => (s.match(/"/g) || []).length % 2 === 1;

const parenDepth = (s: string) => {
  let d = 0;
  let quoted = false;
  for (const ch of s) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === "(") d++;
    else if (!quoted && ch === ")") d--;
  }
  return d;
};

const hasOpenBrace = (s: string) => {
  let quoted = false;
  for (const ch of s) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === "{") return true;
  }
  return false;
};

const keywordPrefix = (s: string) =>
  s.length > 0 && KEYWORDS.some((k) => k !== s && k.startsWith(s));

/** The text the renderer gets for the line being typed. */
export function gateLine(line: string, ctx: GateContext): GatedLine {
  const indent = (line.match(/^\s*/) || [""])[0];
  const s = line.trim();
  const pass = (t: string): GatedLine => ({ text: indent + t, reason: null });
  // After the dwell, everything but a keyword or an open string is released.
  const hold = (reason: HoldReason, t = ""): GatedLine =>
    ctx.dwell && reason !== "keyword" && reason !== "string"
      ? { text: indent + closeParens(s), reason: null }
      : { text: t ? indent + t : "", reason };

  if (!s || s.startsWith("//")) return pass(s);
  if (oddQuotes(s)) {
    const open = s.lastIndexOf('"');
    if (open > 0 && /[.(]/.test(s.slice(0, open)))
      return pass(closeParens(s + '"'));
    // `"a b"->"c`: keep what the complete prefix draws instead of blanking the line.
    const prefix = s.slice(0, open).trimEnd();
    if (prefix) return gateLine(indent + prefix, ctx);
    return hold("string");
  }
  if (/^group\b/.test(s) && !/[{}]$/.test(s)) return hold("keyword");
  if (/^group\b/.test(s) && /\{.*[^}]$/.test(s)) return hold("keyword");
  if (keywordPrefix(s)) return hold("keyword");
  if (/^title\s/.test(s)) return pass(s);
  if (/^=/.test(s)) return /^==.*==$/.test(s) ? pass(s) : hold("divider");

  if (s[0] === "}") {
    const rest = s.slice(1).trim();
    if (!rest || /\{$/.test(rest)) return pass(s);
    if (/^(else\s+if|catch|section)\s*\(/.test(rest))
      return pass("} " + closeParens(rest) + " {");
    if (/^(else|finally|catch)$/.test(rest)) return pass("} " + rest + " {");
    return { text: indent + "}", reason: "keyword" };
  }
  if (LOOP_HEAD.test(s)) {
    const c = closeParens(s);
    // A head like `if(ok) { }` already has its block; a second `{` becomes an unnamed SECTION.
    return pass(hasOpenBrace(c) ? c : c + " {");
  }
  if (/^ref\s*\(/.test(s)) return pass(closeParens(s));
  if (BLOCK_BARE.test(s)) return hold("keyword");
  if (/=\s*$/.test(s) && parenDepth(s) <= 0) return hold("assign");

  // `Type name = rhs`, where a generic type may hold angle brackets
  // (`List<A> xs = `). Brackets become `_` for the match only; the
  // replacement keeps every index, so `rhs` is sliced from `s`.
  const assign = s
    .replace(/[<>]/g, "_")
    .match(/^(?:[\w$[\],]+\s+)?[\w$]+\s*=\s*(.*)$/);
  const rhs = assign ? s.slice(assign[0].length - assign[1].length) : undefined;
  const t = rhs !== undefined ? rhs : s;
  if (/^new(\s+[^\s(]*)?$/.test(t)) return hold("new-name");
  if (rhs !== undefined && /^[\w$]+$/.test(t)) return hold("bare");
  if (s === "return") return hold("return");

  const arrow = t.match(/^(\S+?)\s*-(>?)\s*([^\s:.(]*)$/);
  if (arrow) {
    if (!arrow[2] || !arrow[3]) return hold("arrow");
    return ctx.names.has(arrow[3]) ? pass(closeParens(s)) : hold("target");
  }
  // Punctuation inside quotes is part of a name: `"a:b"` alone is bare.
  const unquoted = s.replace(/"[^"]*"/g, '""');
  if (
    /[.({}:]/.test(unquoted) ||
    unquoted.includes("->") ||
    /^return\b/.test(s)
  )
    return pass(closeParens(s));
  return hold("bare");
}

/** Adds the `}` lines an unclosed block needs, after the caret line. */
export function balanceBraces(lines: string[], caretLine: number): string[] {
  let depth = 0;
  let lastOpen = -1;
  lines.forEach((l, i) => {
    let quoted = false;
    const code = l.replace(/^\s*\/\/.*$/, "");
    for (const ch of code) {
      if (ch === '"') quoted = !quoted;
      else if (!quoted && ch === "{") {
        depth++;
        lastOpen = i;
      } else if (!quoted && ch === "}") depth--;
    }
  });
  if (depth <= 0) return lines;
  const at = Math.max(caretLine, lastOpen) + 1;
  return [
    ...lines.slice(0, at),
    ...Array<string>(depth).fill("}"),
    ...lines.slice(at),
  ];
}

/** Gates the edited line of `code` and balances its braces. */
export function gate(
  code: string,
  edit: Edit,
  ctx: GateContext,
): { code: string; reason: HoldReason | null } {
  const lines = code.split("\n");
  let reason: HoldReason | null = null;
  if (!edit.bulk && edit.line < lines.length) {
    const g = gateLine(lines[edit.line], ctx);
    reason = g.reason;
    lines[edit.line] = g.text;
  }
  return { code: balanceBraces(lines, edit.line).join("\n"), reason };
}
