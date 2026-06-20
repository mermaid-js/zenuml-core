/**
 * Chevrotain token list reproducing the ANTLR `sequenceLexer` token stream
 * EXACTLY (Stage 1 of the ANTLR4 → Langium migration).
 *
 * Design sources (binding):
 * - docs/langium-migration/01-lexer-analysis.md §7 (workarounds) and §8 (order)
 * - docs/langium-migration/07-risk-map.md gaps G1/G2/G3/G5/G6
 * - test/unit/parity/__golden__/lexer/ — the committed goldens are the truth.
 *
 * IMPORTANT: this module must NOT import `langium`. In Stage 2 a Langium
 * TokenBuilder will consume this same ordered list.
 *
 * Key semantics ported from ANTLR:
 * - Chevrotain is first-match; ANTLR is maximal-munch. The list below is
 *   hand-ordered per 01 §8 and every keyword/unit/annotation carries a
 *   `(?![\p{L}\p{Nd}_])u`-style boundary lookahead so longer identifiers
 *   keep lexing as ID/DIGIT_LEADING_NAME.
 * - Channels become Chevrotain GROUPS named exactly HIDDEN / COMMENT_CHANNEL /
 *   MODIFIER_CHANNEL; default-channel tokens have no group.
 * - Lexer modes (EVENT, TITLE_MODE) are emulated with custom patterns keyed on
 *   the previous DEFAULT-channel token (`matchedTokens` excludes grouped
 *   tokens). This works ONLY because both modes are exactly one payload token
 *   long (`payload? lineEnd`) — documented invariant, see 07 risk R12.
 * - ANTLR lexes UTF-16 code units (the goldens show an emoji as TWO 1-char
 *   OTHER tokens), so OTHER and the `\p{L}`-free regexes are NOT `u`-flagged
 *   where code-unit behavior matters.
 */
import { createToken, type IToken, type TokenType } from "chevrotain";

// ---------------------------------------------------------------------------
// Channel (group) names — must match the golden serialization exactly.
// ---------------------------------------------------------------------------
export const HIDDEN_GROUP = "HIDDEN";
export const COMMENT_GROUP = "COMMENT_CHANNEL";
export const MODIFIER_GROUP = "MODIFIER_CHANNEL";

type CustomExec = (
  text: string,
  offset: number,
  tokens?: IToken[],
) => RegExpExecArray | null;

function asMatch(image: string): RegExpExecArray {
  return [image] as unknown as RegExpExecArray;
}

/**
 * Chevrotain recompiles RegExp patterns via `addStickyFlag`/`addStartOfInput`
 * keeping ONLY the `i` flag — the `u` flag is silently dropped, corrupting
 * every `\p{L}`/`\p{Nd}` class (verified against chevrotain@12 lib/src/scan/
 * lexer.js). Wrap unicode regexes as custom patterns running our own sticky
 * `u`-flag regex so the semantics survive.
 */
function uniPattern(re: RegExp): CustomExec {
  const sticky = new RegExp(re.source, re.flags.replace("y", "") + "y");
  return (text, offset) => {
    sticky.lastIndex = offset;
    return sticky.exec(text);
  };
}

function lastMainTokenName(tokens: IToken[] | undefined): string | undefined {
  if (!tokens || tokens.length === 0) return undefined;
  return tokens[tokens.length - 1]!.tokenType.name;
}

/** Match the (non-empty) rest of the line, excluding `\r` / `\n`. */
function restOfLine(text: string, offset: number): RegExpExecArray | null {
  let i = offset;
  while (i < text.length) {
    const c = text.charCodeAt(i);
    if (c === 10 /* \n */ || c === 13 /* \r */) break;
    i++;
  }
  if (i === offset) return null;
  return asMatch(text.slice(offset, i));
}

function singleNewline(text: string, offset: number): RegExpExecArray | null {
  const ch = text[offset];
  if (ch === "\n" || ch === "\r") return asMatch(ch);
  return null;
}

// ---------------------------------------------------------------------------
// G1 — mode emulation: EVENT / TITLE_MODE payload + end tokens.
// ---------------------------------------------------------------------------
const eventPayloadExec: CustomExec = (text, offset, tokens) => {
  if (lastMainTokenName(tokens) !== "COL") return null;
  return restOfLine(text, offset);
};

