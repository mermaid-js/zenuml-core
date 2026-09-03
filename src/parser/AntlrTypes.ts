/**
 * TypeScript interfaces for ANTLR-generated parse tree nodes.
 *
 * The ANTLR parser generates context objects with methods named after grammar
 * rules. These interfaces capture the method patterns actually used by the
 * codebase, providing documentation and IntelliSense without pretending the
 * shapes are fully known at compile time.
 *
 * The file holds two projections of that same parse tree, and they are NOT
 * interchangeable:
 *
 * - The `*Node` interfaces (tree-walk projection) declare every member
 *   OPTIONAL, because the walkers in `src/svg` and the renderer probe methods
 *   that only some context kinds have (`node.block?.()`).
 * - The `*Context` / domain interfaces (prototype-augmentation projection,
 *   formerly `src/parser/Parser.types.ts`) declare members REQUIRED, because
 *   `src/parser/SignatureText.ts` installs prototype methods against them and
 *   calls `this.messageBody()` / `this.content()` unguarded.
 *
 * A `*Node` value is therefore not assignable to its `*Context` twin — see the
 * "kept apart" note below each pair. Merging them would silently drop the
 * required-ness the prototype installers rely on.
 */

/** Base interface for any ANTLR parse tree node */
export interface AntlrNode {
  getText?(): string;
  getFormattedText?(): string;
  getComment?(): string;
}

/**
 * The real shape of any ANTLR ParserRuleContext-derived node in this
 * codebase once the runtime prototype augmentations installed by
 * src/parser/index.js, src/parser/Origin.js and
 * src/parser/utils/cloest-ancestor/ClosestAncestor.ts have run — every
 * generated context class extends antlr4.ParserRuleContext, and those
 * modules patch its prototype directly at runtime.
 *
 * TypeScript's inference for the ANTLR-generated classes (src/generated-parser)
 * does not see prototype patches applied from other files: neither
 * `declare module "antlr4"` (merges only with the named-import view of
 * ParserRuleContext, not the `antlr4.ParserRuleContext` namespace-member
 * view every generated class's `extends` clause uses) nor
 * `declare module "@/generated-parser/sequenceParser"` (breaks the module's
 * inferred default export entirely — sequenceParser.js has no named class
 * exports to merge against) actually bridges this gap. Both were tried and
 * reverted; see git history on this file.
 *
 * So: cast ANTLR context values to this type (or an intersection adding a
 * specific context's own generated methods) explicitly at the point of use,
 * instead of relying on the compiler to infer the augmentation.
 */
export interface AugmentedContext {
  getText(): string;
  /** Installed in src/parser/index.js. */
  getFormattedText(): string;
  /** Installed in src/parser/index.js. */
  getComment(): string | undefined;
  parentCtx: AugmentedContext | null;
  /** Installed in src/parser/utils/cloest-ancestor/ClosestAncestor.ts. */
  ClosestAncestorStat(): AugmentedContext | undefined;
  /** Installed in src/parser/Origin.js. */
  Origin(): string | undefined;
}

/** A block containing statements: `{ stat1; stat2; }` */
export interface BlockNode extends AntlrNode {
  stat?(): StatNode[];
}

/** The root context returned by Parser.RootContext() */
export interface RootContextNode extends AntlrNode {
  block?(): BlockNode;
}

/** A statement node — dispatches to one of: message, asyncMessage, creation, ret, divider, alt, tcf, loop, etc. */
export interface StatNode extends AntlrNode {
  message?(): MessageNode | null;
  asyncMessage?(): AsyncMessageNode | null;
  creation?(): CreationNode | null;
  ret?(): ReturnNode | null;
  divider?(): AntlrNode | null;
  alt?(): AltNode | null;
  tcf?(): TcfNode | null;
  loop?(): SingleBlockFragmentNode | null;
  opt?(): SingleBlockFragmentNode | null;
  par?(): SingleBlockFragmentNode | null;
  critical?(): SingleBlockFragmentNode | null;
  section?(): SingleBlockFragmentNode | null;
  ref?(): AntlrNode | null;
  [key: string]: ((...args: unknown[]) => unknown) | undefined;
}

/** A sync message: `A.method()` or `A.method() { ... }` */
export interface MessageNode extends AntlrNode {
  From?(): string;
  Owner?(): string;
  SignatureText?(): string;
  braceBlock?(): { block?(): BlockNode } | null;
  Assignment?(): { assignee?: string } | null;
}

