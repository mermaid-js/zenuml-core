// types/sequenceParser.types.ts

export interface BaseContext {
  getFormattedText(): string;
}

export interface Parameter extends BaseContext {
  length: number;
  namedParameter?(): NamedParameter | null;
  expr?(): Expression | null;
  declaration?(): Declaration | null;
}

export interface NamedParameter extends BaseContext {
  ID(): { getText(): string };
  expr(): Expression;
}

export interface Declaration extends BaseContext {
  type(): { getText(): string };
  ID(): { getText(): string };
}

export interface Parameters extends BaseContext {
  parameter(): Parameter[];
}

export interface Signature extends BaseContext {
  getFormattedText(): string;
}

export interface Func {
  signature(): Signature[];
}

export interface MessageBody {
  func(): Func;
}

export interface Content extends BaseContext {
  getFormattedText(): string;
}

export interface CreationBody {
  parameters(): Parameters;
}

export interface AsyncMessage {
  content(): Content;
}

export interface Expression extends BaseContext {
  getFormattedText(): string;
}

export interface MessageContext extends BaseContext {
  messageBody(): MessageBody;
  SignatureText(): string;
}

export interface AsyncMessageContext extends BaseContext {
  content(): Content;
  SignatureText(): string;
}

export interface CreationContext extends BaseContext {
  creationBody(): CreationBody;
  SignatureText(): string;
  isParamValid(): boolean;
}

export interface RetContext extends BaseContext {
  asyncMessage(): AsyncMessage;
  expr(): Expression;
  SignatureText(): string;
}
