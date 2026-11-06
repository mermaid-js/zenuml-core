import { default as antlr4 } from "antlr4";
import {
  augment,
  type ParserRuleContextAugmented,
} from "./ContextAugmentations";
import type { AugmentedContext } from "./AntlrTypes";

augment<ParserRuleContextAugmented>(antlr4.ParserRuleContext, {
  getAncestors(predicate?: (ctx: AugmentedContext) => boolean) {
    const ancestors: AugmentedContext[] = [];
    if (!predicate || predicate(this)) {
      ancestors.push(this);
    }
    let current = this.parentCtx;
    while (current) {
      if (!predicate || predicate(current)) {
        ancestors.push(current);
      }
      current = current.parentCtx;
    }
    return ancestors;
  },
});
