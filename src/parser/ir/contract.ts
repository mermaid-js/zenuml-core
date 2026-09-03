/**
 * # v1 IR Contract — the renderer-facing parse-tree boundary
 *
 * The declared shape of the parse-tree API that the renderer
 * (`src/components`, `src/positioning`, `src/svg`, `src/store`, `src/utils`)
 * consumes today. TypeScript types ONLY — no runtime code, and no imports from
 * `antlr4`, `langium` or `src/generated-parser`.
 *
 * Read `docs/langium-migration/09-ir-contract.md` before changing anything
 * here. It is the prose companion to this file and carries the binding
 * conventions (offsets, identity, null-vs-absent, method placement, text
 * reconstruction, errors), the per-kind consumer table and the v2 evolution
 * path. Full renderer call sites per member live in
 * `docs/langium-migration/03-context-api-contract.md` §10.
 *
 * Enforcement: `src/parser-langium/compat.ts` binds its module surface with
 * `satisfies ParserModule`, so `tsc` (the CI typecheck gate) fails when the
 * facade drifts from {@link ParserModule} or from anything it reaches
 * transitively.
 */

/* ------------------------------------------------------------------------ */
/* Token views                                                              */
/* ------------------------------------------------------------------------ */

/** Lightweight view over a boundary token of a node (09 §3.1). */
export interface TokenView {
  /** 0-based char offset of the first character of the token. */
  readonly start: number;
  /** 0-based char offset of the last character of the token, INCLUSIVE. */
  readonly stop: number;
  /** 1-based line number. */
  readonly line: number;
  /** 0-based column of the token's first character. */
  readonly column: number;
  /** Token image (raw source text of this single token). */
  readonly text: string;
}

/** View over a terminal (token) child, e.g. `ParticipantContext.COLOR()`. */
export interface IrTerminal {
  /** The token image, e.g. `#ff0000`. */
  getText(): string;
}

/* ------------------------------------------------------------------------ */
/* Base node                                                                */
/* ------------------------------------------------------------------------ */

/** Predicate used by {@link IrNode.getAncestors}. */
export type IrNodePredicate = (node: IrNode) => boolean;

/**
 * The universal node surface — what every node carries. Kind-specific members
 * live on the per-kind interfaces below and must NOT be hoisted here
 * (09 §3.3: the renderer uses method presence as a type discriminator).
 */
export interface IrNode {
  /** First token of the node. */
  readonly start: TokenView;

  /**
   * Last token of the node; `stop.stop` is INCLUSIVE. `null` when the node
   * consumed zero parser-visible tokens (09 §3.1).
   */
  readonly stop: TokenView | null;

  /** Parent node; `null`/`undefined` at the root. */
  readonly parentCtx: IrNode | null | undefined;

  /** Raw ordered child list (rule nodes and terminals), `null` for empty rules. */
  readonly children: ReadonlyArray<IrNode | IrTerminal> | null;

  /** Token concatenation WITHOUT hidden content or inter-token spacing (09 §3.5). */
  getText(): string;

  /** Raw source slice WITH original spacing, run through `formatText` (09 §3.5). */
  getFormattedText(): string;

  /** The `//`-comment block immediately preceding this node, or `null` (09 §3.4). */
  getComment(): string | null;

  /** Matching ancestors, SELF-INCLUSIVE and root-last, walking `parentCtx` (09 §3.6). */
  getAncestors(predicate?: IrNodePredicate): IrNode[];

  /** `this` if it IS a {@link StatContext}, else the nearest StatContext ancestor. */
  ClosestAncestorStat(): StatContext | undefined;
}

/* ------------------------------------------------------------------------ */
/* Root / document structure                                                */
/* ------------------------------------------------------------------------ */

/** Root node returned by {@link RootContextFn}; identity changes per parse. */
export interface ProgContext extends IrNode {
  /** The `title …` declaration or `null`. */
  title(): TitleContext | null;

  /** The declarations section (participants/groups/starter) or `null`. */
  head(): HeadContext | null;

  /** Root statement block or `null`. */
  block(): BlockContext | null;

