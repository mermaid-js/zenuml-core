/**
 * One augmentation interface per ANTLR-generated context class, listing every
 * method the parser patch files install on that class's prototype (plus the
 * generated rule accessors those installed methods read).
 *
 * The patch files in `src/parser/` install their methods through
 * {@link augment}, typing `this` with the matching interface here. Consumers
 * keep the cast-at-use approach described on `AugmentedContext` in
 * `AntlrTypes.ts`: `declare module` merging does not reach these classes, so a
 * context value is cast to one of these interfaces at the point of use.
 *
 * Each installed member is listed under the file that installs it.
 */
import type {
  AugmentedContext,
  AntlrNode,
  Content,
  Expression,
  Func,
  Parameter,
} from "./AntlrTypes";
import type { Assignment } from "./Messages/Assignment";

/** Source offsets of an ANTLR token. */
export interface Token {
  start: number;
  stop: number;
}

/** A node that may expose a `name()` child, as in `from`/`to` rule results. */
export interface NamedNode {
  name?(): { getFormattedText(): string } | null;
  getFormattedText(): string;
}

/** A context with a formatted source range, such as an assignee. */
interface RangedNode {
  getFormattedText(): string;
  start: Token;
  stop: Token;
}

/** The `fromTo` child of a message body. */
interface FromToLike {
  from(): NamedNode | null;
  to(): NamedNode | null;
}

/** The `assignment` rule shared by message and creation bodies. */
export interface AssignmentRuleLike {
  assignee(): (RangedNode & AntlrNode) | null;
  type(): (RangedNode & AntlrNode) | null;
}

/** `messageBody` rule: `fromTo? assignment? func`. */
export interface MessageBodyLike {
  stop: Token;
  func(): Func;
  fromTo(): FromToLike | null;
  assignment(): AssignmentRuleLike | null;
}

/** `creationBody` rule: `assignment? construct parameters?`. */
export interface CreationBodyLike {
  stop: Token;
  assignment(): AssignmentRuleLike | null;
  construct(): { getFormattedText(): string } | null;
  parameters(): {
    parameter(): Parameter[];
    getFormattedText(): string;
  };
}

/** A `{ ... }` block holding statements. */
export interface BraceBlockLike {
  block(): { stat(): AugmentedContext[] } | null;
}

/** `asyncMessage` / `returnAsyncMessage` child of a ret statement. */
interface RetAsyncMessageLike {
  content(): Content | null;
  to(): NamedNode | null;
  From?(): string | undefined;
}

/** Installed by `index.ts`, `Origin.ts`, `ClosestAncestor.ts`, `AncestorPath.ts`. */
export interface ParserRuleContextAugmented extends AugmentedContext {
  // ANTLR runtime internals read by the installers in index.ts.
  parser: any;
  start: any;
  stop: any;
  getSourceInterval(): any;
  /** Installed in AncestorPath.ts. */
  getAncestors(
    predicate?: (ctx: AugmentedContext) => boolean,
  ): AugmentedContext[];
}

/** Installed by `Origin.ts`. */
export interface StatContextAugmented extends AugmentedContext {
  Origin(): string | undefined;
}

/** Installed by `ProgContext.ts` and `Origin.ts`. */
export interface ProgContextAugmented extends AugmentedContext {
  head(): {
    starterExp(): { starter(): AntlrNode | null } | null;
  } | null;
  Starter(): string | undefined;
  Origin(): string | undefined;
}

/** Installed by `TitleContext.ts`. */
export interface TitleContextAugmented extends AugmentedContext {
  children: AntlrNode[];
  content(): string;
}

export interface MessageContextAugmented extends AugmentedContext {
  start: Token;
  messageBody(): MessageBodyLike | null;
  braceBlock(): BraceBlockLike | null;
  /** From.ts */
  ProvidedFrom(): string | undefined;
  /** From.ts */
  From(): string | undefined;
  /** Owner.ts */
  To(): string | undefined;
  /** Owner.ts */
  Owner(): string | undefined;
  /** SignatureText.ts */
  SignatureText(): string;
  /** IsCurrent.ts: alias of `messageBody`. */
  Body(): { stop: Token };
  /** IsCurrent.ts */
  isCurrent(cursor: number | null | undefined): boolean;
  /** Messages/Assignment.ts */
  Assignment(): Assignment | undefined;
  /** Messages/MessageContext.ts */
  Statements(): AugmentedContext[];
}

