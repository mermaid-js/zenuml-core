import antlr4 from "antlr4";
import sequenceParser from "../generated-parser/sequenceParser";

// ANTLR's token and token-stream types are not declared by the JS-inferred
// types, so they are accessed through `any` (see the same note in ./index.ts).
type Token = any;

const P = sequenceParser as any;
const DEFAULT_CHANNEL = antlr4.Token.DEFAULT_CHANNEL;
const NAMES = new Set([P.ID, P.DIGIT_LEADING_NAME, P.CSTRING, P.USTRING]);
const SIGNATURE_STARTS = new Set([...NAMES, P.LBRACKET, P.EMOJI_SHORTCODE]);
// After a chain, `name` then one of these starts a new statement.
const NEW_STATEMENT_AFTER_NAME = new Set([P.ARROW, P.COL, P.ASSIGN]);
// An argument list never runs past these.
const ARGUMENTS_END = new Set([P.EOF, P.OBRACE, P.CBRACE, P.SCOL]);

export interface RepairError {
  line: number;
  column: number;
  msg: string;
}

/**
 * While a call is being typed it has no `)` yet, or it ends in a `.`. The tokens
 * carry the one fact the grammar cannot see: where the line breaks are. This pass
 * uses them to finish the call before the parser runs, so the next statement
 * stays a statement:
 *
 * | Source               | Tokens the parser sees  |
 * | ---------------------|-------------------------|
 * | `A.b(`               | `A.b()`                 |
 * | `A.b(x` + `A.c()`    | `A.b(x)` + `A.c()`      |
 * | `A.b(` + `A.c()`     | `A.b()` + `A.c()`       |
 * | `A.b(x,` + `y`       | `A.b(x,y)`              |
 * | `A.b().` + `if(x) {` | `A.b()` + `if(x) {`     |
 *
 * A valid document is out of reach: every `(` in it has its `)`, and a chain's
 * `.` is always followed by a signature. Line breaks therefore only ever decide
 * among parses of a broken document.
 *
 * `B.` + `A.c()` is not repaired. It is the valid chain `B.A.c()`, the same shape
 * as `B.` + `c.d()`.
 *
 * @returns one error per repair, because the source is still incomplete.
 */
export function repairIncompleteCalls(stream: Token): RepairError[] {
  stream.fill();
  const visible: Token[] = stream.tokens.filter(
    (t: Token) => t.channel === DEFAULT_CHANNEL,
  );

  const errors: RepairError[] = [];
  const toRemove = new Set<Token>();
  const toCloseAfter: Token[] = [];

  for (const index of unclosedCallParens(visible)) {
    const open = visible[index];
    const last = lastArgumentToken(visible, index);
    // `b(x,` and `b(x.` have a separator with nothing after it.
    const separator = last > index && isSeparator(visible[last]);
    if (separator) toRemove.add(visible[last]);
    toCloseAfter.push(visible[separator ? last - 1 : last]);
    errors.push({
      line: open.line,
      column: open.column + 1,
      msg: "missing ')' for the '(' of this call",
    });
  }

  visible.forEach((token, index) => {
    if (isDanglingChainDot(visible, index)) {
      toRemove.add(token);
      errors.push({
        line: token.line,
        column: token.column,
        msg: "extraneous '.' at the end of this call",
      });
    }
  });

  if (errors.length === 0) return errors;

  stream.tokens = rebuild(stream.tokens, toCloseAfter, toRemove);
  stream.tokens.forEach((t: Token, i: number) => {
    t.tokenIndex = i;
  });
  errors.sort((a, b) => a.line - b.line || a.column - b.column);
  return errors;
}

/** Indexes into `visible` of the call parens that have no `)`. */
function unclosedCallParens(visible: Token[]): number[] {
  const open: { index: number; call: boolean }[] = [];
  visible.forEach((token, index) => {
    if (token.type === P.OPAR) {
      // A plain paren inside a call must close too: `A.b((x` needs two.
      const call =
        NAMES.has(visible[index - 1]?.type) || open.some((o) => o.call);
      open.push({ index, call });
    } else if (token.type === P.CPAR) {
      open.pop();
    }
  });
  return open.filter((o) => o.call).map((o) => o.index);
}

/** The arguments of an unclosed call end with the line, unless a comma goes on. */
function lastArgumentToken(visible: Token[], open: number): number {
  let last = open;
  for (let i = open + 1; !ARGUMENTS_END.has(visible[i].type); i++) {
    const previous = visible[i - 1];
    const goesOn =
      visible[i].line === previous.line ||
      previous.type === P.COMMA ||
      (i === open + 1 && lineEndsInComma(visible, i));
    if (!goesOn) break;
    last = i;
  }
  return last;
}

/** A `,` at the end of this line means an argument list was begun here. */
function lineEndsInComma(visible: Token[], start: number): boolean {
  let i = start;
  while (
    visible[i + 1].type !== P.EOF &&
    visible[i + 1].line === visible[start].line
  ) {
    i++;
  }
  return visible[i].type === P.COMMA;
}

function isSeparator(token: Token): boolean {
  return token.type === P.COMMA || token.type === P.DOT;
}

/** The `.` in `A.b().`, when what follows cannot continue the chain. */
function isDanglingChainDot(visible: Token[], index: number): boolean {
  if (visible[index].type !== P.DOT || visible[index - 1]?.type !== P.CPAR) {
    return false;
  }
  const next = visible[index + 1];
  if (!SIGNATURE_STARTS.has(next.type)) return true;
  return (
    NAMES.has(next.type) && NEW_STATEMENT_AFTER_NAME.has(visible[index + 2]?.type)
  );
}

function rebuild(tokens: Token[], closeAfter: Token[], remove: Set<Token>) {
  const result: Token[] = [];
  for (const token of tokens) {
    if (!remove.has(token)) result.push(token);
    for (const anchor of closeAfter) {
      if (anchor === token) result.push(closingParen(token));
    }
  }
  return result;
}

/** An empty range at the end of `previous`, so source offsets stay real. */
function closingParen(previous: Token): Token {
  const token = previous.clone();
  token.type = P.CPAR;
  token.text = ")";
  token.channel = DEFAULT_CHANNEL;
  token.start = previous.stop + 1;
  token.stop = previous.stop;
  return token;
}
