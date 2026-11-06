import antlr4 from "antlr4";
import { default as sequenceLexer } from "../generated-parser/sequenceLexer";
import { default as sequenceParser } from "../generated-parser/sequenceParser";
import { repairIncompleteCalls } from "./repairIncompleteCalls";
import { readDotColonAsArrow, repairLooseTokens } from "./repairLooseTokens";
import { HeaderRecoveringLexer } from "./HeaderRecoveringLexer";
import ToCollector from "./ToCollector";
import "./TitleContext";
import "./IsCurrent";
import "./Owner";
import "./ProgContext";
import "./RetContext";
import "./RefContext";
import "./Origin";
import "./Divider/DividerContext";
import "./SignatureText";
import "./Messages/MessageContext";
import "./From";
import "./utils/ClosestAncestor";
import "./AncestorPath";
import { recoverAtEof } from "./recoverAtEof";
import { pruneDanglingStatements } from "./pruneDanglingStatements";
import {
  BlockOwnershipErrorStrategy,
  keepBlocksWithOwners,
} from "./BlockOwnership";
import { formatText } from "@/utils/StringUtil";
import {
  augment,
  type ParserRuleContextAugmented,
} from "./ContextAugmentations";

export interface ErrorDetail {
  line: number;
  column: number;
  msg: string;
}

// ANTLR-generated parser internals (`_interp`, `_errHandler`, `parser`) are not
// declared by the JS-inferred types, so they are accessed through `any`.
type Ctx = any;

const errorDetails: ErrorDetail[] = [];

// Reentrant error listener: collects syntax errors into its OWN instance array
// instead of the shared module-level `errorDetails`. This is what lets
// validate()/parse() below run repeatedly or concurrently (e.g. server-side)
// without the clear-before/clear-after dance the legacy globals require.
class CollectingErrorListener extends antlr4.error.ErrorListener {
  errorDetails: ErrorDetail[];
  constructor() {
    super();
    this.errorDetails = [];
  }
  syntaxError(
    _recognizer: unknown,
    _offendingSymbol: unknown,
    line: number,
    column: number,
    msg: string,
  ) {
    this.errorDetails.push({ line, column, msg });
  }
}

function isTopLevelBlock(ctx: Ctx) {
  return (
    ctx instanceof sequenceParser.BlockContext &&
    ctx.parentCtx instanceof sequenceParser.ProgContext
  );
}

// The statement loop of `block` ends at a token that cannot start a statement.
// At the top level nothing can use that token, so `prog` would fail on it. This
// strategy reports the token and stays in the loop, so that one pass finds every
// stray token between statements.
class StrayStatementStrategy extends BlockOwnershipErrorStrategy {
  sync(recognizer: Ctx) {
    if (isTopLevelBlock(recognizer._ctx)) {
      while (!recognizer.isExpectedToken(recognizer.getTokenStream().LA(1))) {
        const token = recognizer.getCurrentToken();
        const display = (this as Ctx).getTokenErrorDisplay(token);
        recognizer.notifyErrorListeners(
          `mismatched input ${display} expecting <EOF>`,
          token,
          null,
        );
        recognizer.consume();
      }
    }
    super.sync(recognizer);
  }
}

// `prog` has nowhere to go after its catch clause: when it fails, every token
// that is left becomes an error node and no statement is built from them. This
// listener remembers the tokens that StrayStatementStrategy skipped, and the
// token that made `prog` fail. An error that `prog` recovers from without an
// exception (one extra token just before EOF) loses nothing, so it is not stray.
class StrayTokenListener extends CollectingErrorListener {
  strays: { token: Ctx; error: ErrorDetail }[] = [];
  syntaxError(
    recognizer: Ctx,
    offendingSymbol: Ctx,
    line: number,
    column: number,
    msg: string,
    e?: unknown,
  ) {
    super.syntaxError(recognizer, offendingSymbol, line, column, msg);
    const ctx = recognizer._ctx;
    if (
      offendingSymbol.type !== antlr4.Token.EOF &&
      (isTopLevelBlock(ctx) || (e && ctx instanceof sequenceParser.ProgContext))
    ) {
      this.strays.push({ token: offendingSymbol, error: { line, column, msg } });
    }
  }
}

