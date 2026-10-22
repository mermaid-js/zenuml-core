import { default as sequenceParser } from "../generated-parser/sequenceParser";
import { default as antlr4 } from "antlr4";
import type { OwnedContext } from "./AntlrTypes";
import {
  augment,
  type ParserRuleContextAugmented,
  type ProgContextAugmented,
  type StatContextAugmented,
} from "./ContextAugmentations";

const ProgContext = sequenceParser.ProgContext;
const MessageContext = sequenceParser.MessageContext;
const CreationContext = sequenceParser.CreationContext;

augment<ParserRuleContextAugmented>(antlr4.ParserRuleContext, {
  Origin() {
    return this.ClosestAncestorStat()?.Origin();
  },
});
// Origin is essentially the 'from' of a message.
// For example, in `S -> A.m1 {B.m2 {C.m3}}`,
//                  |    |     |
// Origin of        m1   m2    m3
augment<StatContextAugmented>(sequenceParser.StatContext, {
  Origin() {
    let ctx = this.parentCtx;
    while (ctx) {
      if (ctx instanceof ProgContext) {
        return (ctx as unknown as ProgContextAugmented).Starter();
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
  },
});

augment<ProgContextAugmented>(ProgContext, {
  Origin() {
    return this.Starter();
  },
});
