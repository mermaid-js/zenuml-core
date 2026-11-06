import { default as antlr4 } from "antlr4";
import { default as sequenceParser } from "../../../generated-parser/sequenceParser";
import {
  augment,
  type ParserRuleContextAugmented,
} from "@/parser/ContextAugmentations";

const seqParser = sequenceParser;
const StatContext = seqParser.StatContext;

augment<ParserRuleContextAugmented>(antlr4.ParserRuleContext, {
  ClosestAncestorStat() {
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
  },
});

export {};