  /** The explicit `@Starter(X)` participant name (formatted), or `undefined` (09 §5). */
  Starter(): string | undefined;

  /** For the root: alias of {@link ProgContext.Starter}. */
  Origin(): string | undefined;
}

/** `title …` node. */
export interface TitleContext extends IrNode {
  /** Text after the `title` keyword, `.trim()`-ed; `""` when the payload is missing. */
  content(): string;
}

/** Declarations section (`head` rule): ordered participants, groups, starter. */
export interface HeadContext extends IrNode {
  /** Explicit participant declarations, in source order. Dual arity. */
  participant(): ParticipantContext[];
  participant(i: number): ParticipantContext | null;

  /** The `@Starter(X)` expression or `null`. */
  starterExp(): StarterExpContext | null;

  /**
   * Re-declared for its primary consumer: LifeLineLayer.tsx filters these by
   * `instanceof GroupContext / ParticipantContext`, so Group and Participant
   * nodes must interleave here in source order.
   */
  readonly children: ReadonlyArray<IrNode | IrTerminal> | null;
}

/** `@Starter(X)` expression node. */
export interface StarterExpContext extends IrNode {
  /** The starter participant reference, or `null` while half-typed. */
  starter(): StarterContext | null;
}

/** Starter participant reference; read via offsets + `getFormattedText()`. */
export type StarterContext = IrNode;

/** A generic name node (`name` rule): participant names, ref labels, endpoint names. */
export type NameContext = IrNode;

/** `as "label"` node under a participant. */
export interface LabelContext extends IrNode {
  name(): NameContext | null;
}

/** `<<stereotype>>` node under a participant. */
export interface StereotypeContext extends IrNode {
  name(): NameContext | null;
}

/** Emoji declaration under a participant. `name` is OPTIONAL here (09 §3.3). */
export interface EmojiContext extends IrNode {
  name?(): NameContext | null;
}

/** `@Actor` / `@Database` … node; read via `getFormattedText()` then `.replace("@","")`. */
export type ParticipantTypeContext = IrNode;

/**
 * One explicit participant declaration under {@link HeadContext}.
 * Also exported as a class for `instanceof` (see {@link ParserModule}).
 */
export interface ParticipantContext extends IrNode {
  /** `name()?.getFormattedText()` is the quote-stripped canonical name. */
  name(): NameContext | null;

  /** `@Actor` etc. */
  participantType(): ParticipantTypeContext | null;

  /** Color terminal (e.g. `#ff0000`) or `null`. */
  COLOR(): IrTerminal | null;

  label(): LabelContext | null;

  stereotype(): StereotypeContext | null;

  emoji(): EmojiContext | null;
}

/**
 * `group { … }` node under {@link HeadContext}.
 * Also exported as a class for `instanceof` (LifeLineLayer.tsx).
 */
export interface GroupContext extends IrNode {
  /** Group label (may be `null` for anonymous groups). */
  name(): NameContext | null;
}

/* ------------------------------------------------------------------------ */
/* Statements and blocks                                                    */
/* ------------------------------------------------------------------------ */

/** Statement list (`block` rule). */
export interface BlockContext extends IrNode {
  /** Statements in source order. Dual arity. */
  stat(): StatContext[];
  stat(i: number): StatContext | null;
}

/**
 * `{ … }` braced block (`braceBlock` rule).
 * NOTE: `getComment()` on THIS kind anchors on the CLOSING `}` (09 §3.4).
 */
export interface BraceBlockContext extends IrNode {
  /** Inner statement block, `null` for `{}`. */
  block(): BlockContext | null;
}

/**
 * Statement wrapper (`stat` rule). Exactly ONE of the thirteen discriminators
 * returns non-`null`; the other twelve return `null`, never `undefined`
 * (09 §3.3). Also exported as a class for `instanceof` (useArrow.ts).
 */
export interface StatContext extends IrNode {
  loop(): LoopContext | null;
  alt(): AltContext | null;
  par(): ParContext | null;
  opt(): OptContext | null;
  section(): SectionContext | null;
  critical(): CriticalContext | null;
  tcf(): TcfContext | null;
  ref(): RefContext | null;
  creation(): CreationContext | null;
  message(): MessageContext | null;
  asyncMessage(): AsyncMessageContext | null;
  divider(): DividerContext | null;
  ret(): RetContext | null;

