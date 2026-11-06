import antlr4 from "antlr4";
import sequenceParser from "../generated-parser/sequenceParser";
import type { RepairError } from "./repairIncompleteCalls";

// ANTLR's token and token-stream types are not declared by the JS-inferred
// types, so they are accessed through `any` (see the same note in ./index.ts).
type Token = any;

const P = sequenceParser as any;
const NAMES = new Set([P.ID, P.DIGIT_LEADING_NAME, P.CSTRING, P.USTRING]);
// What a `@return` that carries a message or a call continues with.
const MESSAGE_PUNCTUATION = new Set([
  P.ARROW,
  P.RETURN_ARROW,
  P.MINUS,
  P.COL,
  P.DOT,
  P.OPAR,
  P.ASSIGN,
]);
// What may end the statement before a statement that starts with `A.b:`.
const STATEMENT_END = new Set([
  P.SCOL,
  P.OBRACE,
  P.CBRACE,
  P.CPAR,
  P.EVENT_PAYLOAD_LXR,
  P.EVENT_END,
  P.DIVIDER,
  P.TITLE_END,
]);

/**
 * Half-typed `@return` lines, which only the token stream can settle (#672). Like
 * `repairIncompleteCalls`, this runs only for a document the parser rejected, so
 * a valid document never changes.
 *
 * | Source                  | Tokens the parser sees      |
 * | ------------------------|-----------------------------|
 * | `@return` + `}`         | `}`                         |
 * | `@return x`             | nothing                     |
 *
 * - `@return` needs a `from->to`. With nothing after it, or with only names on
 *   its line, it is not a return, and the grammar's error recovery would use the
 *   next token for it: `}` of the enclosing block, or `x` as a self-call. The
 *   tokens move off the default channel, as for any other stray token.
 *
 * @returns one error per repair, because the source is still incomplete.
 */
export function repairLooseTokens(stream: Token): RepairError[] {
  readDotColonAsArrow(stream);
  const visible = visibleTokens(stream);
  const errors: RepairError[] = [];

  visible.forEach((token, index) => {
    if (token.type === P.ANNOTATION_RET) {
      const dropped = looseReturnLabel(visible, index);
      if (!dropped) return;
      [token, ...dropped].forEach((t) => {
        t.channel = antlr4.Token.HIDDEN_CHANNEL;
      });
      errors.push({
        line: token.line,
        column: token.column,
        msg: "'@return' needs a 'from->to: message' to be a return",
      });
    }
  });

  errors.sort((a, b) => a.line - b.line || a.column - b.column);
  return errors;
}

/**
 * `C.b: x` is valid DSL (a half-typed call, then an async message), so unlike the
 * repairs above this one also runs on a document that parses. It changes no
 * token count and reports no error: the document stays as valid as it was.
 * Idempotent.
 */
export function readDotColonAsArrow(stream: Token): void {
  const visible = visibleTokens(stream);
  visible.forEach((token, index) => {
    if (isDotForArrow(visible, index)) {
      token.type = P.ARROW;
      token.text = "->";
    }
  });
}

function visibleTokens(stream: Token): Token[] {
  stream.fill();
  return stream.tokens.filter(
    (t: Token) => t.channel === antlr4.Token.DEFAULT_CHANNEL,
  );
}

/**
 * The tokens a loose `@return` takes with it: none when it carries a message.
 * `undefined` when it is a real `@return` or the next statement.
 */
function looseReturnLabel(visible: Token[], index: number): Token[] | undefined {
  const next = visible[index + 1];
  if (next.type === P.CBRACE) return [];

  const label: Token[] = [];
  for (
    let i = index + 1;
    NAMES.has(visible[i].type) && visible[i].line === visible[index].line;
    i++
  ) {
    label.push(visible[i]);
  }
  if (label.length === 0) return undefined;
  const after = visible[index + 1 + label.length];
  return MESSAGE_PUNCTUATION.has(after.type) ? undefined : label;
}

/**
 * `C.b: x`: a `.` between two names with a `:` right after them, on one line, at
 * the start of a statement. The user typed `.` where `->` was meant (`A->b: x`;
 * `A.b(x)` is the other reading). The grammar reads `C.` and `b: x` as two
 * messages and a phantom participant. The arrow keeps every name and the text.
 * A longer chain, an assignment and a `.` at the end of a line are not touched.
 */
function isDotForArrow(visible: Token[], index: number): boolean {
  const [from, dot, to, colon] = [-1, 0, 1, 2].map((d) => visible[index + d]);
  if (!from || dot.type !== P.DOT || !colon) return false;
  if (!NAMES.has(from.type) || !NAMES.has(to.type) || colon.type !== P.COL) {
    return false;
  }
  if (new Set([from, dot, to, colon].map((t) => t.line)).size !== 1) {
    return false;
  }
  const before = visible[index - 2];
  return (
    !before ||
    STATEMENT_END.has(before.type) ||
    (NAMES.has(before.type) && before.line < from.line)
  );
}
