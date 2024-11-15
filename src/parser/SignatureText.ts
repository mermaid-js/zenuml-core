import sequenceParser from "../generated-parser/sequenceParser";

// Define interfaces for the parser contexts to properly type them
interface BaseContext {
  getFormattedText(): string;
}

interface Parameter extends BaseContext {
  length: number;
}

interface Parameters extends BaseContext {
  parameter(): Parameter[];
}

interface Signature extends BaseContext {
  getFormattedText(): string;
}

interface Func {
  signature(): Signature[];
}

interface MessageBody {
  func(): Func;
}

interface Content extends BaseContext {
  getFormattedText(): string;
}

interface CreationBody {
  parameters(): Parameters;
}

interface AsyncMessage {
  content(): Content;
}

interface Expression extends BaseContext {
  getFormattedText(): string;
}

// Extend the base interfaces to include our new methods
interface MessageContext extends BaseContext {
  messageBody(): MessageBody;
  SignatureText(): string; // Add the new method to the interface
}

interface AsyncMessageContext extends BaseContext {
  content(): Content;
  SignatureText(): string; // Add the new method to the interface
}

interface CreationContext extends BaseContext {
  creationBody(): CreationBody;
  SignatureText(): string; // Add the new method to the interface
  isParamValid(): boolean; // Add the new method to the interface
}

interface RetContext extends BaseContext {
  asyncMessage(): AsyncMessage;
  expr(): Expression;
  SignatureText(): string; // Add the new method to the interface
}

// Get the parser contexts and assert their types
const MessageContext = sequenceParser.MessageContext as any as {
  new (): MessageContext;
  prototype: MessageContext;
};
const AsyncMessageContext = sequenceParser.AsyncMessageContext as any as {
  new (): AsyncMessageContext;
  prototype: AsyncMessageContext;
};
const CreationContext = sequenceParser.CreationContext as any as {
  new (): CreationContext;
  prototype: CreationContext;
};
const RetContext = sequenceParser.RetContext as any as {
  new (): RetContext;
  prototype: RetContext;
};

// Now we can safely extend the prototypes with proper typing
MessageContext.prototype.SignatureText = function (
  this: MessageContext,
): string {
  return (
    this.messageBody()
      ?.func()
      ?.signature()
      ?.map((s) => s?.getFormattedText())
      .join(".") ?? ""
  );
};

AsyncMessageContext.prototype.SignatureText = function (
  this: AsyncMessageContext,
): string {
  return this.content()?.getFormattedText() ?? "";
};

CreationContext.prototype.SignatureText = function (
  this: CreationContext,
): string {
  const params = this.creationBody().parameters();
  const text =
    params?.parameter()?.length > 0 ? params.getFormattedText() : "create";
  return `«${text}»`;
};

CreationContext.prototype.isParamValid = function (
  this: CreationContext,
): boolean {
  return (this.creationBody().parameters()?.parameter()?.length ?? 0) > 0;
};

RetContext.prototype.SignatureText = function (this: RetContext): string {
  return (
    this.asyncMessage()?.content()?.getFormattedText() ??
    this.expr()?.getFormattedText() ??
    ""
  );
};
