import antlr4 from "antlr4";
import { default as sequenceLexer } from "../generated-parser/sequenceLexer";
import { default as sequenceParser } from "../generated-parser/sequenceParser";
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
import "./utils/cloest-ancestor/ClosestAncestor";
import "./AncestorPath";
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
class SeqErrorListener extends antlr4.error.ErrorListener {
  syntaxError(
    _recognizer: unknown,
    _offendingSymbol: unknown,
    line: number,
    column: number,
    msg: string,
  ) {
    errorDetails.push({
      line,
      column,
      msg,
    });
  }
}

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

function createParser(code: string, { silent = false } = {}) {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  if (silent) {
    lexer.removeErrorListeners();
  }
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  if (silent) {
    parser.removeErrorListeners();
  }
  return parser;
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

  // Two-stage parsing: SLL prediction is an order of magnitude faster than
  // full LL and, when it succeeds, is guaranteed to produce the same parse
  // tree. BailErrorStrategy aborts on the first syntax error so invalid input
  // falls through to the full LL parse below, which keeps error recovery and
  // error reporting behavior unchanged.
  const sllParser = createParser(code, { silent: true });
  sllParser._interp.predictionMode = antlr4.atn.PredictionMode.SLL;
  sllParser._errHandler = new antlr4.error.BailErrorStrategy();
  try {
    const tree = sllParser.prog();
    rootContextCache.set(code, tree);
    if (rootContextCache.size > ROOT_CONTEXT_CACHE_MAX) {
      rootContextCache.delete(rootContextCache.keys().next().value as string);
    }
    return tree;
  } catch {
    // fall through to full LL parse
  }

  const parser = createParser(code);
  parser.addErrorListener(new SeqErrorListener());
  return parser.prog();
}

augment<ParserRuleContextAugmented>(antlr4.ParserRuleContext, {
  getFormattedText() {
    const code = this.parser.getTokenStream().getText(this.getSourceInterval());
    // remove extra quotes, spaces and new lines
    return formatText(code);
  },

  // Comment is where users have the most flexibility. The parser should make minimal assumptions about
  // the content and the style including change of line, indentation, etc.
  getComment() {
    let tokenIndex = this.start.tokenIndex;
    const channel = sequenceLexer.channelNames.indexOf("COMMENT_CHANNEL");
    if (this.constructor.name === "BraceBlockContext") {
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
  const listener = new CollectingErrorListener();
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  lexer.removeErrorListeners();
  lexer.addErrorListener(listener);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  parser.removeErrorListeners();
  parser.addErrorListener(listener);
  const tree = parser.prog();
  return {
    rootContext: tree,
    pass: listener.errorDetails.length === 0,
    errorDetails: listener.errorDetails,
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