function byPosition(a: ErrorDetail, b: ErrorDetail) {
  return a.line - b.line || a.column - b.column;
}

// SLL prediction is an order of magnitude faster than full LL and, when it
// succeeds, is guaranteed to produce the same parse tree. BailErrorStrategy
// aborts on the first syntax error. Returns null for invalid input.
function parseWithSll(tokens: Ctx) {
  readDotColonAsArrow(tokens);
  tokens.seek(0);
  const parser: Ctx = new sequenceParser(tokens);
  parser.removeErrorListeners();
  parser._interp.predictionMode = antlr4.atn.PredictionMode.SLL;
  parser._errHandler = new antlr4.error.BailErrorStrategy();
  try {
    const tree = parser.prog();
    // A grammar action can report an error without an exception, and a recovered
    // header parses cleanly but is not error-free.
    if (parser._syntaxErrors !== 0 || tokens.tokenSource.reportedHeaderError) {
      return null;
    }
    pruneDanglingStatements(tree);
    return tree;
  } catch {
    return null;
  }
}

// A stray token in the document head costs one pass, so garbage input must not
// scale with its length. After this many passes the remaining tokens truncate
// the document, as every stray token did before they were skipped.
const MAX_STRAY_PASSES = 8;

/**
 * Parses with full LL. Tokens the parser cannot place at the top level are
 * reported and moved off the default channel, and the document is parsed again
 * without them. Input with no top-level error takes one pass and is not changed.
 *
 * Only the errors for those tokens are kept from that pass. Its other errors can
 * be side effects of the stray tokens, and the real ones come back in the final
 * pass.
 */
function parseSkippingStrayTokens(tokens: Ctx) {
  const strayErrors: ErrorDetail[] = [
    ...repairIncompleteCalls(tokens),
    ...repairLooseTokens(tokens),
  ];
  for (let pass = 1; ; pass++) {
    tokens.seek(0);
    const parser: Ctx = recoverAtEof(
      keepBlocksWithOwners(new sequenceParser(tokens)),
    );
    const listener = new StrayTokenListener();
    parser.removeErrorListeners();
    parser.addErrorListener(listener);
    parser._errHandler = new StrayStatementStrategy();
    const tree = parser.prog();
    if (listener.strays.length === 0 || pass === MAX_STRAY_PASSES) {
      pruneDanglingStatements(tree);
      return {
        tree,
        errors: [...strayErrors, ...listener.errorDetails].sort(byPosition),
      };
    }
    for (const { token, error } of listener.strays) {
      token.channel = antlr4.Token.HIDDEN_CHANNEL;
      strayErrors.push(error);
    }
    const sllTree = parseWithSll(tokens);
    if (sllTree) {
      return { tree: sllTree, errors: strayErrors.sort(byPosition) };
    }
  }
}

function createSilentTokens(code: string) {
  const chars = new antlr4.InputStream(code);
  const lexer = new HeaderRecoveringLexer(chars);
  lexer.removeErrorListeners();
  return new antlr4.CommonTokenStream(lexer);
}

// Memoize error-free parse results so the same code is parsed once even when
// multiple render paths (store, SVG export, CLI) need the tree.
const rootContextCache = new Map<string, Ctx>();
const ROOT_CONTEXT_CACHE_MAX = 10;

function rootContext(code: string) {
  const cached = rootContextCache.get(code);
  if (cached) {
    return cached;
  }

  // Two-stage parsing: invalid input falls through from SLL to the full LL parse
  // below, which does the error recovery and error reporting.
  // A document that needs a repair is incomplete, even when its tokens parse.
  const silentTokens = createSilentTokens(code);
  const sllTree =
    repairIncompleteCalls(silentTokens).length === 0
      ? parseWithSll(silentTokens)
      : null;
  if (sllTree) {
    rootContextCache.set(code, sllTree);
    if (rootContextCache.size > ROOT_CONTEXT_CACHE_MAX) {
      rootContextCache.delete(rootContextCache.keys().next().value as string);
    }
    return sllTree;
  }

  const chars = new antlr4.InputStream(code);
  const lexer = new HeaderRecoveringLexer(chars);
  const lexerListener = new CollectingErrorListener();
  lexer.addErrorListener(lexerListener);
  const { tree, errors } = parseSkippingStrayTokens(
    new antlr4.CommonTokenStream(lexer),
  );
  for (const { line, column, msg } of errors) {
    console.error(`line ${line}:${column} ${msg}`);
  }
  errorDetails.push(...[...lexerListener.errorDetails, ...errors].sort(byPosition));
  return tree;
}

