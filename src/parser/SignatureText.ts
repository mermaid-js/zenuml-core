// Owner is the `to` for a message or the name in the creation.
import sequenceParser from "../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const MessageContext = seqParser.MessageContext;
const AsyncMessageContext = seqParser.AsyncMessageContext;
const CreationContext = seqParser.CreationContext;

// @ts-ignore
MessageContext.prototype.SignatureText = function () {
  return this.messageBody()
    ?.func()
    ?.signature()
    ?.map((s: any) => s?.getFormattedText())
    .join(".");
};

// @ts-ignore
AsyncMessageContext.prototype.SignatureText = function () {
  // @ts-ignore
  return this.content()?.getFormattedText();
};

// @ts-ignore
CreationContext.prototype.SignatureText = function () {
  const params = this.creationBody().parameters();
  const text =
    // @ts-ignore
    params?.parameter()?.length > 0 ? params.getFormattedText() : "create";
  return "«" + text + "»";
};

// @ts-ignore
CreationContext.prototype.isParamValid = function () {
  return this.creationBody().parameters()?.parameter()?.length > 0;
};
