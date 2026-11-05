/**
 * Langium service wiring + synchronous parse entry point — Stage 2.
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
  inject,
} from "langium";
import type {
  AstNode,
  CstNode,
  GrammarAST,
  LangiumCoreServices,
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

  override tokenize(text: string, options?: TokenizeOptions): LexerResult {
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

export const ZenUmlModule: Module<
  LangiumCoreServices,
  PartialLangiumCoreServices
> = {
  parser: {
    TokenBuilder: () => new ZenTokenBuilder(),
    Lexer: (services) => new ZenLexer(services),
    ValueConverter: () => new ZenValueConverter(),
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
