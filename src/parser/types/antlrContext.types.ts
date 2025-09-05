// Base interface for ANTLR contexts that we actually need
export interface BaseANTLRContext {
  constructor: { name: string };
  start?: { start: number };
  stop?: { stop: number };
  parentCtx?: BaseANTLRContext;
  getText?(): string;
  getFormattedText?(): string;
  parser?: {
    getTokenStream(): {
      getText(interval: any): string;
    };
  };
  getSourceInterval?(): any;
}

// Token interface for terminal symbols
export interface Token {
  getText(): string;
  start: number;
  stop: number;
}

// Main program context
export interface IProgContext extends BaseANTLRContext {
  EOF?(): Token;
  title?(): ITitleContext;
  head?(): IHeadContext;
  block?(): IBlockContext;
}

export interface ITitleContext extends BaseANTLRContext {
  TITLE?(): Token;
  TITLE_CONTENT?(): Token;
  TITLE_END?(): Token;
}

export interface IHeadContext extends BaseANTLRContext {
  group?(): IGroupContext[];
  participant?(): IParticipantContext[];
  starterExp?(): IStarterExpContext;
}

export interface IGroupContext extends BaseANTLRContext {
  GROUP?(): Token;
  OBRACE?(): Token;
  CBRACE?(): Token;
  name?(): INameContext;
  participant?(): IParticipantContext[];
}

export interface IStarterExpContext extends BaseANTLRContext {
  STARTER_LXR?(): Token;
  OPAR?(): Token;
  CPAR?(): Token;
  starter?(): IStarterContext;
  ANNOTATION?(): Token;
}

export interface IStarterContext extends BaseANTLRContext {
  name?(): INameContext;
}

export interface IParticipantContext extends BaseANTLRContext {
  name?(): INameContext;
  participantType?(): IParticipantTypeContext;
  stereotype?(): IStereotypeContext;
  width?(): IWidthContext;
  label?(): ILabelContext;
  COLOR?(): Token;
}

export interface IStereotypeContext extends BaseANTLRContext {
  SOPEN?(): Token;
  SCLOSE?(): Token;
  label?(): ILabelContext;
}

export interface ILabelContext extends BaseANTLRContext {
  GT?(): Token;
  LT?(): Token;
  AS?(): Token;
  ANNOTATION?(): Token;
}

export interface IParticipantTypeContext extends BaseANTLRContext {
  ID?(): Token;
  STRING?(): Token;
}

export interface INameContext extends BaseANTLRContext {
  ID?(): Token;
  STRING?(): Token;
}

export interface IWidthContext extends BaseANTLRContext {
  INT?(): Token;
}

export interface IBlockContext extends BaseANTLRContext {
  stat?(): IStatContext[];
}

export interface IRetContext extends BaseANTLRContext {
  RETURN?(): Token;
  SCOL?(): Token;
  expr?(): IExprContext;
  asyncMessage(): IAsyncMessageContext;
  ANNOTATION_RET?(): Token;
  EVENT_END?(): Token;
}

export interface IDividerContext extends BaseANTLRContext {
  DIVIDER?(): Token;
  EVENT_END?(): Token;
  asyncMessage?(): IAsyncMessageContext;
  dividerNote?(): IDividerNoteContext;
  Note?(): string;
}

export interface IDividerNoteContext extends BaseANTLRContext {
  OTHER?(): Token;
}

export interface IStatContext extends BaseANTLRContext {
  alt?(): IAltContext;
  par?(): IParContext;
  opt?(): IOptContext;
  critical?(): ICriticalContext;
  section?(): ISectionContext;
  ref?(): IRefContext;
  loop?(): ILoopContext;
  creation?(): ICreationContext;
  message?(): IMessageContext;
  asyncMessage?(): IAsyncMessageContext;
  ret?(): IRetContext;
  divider?(): IDividerContext;
  tcf?(): ITcfContext;
  braceBlock?(): IBraceBlockContext;
}

export interface IParContext extends BaseANTLRContext {
  PAR?(): Token;
  braceBlock?(): IBraceBlockContext;
}

export interface IOptContext extends BaseANTLRContext {
  OPT?(): Token;
  braceBlock?(): IBraceBlockContext;
}

export interface ICriticalContext extends BaseANTLRContext {
  CRITICAL?(): Token;
  OPAR?(): Token;
  CPAR?(): Token;
  atom?(): IAtomContext;
  braceBlock?(): IBraceBlockContext;
}

export interface ISectionContext extends BaseANTLRContext {
  SECTION?(): Token;
  OPAR?(): Token;
  CPAR?(): Token;
  SCOL?(): Token;
  atom?(): IAtomContext;
  braceBlock?(): IBraceBlockContext;
}

export interface ICreationContext extends BaseANTLRContext {
  creationBody?(): ICreationBodyContext;
  braceBlock?(): IBraceBlockContext;
}

export interface IRefContext extends BaseANTLRContext {
  REF?(): Token;
  OPAR?(): Token;
  CPAR?(): Token;
  SCOL?(): Token;
  name?(): INameContext[];
}

export interface ICreationBodyContext extends BaseANTLRContext {
  NEW?(): Token;
  construct?(): IConstructContext;
  assignment?(): IAssignmentContext;
  parameters?(): IParametersContext;
}

export interface IMessageContext extends BaseANTLRContext {
  messageBody?(): IMessageBodyContext;
  braceBlock?(): IBraceBlockContext;
}

export interface IMessageBodyContext extends BaseANTLRContext {
  func?(): IFuncContext;
  assignment?(): IAssignmentContext;
  braceBlock?(): IBraceBlockContext;
}

export interface IFuncContext extends BaseANTLRContext {
  to?(): IToContext;
  from?(): IFromContext;
  signature?(): ISignatureContext[];
}

