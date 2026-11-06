import antlr4 from "antlr4";

// Error recovery for a document that ends inside a block (#696).
//
// `A {` followed by statements and no `}` is a participant and an anonymous
// block. The two `prog` alternatives (`head EOF` and `head? block EOF`) both
// die on that input, the first at `{` and the second at EOF where `}` is
// missing. ANTLR throws NoViableAlt, `prog` gives up, and every token becomes
// an error node, so the diagram is blank.
//
// An alternative that survives up to EOF only lacks the tokens that close it,
// and the error strategy can insert those. When prediction fails at EOF, the
// parser takes the alternative that got that far. A failure before EOF is
// left alone. Only the recovering parser is configured here, so valid input,
// which the SLL pass parses, never gets this far.

// Parser internals are not declared by antlr4's types.
type Parser = any;

// Class identity, not `constructor.name`: a minified bundle renames classes.
const NoViableAltException = antlr4.error.NoViableAltException;

export function recoverAtEof(parser: Parser) {
  const interp = parser._interp;
  const adaptivePredict = interp.adaptivePredict;
  interp.adaptivePredict = function (
    input: Parser,
    decision: number,
    outerContext: Parser,
  ) {
    try {
      return adaptivePredict.call(this, input, decision, outerContext);
    } catch (e) {
      if (
        e instanceof NoViableAltException &&
        e.offendingToken?.type === antlr4.Token.EOF
      ) {
        const alts: number[] = (e.deadEndConfigs?.configs ?? []).map(
          (config: { alt: number }) => config.alt,
        );
        if (alts.length > 0) {
          return Math.min(...alts);
        }
      }
      throw e;
    }
  };
  return parser;
}
