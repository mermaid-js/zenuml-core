import antlr4 from "antlr4";
import { default as activityLexer } from "../../generated-parser/activityLexer.js";
import { default as activityParser } from "../../generated-parser/activityParser.js";

function rootContext(code: string) {
  const chars = new antlr4.InputStream(code);
  const lexer = new activityLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new activityParser(tokens);
  return parser.activityDiagram();
}

export default {
  RootContext: rootContext,
};