const titleContentExec: CustomExec = (text, offset, tokens) => {
  if (lastMainTokenName(tokens) !== "TITLE") return null;
  return restOfLine(text, offset);
};

const eventEndExec: CustomExec = (text, offset, tokens) => {
  const last = lastMainTokenName(tokens);
  if (last !== "COL" && last !== "EVENT_PAYLOAD_LXR") return null;
  return singleNewline(text, offset);
};

const titleEndExec: CustomExec = (text, offset, tokens) => {
  const last = lastMainTokenName(tokens);
  if (last !== "TITLE" && last !== "TITLE_CONTENT") return null;
  return singleNewline(text, offset);
};

export const EVENT_PAYLOAD_LXR = createToken({
  name: "EVENT_PAYLOAD_LXR",
  pattern: eventPayloadExec,
  line_breaks: false,
});

export const TITLE_CONTENT = createToken({
  name: "TITLE_CONTENT",
  pattern: titleContentExec,
  line_breaks: false,
});

export const EVENT_END = createToken({
  name: "EVENT_END",
  pattern: eventEndExec,
  line_breaks: true,
});

export const TITLE_END = createToken({
  name: "TITLE_END",
  pattern: titleEndExec,
  line_breaks: true,
});

// ---------------------------------------------------------------------------
// G2 — DIVIDER: `{this.column === 0}? HWS* '==' ~[\r\n]*` with the bare-`==`
// carve-out (a line that is exactly `==` with no leading whitespace ties with
// EQ in ANTLR and EQ wins by rule order — golden divider-bare-eq-line).
// Ordered BEFORE WS so the leading spaces stay inside the DIVIDER image
// (golden divider-bare-eq-line-leading-space: text " ==").
// ---------------------------------------------------------------------------
const DIVIDER_RE = /[ \t]*==[^\r\n]*/y;

const dividerExec: CustomExec = (text, offset) => {
  if (offset !== 0) {
    const prev = text.charCodeAt(offset - 1);
    if (prev !== 10 && prev !== 13) return null; // not at column 0
  }
  DIVIDER_RE.lastIndex = offset;
  const m = DIVIDER_RE.exec(text);
  if (m === null) return null;
  // ANTLR tie-break: a bare `==` (2 chars, no leading WS, no note text) ties
  // with EQ and EQ's lower rule index wins. Replicate by refusing the match.
  if (m[0] === "==") return null;
  return m;
};

export const DIVIDER = createToken({
  name: "DIVIDER",
  pattern: dividerExec,
  line_breaks: false,
});

// ---------------------------------------------------------------------------
// Hidden / channel tokens.
// ---------------------------------------------------------------------------
export const WS = createToken({
  name: "WS",
  pattern: /[ \t]+/,
  group: HIDDEN_GROUP,
});

export const CR = createToken({
  name: "CR",
  pattern: /\r|\n/,
  group: HIDDEN_GROUP,
  line_breaks: true,
});

export const COMMENT = createToken({
  name: "COMMENT",
  pattern: /\/\/[^\r\n]*/,
  group: COMMENT_GROUP,
});

// Additional comment styles pasted from PlantUML / source code (issue #402),
// hidden from the parser. Mirror sequenceLexer.g4: block `/* … */` (multiline),
// `# ` (space-guarded so `#RRGGBB` stays COLOR), and column-0 `'` (PlantUML).
// BLOCK_COMMENT must precede DIV, HASH_COMMENT must precede COLOR.
export const BLOCK_COMMENT = createToken({
  name: "BLOCK_COMMENT",
  pattern: /\/\*[\s\S]*?\*\//,
  group: HIDDEN_GROUP,
  line_breaks: true,
});
export const HASH_COMMENT = createToken({
  name: "HASH_COMMENT",
  pattern: /#[ \t][^\r\n]*/,
  group: HIDDEN_GROUP,
});
const QUOTE_COMMENT_RE = /'[^\r\n]*/y;
const quoteCommentExec: CustomExec = (text, offset) => {
  if (offset !== 0) {
    const prev = text.charCodeAt(offset - 1);
    if (prev !== 10 && prev !== 13) return null; // not at column 0
  }
  QUOTE_COMMENT_RE.lastIndex = offset;
  return QUOTE_COMMENT_RE.exec(text);
};
export const QUOTE_COMMENT = createToken({
  name: "QUOTE_COMMENT",
  pattern: quoteCommentExec,
  group: HIDDEN_GROUP,
  line_breaks: false,
});

