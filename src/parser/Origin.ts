import { default as sequenceParser } from "../generated-parser/sequenceParser";
import { default as antlr4 } from "antlr4";
import type { AugmentedContext, OwnedContext } from "./AntlrTypes";

interface ProgContextInstalled extends AugmentedContext {
  Starter(): string | undefined;
}

// antlr4.ParserRuleContext is the real (un-augmented) @types/antlr4 class —
// cast its prototype to the shape this file installs. See AugmentedContext's
// doc comment for why `declare module` can't express this instead.
const ParserRuleContext = antlr4.ParserRuleContext as unknown as {
  prototype: AugmentedContext;
};
const StatContext = sequenceParser.StatContext as any as {
  prototype: AugmentedContext;
};
const ProgContext = sequenceParser.ProgContext as any as {
  prototype: ProgContextInstalled;
};
const MessageContext = sequenceParser.MessageContext;
const CreationContext = sequenceParser.CreationContext;

ParserRuleContext.prototype.Origin = function (this: AugmentedContext) {
  return this.ClosestAncestorStat()?.Origin();
};
// Origin is essentially the 'from' of a message.
// For example, in `S -> A.m1 {B.m2 {C.m3}}`,
//                  |    |     |
// Origin of        m1   m2    m3
StatContext.prototype.Origin = function (this: AugmentedContext) {
  let ctx = this.parentCtx;
  while (ctx) {
    if (ctx instanceof (ProgContext as any)) {
      return (ctx as ProgContextInstalled).Starter();
    }
    if (ctx instanceof MessageContext || ctx instanceof CreationContext) {
      const receiver = (ctx as unknown as OwnedContext).Owner();
      if (receiver) {
        return receiver;
      }
    }
    ctx = ctx.parentCtx;
  }
  return undefined;
};

ProgContext.prototype.Origin = function (this: ProgContextInstalled) {
  return this.Starter();
};
