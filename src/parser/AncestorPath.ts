import { default as antlr4 } from "antlr4";

// TypeScript cannot infer that the method exists on the prototype chain
(antlr4.ParserRuleContext.prototype as any).getAncestors = function (
  predicate?: (ctx: antlr4.ParserRuleContext) => boolean,
): antlr4.ParserRuleContext[] {
  let current = this;
  const ancestors = [];
  while (current) {
    if (!predicate || predicate(current)) {
      ancestors.push(current);
    }
    current = current.parentCtx;
  }
  return ancestors;
};