// Modifier keywords (MODIFIER_CHANNEL). Boundary lookahead keeps `constant`,
// `awaits`, `statics`, `readonlyX` lexing as ID (ANTLR maximal munch).
export const CONSTANT = createToken({
  name: "CONSTANT",
  pattern: uniPattern(/const(?![\p{L}\p{Nd}_])/u),
  group: MODIFIER_GROUP,
  line_breaks: false,
});
export const READONLY = createToken({
  name: "READONLY",
  pattern: uniPattern(/readonly(?![\p{L}\p{Nd}_])/u),
  group: MODIFIER_GROUP,
  line_breaks: false,
});
export const STATIC = createToken({
  name: "STATIC",
  pattern: uniPattern(/static(?![\p{L}\p{Nd}_])/u),
  group: MODIFIER_GROUP,
  line_breaks: false,
});
export const AWAIT = createToken({
  name: "AWAIT",
  pattern: uniPattern(/await(?![\p{L}\p{Nd}_])/u),
  group: MODIFIER_GROUP,
  line_breaks: false,
});

// ---------------------------------------------------------------------------
// G2 — TITLE predicate: byte-for-byte port of isTitle() from sequenceLexer.g4.
// ---------------------------------------------------------------------------
const IDENT_CHAR_RE = /[\p{L}\p{Nd}_]/u;

const titleExec: CustomExec = (text, offset) => {
  if (!text.startsWith("title", offset)) return null;

  // Maximal-munch carve-out: if the char right after `title` is an identifier
  // char, ANTLR's ID rule matches longer and wins (`titles` → ID).
  const after = offset + 5;
  if (after < text.length && IDENT_CHAR_RE.test(text[after]!)) return null;

  // isTitle() step 1: only whitespace/comments may precede `title`.
  const preceding = text
    .slice(0, offset)
    .replace(/\/\/[^\n]*(?:\n|$)/g, "")
    .trim();
  if (preceding.length) return null;

  // isTitle() step 2: look ahead past spaces/tabs; reject '.', '=', '('.
  let i = after;
  while (text[i] === " " || text[i] === "\t") i++;
  const next = text[i]; // undefined === EOF → accept
  if (next === "." || next === "=" || next === "(") return null;

  return asMatch("title");
};

export const TITLE = createToken({
  name: "TITLE",
  pattern: titleExec,
  line_breaks: false,
});

// ---------------------------------------------------------------------------
// Annotations (01 §7.9). ANNOTATION's tail is ASCII-only, so the boundary
// lookaheads for the fixed forms are ASCII too (`@Starter中` → STARTER_LXR).
// ---------------------------------------------------------------------------
export const STARTER_LXR = createToken({
  name: "STARTER_LXR",
  pattern: /@[Ss]tarter(?![a-zA-Z0-9_])/,
});
export const ANNOTATION_RET = createToken({
  name: "ANNOTATION_RET",
  pattern: /@(?:[Rr]eturn|[Rr]eply)(?![a-zA-Z0-9_])/,
});
export const ANNOTATION = createToken({
  name: "ANNOTATION",
  pattern: /@[a-zA-Z0-9_]*/,
});

// PlantUML/ZenUML wrapper directives are no-ops (issue #400): hidden from the
// parser. The boundary lookahead keeps `@startumlX` lexing as ANNOTATION.
// Must precede ANNOTATION in the token order.
export const WRAPPER_DIRECTIVE = createToken({
  name: "WRAPPER_DIRECTIVE",
  pattern: /@(?:startuml|enduml|startzenuml|endzenuml)(?![a-zA-Z0-9_])/,
  group: HIDDEN_GROUP,
});

