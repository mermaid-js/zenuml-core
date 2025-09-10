import sequenceParser from "../generated-parser/sequenceParser";
import type {
  MessageContext,
  AsyncMessageContext,
  CreationContext,
  RetContext,
  Parameter,
} from "./Parser.types";

// Helper function to format a single parameter
function formatParameter(param: Parameter): string {
  if (param.namedParameter?.()) {
    const namedParam = param.namedParameter();
    if (namedParam) {
      return `${namedParam.ID().getText()}=${namedParam.expr().getFormattedText()}`;
    }
  }
  
  if (param.declaration?.()) {
    const decl = param.declaration();
    if (decl) {
      return `${decl.type().getText()} ${decl.ID().getText()}`;
    }
  }
  
  if (param.expr?.()) {
    return param.expr().getFormattedText();
  }
  
  return param.getFormattedText();
}

// Helper function to format parameters list
function formatParameters(params: Parameter[]): string {
  return params.map(formatParameter).join(",");
}

// Get the parser contexts and assert their types
const MessageContext = sequenceParser.MessageContext as any as {
  new (): MessageContext;
  prototype: MessageContext;
};
const ParametersContext = sequenceParser.ParametersContext as any as {
  new (): any;
  prototype: any;
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
    params?.parameter()?.length > 0 
      ? formatParameters(params.parameter())
      : "create";
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

// Enhance ParametersContext to properly format named parameters
ParametersContext.prototype.getFormattedText = function (): string {
  const params = this.parameter();
  if (!params || params.length === 0) {
    return "";
  }
  return formatParameters(params);
};
