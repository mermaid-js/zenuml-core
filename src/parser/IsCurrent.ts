import { default as sequenceParser } from "../generated-parser/sequenceParser";
import {
  augment,
  type CreationContextAugmented,
  type MessageContextAugmented,
} from "./ContextAugmentations";

const seqParser = sequenceParser;

/** MessageContext / CreationContext once Body and isCurrent are installed. */
type CurrentableContext = CreationContextAugmented | MessageContextAugmented;

// `Body` is the generated `creationBody` / `messageBody` accessor, copied at
// install time exactly as the plain prototype assignment did.
augment<CreationContextAugmented>(seqParser.CreationContext, {
  Body: seqParser.CreationContext.prototype.creationBody,
  isCurrent(cursor: number | null | undefined) {
    return isCurrent.bind(this)(cursor);
  },
});

augment<MessageContextAugmented>(seqParser.MessageContext, {
  Body: seqParser.MessageContext.prototype.messageBody,
  isCurrent(cursor: number | null | undefined) {
    return isCurrent.bind(this)(cursor);
  },
});

function isCurrent(
  this: CurrentableContext,
  cursor: number | null | undefined,
): boolean {
  try {
    if (cursor === null || cursor === undefined) return false;
    const start = this.start.start;
    const stop = this.Body().stop.stop + 1;

    return cursor >= start && cursor <= stop;
  } catch {
    return false;
  }
}
