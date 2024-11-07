import antlr4 from "antlr4";
import "../parser/index";
import sequenceLexer from "../generated-parser/sequenceLexer";
import sequenceParser from "../generated-parser/sequenceParser";
class SeqErrorListener extends antlr4.error.ErrorListener {}

function createParser(code: any) {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  parser.addErrorListener(new SeqErrorListener());
  return parser;
}

// eslint-disable-next-line no-unused-vars
function createParseFunction(parseMethod: (parser: sequenceParser) => any) {
  return (code: string) => {
    const parser = createParser(code);
    return parseMethod(parser);
  };
}

export const ProgContextFixture = createParseFunction((parser) =>
  parser.prog(),
);
export const TitleContextFixture = createParseFunction((parser) =>
  parser.title(),
);
export const StatContextFixture = createParseFunction((parser) =>
  parser.stat(),
);
export const AsyncMessageContextFixture = createParseFunction((parser) =>
  parser.asyncMessage(),
);

export const MessageContextFixture = createParseFunction((parser) =>
  parser.message(),
);

export const DividerContextFixture = createParseFunction((parser) =>
  parser.divider(),
);
export const CreationContextFixture = createParseFunction((parser) =>
  parser.creation(),
);

export const RetContextFixture = createParseFunction((parser) => parser.ret());
