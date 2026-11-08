/**
 * Langium service wiring + synchronous parse entry point.
 *
 * Langium is the LSP / editor-autocomplete side-car; ANTLR remains the
 * production parser. See docs/langium-migration/14-dual-parser-architecture.md.
 *
 * Imports ONLY from 'langium' (never 'langium/lsp') so no
 * vscode-languageserver code can reach a browser bundle (07-risk-map B3/R11).
 *
 * Overrides:
 *  - TokenBuilder → the Stage-1 token list (see ./token-builder).
 *  - Lexer        → DefaultLexer rebuilt with Chevrotain `safeMode: true`.
 *                   Without safeMode, Chevrotain's first-char optimization
 *                   silently DROPS the custom-pattern unicode tokens
 *                   (ID/DIGIT_LEADING_NAME/...), exactly as documented in
 *                   src/parser-langium/lexer/index.ts for Stage 1.
 *  - ValueConverter → identity. The default converter rewrites INT to number,
 *                   strips `^` from ID, etc. — Stage 2 wants the RAW source
 *                   text in the AST, matching ANTLR token text.
 */
import {
  Lexer as ChevrotainLexer,
  createTokenInstance,
  type IToken,
  type TokenType,
} from "chevrotain";
import {
  createDefaultCoreModule,
  createDefaultSharedCoreModule,
  DefaultLexer,
  DefaultValueConverter,
  EmptyFileSystem,
  createLangiumParser,
  inject,
} from "langium";
import type {
  AstNode,
  CstNode,
  GrammarAST,
  LangiumCoreServices,
  LangiumParser,
  LangiumSharedCoreServices,
  LexerResult,
  Module,
  ParseResult,
  PartialLangiumCoreServices,
  TokenizeOptions,
  ValueType,
} from "langium";
import { isEmptyPlan, planHeaderRecovery } from "../parser/headerRecovery";
import {
  ZenUmlGeneratedModule,
  ZenUmlGeneratedSharedModule,
} from "./generated/module";
import { ZenTokenBuilder } from "./token-builder";

class ZenLexer extends DefaultLexer {
  constructor(services: LangiumCoreServices) {
    super(services);
    // Rebuild the underlying Chevrotain lexer with safeMode: the first-char
    // bucket optimization cannot analyze our custom-pattern tokens and would
    // drop them from candidate sets (verified in Stage 1).
    this.chevrotainLexer = new ChevrotainLexer(Object.values(this.definition), {
      positionTracking: "full",
      safeMode: true,
      errorMessageProvider: services.parser.LexerErrorMessageProvider,
    });
  }

  /**
   * Start offsets of stray top-level tokens that the next `tokenize` moves to
   * the hidden channel. Set only by `withStrayTokenRecovery` for one parse.
   */
  strayOffsets: ReadonlySet<number> = new Set();

  override tokenize(text: string, options?: TokenizeOptions): LexerResult {
    return this.hideStrayTokens(this.recoverHeader(text, options));
  }

  private hideStrayTokens(result: LexerResult): LexerResult {
    if (this.strayOffsets.size === 0) return result;
    const stray = (t: IToken) =>
      t.image.length > 0 && this.strayOffsets.has(t.startOffset);
    const hidden = result.tokens.filter(stray);
    if (hidden.length === 0) return result;
    return {
      ...result,
      tokens: result.tokens.filter((t) => !stray(t)),
      hidden: [...result.hidden, ...hidden].sort(
        (a, b) => a.startOffset - b.startOffset,
      ),
    };
  }

  private recoverHeader(text: string, options?: TokenizeOptions): LexerResult {
    const result = super.tokenize(text, options);
    const { tokens } = result;
    const plan = planHeaderRecovery([
      ...tokens.map((t) => ({
        kind: t.tokenType.name,
        line: t.startLine ?? 0,
      })),
      { kind: "EOF", line: 0 },
    ]);
    if (isEmptyPlan(plan)) return result;

    const errors = plan.errors.map(({ at, expected }) => {
      const offending = tokens[at];
      return {
        offset: offending.startOffset,
        line: offending.startLine,
        column: offending.startColumn,
        length: offending.image.length,
        message: `missing ${expected} at '${offending.image}'`,
      };
    });

    const merges = new Map(plan.merges.map((m) => [m.first, m.last]));
    const recovered: IToken[] = [];
    for (let index = 0; index < tokens.length; index++) {
      const last = merges.get(index);
      if (last === undefined) {
        recovered.push(tokens[index]);
      } else {
        recovered.push(this.mergedToken(text, tokens[index], tokens[last]));
        index = last;
      }
      for (const kind of plan.insertions.get(index) ?? []) {
        recovered.push(this.emptyTokenAfter(kind, tokens[index]));
      }
    }
    return {
      ...result,
      tokens: recovered,
      errors: [...result.errors, ...errors],
    };
  }