// PlantUML `!theme …` directive at column 0 (issue #400). The column-0 guard
// (mirroring sequenceLexer.g4's `{_tokenStartColumn === 0}?`) keeps it from
// ever shadowing the `!` (NOT) operator, which only appears mid-line.
const THEME_DIRECTIVE_RE = /!theme[^\r\n]*/y;
const themeDirectiveExec: CustomExec = (text, offset) => {
  if (offset !== 0) {
    const prev = text.charCodeAt(offset - 1);
    if (prev !== 10 && prev !== 13) return null; // not at column 0
  }
  THEME_DIRECTIVE_RE.lastIndex = offset;
  return THEME_DIRECTIVE_RE.exec(text);
};
export const THEME_DIRECTIVE = createToken({
  name: "THEME_DIRECTIVE",
  pattern: themeDirectiveExec,
  group: HIDDEN_GROUP,
  line_breaks: false,
});

// ---------------------------------------------------------------------------
// Keywords (default channel). All carry the unicode boundary lookahead.
// Within alternations, longer alternatives come first (JS regex alternation
// is leftmost-first): forEach/foreach before for, etc.
// ---------------------------------------------------------------------------
const kw = (name: string, pattern: RegExp): TokenType =>
  createToken({ name, pattern });

/** Unicode-regex keyword: custom pattern preserving the `u` flag. */
const ukw = (name: string, pattern: RegExp): TokenType =>
  createToken({ name, pattern: uniPattern(pattern), line_breaks: false });

export const TRUE = ukw("TRUE", /true(?![\p{L}\p{Nd}_])/u);
export const FALSE = ukw("FALSE", /false(?![\p{L}\p{Nd}_])/u);
export const NIL = ukw("NIL", /(?:nil|null)(?![\p{L}\p{Nd}_])/u);
export const IF = ukw("IF", /if(?![\p{L}\p{Nd}_])/u);
export const ELSE = ukw("ELSE", /else(?![\p{L}\p{Nd}_])/u);
export const WHILE = ukw(
  "WHILE",
  /(?:while|forEach|foreach|for|loop)(?![\p{L}\p{Nd}_])/u,
);
export const RETURN = ukw("RETURN", /return(?![\p{L}\p{Nd}_])/u);
export const NEW = ukw("NEW", /new(?![\p{L}\p{Nd}_])/u);
export const PAR = ukw("PAR", /par(?![\p{L}\p{Nd}_])/u);
export const GROUP = ukw("GROUP", /group(?![\p{L}\p{Nd}_])/u);
export const OPT = ukw("OPT", /opt(?![\p{L}\p{Nd}_])/u);
export const CRITICAL = ukw("CRITICAL", /critical(?![\p{L}\p{Nd}_])/u);
export const SECTION = ukw("SECTION", /(?:section|frame)(?![\p{L}\p{Nd}_])/u);
export const REF = ukw("REF", /ref(?![\p{L}\p{Nd}_])/u);
export const AS = ukw("AS", /as(?![\p{L}\p{Nd}_])/u);
export const TRY = ukw("TRY", /try(?![\p{L}\p{Nd}_])/u);
export const CATCH = ukw("CATCH", /catch(?![\p{L}\p{Nd}_])/u);
export const FINALLY = ukw("FINALLY", /finally(?![\p{L}\p{Nd}_])/u);
export const IN = ukw("IN", /in(?![\p{L}\p{Nd}_])/u);

// ---------------------------------------------------------------------------
// Numbers and units (01 §7.8, §7.4). NUMBER_UNIT before FLOAT before
// MONEY/DIGIT_LEADING_NAME/INT; FLOAT before DOT.
// ---------------------------------------------------------------------------
export const NUMBER_UNIT = createToken({
  name: "NUMBER_UNIT",
  pattern: uniPattern(
    /(?:\d+\.\d*|\.\d+|\d+)(?:milliseconds|millisecond|ms|seconds|second|secs|sec|s|minutes|minute|mins|min|hours|hour|hrs|hr|h|days|day|d|weeks|week|w|KiB|MiB|GiB|TiB|KB|MB|GB|TB|kb|mb|gb|tb|B|rem|em|px|mm|cm|km|m|mg|kg|g)(?![\p{L}\p{Nd}_])/u,
  ),
  line_breaks: false,
});

