/**
 * TypeScript interfaces for ANTLR-generated parse tree nodes.
 *
 * The ANTLR parser generates context objects with methods named after grammar
 * rules. These interfaces capture the method patterns actually used by the
 * codebase, providing documentation and IntelliSense without pretending the
 * shapes are fully known at compile time.
 *
 * Methods use optional chaining patterns (e.g. `node.block?.()`) because
 * not all context types have all methods — each grammar rule produces a
 * different context class.
 */

/** Base interface for any ANTLR parse tree node */
export interface AntlrNode {
  getText?(): string;
  getFormattedText?(): string;
  getComment?(): string;
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
