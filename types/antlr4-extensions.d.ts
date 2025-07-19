import "antlr4";

declare module "antlr4" {
  interface ParserRuleContext {
    getFormattedText(): string;
    getComment(): string;
  }
}