// `.5` is a FLOAT only when NOT followed by a name-start char — exact port of
// `!isNameStartAhead()` (checks [\p{L}_] only, not \p{Nd}).
export const FLOAT = createToken({
  name: "FLOAT",
  pattern: uniPattern(/\d+\.\d*|\.\d+(?![\p{L}_])/u),
  line_breaks: false,
});

export const MONEY = createToken({
  name: "MONEY",
  pattern: uniPattern(/\$(?:\d+\.\d*|\.\d+(?![\p{L}_])|\d+)/u),
  line_breaks: false,
});

export const DIGIT_LEADING_NAME = createToken({
  name: "DIGIT_LEADING_NAME",
  pattern: uniPattern(/[0-9]+\p{L}[\p{L}\p{Nd}_]*/u),
  line_breaks: false,
});

export const INT = createToken({ name: "INT", pattern: /[0-9]+/ });

export const COLOR = createToken({ name: "COLOR", pattern: /#[0-9a-fA-F]+/ });

// ---------------------------------------------------------------------------
// G6 — strings: one shared scan computing the LONGEST of CSTRING (closed,
// doubled-quote escapes) vs USTRING (unclosed). ANTLR resolves by longest
// match with CSTRING winning ties ("abc"" → USTRING per golden).
// ---------------------------------------------------------------------------
interface StringScan {
  /** End offset (exclusive) of the longest closed-string match, or -1. */
  cstringEnd: number;
  /** End offset (exclusive) of the longest unclosed-string match. */
  ustringEnd: number;
}

function scanString(text: string, offset: number): StringScan | null {
  if (text.charCodeAt(offset) !== 34 /* " */) return null;
  let i = offset + 1;
  let cstringEnd = -1;
  for (;;) {
    if (i >= text.length) break;
    const c = text.charCodeAt(i);
    if (c === 10 || c === 13) break;
    if (c === 34) {
      cstringEnd = i + 1; // this quote can close the string
      if (text.charCodeAt(i + 1) === 34) {
        i += 2; // doubled-quote escape — keep scanning for a longer match
      } else {
        break;
      }
    } else {
      i++;
    }
  }
  return { cstringEnd, ustringEnd: i };
}

const cstringExec: CustomExec = (text, offset) => {
  const scan = scanString(text, offset);
  if (scan === null || scan.cstringEnd < 0) return null;
  if (scan.cstringEnd < scan.ustringEnd) return null; // USTRING is longer
  return asMatch(text.slice(offset, scan.cstringEnd));
};

const ustringExec: CustomExec = (text, offset) => {
  const scan = scanString(text, offset);
  if (scan === null) return null;
  return asMatch(text.slice(offset, scan.ustringEnd));
};

export const CSTRING = createToken({
  name: "CSTRING",
  pattern: cstringExec,
  line_breaks: false,
});

export const USTRING = createToken({
  name: "USTRING",
  pattern: ustringExec,
  line_breaks: false,
});

// ---------------------------------------------------------------------------
// Operators / punctuation. Multi-char forms before their single-char prefixes.
// ---------------------------------------------------------------------------
export const RETURN_ARROW = kw("RETURN_ARROW", /-->/);
export const ARROW = kw("ARROW", /->/);
export const SOPEN = kw("SOPEN", /<</);
export const SCLOSE = kw("SCLOSE", />>/);
export const GTEQ = kw("GTEQ", />=/);
export const LTEQ = kw("LTEQ", /<=/);
export const EQ = kw("EQ", /==/);
export const NEQ = kw("NEQ", /!=/);
export const OR = kw("OR", /\|\|/);
export const AND = kw("AND", /&&/);
export const GT = kw("GT", />/);
export const LT = kw("LT", /</);
export const PLUS = kw("PLUS", /\+/);
export const MINUS = kw("MINUS", /-/);
export const MULT = kw("MULT", /\*/);
export const DIV = kw("DIV", /\//);
export const MOD = kw("MOD", /%/);
export const POW = kw("POW", /\^/);
export const NOT = kw("NOT", /!/);
export const SCOL = kw("SCOL", /;/);
export const COMMA = kw("COMMA", /,/);
export const ASSIGN = kw("ASSIGN", /=/);
export const OPAR = kw("OPAR", /\(/);
export const CPAR = kw("CPAR", /\)/);
export const OBRACE = kw("OBRACE", /\{/);
export const CBRACE = kw("CBRACE", /\}/);
export const LBRACKET = kw("LBRACKET", /\[/);
export const RBRACKET = kw("RBRACKET", /\]/);
export const DOT = kw("DOT", /\./);
export const COL = kw("COL", /:/);

// ---------------------------------------------------------------------------
// Identifiers and the never-fail catch-all.
// ---------------------------------------------------------------------------
export const ID = createToken({
  name: "ID",
  pattern: uniPattern(/[\p{L}_][\p{L}\p{Nd}_]*/u),
  line_breaks: false,
});

// G5 — OTHER: one UTF-16 CODE UNIT per token (no `u` flag!). ANTLR lexes code
// units, so an astral emoji becomes two 1-char OTHER tokens (golden
// emoji-stray). Ordered dead last; the lexer never errors.
export const OTHER = createToken({
  name: "OTHER",
  pattern: /[\s\S]/,
  line_breaks: true,
});

// ---------------------------------------------------------------------------
// G3 — the ordered token list (first-match semantics; 01 §8 blueprint).
// ---------------------------------------------------------------------------
export const tokens: TokenType[] = [
  // Mode-emulation tokens fire only right after COL/TITLE/payloads — they must
  // outcompete every default-mode token (payload includes spaces, `//`, etc.).
  EVENT_PAYLOAD_LXR,
  TITLE_CONTENT,
  EVENT_END,
  TITLE_END,
  // DIVIDER before WS so leading [ \t]* stays inside the DIVIDER image.
  DIVIDER,
  WS,
  CR,
  // COMMENT before DIV; BLOCK_COMMENT (`/* */`) before DIV too.
  COMMENT,
  BLOCK_COMMENT,
  QUOTE_COMMENT,
  // Modifier channel.
  CONSTANT,
  READONLY,
  STATIC,
  AWAIT,
  // Predicated soft keyword.
  TITLE,
  // Wrapper directives (hidden) before the generic ANNOTATION.
  WRAPPER_DIRECTIVE,
  // Annotations: fixed forms before the generic one.
  STARTER_LXR,
  ANNOTATION_RET,
  ANNOTATION,
  // Keywords (boundary-lookahead guarded), before ID.
  TRUE,
  FALSE,
  NIL,
  IF,
  ELSE,
  WHILE,
  RETURN,
  NEW,
  PAR,
  GROUP,
  OPT,
  CRITICAL,
  SECTION,
  REF,
  AS,
  TRY,
  CATCH,
  FINALLY,
  IN,
  // Numbers: NUMBER_UNIT > FLOAT > MONEY > DIGIT_LEADING_NAME > INT.
  NUMBER_UNIT,
  FLOAT,
  MONEY,
  DIGIT_LEADING_NAME,
  INT,
  // HASH_COMMENT (`# …`, space-guarded) before COLOR (`#RRGGBB`).
  HASH_COMMENT,
  COLOR,
  // Strings: CSTRING wins ties; USTRING right after.
  CSTRING,
  USTRING,
  // Multi-char operators before their prefixes.
  RETURN_ARROW,
  ARROW,
  SOPEN,
  SCLOSE,
  GTEQ,
  LTEQ,
  EQ,
  NEQ,
  OR,
  AND,
  // Single-char operators / punctuation (FLOAT above already beat DOT).
  GT,
  LT,
  PLUS,
  MINUS,
  MULT,
  DIV,
  MOD,
  POW,
  // `!theme …` at column 0 (hidden) before the `!` NOT operator.
  THEME_DIRECTIVE,
  NOT,
  SCOL,
  COMMA,
  ASSIGN,
  OPAR,
  CPAR,
  OBRACE,
  CBRACE,
  LBRACKET,
  RBRACKET,
  DOT,
  COL,
  // Identifiers.
  ID,
  // Never-fail catch-all — must stay last.
  OTHER,
];