  /** The inferred SENDER ("current lifeline") of this statement (09 §5). */
  Origin(): string | undefined;

  /**
   * Re-declared for its primary consumer: useArrow.ts reads `children?.[0]`
   * expecting the single concrete statement node under this wrapper.
   */
  readonly children: ReadonlyArray<IrNode | IrTerminal> | null;
}

/* ------------------------------------------------------------------------ */
/* Messages                                                                 */
/* ------------------------------------------------------------------------ */

/** Position tuple in absolute char offsets, `[start, end)` — exclusive end. */
export type IrPosition = [number, number];

/** Structured assignment info for `a = method()` / `a:A = new A()` (09 §4.1). */
export interface AssignmentView {
  readonly assignee: string;
  readonly type?: string;
  /** Backward-compat alias of {@link AssignmentView.assigneePosition}. */
  readonly labelPosition: IrPosition;
  readonly assigneePosition: IrPosition;
  /** `[-1, -1]` when the assignment has no type part. */
  readonly typePosition: IrPosition;
  /** `"assignee:type"` or `"assignee"`. */
  getText(): string;
}

/** Message endpoint node (`to` / `from` rules). `name` is OPTIONAL here (09 §3.3). */
export interface EndpointContext extends IrNode {
  name?(): NameContext | null;
}

/** Free-text payload node (`content` rule). Exported as a class for `instanceof`. */
export type ContentContext = IrNode;

/** One signature segment of a method chain (`signature` rule). */
export type SignatureContext = IrNode;

/** `func` rule — a method chain `a.b().c()`. */
export interface FuncContext extends IrNode {
  /** Chain segments. Dual arity. */
  signature(): SignatureContext[];
  signature(i: number): SignatureContext | null;
}

/** `messageBody` rule; only `func()` is consumed outside the parser layer. */
export interface MessageBodyContext extends IrNode {
  func(): FuncContext | null;
}

/**
 * Synchronous message statement (`A.method()` / `A->B.method() { … }`).
 * Also exported as a class for `instanceof` (useArrow.ts, useFragmentData.ts).
 */
export interface MessageContext extends IrNode {
  /** KIND TEST: probed with `typeof ctx.messageBody === "function"` (09 §3.3). */
  messageBody(): MessageBodyContext | null;

  /** Nested `{ … }` body or `null`. */
  braceBlock(): BraceBlockContext | null;

  /** The message RECEIVER: explicit `to` name else the ancestor owner (09 §5). */
  Owner(): string | undefined;

  /** The resolved SENDER: {@link MessageContext.ProvidedFrom} else the stat origin. */
  From(): string | undefined;

  /** ONLY the explicitly written source (`A->B.m()` → `"A"`), `undefined` otherwise. */
  ProvidedFrom(): string | undefined;

  /** Explicit receiver name (formatted) or `undefined`; used by `Owner()`. */
  To(): string | undefined;

  /** Method-chain label, segments joined with `"."`; `""` when absent (09 §5). */
  SignatureText(): string;

  /** KIND TEST: probed with `typeof ctx.Assignment === "function"` (09 §3.3). */
  Assignment(): AssignmentView | undefined;

  /** `braceBlock()?.block()?.stat() ?? []` — nested statements. */
  Statements(): StatContext[];

  /** Whether the editor `cursor` offset lies inside this message (09 §5). */
  isCurrent(cursor: number): boolean;

  /** Alias of {@link MessageContext.messageBody}. */
  Body(): MessageBodyContext | null;
}

/**
 * Async message statement (`A->B: hello`).
 * Also exported as a class shape for renderer `instanceof`.
 */
export interface AsyncMessageContext extends IrNode {
  /** Label payload. KIND TEST: StylePanel duck-types on `content?.()` (09 §3.3). */
  content(): ContentContext | null;

  to(): EndpointContext | null;

  from(): EndpointContext | null;

