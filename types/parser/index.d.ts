/**
 * `@zenuml/core/parser` — headless, server-safe ANTLR parsing/validation for
 * ZenUML DSL. Unlike the default `@zenuml/core` entry (a browser/DOM bundle),
 * this subpath imports cleanly in Node, and `validate`/`parse` are reentrant:
 * each call builds its own lexer/parser/error listener, so calls are safe to
 * make repeatedly and concurrently.
 *
 * Import-time side effect: loading this module applies ZenUML's ANTLR prototype
 * augmentation (methods such as `getFormattedText` are patched onto
 * `antlr4.ParserRuleContext.prototype`). This is a one-time, process-wide
 * mutation of the `antlr4` package you have installed — harmless on its own,
 * but relevant if another library in the same process also depends on `antlr4`.
 */

export interface ErrorDetail {
  /** 1-based line of the offending token. */
  line: number;
  /** 0-based column of the offending token. */
  column: number;
  /** ANTLR diagnostic message. */
  msg: string;
}

export interface ParseResult {
  /** True when the DSL parsed with no syntax errors. */
  pass: boolean;
  /** Structured syntax errors (empty when `pass` is true). */
  errorDetails: ErrorDetail[];
}

export interface ParseTreeResult extends ParseResult {
  /**
   * ANTLR `ProgContext` parse tree. ANTLR error recovery still produces a
   * best-effort tree even when `pass` is false, so this is generally present.
   * Typed as `unknown` — cast to the ANTLR context type if you walk it.
   */
  rootContext: unknown;
}

/** Validate ZenUML DSL syntax without exposing the parse tree. */
export declare function validate(code: string): ParseResult;

/** Parse ZenUML DSL, returning the error-recovered tree plus structured errors. */
export declare function parse(code: string): ParseTreeResult;
