import sequenceParser from "../generated-parser/sequenceParser";
import type { Parameter } from "./AntlrTypes";
import {
  augment,
  type AsyncMessageContextAugmented,
  type CreationContextAugmented,
  type MessageContextAugmented,
  type ParametersContextAugmented,
  type RetContextAugmented,
  type ReturnAsyncMessageContextAugmented,
} from "./ContextAugmentations";

// Helper function to format a single parameter
function formatParameter(param: Parameter): string {
  if (param.namedParameter?.()) {
    const namedParam = param.namedParameter();
    if (namedParam) {
      const expr = namedParam.expr();
      const value = expr ? expr.getFormattedText() : "";
      return `${namedParam.ID().getText()}=${value}`;
    }
  }

  if (param.declaration?.()) {
    const decl = param.declaration();
    if (decl) {
      return `${decl.type().getText()} ${decl.ID().getText()}`;
    }
  }

  const expr = param.expr?.();
  if (expr) {
    return expr.getFormattedText();
  }

  return param.getFormattedText();
}

// Helper function to format parameters list
function formatParameters(params: Parameter[]): string {
  return params.map(formatParameter).join(",");
}

augment<MessageContextAugmented>(sequenceParser.MessageContext, {
  SignatureText(): string {
    return (
      this.messageBody()
        ?.func()
        ?.signature()
        ?.map((s) => s?.getFormattedText())
        .join(".") ?? ""
    );
  },
});

augment<AsyncMessageContextAugmented>(sequenceParser.AsyncMessageContext, {
  SignatureText(): string {
    return this.content()?.getFormattedText() ?? "";
  },
});

augment<CreationContextAugmented>(sequenceParser.CreationContext, {
  ParametersText(): string {
    const params = this.creationBody()!.parameters();
    return params?.parameter()?.length > 0
      ? formatParameters(params.parameter())
      : "";
  },
  SignatureText(): string {
    const text = this.ParametersText() || "create";
    return `«${text}»`;
  },
});

augment<RetContextAugmented>(sequenceParser.RetContext, {
  SignatureText(): string {
    return (
      this.asyncMessage()?.content()?.getFormattedText() ??
      this.returnAsyncMessage()?.content()?.getFormattedText() ??
      this.expr()?.getFormattedText() ??
      ""
    );
  },
});

augment<ReturnAsyncMessageContextAugmented>(
  sequenceParser.ReturnAsyncMessageContext,
  {
    SignatureText(): string {
      return this.content()?.getFormattedText() ?? "";
    },
  },
);

// Enhance ParametersContext to properly format named parameters
augment<ParametersContextAugmented>(sequenceParser.ParametersContext, {
  getFormattedText(): string {
    const params = this.parameter();
    if (!params || params.length === 0) {
      return "";
    }
    return formatParameters(params);
  },
});