  /** Receiver: explicit `to()` name else ancestor owner. */
  Owner(): string | undefined;

  /** Sender: explicit `from` else stat origin. */
  From(): string | undefined;

  /** Explicitly written source only ("out-of-band" discrimination). */
  ProvidedFrom(): string | undefined;

  /** Explicit receiver name or `undefined`; consumed by `Owner()`. */
  To(): string | undefined;

  /** `content()` formatted text, `""` when absent; KEEPS the leading space (09 §5). */
  SignatureText(): string;
}

/**
 * Return-async message (`A->B: result` in return position). Same surface as
 * {@link AsyncMessageContext} — a distinct kind because the grammar and
 * `RetContext.returnAsyncMessage()` distinguish them.
 */
export interface ReturnAsyncMessageContext extends IrNode {
  content(): ContentContext | null;
  to(): EndpointContext | null;
  from(): EndpointContext | null;
  Owner(): string | undefined;
  From(): string | undefined;
  ProvidedFrom(): string | undefined;
  To(): string | undefined;
  SignatureText(): string;
}

/** `creationBody` rule; only `parameters()` is consumed outside the parser layer. */
export interface CreationBodyContext extends IrNode {
  parameters(): ParametersContext | null;
}

/**
 * Creation statement (`new A(…)`).
 * Also exported as a class for `instanceof` (useArrow.ts, useFragmentData.ts).
 */
export interface CreationContext extends IrNode {
  /** KIND TEST: the creation twin of `messageBody` (09 §3.3). */
  creationBody(): CreationBodyContext | null;

  braceBlock(): BraceBlockContext | null;

  /** The created participant's name — a composite `"assignee:Type"` (09 §5). */
  Owner(): string | undefined;

  /** Stat origin when the parent is a stat, else `undefined`. */
  From(): string | undefined;

  /** `«params»` when parameters exist, else `«create»` (09 §5). */
  SignatureText(): string;

  /** Formatted parameter list; named params as `name=value`, declarations as `Type id`. */
  ParametersText(): string;

  /** See {@link MessageContext.Assignment} (kind test applies here too). */
  Assignment(): AssignmentView | undefined;

  /** See {@link MessageContext.Statements}. */
  Statements(): StatContext[];

  /** See {@link MessageContext.isCurrent}. */
  isCurrent(cursor: number): boolean;

  /** Alias of {@link CreationContext.creationBody}. */
  Body(): CreationBodyContext | null;

  /** Formatted assignee text or `undefined`. */
  Assignee(): string | undefined;

  /** `[assignee.start.start, assignee.stop.stop + 1]` or `undefined`. */
  AssigneePosition(): IrPosition | undefined;

  /** Constructor (type) name, formatted, or `undefined`. */
  Constructor(): string | undefined;
}

/** Expression node (`expr` rule) — generic base for all expression alternatives. */
export type ExprContext = IrNode;

/**
 * Labeled alternative `#atomExpr` of `expr`. Exported as a class for
 * `instanceof` (Return.tsx).
 */
export interface AtomExprContext extends ExprContext {
  atom(): AtomContext | null;
}

/** Atom node (literals, names). Read via offsets and `getFormattedText()`. */
export type AtomContext = IrNode;

/** `return …` statement. */
export interface RetContext extends IrNode {
  /** The embedded async message for `return A->B: x` forms, or `null`. */
  asyncMessage(): AsyncMessageContext | null;

  /** Return-async twin of the above. */
  returnAsyncMessage(): ReturnAsyncMessageContext | null;

  /**
   * Plain return expression or `null`. May be an {@link AtomExprContext} or
   * another expr kind; {@link ContentContext} is discriminated via `instanceof`.
   */
  expr(): ExprContext | null;

  /** Label text; `undefined` when empty — NOTE `SignatureText()` returns `""` (09 §5). */
  Signature(): string | undefined;

  /** Same as {@link RetContext.Signature} but `""` when empty. */
  SignatureText(): string;

  /** The receiver of the `return` — the hairiest upward walk (09 §5, 04 §3.5). */
  ReturnTo(): string | undefined;

