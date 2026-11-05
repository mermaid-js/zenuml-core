import antlr4 from "antlr4";
import sequenceParser from "../generated-parser/sequenceParser";

// Error recovery that keeps a `{` block with its owner (#668).
//
// The grammar has an anonymous `section : braceBlock`, so an owner's optional
// `braceBlock?` can also be skipped: the `{` is then an anonymous section. On a
// `{` block that parses, the two paths tie and ANTLR takes the first, the owner.
// On a block that does not parse, both paths die, and ANTLR's fallback
// (ParserATNSimulator.getSynValidOrSemInvalidAltThatFinishedDecisionEntryRule)
// takes the path that left the rule: the owner loses its body. A semantic
// predicate cannot prevent this, because the fallback also accepts a path whose
// predicate failed.
//
// Skipping the owner is never needed. Whatever follows a block on the skipping
// path also follows a block on the owner's path, so no valid input depends on
// it. Only the recovering parser is configured here; valid input never gets
// that far (see the two-stage parse in ./index.ts).

// Parser internals are not declared by antlr4's types.
type Parser = any;
type AtnState = any;

const RULE_TRANSITION = 3; // Transition.RULE
const RULE_STOP_STATE = 7; // ATNState.RULE_STOP

function canEnterRule(
  state: AtnState,
  ruleIndex: number,
  seen = new Set<AtnState>(),
): boolean {
  if (state.stateType === RULE_STOP_STATE || seen.has(state)) return false;
  seen.add(state);
  return state.transitions.some((transition: AtnState) => {
    if (transition.serializationType === RULE_TRANSITION) {
      return transition.target.ruleIndex === ruleIndex;
    }
    return (
      transition.isEpsilon && canEnterRule(transition.target, ruleIndex, seen)
    );
  });
}

// decision number -> the alternative that goes straight into the rule.
function alternativesEntering(parser: Parser, ruleIndex: number) {
  const alternatives = new Map<number, number>();
  parser._interp.atn.decisionToState.forEach(
    (state: AtnState, decision: number) => {
      const index = state.transitions.findIndex((t: AtnState) =>
        canEnterRule(t.target, ruleIndex),
      );
      if (index >= 0) alternatives.set(decision, index + 1);
    },
  );
  return alternatives;
}

let braceBlockAlternatives: Map<number, number> | undefined;
let elseIfAlternatives: Map<number, number> | undefined;

/** The alternative that keeps the input ahead with its owner, if there is one. */
function ownerAlternative(parser: Parser, input: Parser, decision: number) {
  const token = input.LA(1);
  if (token === sequenceParser.OBRACE) {
    braceBlockAlternatives ??= alternativesEntering(
      parser,
      sequenceParser.RULE_braceBlock,
    );
    return braceBlockAlternatives.get(decision);
  }
  // `else if` is one clause. The other reading, a bare `else` and a new `if`,
  // has the same problem as a skipped block: the `if` leaves its `alt`.
  if (token === sequenceParser.ELSE && input.LA(2) === sequenceParser.IF) {
    elseIfAlternatives ??= alternativesEntering(
      parser,
      sequenceParser.RULE_elseIfBlock,
    );
    return elseIfAlternatives.get(decision);
  }
  return undefined;
}

/** Does the `{` at the parser's position have a matching `}`? */
function isClosed(parser: Parser): boolean {
  const stream = parser.getTokenStream();
  stream.fill();
  let depth = 0;
  for (let i = stream.index; i < stream.tokens.length; i++) {
    const { type } = stream.tokens[i];
    if (type === sequenceParser.OBRACE) depth++;
    if (type === sequenceParser.CBRACE && --depth === 0) return true;
  }
  return false;
}

/** Can the token follow the `}` of this brace block, as `else` can? */
function followsBlock(parser: Parser, braceBlock: Parser, token: number) {
  const { atn } = parser._interp;
  const call = atn.states[braceBlock.invokingState].transitions[0];
  return atn
    .nextTokens(call.followState, braceBlock.parentCtx)
    .contains(token);
}

/**
 * A token at a statement boundary that no statement can use:
 * - a `{` with no matching `}`. It got here without an owner, so it is not a
 *   block at all. The statements after it stay at the enclosing level.
 * - inside a brace block, any other token that cannot start a statement, cannot
 *   close the block and cannot follow it. Without this, the block would end
 *   here and the statements after the error would leave their owner.
 */
function isStray(parser: Parser): boolean {
  const token = parser.getTokenStream().LA(1);
  if (token === antlr4.Token.EOF) return false;
  if (token === sequenceParser.OBRACE) return !isClosed(parser);

  const ctx = parser._ctx;
  const braceBlock =
    ctx instanceof sequenceParser.BraceBlockContext ? ctx : ctx.parentCtx;
  if (
    token === sequenceParser.CBRACE ||
    !(braceBlock instanceof sequenceParser.BraceBlockContext)
  ) {
    return false;
  }
  const { atn } = parser._interp;
  return (
    !atn.nextTokens(atn.states[parser.state]).contains(token) &&
    !followsBlock(parser, braceBlock, token)
  );
}

export class BlockOwnershipErrorStrategy extends antlr4.error.DefaultErrorStrategy {
  sync(parser: Parser) {
    if (
      parser._ctx instanceof sequenceParser.BlockContext ||
      parser._ctx instanceof sequenceParser.BraceBlockContext
    ) {
      while (isStray(parser)) {
        this.reportUnwantedToken(parser);
        parser.consume();
        this.reportMatch(parser);
      }
    }
    super.sync(parser);
  }
}

/** Configure a parser that recovers from errors to keep blocks with owners. */
export function keepBlocksWithOwners(parser: Parser) {
  parser._errHandler = new BlockOwnershipErrorStrategy();
  const interp = parser._interp;
  const adaptivePredict = interp.adaptivePredict;
  interp.adaptivePredict = function (
    input: Parser,
    decision: number,
    outerContext: Parser,
  ) {
    return (
      ownerAlternative(parser, input, decision) ??
      adaptivePredict.call(this, input, decision, outerContext)
    );
  };
  return parser;
}
