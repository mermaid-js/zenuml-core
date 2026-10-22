import sequenceParser from "../../generated-parser/sequenceParser";
import {
  augment,
  type CreationContextAugmented,
  type IfBlockContextAugmented,
  type LoopContextAugmented,
  type MessageContextAugmented,
} from "../ContextAugmentations";
import "./Assignment";

const seqParser = sequenceParser;
const MessageContext = seqParser.MessageContext;
const CreationContext = seqParser.CreationContext;
const IfBlockContext = seqParser.IfBlockContext;
const LoopContext = seqParser.LoopContext;

augment<MessageContextAugmented>(MessageContext, {
  Statements() {
    return this.braceBlock()?.block()?.stat() || [];
  },
});

augment<CreationContextAugmented>(CreationContext, {
  Statements() {
    return this.braceBlock()?.block()?.stat() || [];
  },
});

augment<IfBlockContextAugmented>(IfBlockContext, {
  Statements() {
    return this.braceBlock()?.block()?.stat() || [];
  },
});

augment<LoopContextAugmented>(LoopContext, {
  Statements() {
    return this.braceBlock()?.block()?.stat() || [];
  },
});
