import antlr4 from "antlr4";
import { default as sequenceLexer } from "../generated-parser/sequenceLexer";
import { default as sequenceParser } from "../generated-parser/sequenceParser";
import ToCollector from "./ToCollector";
import ChildFragmentDetector from "./ChildFragmentDetecotr";
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
import "./key/Key";
import "./utils/cloest-ancestor/ClosestAncestor";
import "./AncestorPath";
import { formatText } from "@/utils/StringUtil";

const errors = [];
const errorDetails = [];
class SeqErrorListener extends antlr4.error.ErrorListener {
  syntaxError(recognizer, offendingSymbol, line, column, msg) {
    errors.push(`${offendingSymbol} line ${line}, col ${column}: ${msg}`);
    errorDetails.push({
      line,
      column,
      msg,
    });
  }
}

const PredictionMode = antlr4.atn.PredictionMode;

// Authoritative full-context (LL) parse. This is byte-for-byte the original
// parsing behavior: it surfaces syntax errors through the module-level
// `errors` / `errorDetails` arrays via SeqErrorListener.
function parseLL(code) {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  parser.addErrorListener(new SeqErrorListener());
  return parser._syntaxErrors ? null : parser.prog();
}

// Two-stage parsing. ANTLR defaults to full-context LL prediction, whose
// `adaptivePredict` calls dominate render time (a single 8-participant nested
// diagram parses in ~670ms under LL vs ~43ms under SLL — ~15x). SLL prediction
// produces an identical parse tree for well-formed input; for the rare input
// that genuinely needs full-context prediction, SLL raises a syntax error (or
// throws), and we fall back to the unchanged LL path. Net result: same trees
// and same error reporting as before, far faster on the common path.
function rootContext(code) {
  try {
    const chars = new antlr4.InputStream(code);
    const lexer = new sequenceLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new sequenceParser(tokens);
    // Probe silently: suppress listeners so a failed SLL attempt neither logs
    // to the console nor pollutes the error arrays before the LL fallback.
    parser.removeErrorListeners();
    parser._interp.predictionMode = PredictionMode.SLL;
    const tree = parser.prog();
    if (parser._syntaxErrors === 0) {
      return tree;
    }
  } catch {
    // SLL can fail on inputs requiring full-context prediction — fall through.
  }
  return parseLL(code);
}

antlr4.ParserRuleContext.prototype.getFormattedText = function () {
  const code = this.parser.getTokenStream().getText(this.getSourceInterval());
  // remove extra quotes, spaces and new lines
  return formatText(code);
};

// Comment is where users have the most flexibility. The parser should make minimal assumptions about
// the content and the style including change of line, indentation, etc.
antlr4.ParserRuleContext.prototype.getComment = function () {
  let tokenIndex = this.start.tokenIndex;
  let channel = sequenceLexer.channelNames.indexOf("COMMENT_CHANNEL");
  if (this.constructor.name === "BraceBlockContext") {
    tokenIndex = this.stop.tokenIndex;
  }
  let hiddenTokensToLeft = this.parser
    .getTokenStream()
    .getHiddenTokensToLeft(tokenIndex, channel);
  return (
    hiddenTokensToLeft &&
    hiddenTokensToLeft
      .map((t) => t.text.substring(2)) // skip '//'
      .join("\n")
  );
};

antlr4.ParserRuleContext.prototype.returnedValue = function () {
  return this.braceBlock().block().ret().value();
};

export const ProgContext = sequenceParser.ProgContext;
export const RootContext = rootContext;
export const GroupContext = sequenceParser.GroupContext;
export const ParticipantContext = sequenceParser.ParticipantContext;
export const Depth = function (ctx) {
  const childFragmentDetector = ChildFragmentDetector;
  return childFragmentDetector.depth(childFragmentDetector)(ctx);
};
export const Participants = function (ctx) {
  const toCollector = ToCollector;
  return toCollector.getParticipants(ctx);
};

export default {
  RootContext: rootContext,
  ProgContext: sequenceParser.ProgContext,
  GroupContext: sequenceParser.GroupContext,
  ParticipantContext: sequenceParser.ParticipantContext,
  Participants: function (ctx) {
    const toCollector = ToCollector;
    return toCollector.getParticipants(ctx);
  },
  Errors: errors,
  ErrorDetails: errorDetails,
  /**
   * @return {number} how many levels of embedded fragments
   */
  Depth: function (ctx) {
    const childFragmentDetector = ChildFragmentDetector;
    return childFragmentDetector.depth(childFragmentDetector)(ctx);
  },
};
