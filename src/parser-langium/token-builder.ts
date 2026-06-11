/**
 * Langium TokenBuilder override — Stage 2 of the ANTLR4 → Langium migration.
 *
 * The `.langium` grammar's terminal regexes are PLACEHOLDERS. This builder is
 * the authoritative token source: it returns the parity-proven Stage-1
 * Chevrotain token list from ./lexer/tokens (patterns and order untouched),
 * reconciled for parser consumption:
 *
 *  - Channel mapping. Langium's DefaultLexer treats exactly the Chevrotain
 *    group `"hidden"` as hidden (CST-attached, never parsed). The Stage-1
 *    groups HIDDEN / COMMENT_CHANNEL / MODIFIER_CHANNEL all map to `"hidden"`.
 *  - EVENT_END / TITLE_END (the EVENT/TITLE_MODE mode-pop newlines) become
 *    hidden too: the grammar drops ANTLR's `EVENT_END?` / `TITLE_END?`
 *    (07-risk-map L13). Known cosmetic divergence: because hidden tokens are
 *    excluded from Chevrotain's `matchedTokens`, a SECOND consecutive newline
 *    after a payload lexes as EVENT_END/TITLE_END instead of CR here — both
 *    hidden, parser-invisible; the Stage-1 `lexWithLangium` stream (which
 *    keeps them on the main channel) is unaffected.
 *  - The Stage-1 token OBJECTS are never mutated (their parity is pinned by
 *    lexer-parity-langium.spec.ts / lexer-token-order.spec.ts); we emit
 *    clones via createToken, sharing the pattern functions/regexes.
 *
 * recoveryEnabled stays at Langium's default (true) — no parser config here.
 */
import {
  createToken,
  type ITokenConfig,
  type TokenType,
  type TokenVocabulary,
} from "chevrotain";
import type { Grammar, TokenBuilder, TokenBuilderOptions } from "langium";
import { tokens as stage1Tokens } from "./lexer/tokens";

/** The one group name Langium's DefaultLexer puts into `lexerResult.hidden`. */
const LANGIUM_HIDDEN_GROUP = "hidden";

/**
 * Tokens the PARSER must never see. WS/CR (HIDDEN), COMMENT (COMMENT_CHANNEL),
 * const/readonly/static/await (MODIFIER_CHANNEL), and the dropped mode-pop
 * newlines EVENT_END/TITLE_END.
 */
const HIDDEN_FOR_PARSER = new Set([
  "WS",
  "CR",
  "COMMENT",
  "CONSTANT",
  "READONLY",
  "STATIC",
  "AWAIT",
  "EVENT_END",
  "TITLE_END",
]);

function cloneForParser(token: TokenType): TokenType {
  const config: ITokenConfig = {
    name: token.name,
    pattern: token.PATTERN,
  };
  if (token.LINE_BREAKS !== undefined) {
    config.line_breaks = token.LINE_BREAKS;
  }
  if (HIDDEN_FOR_PARSER.has(token.name)) {
    config.group = LANGIUM_HIDDEN_GROUP;
  }
  return createToken(config);
}

/**
 * The parser-facing vocabulary: same names, same patterns, same ORDER as the
 * Stage-1 list (Chevrotain is first-match — order is load-bearing, 01 §8).
 */
export const parserTokens: TokenType[] = stage1Tokens.map(cloneForParser);

export class ZenTokenBuilder implements TokenBuilder {
  buildTokens(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _grammar: Grammar,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: TokenBuilderOptions,
  ): TokenVocabulary {
    return parserTokens;
  }
}