export interface IFromContext extends BaseANTLRContext {
  ID?(): Token;
  STRING?(): Token;
}

export interface IToContext extends BaseANTLRContext {
  ID?(): Token;
  STRING?(): Token;
}

export interface ISignatureContext extends BaseANTLRContext {
  methodName?(): IMethodNameContext;
  invocation?(): IInvocationContext;
  parameters?(): IParametersContext;
}

export interface IInvocationContext extends BaseANTLRContext {
  OPAR?(): Token;
  CPAR?(): Token;
}

export interface IAssignmentContext extends BaseANTLRContext {
  assignee?(): IAssigneeContext;
  type?(): ITypeContext;
  ASSIGN?(): Token;
  COL?(): Token;
}

export interface IAsyncMessageContext extends BaseANTLRContext {
  to?(): IToContext;
  from?(): IFromContext;
  ARROW?(): Token;
  MINUS?(): Token;
  EVENT_PAYLOAD_LXR?(): Token;
  content?(): IContentContext;
  // Extended methods for adapter compatibility
  From?(): string;
  To?(): string;
  SignatureText?(): string;
}

export interface IContentContext extends BaseANTLRContext {
  atom?(): IAtomContext;
}

export interface IConstructContext extends BaseANTLRContext {
  NEW?(): Token;
  ID?(): Token;
  STRING?(): Token;
}

export interface ITypeContext extends BaseANTLRContext {
  ID?(): Token;
  STRING?(): Token;
}

export interface IAssigneeContext extends BaseANTLRContext {
  STRING?(): Token;
}

export interface IMethodNameContext extends BaseANTLRContext {
  ID?(): Token;
  STRING?(): Token;
}

export interface IParametersContext extends BaseANTLRContext {
  parameter?(): IParameterContext[];
}

export interface IParameterContext extends BaseANTLRContext {
  declaration?(): IDeclarationContext;
  expr?(): IExprContext;
}

export interface IDeclarationContext extends BaseANTLRContext {
  type?(): ITypeContext;
  ID?(): Token;
}

export interface ITcfContext extends BaseANTLRContext {
  TRY?(): Token;
  tryBlock?(): ITryBlockContext;
  catchBlock?(): ICatchBlockContext[];
  finallyBlock?(): IFinallyBlockContext;
}

export interface ITryBlockContext extends BaseANTLRContext {
  braceBlock?(): IBraceBlockContext;
}

export interface ICatchBlockContext extends BaseANTLRContext {
  CATCH?(): Token;
  braceBlock?(): IBraceBlockContext;
  invocation?(): IInvocationContext;
}

export interface IFinallyBlockContext extends BaseANTLRContext {
  FINALLY?(): Token;
  braceBlock?(): IBraceBlockContext;
}

export interface IAltContext extends BaseANTLRContext {
  ifBlock?(): IIfBlockContext;
  elseIfBlock?(): IElseIfBlockContext[];
  elseBlock?(): IElseBlockContext;
}

export interface IIfBlockContext extends BaseANTLRContext {
  IF?(): Token;
  parExpr?(): IParExprContext;
  braceBlock?(): IBraceBlockContext;
}

export interface IElseIfBlockContext extends BaseANTLRContext {
  ELSE?(): Token;
  IF?(): Token;
  parExpr?(): IParExprContext;
  braceBlock?(): IBraceBlockContext;
}

export interface IElseBlockContext extends BaseANTLRContext {
  ELSE?(): Token;
  braceBlock?(): IBraceBlockContext;
}

export interface IBraceBlockContext extends BaseANTLRContext {
  OBRACE?(): Token;
  CBRACE?(): Token;
  block?(): IBlockContext;
}

export interface ILoopContext extends BaseANTLRContext {
  WHILE?(): Token;
  parExpr?(): IParExprContext;
  braceBlock?(): IBraceBlockContext;
}

export interface IExprContext extends BaseANTLRContext {
  assignment?(): IAssignmentContext;
  expr?(): IExprContext[];
  func?(): IFuncContext;
  to?(): IToContext;
  atom?(): IAtomContext;
  DOT?(): Token;
  OR?(): Token;
  PLUS?(): Token;
  MINUS?(): Token;
  LTEQ?(): Token;
  GTEQ?(): Token;
  LT?(): Token;
  GT?(): Token;
  MULT?(): Token;
  DIV?(): Token;
  MOD?(): Token;
  EQ?(): Token;
  NEQ?(): Token;
  AND?(): Token;
}

export interface IAtomContext extends BaseANTLRContext {
  PLUS?(): Token;
  NOT?(): Token;
  MINUS?(): Token;
  creation?(): ICreationContext;
  expr?(): IExprContext;
  TRUE?(): Token;
  FALSE?(): Token;
  ID?(): Token;
  MONEY?(): Token;
  STRING?(): Token;
  NIL?(): Token;
  INT?(): Token;
  FLOAT?(): Token;
  NUMBER_UNIT?(): Token;
}

export interface IParExprContext extends BaseANTLRContext {
  OPAR?(): Token;
  CPAR?(): Token;
  condition?(): IConditionContext;
}

export interface IConditionContext extends BaseANTLRContext {
  atom?(): IAtomContext;
  expr?(): IExprContext;
}

export interface IInExprContext extends BaseANTLRContext {
  IN?(): Token;
  inExpr?(): IInExprContext;
}

// Fragment context interface for compatibility
export interface IFragmentContext extends BaseANTLRContext {
  condition?(): IConditionContext;
  expr?(): IExprContext;
  ifBlock?(): IIfBlockContext;
  block?(): IBlockContext;
  braceBlock?(): IBraceBlockContext;
}