  /** Sender: embedded message's `From()` else stat origin. */
  From(): string | undefined;

  /** Alias of `ReturnTo()`; consumed by `Owner()` internally. */
  To(): string | undefined;

  /** Receiver: `To()` else ancestor owner. */
  Owner(): string | undefined;
}

/* ------------------------------------------------------------------------ */
/* Fragments                                                                */
/* ------------------------------------------------------------------------ */

/** `(condition)` wrapper (`parExpr` rule). */
export interface ParExprContext extends IrNode {
  condition(): ConditionContext | null;
}

/** Fragment condition node. Read via `getFormattedText()` and offsets. */
export type ConditionContext = IrNode;

/** `if` branch of an `alt` fragment. */
export interface IfBlockContext extends IrNode {
  parExpr(): ParExprContext | null;
  braceBlock(): BraceBlockContext | null;
  /** See {@link MessageContext.Statements} — defined on IfBlock/Loop too. */
  Statements(): StatContext[];
}

/** `else if` branch of an `alt` fragment. */
export interface ElseIfBlockContext extends IrNode {
  parExpr(): ParExprContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `else` branch of an `alt` fragment. */
export interface ElseBlockContext extends IrNode {
  braceBlock(): BraceBlockContext | null;
}

/** `alt` (if/else if/else) fragment. */
export interface AltContext extends IrNode {
  ifBlock(): IfBlockContext | null;

  /** Dual arity; array element identity is stable (09 §3.2). */
  elseIfBlock(): ElseIfBlockContext[];
  elseIfBlock(i: number): ElseIfBlockContext | null;

  elseBlock(): ElseBlockContext | null;
}

/** `opt` fragment. */
export interface OptContext extends IrNode {
  parExpr(): ParExprContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `par` fragment. */
export interface ParContext extends IrNode {
  parExpr(): ParExprContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `critical` fragment. */
export interface CriticalContext extends IrNode {
  parExpr(): ParExprContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `loop` / `while` / `for` / `forEach` fragment. */
export interface LoopContext extends IrNode {
  parExpr(): ParExprContext | null;
  braceBlock(): BraceBlockContext | null;
  /** See {@link IfBlockContext.Statements}. */
  Statements(): StatContext[];
}

/** `section` / `frame` fragment. */
export interface SectionContext extends IrNode {
  /** Section label: `atom()?.getFormattedText()`. */
  atom(): AtomContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `try` block of a `tcf` fragment. */
export interface TryBlockContext extends IrNode {
  braceBlock(): BraceBlockContext | null;
}

/** `catch(…)` invocation node. */
export interface InvocationContext extends IrNode {
  /** Exception parameter list; labelled via the `getFormattedText()` override. */
  parameters(): ParametersContext | null;
}

/** `catch` block of a `tcf` fragment. */
export interface CatchBlockContext extends IrNode {
  invocation(): InvocationContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `finally` block of a `tcf` fragment. */
export interface FinallyBlockContext extends IrNode {
  braceBlock(): BraceBlockContext | null;
}

/** `try`/`catch`/`finally` fragment. */
export interface TcfContext extends IrNode {
  tryBlock(): TryBlockContext | null;

  /** Dual arity. */
  catchBlock(): CatchBlockContext[];
  catchBlock(i: number): CatchBlockContext | null;

  finallyBlock(): FinallyBlockContext | null;
}

/** `ref(label, A, B)` fragment. */
export interface RefContext extends IrNode {
  /** All names: `[0]` is the ref label, the rest are spanned participants. Dual arity. */
  name(): NameContext[];
  name(i: number): NameContext | null;

  /** `name()[0]` — the ref label. */
  Content(): NameContext | undefined;