export interface CreationContextAugmented extends AugmentedContext {
  start: Token;
  creationBody(): CreationBodyLike | null;
  braceBlock(): BraceBlockLike | null;
  /** From.ts */
  From(): string | undefined;
  /** Owner.ts */
  Assignee(): string | undefined;
  /** Owner.ts */
  AssigneePosition(): number[] | undefined;
  /** Owner.ts */
  Constructor(): string | undefined;
  /** Owner.ts */
  Owner(): string | undefined;
  /** SignatureText.ts */
  ParametersText(): string;
  /** SignatureText.ts */
  SignatureText(): string;
  /** IsCurrent.ts: alias of `creationBody`. */
  Body(): { stop: Token };
  /** IsCurrent.ts */
  isCurrent(cursor: number | null | undefined): boolean;
  /** Messages/Assignment.ts */
  Assignment(): Assignment | undefined;
  /** Messages/MessageContext.ts */
  Statements(): AugmentedContext[];
}

export interface AsyncMessageContextAugmented extends AugmentedContext {
  from(): NamedNode | null;
  to(): NamedNode | null;
  content(): Content;
  /** From.ts */
  ProvidedFrom(): string | undefined;
  /** From.ts */
  From(): string | undefined;
  /** Owner.ts */
  To(): string | undefined;
  /** Owner.ts */
  Owner(): string | undefined;
  /** SignatureText.ts */
  SignatureText(): string;
}

/** Same members as {@link AsyncMessageContextAugmented}; distinct grammar rule. */
export type ReturnAsyncMessageContextAugmented = AsyncMessageContextAugmented;

export interface RetContextAugmented extends AugmentedContext {
  asyncMessage(): RetAsyncMessageLike | null;
  returnAsyncMessage(): RetAsyncMessageLike | null;
  expr(): Expression | null;
  /** RetContext.ts */
  Signature(): string | undefined;
  /** RetContext.ts */
  ReturnTo(): string | undefined;
  /** From.ts */
  From(): string | undefined;
  /** Owner.ts */
  To(): string | undefined;
  /** Owner.ts */
  Owner(): string | undefined;
  /** SignatureText.ts */
  SignatureText(): string;
}

/** Installed by `SignatureText.ts`. */
export interface ParametersContextAugmented extends AugmentedContext {
  parameter(): Parameter[];
}

/** Installed by `RefContext.ts`. */
export interface RefContextAugmented extends AugmentedContext {
  name(): AugmentedContext[];
  Content(): AugmentedContext | undefined;
  Participants(): AugmentedContext[];
}

/** Installed by `Divider/DividerContext.ts`. */
export interface DividerContextAugmented extends AugmentedContext {
  dividerNote(): { getFormattedText(): string } | null;
  Note(): string;
}

/** Installed by `Messages/MessageContext.ts`. */
export interface IfBlockContextAugmented extends AugmentedContext {
  braceBlock(): BraceBlockLike | null;
  Statements(): AugmentedContext[];
}

/** Installed by `Messages/MessageContext.ts`. */
export interface LoopContextAugmented extends AugmentedContext {
  braceBlock(): BraceBlockLike | null;
  Statements(): AugmentedContext[];
}

/**
 * Install `methods` on `ctxClass.prototype` with plain assignment, in key
 * order. This is exactly what `ctxClass.prototype.X = function () {...}` did:
 * the same enumerability, overriding any generated method of the same name,
 * and non-function values are copied as they are.
 *
 * Write installed methods with method or `function` syntax, never arrow
 * functions: `ThisType<T>` types `this` as the augmented context.
 */
export function augment<T>(
  ctxClass: unknown,
  methods: Partial<T> & ThisType<T>,
): void {
  const prototype = (ctxClass as { prototype: Record<string, unknown> })
    .prototype;
  for (const key of Object.keys(methods)) {
    prototype[key] = (methods as Record<string, unknown>)[key];
  }
}
