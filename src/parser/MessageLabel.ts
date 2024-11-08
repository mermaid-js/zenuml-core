// The label in the rendered diagram.
// `a->b.label`: `label`.
// `a->b.label()`: `label`.
// `a=b()`: `b`. Invocation.
// `a=b`: `a=b`. Simple assignment.
// `new A`: `«create»`.
// `new A(1)`: `«1»`.

import sequenceParser from "../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const MessageContext = seqParser.MessageContext;
const AsyncMessageContext = seqParser.AsyncMessageContext;
const CreationContext = seqParser.CreationContext;

// @ts-ignore
MessageContext.prototype.Label = function () {
  // @ts-ignore
  if (this.isSimpleAssignment()) {
    // @ts-ignore
    return this.Assignment()?.getLabel() + "=" + this.SignatureText();
  }
  // @ts-ignore
  return this.SignatureText();
};

// @ts-ignore
AsyncMessageContext.prototype.Label =
  AsyncMessageContext.prototype.SignatureText;

// @ts-ignore
CreationContext.prototype.Label = CreationContext.prototype.SignatureText;
