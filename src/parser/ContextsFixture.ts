import antlr4 from "antlr4";
import "../parser/index";
import sequenceLexer from "../generated-parser/sequenceLexer";
import sequenceParser from "../generated-parser/sequenceParser";
import { USE_LANGIUM } from "../parser-langium/engine-flag";
import * as langiumFixtures from "../parser-langium/compat";
class SeqErrorListener extends antlr4.error.ErrorListener {}

function createParser(code: any) {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  parser.addErrorListener(new SeqErrorListener());
  return parser;
}

 
// Engine flag (Stage-5 rollback lever): under ZENUML_PARSER=langium each
// fixture parses at the same named sub-rule via parseZen(code, { rule }) and
// returns the facade kind; the ANTLR pipeline below is untouched.
function createParseFunction(parseMethod: (parser: sequenceParser) => any) {
  return (code: string) => {
    const parser = createParser(code);
    return parseMethod(parser);
  };
}

function select(antlrFixture: (code: string) => any, langiumFixture: (code: string) => any) {
  return USE_LANGIUM ? langiumFixture : antlrFixture;
}

export const ProgContextFixture = select(
  createParseFunction((parser) => parser.prog()),
  langiumFixtures.ProgContextFixture,
);
export const TitleContextFixture = select(
  createParseFunction((parser) => parser.title()),
  langiumFixtures.TitleContextFixture,
);
export const StatContextFixture = select(
  createParseFunction((parser) => parser.stat()),
  langiumFixtures.StatContextFixture,
);
export const AsyncMessageContextFixture = select(
  createParseFunction((parser) => parser.asyncMessage()),
  langiumFixtures.AsyncMessageContextFixture,
);
export const SyncMessageContextFixture = select(
  createParseFunction((parser) => parser.message()),
  langiumFixtures.SyncMessageContextFixture,
);
export const DividerContextFixture = select(
  createParseFunction((parser) => parser.divider()),
  langiumFixtures.DividerContextFixture,
);
export const CreationContextFixture = select(
  createParseFunction((parser) => parser.creation()),
  langiumFixtures.CreationContextFixture,
);

export const RetContextFixture = select(
  createParseFunction((parser) => parser.ret()),
  langiumFixtures.RetContextFixture,
);
