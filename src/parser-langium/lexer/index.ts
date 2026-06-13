/**
 * Chevrotain lexer entry point for the ANTLR-parity token stream (Stage 1).
 *
 * `lexWithLangium(code)` runs the Chevrotain Lexer over the ordered token
 * list from ./tokens and merges main-channel tokens with all grouped
 * (HIDDEN / COMMENT_CHANNEL / MODIFIER_CHANNEL) tokens into ONE stream
 * ordered by startOffset — the same triple shape the ANTLR golden harness
 * produces (EOF excluded; Chevrotain emits no EOF token anyway).
 */
import { Lexer, type IToken } from "chevrotain";
import { tokens } from "./tokens";

export { tokens } from "./tokens";

export interface LexedToken {
  type: string;
  text: string;
  channel: string;
}

const DEFAULT_CHANNEL = "DEFAULT_TOKEN_CHANNEL";

export const lexer = new Lexer(tokens, {
  positionTracking: "onlyOffset",
  // `safeMode` disables Chevrotain's first-char bucket optimization, which
  // silently DROPS tokens whose first chars it cannot analyze — the
  // `\p{L}`-based ID/DIGIT_LEADING_NAME regexes are exactly that case
  // (verified: without safeMode, `Abc` lexes as three OTHER tokens).
  // Perf tuning via `start_chars_hint` is a later, Gate-1-budgeted change.
  safeMode: true,
  // The OTHER catch-all guarantees every input tokenizes; any lexer error
  // here would be a bug in the token list, surfaced by the parity spec.
  deferDefinitionErrorsHandling: false,
});

export function lexWithLangium(code: string): LexedToken[] {
  const result = lexer.tokenize(code);

  const merged: Array<{ token: IToken; channel: string }> = [];
  for (const token of result.tokens) {
    merged.push({ token, channel: DEFAULT_CHANNEL });
  }
  for (const [groupName, groupTokens] of Object.entries(result.groups)) {
    for (const token of groupTokens) {
      merged.push({ token, channel: groupName });
    }
  }
  merged.sort((a, b) => a.token.startOffset - b.token.startOffset);

  return merged.map(({ token, channel }) => ({
    type: token.tokenType.name,
    text: token.image,
    channel,
  }));
}
