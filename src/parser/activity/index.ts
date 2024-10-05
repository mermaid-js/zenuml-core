import antlr4 from "antlr4";
import { default as activityLexer } from "../../generated-parser/activityLexer.js";
import { default as activityParser } from "../../generated-parser/activityParser.js";
import { formatText } from "@/utils/StringUtil";

function rootContext(code: string) {
  const chars = new antlr4.InputStream(code);
  const lexer = new activityLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new activityParser(tokens);
  return parser.activityDiagram();
}

// @ts-ignore
antlr4.ParserRuleContext.prototype.getFormattedText = function () {
  // @ts-ignore
  const code = this.parser.getTokenStream().getText(this.getSourceInterval());
  // remove extra quotes, spaces and new lines
  return formatText(code);
};

export default {
  RootContext: rootContext,
};