  /** `name().slice(1)` — spanned participants. */
  Participants(): NameContext[];
}

/* ------------------------------------------------------------------------ */
/* Divider                                                                  */
/* ------------------------------------------------------------------------ */

/** `== text ==` divider statement. */
export interface DividerContext extends IrNode {
  /**
   * The divider display text. THROWS `Error("Divider note must start with ==")`
   * when the parsed note does not start with `==`, and `Divider.tsx` does not
   * catch — kept for parity through the migration (09 §5).
   */
  Note(): string;
}

/* ------------------------------------------------------------------------ */
/* Parameters                                                               */
/* ------------------------------------------------------------------------ */

/** A single parameter (named parameter, declaration, or expression). */
export type ParameterContext = IrNode;

/** Parameter list node. */
export interface ParametersContext extends IrNode {
  /** Dual arity. */
  parameter(): ParameterContext[];
  parameter(i: number): ParameterContext | null;

  /**
   * Parameter-aware OVERRIDE of {@link IrNode.getFormattedText}: the signature
   * is unchanged, the BEHAVIOR differs (09 §3.5).
   */
  getFormattedText(): string;
}

/* ------------------------------------------------------------------------ */
/* Participants collection (tree-derived service output)                    */
/* ------------------------------------------------------------------------ */

/** Plain-object snapshot of one participant (09 §4.1). */
export interface ParticipantView {
  readonly name: string;
  readonly label?: string;
  readonly type?: string;
  readonly stereotype?: string;
  readonly color?: string;
  readonly emoji?: string;
  readonly comment?: string;
  readonly explicit?: boolean;
  readonly isStarter?: boolean;
  readonly groupId?: string | number;
  readonly assignee?: string;
  /** Absolute char-offset tuples `[start, stop + 1]`. */
  readonly positions: ReadonlySet<IrPosition>;
  readonly assigneePositions: ReadonlySet<IrPosition>;
}

/** The collection returned by {@link ParserModule.Participants} (09 §4.1). */
export interface ParticipantsCollection {
  /** All participant names in source order. */
  Names(): string[];
  /** Participants deduced from messages only (not explicitly declared). */
  ImplicitArray(): ParticipantView[];
  /** First participant or `undefined` when empty. */
  First(): ParticipantView | undefined;
  /** Lookup by canonical name. */
  Get(name: string): ParticipantView | undefined;
  /** Number of participants. */
  Size(): number;
  /** Declaration/mention offset ranges, or `undefined` when the name is unknown. */
  GetPositions(name: string): ReadonlySet<IrPosition> | undefined;
  /** Assignee offset ranges (see {@link ParticipantsCollection.GetPositions}). */
  GetAssigneePositions(name: string): ReadonlySet<IrPosition> | undefined;
}

/* ------------------------------------------------------------------------ */
/* Entry points (module-level contract of `@/parser`)                       */
/* ------------------------------------------------------------------------ */

/** One syntax-error record, shape-compatible with the ANTLR `SeqErrorListener` payload. */
export interface ErrorDetail {
  /** 1-based line. */
  readonly line: number;
  /** 0-based column. */
  readonly column: number;
  readonly msg: string;
}

/**
 * `RootContext(code)`: parses `code` and returns the root node. A (partial)
 * tree is effectively ALWAYS returned for non-empty input; the `| null` is
 * defensive (09 §3.7).
 */
export type RootContextFn = (code: string) => ProgContext | null;

/** Constructor-shaped value exported for renderer `instanceof` checks (09 §4). */
export type ContextClass<T extends IrNode> = abstract new (
  ...args: never[]
) => T;

/**
 * The module-level contract of `@/parser` (named exports + default export
 * object). The Stage-3 facade entry module must satisfy this shape.
 */
export interface ParserModule {
  /** See {@link RootContextFn}. */
  RootContext: RootContextFn;

  /**
   * LIVE mutable array (module singleton) accumulating one entry per syntax
   * error across ALL parses; `src/core.tsx` clears it with `.length = 0`
   * (09 §3.7).
   */
  ErrorDetails: ErrorDetail[];

  /** Walks the subtree and returns the participants collection (09 §4.1). */
  Participants(ctx: IrNode | null | undefined): ParticipantsCollection;

  /** Class export for `instanceof`. */
  ProgContext: ContextClass<ProgContext>;
  /** Class export for `instanceof`. */
  GroupContext: ContextClass<GroupContext>;
  /** Class export for `instanceof`. */
  ParticipantContext: ContextClass<ParticipantContext>;
}
