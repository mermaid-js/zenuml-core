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
import { Lexer as ChevrotainLexer } from "chevrotain";
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
  Module,
  ParseResult,
  PartialLangiumCoreServices,
  ValueType,
} from "langium";
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
