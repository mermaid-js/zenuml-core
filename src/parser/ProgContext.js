import { default as sequenceParser } from "../generated-parser/sequenceParser";

const ProgContext = sequenceParser.ProgContext;

/**
 * When does Starter need to be treated differently?
 *
 * 0. "". A default starter CAN be rendered as otherwise the diagram is empty.
 *
 * 1. A.method
 * There is no starter indicated in the code at all. _STARTER_ is used.
 *
 * 2. A->B.method
 * There seems no need to even consider a starter and all messages have a provided sender.
 *
 * 3. if(x) { A.method }.
 * Similar to #1
 *
 * 4. if(x) { A->B.method }.
 * Similar to #2
 *
 * 5. @Starter(A).
 * Starter is clearly defined. It must be used anywhere a sender is not provided
 * and not inferrable.
 *
 * 6. A B.
 * Only the participants are defined. There is no need to consider a starter.
 *
 * From the above analysis, it is clear that whether we should consider a starter is base on
 * messages only. Thus, the following rules are established:
 *
 * For the ProgContext, if there is `@starter(x)` then Starter returns x, otherwise it returns undefined.
 * It is left to the LifelineLayer to determine whether a default starter is rendered based on the messages.
 *
 * The ToCollector should not be concerned with the default starter.
 *
 * _STARTER_ is of the renderer's concern. It is not a concern of the parser.
 */

ProgContext.prototype.Starter = function () {
  return this.head()?.starterExp()?.starter()?.getFormattedText();
};
