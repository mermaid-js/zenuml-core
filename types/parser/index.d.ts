/**
 * `@zenuml/core/parser` — headless, server-safe ANTLR parsing/validation for
 * ZenUML DSL. Unlike the default `@zenuml/core` entry (a browser/DOM bundle),
 * this subpath imports cleanly in Node and is reentrant (safe to call
 * repeatedly/concurrently — it does not touch any shared module state).
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