augment<ParserRuleContextAugmented>(antlr4.ParserRuleContext, {
  getFormattedText() {
    const code = this.parser.getTokenStream().getText(this.getSourceInterval());
    // remove extra quotes, spaces and new lines
    const text = formatText(code);
    // A lone unclosed string (`"Bob Sm`) is a name that is still being typed:
    // formatText only strips a closing pair, so drop the opening quote here.
    if (
      this.start &&
      this.start === this.stop &&
      this.start.type === sequenceLexer.USTRING
    ) {
      // A lone `"` stays as it is: an empty name would throw downstream.
      return text.length > 1 ? text.replace(/^"/, "") : text;
    }
    return text;
  },

  // Comment is where users have the most flexibility. The parser should make minimal assumptions about
  // the content and the style including change of line, indentation, etc.
  getComment() {
    let tokenIndex = this.start.tokenIndex;
    const channel = sequenceLexer.channelNames.indexOf("COMMENT_CHANNEL");
    // Compare the class, not its name: the published bundles minify class names.
    if (this instanceof sequenceParser.BraceBlockContext) {
      tokenIndex = this.stop.tokenIndex;
    }
    const hiddenTokensToLeft = this.parser
      .getTokenStream()
      .getHiddenTokensToLeft(tokenIndex, channel);
    return (
      hiddenTokensToLeft &&
      hiddenTokensToLeft
        .map((t: { text: string }) => t.text.substring(2)) // skip '//'
        .join("\n")
    );
  },
});

/**
 * Parse ZenUML DSL with a per-call (reentrant) error listener and return both
 * the error-recovered parse tree and a structured error list. Safe to call
 * repeatedly/concurrently — it does not touch the module-level ErrorDetails.
 *
 * @param code ZenUML DSL source
 */
export function parse(code: string): {
  rootContext: Ctx;
  pass: boolean;
  errorDetails: ErrorDetail[];
} {
  const lexerListener = new CollectingErrorListener();
  const chars = new antlr4.InputStream(code);
  const lexer = new HeaderRecoveringLexer(chars);
  lexer.removeErrorListeners();
  lexer.addErrorListener(lexerListener);
  const { tree, errors } = parseSkippingStrayTokens(
    new antlr4.CommonTokenStream(lexer),
  );
  const allErrors = [...lexerListener.errorDetails, ...errors].sort(byPosition);
  return {
    rootContext: tree,
    pass: allErrors.length === 0,
    errorDetails: allErrors,
  };
}

/**
 * Validate ZenUML DSL syntax without exposing the parse tree. Reentrant.
 *
 * @param code ZenUML DSL source
 */
export function validate(code: string): {
  pass: boolean;
  errorDetails: ErrorDetail[];
} {
  const { pass, errorDetails } = parse(code);
  return { pass, errorDetails };
}

export const ProgContext = sequenceParser.ProgContext;
export const RootContext = rootContext;
export const GroupContext = sequenceParser.GroupContext;
export const ParticipantContext = sequenceParser.ParticipantContext;
export const Participants = function (ctx: unknown) {
  const toCollector = ToCollector;
  return toCollector.getParticipants(ctx);
};

export default {
  RootContext: rootContext,
  ProgContext: sequenceParser.ProgContext,
  GroupContext: sequenceParser.GroupContext,
  ParticipantContext: sequenceParser.ParticipantContext,
  Participants: function (ctx: unknown) {
    const toCollector = ToCollector;
    return toCollector.getParticipants(ctx);
  },
  parse,
  validate,
  ErrorDetails: errorDetails,
};
