import { default as antlr4 } from "antlr4";
import { default as sequenceParser } from "../../../generated-parser/sequenceParser";
import type { AugmentedContext } from "@/parser/AntlrTypes";

const seqParser = sequenceParser;
const StatContext = seqParser.StatContext;

// antlr4.ParserRuleContext is the real (un-augmented) @types/antlr4 class —
// cast its prototype to the shape this file installs. See AugmentedContext's
// doc comment for why `declare module` can't express this instead.
const ParserRuleContext = antlr4.ParserRuleContext as unknown as {
  prototype: AugmentedContext;
};

ParserRuleContext.prototype.ClosestAncestorStat = function (
  this: AugmentedContext,
): AugmentedContext | undefined {
  if (this instanceof StatContext) {
    return this;
  }
  let current = this.parentCtx;
  while (current && !(current instanceof StatContext)) {
    current = current.parentCtx;
  }
  if (current instanceof StatContext) {
    return current;
  }
  return undefined;
};

ParserRuleContext.prototype.ClosestAncestorBlock = function (
  this: AugmentedContext,
): AugmentedContext | undefined {
  const parentCtx = this.ClosestAncestorStat()?.parentCtx;
  // if parent is a block, return it
  if (parentCtx instanceof seqParser.BlockContext) {
    return parentCtx;
  }
  console.warn("Cannot find closest ancestor block for context:", this);
  return undefined;
};

export {};
