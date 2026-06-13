/**
 * Golden token-stream harness — Stage 0 of the ANTLR4 → Langium migration.
 *
 * `lexWithAntlr` is the reference implementation: it lexes a DSL string with the
 * CURRENT generated ANTLR lexer and returns one triple per token, across ALL
 * channels (DEFAULT_TOKEN_CHANNEL, HIDDEN, COMMENT_CHANNEL, MODIFIER_CHANNEL),
 * until EOF. The EOF sentinel itself is excluded so that a future Chevrotain/
 * Langium lexer (which emits no EOF token) can be asserted against the SAME
 * committed goldens via an identically-shaped `lexWithLangium(code)` function.
 *
 * Token types are symbolic names (e.g. "ARROW", "ID"), never numeric indices,
 * because numbering differs between ANTLR and Chevrotain.
 */
import antlr4 from "antlr4";
import sequenceLexer from "../../../src/generated-parser/sequenceLexer";

export interface LexedToken {
  type: string;
  text: string;
  channel: string;
}

export type LexFunction = (code: string) => LexedToken[];

// Mirrors `sequenceLexer.channelNames` (index === antlr channel number).
const CHANNEL_NAMES = [
  "DEFAULT_TOKEN_CHANNEL",
  "HIDDEN",
  "COMMENT_CHANNEL",
  "MODIFIER_CHANNEL",
] as const;

export function lexWithAntlr(code: string): LexedToken[] {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  // Malformed inputs (e.g. unterminated strings, stray chars) are part of the
  // corpus; suppress console noise — the OTHER catch-all guarantees the token
  // stream itself is still produced.
  lexer.removeErrorListeners();
  const tokens = new antlr4.CommonTokenStream(lexer);
  tokens.fill();
  return tokens.tokens
    .filter((token) => token.type !== antlr4.Token.EOF)
    .map((token) => ({
      type: sequenceLexer.symbolicNames[token.type] ?? `<${token.type}>`,
      text: token.text,
      channel: CHANNEL_NAMES[token.channel] ?? `CHANNEL_${token.channel}`,
    }));
}

/** Canonical golden serialization. Goldens are compared byte-for-byte. */
export function serializeTokens(tokens: LexedToken[]): string {
  return JSON.stringify(tokens, null, 2) + "\n";
}
