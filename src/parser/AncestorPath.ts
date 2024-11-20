import { default as antlr4 } from "antlr4";
// @ts-ignore
antlr4.ParserRuleContext.prototype.getAncestors = function (
  predicate: (ctx: antlr4.ParserRuleContext) => boolean,
): antlr4.ParserRuleContext[] {
  // @ts-nocheck
  let current = this;
  const ancestors = [];
  while (current) {
    if (predicate(current)) {
      ancestors.push(current);
    }
    // @ts-ignore
    current = current.parentCtx;
  }
  return ancestors;
};