  private mergedToken(text: string, first: IToken, last: IToken): IToken {
    return createTokenInstance(
      (this.definition as Record<string, TokenType>).ID,
      text.slice(first.startOffset, (last.endOffset ?? 0) + 1),
      first.startOffset,
      last.endOffset ?? 0,
      first.startLine ?? 0,
      last.endLine ?? 0,
      first.startColumn ?? 0,
      last.endColumn ?? 0,
    );
  }

  // No width: it starts right after the token it follows.
  private emptyTokenAfter(kind: string, before: IToken): IToken {
    const end = before.endOffset ?? 0;
    const line = before.endLine ?? 0;
    const column = before.endColumn ?? 0;
    return createTokenInstance(
      (this.definition as Record<string, TokenType>)[kind],
      "",
      end + 1,
      end,
      line,
      line,
      column + 1,
      column,
    );
  }
}

class ZenValueConverter extends DefaultValueConverter {
  protected override runConverter(
    _rule: GrammarAST.AbstractRule,
    input: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _cstNode: CstNode,
  ): ValueType {
    return input; // raw source text, no INT/ID/string munging
  }
}

// Upper bound on re-parses for one document: one pass per stray token.
const MAX_STRAY_PASSES = 64;

/**
 * Stray top-level tokens (`/`, `=`, `else`, an extra `}` or `)`) stop the entry
 * rule, so Chevrotain reports "Expecting end of file" and every later
 * statement is dropped. The ANTLR parser keeps them (issue 667); do the same:
 * move the offending token to the hidden channel and parse again, so statements
 * after it stay in the AST (and in editor completion). The stray token's error
 * is kept. Valid input has no such error and is parsed once, as before.
 *
 * Detection uses the exception's `name` string, never a class name, so it
 * survives minification.
 */
function withStrayTokenRecovery(
  parser: LangiumParser,
  lexer: ZenLexer,
): LangiumParser {
  const parse = parser.parse.bind(parser) as LangiumParser["parse"];
  parser.parse = ((input: string, options?: Parameters<typeof parse>[1]) => {
    const found = new Set<number>();
    const strayErrors: ParseResult["parserErrors"] = [];
    try {
      for (let pass = 0; ; pass++) {
        const result = parse(input, options);
        const stray = result.parserErrors.find(
          (e) =>
            e.name === "NotAllInputParsedException" &&
            e.token.image.length > 0 &&
            !found.has(e.token.startOffset),
        );
        if (!stray || pass >= MAX_STRAY_PASSES) {
          if (strayErrors.length === 0) return result;
          return {
            ...result,
            parserErrors: [...strayErrors, ...result.parserErrors],
          };
        }
        found.add(stray.token.startOffset);
        strayErrors.push(stray);
        lexer.strayOffsets = found;
      }
    } finally {
      lexer.strayOffsets = new Set();
    }
  }) as LangiumParser["parse"];
  return parser;
}

export const ZenUmlModule: Module<
  LangiumCoreServices,
  PartialLangiumCoreServices
> = {
  parser: {
    TokenBuilder: () => new ZenTokenBuilder(),
    Lexer: (services) => new ZenLexer(services),
    ValueConverter: () => new ZenValueConverter(),
    LangiumParser: (services) =>
      withStrayTokenRecovery(
        createLangiumParser(services),
        services.parser.Lexer as ZenLexer,
      ),
  },
};

export interface ZenUmlServices {
  shared: LangiumSharedCoreServices;
  ZenUml: LangiumCoreServices;
}

export function createZenUmlServices(
  context = EmptyFileSystem,
): ZenUmlServices {
  const shared = inject(
    createDefaultSharedCoreModule(context),
    ZenUmlGeneratedSharedModule,
  );
  const ZenUml = inject(
    createDefaultCoreModule({ shared }),
    ZenUmlGeneratedModule,
    ZenUmlModule,
  );
  shared.ServiceRegistry.register(ZenUml);
  return { shared, ZenUml };
}

let cachedParser: ReturnType<
  typeof createZenUmlServices
>["ZenUml"]["parser"]["LangiumParser"];

/**
 * Synchronous parse. Never throws on user input; returns
 * `{ value, lexerErrors, parserErrors }` with a (possibly partial) AST —
 * recovery is Langium's default. `opts.rule` selects a named sub-rule entry
 * point (e.g. { rule: 'Atom' }).
 */
export function parseZen(
  code: string,
  opts?: { rule?: string },
): ParseResult<AstNode> {
  if (!cachedParser) {
    cachedParser = createZenUmlServices().ZenUml.parser.LangiumParser;
  }
  return cachedParser.parse(code, opts);
}