/** An async message: `A -> B: label` */
export interface AsyncMessageNode extends AntlrNode {
  From?(): string;
  ProvidedFrom?(): string;
  Origin?(): string;
  Owner?(): string;
  SignatureText?(): string;
  to?(): AntlrNode | null;
  content?(): AntlrNode | null;
}

/** A creation statement: `new B()` or `b = new B()` */
export interface CreationNode extends AntlrNode {
  From?(): string;
  Owner?(): string;
  SignatureText?(): string;
  braceBlock?(): { block?(): BlockNode } | null;
  Assignment?(): { assignee?: string } | null;
}

/** A return statement: `return value` */
export interface ReturnNode extends AntlrNode {
  From?(): string;
  ReturnTo?(): string;
  SignatureText?(): string;
  asyncMessage?(): AsyncMessageNode | null;
}

/** Alt (if/else) fragment */
export interface AltNode extends AntlrNode {
  ifBlock?(): ConditionBlockNode | null;
  elseIfBlock?(): ConditionBlockNode[];
  elseBlock?(): { braceBlock?(): { block?(): BlockNode } } | null;
}

/** Try/catch/finally fragment */
export interface TcfNode extends AntlrNode {
  tryBlock?(): { braceBlock?(): { block?(): BlockNode } } | null;
  catchBlock?(): CatchBlockNode[];
  finallyBlock?(): { braceBlock?(): { block?(): BlockNode } } | null;
}

/** A condition block (if/else-if) with a parExpr containing a condition */
export interface ConditionBlockNode extends AntlrNode {
  parExpr?(): { condition?(): AntlrNode } | null;
  braceBlock?(): { block?(): BlockNode } | null;
}

/** A catch block with an invocation for exception parameters */
export interface CatchBlockNode extends AntlrNode {
  invocation?(): { parameters?(): AntlrNode } | null;
  braceBlock?(): { block?(): BlockNode } | null;
}

/** Single-block fragments: loop, opt, par, critical, section */
export interface SingleBlockFragmentNode extends AntlrNode {
  parExpr?(): { condition?(): AntlrNode } | null;
  braceBlock?(): { block?(): BlockNode } | null;
}

/* ------------------------------------------------------------------------ */
/* Prototype-augmentation projection (merged from src/parser/Parser.types.ts) */
/*                                                                          */
/* Required-member shapes used by src/parser/SignatureText.ts to type the    */
/* generated context classes it patches. Kept separate from the `*Node`      */
/* interfaces above: `MessageNode`/`CreationNode`/`ReturnNode`/              */
/* `AsyncMessageNode` declare the same concepts with every member optional,  */
/* and collapsing each pair into one declaration would drop the required-ness*/
/* these installers depend on.                                              */
/* ------------------------------------------------------------------------ */

/** Any context whose formatted source text the parser layer reads. */
export interface BaseContext {
  getFormattedText(): string;
}

/**
 * `signature`, `content` and `expr` contexts are read through
 * `getFormattedText()` only, so they are the same shape as {@link BaseContext}
 * — aliased rather than re-declared three times.
 */
export type Signature = BaseContext;
export type Content = BaseContext;
export type Expression = BaseContext;

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

export interface Func {
  signature(): Signature[];
}

export interface MessageBody {
  func(): Func;
}

export interface CreationBody {
  parameters(): Parameters;
}

export interface AsyncMessage {
  content(): Content;
}

/** Kept apart from {@link MessageNode}: `messageBody()` is required here. */
export interface MessageContext extends BaseContext {
  messageBody(): MessageBody;
  SignatureText(): string;
}

/** Kept apart from {@link AsyncMessageNode}: `content()` is required here. */
export interface AsyncMessageContext extends BaseContext {
  content(): Content;
  SignatureText(): string;
}

/** Same shape as {@link AsyncMessageContext}; distinct grammar rule, one declaration. */
export type ReturnAsyncMessageContext = AsyncMessageContext;

/** Kept apart from {@link CreationNode}: `creationBody()` is required here. */
export interface CreationContext extends BaseContext {
  creationBody(): CreationBody;
  SignatureText(): string;
  ParametersText(): string;
}

/** Kept apart from {@link ReturnNode}: `asyncMessage()`/`expr()` are required here. */
export interface RetContext extends BaseContext {
  asyncMessage(): AsyncMessage;
  returnAsyncMessage(): AsyncMessage;
  expr(): Expression;
  SignatureText(): string;
}
