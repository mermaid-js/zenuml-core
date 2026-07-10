/**
 * # v1 IR Contract — the renderer-facing parse-tree boundary
 *
 * This file is the **declared, binding shape** of the parse-tree API that the
 * renderer (`src/components`, `src/positioning`, `src/svg`, `src/store`,
 * `src/utils`) consumes today. It contains TypeScript types ONLY — no runtime
 * code, and no imports from `antlr4`, `langium`, or `src/generated-parser`.
 *
 * Enforcement: `src/parser-langium/compat.ts` binds its module surface to
 * {@link ParserModule} with `satisfies`, so `tsc` (the CI typecheck gate) fails
 * if the Langium facade drifts from this contract — including the ProgContext /
 * GroupContext / ParticipantContext facade classes and the ParticipantsCollection
 * shape, which ParserModule types as members and so are checked transitively.
 * The renderer stays untouched through the migration
 * (docs/langium-migration/07-risk-map.md Part 3). The contract is derived from:
 *
 * - docs/langium-migration/03-context-api-contract.md (per-method consumer table)
 * - docs/langium-migration/04-parser-layer.md (semantic method implementations)
 * - docs/langium-migration/07-risk-map.md (R1–R12 runtime rows, §3.4 facade rules)
 * - docs/langium-migration/09-ir-contract.md (the prose companion to this file)
 *
 * ## Binding conventions (apply to every member below)
 *
 * 1. **Offsets are the universal currency** (07 §R1). `start.start` /
 *    `stop.stop` are 0-based character offsets into the exact source string
 *    that was parsed (`codeAtom`). `stop.stop` points at the LAST character of
 *    the node, INCLUSIVE — consumers compute exclusive slice ends as
 *    `stop.stop + 1`. One off-by-one breaks selection, inline editing,
 *    drag-reorder keys and every DSL transform.
 * 2. **Lines are 1-based, columns are 0-based** (ANTLR convention, kept by
 *    `CodeRange.from` and `onElementClick` consumers).
 * 3. **Absent children are `null`, never `undefined`** (07 §R7).
 *    `src/utils/Context.ts:16` discriminates with strict `!== null`.
 * 4. **Dual accessor arity** (07 §R7): repeated-rule accessors return the full
 *    array when called with no argument, and a single child (or `null`) when
 *    called with an index — e.g. `block.stat()` vs `block.stat(0)`.
 * 5. **Identity is stable within one parse** (07 §R8): the same accessor on the
 *    same node returns the SAME object every call (`block() === block()`).
 *    Returned arrays may be fresh, but their elements are identical objects.
 *    Renderer relies on this for `===` checks
 *    (`positioning/vertical/VerticalCoordinates.ts`,
 *    `positioning/vertical/vm/StatementVM.ts`) and React hook deps
 *    (`useFragmentData.ts`, `Occurrence.tsx`, `FragmentAlt.tsx`).
 *    Implementations must memoize wrappers per underlying AST node.
 * 6. **Method presence is a type discriminator** (03 §8.2). The renderer probes
 *    `typeof ctx.messageBody === "function"`,
 *    `typeof ctx.Assignment !== "function"`, `typeof ctx.alt !== "function"`,
 *    `typeof titleContext.content !== "function"`. Members like `messageBody`,
 *    `creationBody`, `Assignment`, `alt`, `content` therefore appear ONLY on
 *    the kind interfaces that have them today — never on `IrNode`. Do not
 *    "helpfully" hoist them to a common base; that silently breaks dispatch.
 * 7. **`@v2` tags** mark ANTLR-inherited awkwardness kept deliberately in v1.
 *    They are NOT current deprecations — they are the documented evolution path
 *    for post-cutover, file-by-file call-site migration (see 09 §6).
 */

/* ------------------------------------------------------------------------ */
/* Token views                                                              */
/* ------------------------------------------------------------------------ */

/**
 * Lightweight view over a boundary token of a node (07 §3.4 rule 3).
 *
 * Conventions:
 * - `start`: 0-based char offset of the token's first character.
 * - `stop`:  0-based char offset of the token's last character, INCLUSIVE.
 *   For a `TokenView` obtained from `node.stop`, consumers use
 *   `stop.stop + 1` as the exclusive end of the whole node.
 * - `line`: 1-based.
 * - `column`: 0-based; the column of the token's FIRST character
 *   (so `CodeRange.from` computes the end column as
 *   `stop.column + stop.text.length`).
 * - `text`: the token image (consumed by `src/parser/CodeRange.ts` only).
 *
 * @v2 Replace the inclusive-stop token pair with a single exclusive range
 * `{ offset: number; end: number; range: {startLine, startCol, endLine, endCol} }`
 * on the node itself, eliminating the `+ 1` ritual at ~18 call sites.
 */
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

/**
 * View over a terminal (token) child returned by terminal accessors such as
 * `ParticipantContext.COLOR()`.
 * Consumer: src/utils/participantStyleTransform.ts:43 (`COLOR?.()?.getText()`).
 */
export interface IrTerminal {
  /** The token image, e.g. `#ff0000`. */
  getText(): string;
}

/* ------------------------------------------------------------------------ */
/* Base node                                                                */
/* ------------------------------------------------------------------------ */

/**
 * Predicate used by {@link IrNode.getAncestors}.
 */
export type IrNodePredicate = (node: IrNode) => boolean;

/**
 * The universal node surface — ONLY what is installed today on
 * `antlr4.ParserRuleContext.prototype` (every context) plus the built-in tree
 * fields the renderer reads (03 §2–3). Anything kind-specific lives on the
 * per-kind interfaces below (convention 6 in the file header).
 */
export interface IrNode {
  /**
   * First token of the node.
   * Consumers (representative, 03 §10): Message.tsx:43, Return.tsx:38-40,
   * Interaction.tsx:31, Interaction-async.tsx:104,116, Creation.tsx:36,
   * SelfInvocation.tsx:24, ConditionLabel.tsx:26, FragmentRef.tsx:21,
   * DiagramTitle/index.tsx:24, StylePanel.tsx:210,256-266,
   * positioning/vertical/StatementIdentifier.ts:2-5,
   * utils/participantStyleTransform.ts:60, utils/participantInsertTransform.ts:102-115,
   * utils/insertMessageInDsl.ts:42, utils/insertDividerInDsl.ts:39-42,
   * src/parser/CodeRange.ts.
   */
  readonly start: TokenView;

  /**
   * Last token of the node. `stop.stop` is INCLUSIVE — every label-edit /
   * DSL-transform site computes `stop.stop + 1` for the exclusive slice end.
   * Consumers: same set as {@link IrNode.start}.
   *
   * `null` when the node consumed zero parser-visible tokens (ANTLR gives such
   * a rule `stop === null`; the Langium facade mirrors this — facade/nodes.ts
   * `get stop()`). The DSL-transform consumers above only read `stop` on
   * non-empty nodes, so they never observe the `null`.
   */
  readonly stop: TokenView | null;

  /**
   * Parent node; `null`/`undefined` at the root. Upward walks traverse the
   * exact ANTLR wrapper chain (stat → block → braceBlock → message/creation) —
   * the facade synthesizes wrapper levels so this chain's depth is preserved
   * (07 §G8; `getAncestors()` returns exactly 7 nodes for the pinned input).
   * Consumers: positioning/vertical/vm/ReturnStatementVM.ts:42-54,
   * positioning/vertical/vm/StatementVM.ts:70-76; plus all parser-layer
   * semantic walks (Owner/Origin/ReturnTo/From) invoked by the renderer.
   *
   * @v2 `parent: IrNode | null` with a guaranteed-`null` root (drop the
   * `undefined` looseness) once the `typeof`-free call sites migrate.
   */
  readonly parentCtx: IrNode | null | undefined;

  /**
   * Raw ordered child list (rule nodes and terminal tokens interleaved), or
   * `null` for empty rules. Only two renderer reads exist:
   * - LifeLineLayer.tsx:43-51 — filters `head()` children by
   *   `instanceof GroupContext / ParticipantContext`, PRESERVING source order
   *   across the two kinds;
   * - useArrow.ts:38 — `statContext?.children?.[0]`, the single concrete
   *   statement under a stat wrapper.
   *
   * @v2 Replace with typed per-need views: `HeadContext.members:
   * readonly (GroupContext | ParticipantContext)[]` and
   * `StatContext.statement: ConcreteStatement` — then drop `children` from the
   * contract entirely (07 §R5).
   */
  readonly children: ReadonlyArray<IrNode | IrTerminal> | null;

  /**
   * Source text of the node WITHOUT hidden-channel content — tokens
   * concatenated with no whitespace between them (e.g. `hasmoreitems`,
   * `user.role=="admin"`). Distinct from {@link IrNode.getFormattedText};
   * see 07 §R6.
   * Renderer consumer: utils/participantStyleTransform.ts (terminal text);
   * parser-side consumers invoked by renderer flows: TitleContext content,
   * SignatureText (`ID().getText()`).
   */
  getText(): string;

  /**
   * Raw source slice of the node INCLUDING original inter-token spacing
   * (`[start.start, stop.stop + 1)` of the document), passed through
   * `formatText` (src/utils/StringUtil.ts): newlines → space, whitespace
   * collapsed, spaces stripped around `,;.()`, trailing whitespace stripped,
   * ONE pair of surrounding double quotes stripped (`"Order Service"` →
   * `Order Service` — load-bearing for participant-name equality).
   *
   * The single most-called method in the codebase (03 §3).
   * Consumers: Interaction-async.tsx:96,100, SelfInvocationAsync.tsx:53,
   * FragmentSection.tsx:30, FragmentRef.tsx:19, ConditionLabel.tsx:23,
   * FragmentTryCatchFinally.tsx:31, LifeLineGroup.tsx:137,
   * ParticipantStylePanel.tsx:137, utils/participantStyleTransform.ts:28-52,
   * positioning/vertical/vm/AsyncMessageStatementVM.ts:28,
   * positioning/vertical/vm/ReturnStatementVM.ts:24; pervasive inside parser
   * semantics (Owner/From/SignatureText/Starter/Note).
   *
   * NOTE: {@link ParametersContext} OVERRIDES this method with
   * parameter-aware formatting — per-kind override is part of the contract
   * (03 §11.9).
   *
   * @v2 Rename to `formattedText` (property) and split the quote-stripping
   * into an explicit `displayName()` concern; "getFormattedText" describes
   * the mechanism, not the meaning.
   */
  getFormattedText(): string;

  /**
   * The `//`-comment block immediately preceding this node, or `null` when
   * none. Exact algorithm (src/parser/index.js:51-66, must be reproduced
   * byte-for-byte — see 09 §3.4):
   * - collect the contiguous run of comment tokens (hidden COMMENT_CHANNEL)
   *   immediately left of the node's FIRST token;
   * - special case: for {@link BraceBlockContext} use the node's LAST token
   *   instead (comment before the closing `}`);
   * - strip exactly the leading `//` of each token — LEADING SPACES AFTER
   *   `//` ARE PRESERVED (they carry indentation semantics);
   * - join with `"\n"`.
   * Comment text drives styling directives (`// [bold,#red] note`) and
   * vertical layout height — wrong attachment visibly breaks diagrams.
   *
   * Defined on EVERY node: positioning/vertical/vm/StatementVM.ts:17
   * duck-checks `!context?.getComment` (absent method ⇒ comment height 0).
   * Consumers: Statement.tsx:23, StatementVM.ts:17-18.
   */
  getComment(): string | null;

  /**
   * `[this (if matching), ...ancestors matching predicate]` — SELF-INCLUSIVE,
   * root-last, walking {@link IrNode.parentCtx}. Self-inclusion is
   * load-bearing for occurrence-bar layer counts.
   * Consumers: useArrow.ts:18-31, useFragmentData.ts:18-29.
   * Pinned: returns exactly 7 nodes for the AncestorPath.spec.ts input —
   * this freezes the synthesized wrapper-chain depth (07 §G8).
   */
  getAncestors(predicate?: IrNodePredicate): IrNode[];

  /**
   * `this` if it IS a {@link StatContext}, else the nearest StatContext
   * ancestor, else `undefined`. No direct renderer callers, but it is the
   * building block of every `From()`/`Origin()` chain the renderer triggers
   * on each message (03 §3).
   */
  ClosestAncestorStat(): StatContext | undefined;
}

/* ------------------------------------------------------------------------ */
/* Root / document structure                                                */
/* ------------------------------------------------------------------------ */

/**
 * Root node returned by {@link RootContextFn}. Held by
 * `src/store/Store.ts` `rootContextAtom`; identity changes per parse (all
 * downstream `useEffect` resets rely on that).
 */
export interface ProgContext extends IrNode {
  /**
   * The `title …` declaration or `null`.
   * Consumers: Store.ts:55 (`titleAtom`), DiagramFrame.tsx:57,
   * utils/participantInsertTransform.ts:99 (also reads `title.stop.stop`).
   */
  title(): TitleContext | null;

  /**
   * The declarations section (participants/groups/starter) or `null`.
   * Consumers: SeqDiagram.tsx:107,116,140 (passed to LifeLineLayer),
   * utils/participantStyleTransform.ts:26,
   * utils/participantInsertTransform.ts:97, ParticipantStylePanel.tsx:136.
   */
  head(): HeadContext | null;

  /**
   * Root statement block or `null`. `VerticalCoordinates.ts:16` falls back to
   * the root node itself when absent and later compares identity
   * (`StatementVM.isRootLevelStatement`) — identity stability is mandatory.
   * Consumers: SeqDiagram.tsx:111,145, positioning/vertical/VerticalCoordinates.ts:16,
   * utils/participantInsertTransform.ts:98.
   */
  block(): BlockContext | null;

  /**
   * The explicit `@Starter(X)` participant name (formatted, quote-stripped) or
   * `undefined`. The parser NEVER invents a default starter — synthesizing
   * `_STARTER_` is a renderer/OrderedParticipants concern
   * (design doctrine in src/parser/ProgContext.js).
   * Consumers: indirect via `Origin()` / `ReturnTo()` on every message.
   */
  Starter(): string | undefined;

  /**
   * For the root: alias of {@link ProgContext.Starter}.
   * See {@link StatContext.Origin} for the statement-level semantics.
   */
  Origin(): string | undefined;
}

/**
 * `title …` node.
 */
export interface TitleContext extends IrNode {
  /**
   * Text after the `title` keyword, `.trim()`-ed; `""` when the payload is
   * missing. NOTE: `Store.ts:56` duck-checks
   * `typeof titleContext.content === "function"` — `content` must exist on
   * this kind and ONLY where it exists today (convention 6).
   * Consumers: Store.ts:59 (`titleAtom`), DiagramTitle/index.tsx:13.
   *
   * @v2 A plain `title: string` property on the root; the method form only
   * exists because ANTLR exposed `children[1].getText()`.
   */
  content(): string;
}

/**
 * Declarations section (`head` rule): ordered participants, groups, starter.
 */
export interface HeadContext extends IrNode {
  /**
   * Explicit participant declarations, in source order.
   * Dual arity: no argument → array; index → single or `null`.
   * Consumers: utils/participantStyleTransform.ts:26,
   * ParticipantStylePanel.tsx:136 (`rootContext?.head?.()?.participant?.()`).
   *
   * @v2 `participants: readonly ParticipantContext[]`.
   */
  participant(): ParticipantContext[];
  participant(i: number): ParticipantContext | null;

  /**
   * The `@Starter(X)` expression or `null`.
   * Consumers: utils/participantInsertTransform.ts:104 (insert offsets),
   * ProgContext.Starter() internally.
   */
  starterExp(): StarterExpContext | null;

  /**
   * IMPORTANT: LifeLineLayer.tsx:43-51 reads RAW {@link IrNode.children} on
   * this kind and filters by `instanceof GroupContext / ParticipantContext`,
   * preserving source order across the two kinds. The facade's head children
   * must therefore interleave Group and Participant nodes in source order.
   * (Inherited member — re-documented here because this is its primary
   * renderer consumer.)
   */
  readonly children: ReadonlyArray<IrNode | IrTerminal> | null;
}

/** `@Starter(X)` expression node. */
export interface StarterExpContext extends IrNode {
  /**
   * The starter participant reference, or `null` while half-typed.
   * Consumers: utils/participantInsertTransform.ts:104
   * (`starter.start.start` / `stop.stop` insert offsets); ProgContext.Starter.
   */
  starter(): StarterContext | null;
}

/** Starter participant reference; read via offsets + `getFormattedText()`. */
export type StarterContext = IrNode;

/**
 * A generic name node (`name` rule): participant names, ref labels, endpoint
 * names. Read via `getFormattedText()` (quote-stripped) and offsets.
 */
export type NameContext = IrNode;

/** `as "label"` node under a participant. */
export interface LabelContext extends IrNode {
  /** Consumer: utils/participantStyleTransform.ts:44 (`label()?.name()?.getFormattedText()`). */
  name(): NameContext | null;
}

/** `<<stereotype>>` node under a participant. */
export interface StereotypeContext extends IrNode {
  /** Consumer: utils/participantStyleTransform.ts:45. */
  name(): NameContext | null;
}

/**
 * Emoji declaration under a participant. NOTE: the renderer probes
 * `ctx.emoji?.()?.name?.()` — `name` is an OPTIONAL method on this kind
 * (grammar-alternative dependent); absent must mean `undefined` property,
 * not a throwing method (03 §8.1).
 */
export interface EmojiContext extends IrNode {
  /** Consumer: utils/participantStyleTransform.ts:46. */
  name?(): NameContext | null;
}

/** `@Actor` / `@Database` … node; read via `getFormattedText()` then `.replace("@","")`. */
export type ParticipantTypeContext = IrNode;

/**
 * One explicit participant declaration under {@link HeadContext}.
 * Also exported as a class for `instanceof` (see {@link ParserModule}).
 */
export interface ParticipantContext extends IrNode {
  /**
   * Participant name node (`name()?.getFormattedText()` is the
   * quote-stripped canonical name).
   * Consumers: ParticipantStylePanel.tsx:137, utils/participantStyleTransform.ts:28,52.
   */
  name(): NameContext | null;

  /** `@Actor` etc. Consumer: utils/participantStyleTransform.ts:42. */
  participantType(): ParticipantTypeContext | null;

  /**
   * Color terminal (e.g. `#ff0000`) or `null`.
   * Consumer: utils/participantStyleTransform.ts:43 (`COLOR?.()?.getText()`).
   */
  COLOR(): IrTerminal | null;

  /** Consumer: utils/participantStyleTransform.ts:44. */
  label(): LabelContext | null;

  /** Consumer: utils/participantStyleTransform.ts:45. */
  stereotype(): StereotypeContext | null;

  /** Consumer: utils/participantStyleTransform.ts:46 (`emoji?.()?.name?.()`). */
  emoji(): EmojiContext | null;
}

/**
 * `group { … }` node under {@link HeadContext}.
 * Also exported as a class for `instanceof` (LifeLineLayer.tsx:44-51).
 */
export interface GroupContext extends IrNode {
  /** Group label (may be `null` for anonymous groups). Consumer: LifeLineGroup.tsx:137. */
  name(): NameContext | null;
}

/* ------------------------------------------------------------------------ */
/* Statements and blocks                                                    */
/* ------------------------------------------------------------------------ */

/**
 * Statement list (`block` rule).
 */
export interface BlockContext extends IrNode {
  /**
   * Statements in source order. Dual arity. Element identity is stable
   * (`statements[0] === statCtx` in StatementVM.isFirstStatement).
   * Consumers: Block.tsx:32, positioning/vertical/vm/BlockVM.ts:11,
   * vm/StatementVM.ts:76, vm/ReturnStatementVM.ts:43, Occurrence.tsx:58,
   * utils/Numbering.ts:4-6, utils/insertDividerInDsl.ts:21,
   * utils/insertMessageInDsl.ts:39.
   *
   * @v2 `statements: readonly StatContext[]` — the dual arity exists only
   * because ANTLR generated it; no renderer site needs the indexed form that
   * the array form can't serve.
   */
  stat(): StatContext[];
  stat(i: number): StatContext | null;
}

/**
 * `{ … }` braced block (`braceBlock` rule).
 *
 * SPECIAL CASE: {@link IrNode.getComment} on THIS kind reads the comment
 * before the CLOSING `}` (the node's last token), not before its first token.
 */
export interface BraceBlockContext extends IrNode {
  /**
   * Inner statement block, `null` for `{}`.
   * Consumers: Occurrence.tsx:55,183,186, vm/StatementVM.ts:54,
   * vm/SyncMessageStatementVM.ts:23, vm/CreationStatementVM.ts:32,
   * Fragment*.tsx / Fragment*VM.ts branch bodies, utils/insertMessageInDsl.ts:38.
   */
  block(): BlockContext | null;
}

/**
 * Statement wrapper (`stat` rule) — exactly ONE of the thirteen discriminator
 * accessors below returns non-`null`; the other twelve return `null`
 * (NEVER `undefined`: `utils/Context.ts:16` uses strict `!== null`).
 *
 * This is the statement discriminator API: Statement.tsx:28,38-62 dispatches
 * on `Boolean(props.context.loop())` etc.; utils/Context.ts probes all
 * thirteen; Occurrence.tsx:60 uses BRACKET access (`stats[0]["ret"]()`), so
 * the methods must be own/inherited properties reachable by string key;
 * vm/createStatementVM.ts:22-80, vm/StatementVM.ts:81-89,
 * vm/ReturnStatementVM.ts:12, vm/FragmentRefVM.ts:8, utils/Numbering.ts:4.
 *
 * Also exported as a class for `instanceof` (useArrow.ts:34).
 *
 * @v2 A discriminated union `statement: Loop | Alt | …` with a `kind` tag —
 * thirteen nullable probes is an ANTLR artifact; `getContextType` would
 * become `statement.kind`.
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

  /**
   * The inferred SENDER ("current lifeline") of this statement: nearest
   * Message/Creation ancestor's `Owner()`, else the root's `Starter()`, else
   * `undefined`. Defined ONLY on Stat and Prog — the generic
   * `ParserRuleContext.Origin` of the ANTLR layer is a latent infinite loop
   * and is NOT part of this contract (03 §3, 07 do-not-port list).
   * Consumers: positioning/LocalParticipants.ts:15 (→ useFragmentData,
   * FrameBuilder, TotalWidth, StatementVM.findLeftParticipant),
   * vm/AsyncMessageStatementVM.ts:24 (defensive).
   */
  Origin(): string | undefined;

  /**
   * IMPORTANT: useArrow.ts:38 reads `statContext?.children?.[0]` expecting the
   * single concrete statement node under this wrapper. (Inherited member —
   * re-documented for its primary consumer.)
   */
  readonly children: ReadonlyArray<IrNode | IrTerminal> | null;
}

/* ------------------------------------------------------------------------ */
/* Messages                                                                 */
/* ------------------------------------------------------------------------ */

/** Position tuple in absolute char offsets. By convention `[start, end)` (exclusive end). */
export type IrPosition = [number, number];

/**
 * Structured assignment info for `a = method()` / `a:A = new A()` —
 * the return type of `Assignment()` (a plain data class, ported as-is;
 * src/parser/Messages/Assignment.ts).
 * Consumers: SelfInvocation.tsx:20 (`.getText()`), Occurrence.tsx:81-92
 * (positions → editable return label), vm/SyncMessageStatementVM.ts:25,
 * vm/CreationStatementVM.ts:43.
 */
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

/**
 * Message endpoint node (`to` / `from` rules). NOTE the renderer probes
 * `toCtx?.name?.()` — `name` may be ABSENT depending on the grammar
 * alternative, so it is optional here; fallback is `getFormattedText()` on
 * the endpoint itself (Interaction-async.tsx:99-100).
 */
export interface EndpointContext extends IrNode {
  name?(): NameContext | null;
}

/** Free-text payload node (`content` rule). Exported as a class for `instanceof` (Return.tsx:36). */
export type ContentContext = IrNode;

/**
 * One signature segment of a method chain (`signature` rule). Read via
 * offsets (`signature()[0].start/.stop` selection range, Interaction.tsx:30)
 * and `getFormattedText()`.
 */
export type SignatureContext = IrNode;

/** `func` rule — a method chain `a.b().c()`. */
export interface FuncContext extends IrNode {
  /**
   * Chain segments. Dual arity.
   * Consumers: Interaction.tsx:30 (`signature()[0]` start/stop),
   * SelfInvocation.tsx:22-24, StylePanel.tsx:241.
   *
   * @v2 `signatures: readonly SignatureContext[]`.
   */
  signature(): SignatureContext[];
  signature(i: number): SignatureContext | null;
}

/**
 * `messageBody` rule. Its PRESENCE (as a method on the message node) is a
 * kind test — see {@link MessageContext.messageBody}.
 * Only `func()` is consumed outside the parser layer; `assignment()` /
 * `fromTo()` are facade-internal navigation and deliberately NOT part of
 * this contract (09 §7).
 */
export interface MessageBodyContext extends IrNode {
  /** Consumers: Interaction.tsx:30, SelfInvocation.tsx:22, StylePanel.tsx:241. */
  func(): FuncContext | null;
}

/**
 * Synchronous message statement (`A.method()` / `A->B.method() { … }`).
 * Also exported as a class for `instanceof` (useArrow.ts:11,20, useFragmentData.ts:20).
 */
export interface MessageContext extends IrNode {
  /**
   * KIND TEST: `typeof ctx.messageBody === "function"`
   * (vm/ReturnStatementVM.ts:51 — "is inside an occurrence") and StylePanel.tsx:241
   * duck-type on this member's existence. It must exist on MessageContext and
   * CreationContext-equivalent (`creationBody`) ONLY.
   * Consumers: Interaction.tsx:30, SelfInvocation.tsx:22, StylePanel.tsx:241.
   */
  messageBody(): MessageBodyContext | null;

  /**
   * Nested `{ … }` body or `null`.
   * Consumers: Occurrence.tsx:55,183,186, vm/StatementVM.ts:54,
   * vm/SyncMessageStatementVM.ts:23, utils/insertMessageInDsl.ts:38.
   */
  braceBlock(): BraceBlockContext | null;

  /**
   * The message RECEIVER: explicit `to` name (formatted/quote-stripped), else
   * the nearest ancestor Message/Creation's `Owner()` via the wrapper-chain
   * walk (04 §3.2). Core layout semantic.
   * Consumers: useArrow.ts:12,26, useFragmentData.ts:25, Interaction.tsx:28,
   * vm/SyncMessageStatementVM.ts:22; MessageCollector (AllMessages).
   */
  Owner(): string | undefined;

  /**
   * The resolved SENDER: {@link MessageContext.ProvidedFrom} else
   * `ClosestAncestorStat().Origin()` (04 §3.3).
   * Consumers: useArrow.ts:13, Interaction.tsx:27, vm/SyncMessageStatementVM.ts:21.
   */
  From(): string | undefined;

  /**
   * ONLY the explicitly written source (`A->B.m()` → `"A"`), `undefined`
   * otherwise. Distinguishes "out-of-band" messages.
   * Consumers: indirect for sync messages (Interaction-async.tsx pattern is
   * the async twin); part of the shared message surface (03 §4).
   */
  ProvidedFrom(): string | undefined;

  /**
   * Explicit receiver name (formatted) or `undefined`; used by `Owner()`.
   * No direct renderer callers (03 §4) — kept because MessageCollector and
   * the Owner walk consume it on the facade.
   */
  To(): string | undefined;

  /**
   * Method-chain label: `messageBody().func().signature()` segments mapped
   * through `getFormattedText()` joined with `"."`; `""` when absent.
   * Width math depends on EXACT string equality between MessageCollector
   * output and component labels.
   * Consumers: Interaction.tsx:25, SelfInvocation.tsx:59; MessageCollector.
   */
  SignatureText(): string;

  /**
   * Structured assignment or `undefined` when the message has no assignee.
   * KIND TEST: Occurrence.tsx:78 probes
   * `typeof props.context?.Assignment === "function"` to distinguish
   * message/creation contexts from all others — define ONLY here and on
   * {@link CreationContext}.
   * Consumers: SelfInvocation.tsx:20, Occurrence.tsx:81,
   * vm/SyncMessageStatementVM.ts:25.
   */
  Assignment(): AssignmentView | undefined;

  /**
   * `braceBlock()?.block()?.stat() ?? []` — nested statements.
   * Consumers: Occurrence.tsx:94,99 (numbering + insert index).
   */
  Statements(): StatContext[];

  /**
   * `true` iff `cursor` (absolute char offset from the editor) lies within
   * `[start.start, Body().stop.stop + 1]`; any internal failure → `false`.
   * Consumers: Interaction.tsx:26.
   *
   * @v2 Renderer-side pure range check over node offsets; the method exists
   * only because offsets used to be awkward to reach.
   */
  isCurrent(cursor: number): boolean;

  /**
   * Alias of {@link MessageContext.messageBody} (src/parser/IsCurrent.js).
   * Indirect consumers only (isCurrent internals + StylePanel range math).
   *
   * @v2 Drop the alias; call `messageBody()` directly.
   */
  Body(): MessageBodyContext | null;
}

/**
 * Async message statement (`A->B: hello`).
 * Also exported as a class shape for renderer `instanceof` via the
 * `@/generated-parser` shim.
 */
export interface AsyncMessageContext extends IrNode {
  /**
   * Label payload. Consumers: Interaction-async.tsx:96,103,
   * SelfInvocationAsync.tsx:15, Return.tsx:34, StylePanel.tsx:242 (duck-typed
   * `content?.()` — define only on async/return-async kinds).
   */
  content(): ContentContext | null;

  /** Consumers: Interaction-async.tsx:99-100, vm/AsyncMessageStatementVM.ts:28. */
  to(): EndpointContext | null;

  /** Consumers: Interaction-async.tsx:99-100, vm/ReturnStatementVM.ts:24. */
  from(): EndpointContext | null;

  /** Receiver: explicit `to()` name else ancestor owner. Consumers: vm/AsyncMessageStatementVM.ts:27. */
  Owner(): string | undefined;

  /** Sender: explicit `from` else stat origin. Consumers: vm/AsyncMessageStatementVM.ts:22. */
  From(): string | undefined;

  /**
   * Explicitly written source only ("out-of-band" discrimination — see the
   * design comment at Interaction-async.tsx:5-70).
   * Consumers: Interaction-async.tsx:97, vm/AsyncMessageStatementVM.ts:23.
   */
  ProvidedFrom(): string | undefined;

  /** Explicit receiver name or `undefined`; consumed by `Owner()` and MessageCollector. */
  To(): string | undefined;

  /**
   * `content()` formatted text, `""` when absent. NOTE: async signatures keep
   * the leading space (`" message"`) — a pinned quirk (07 latent-behavior
   * list); do not trim.
   * Consumers: MessageCollector (widths); SelfInvocationAsync flows.
   */
  SignatureText(): string;
}

/**
 * Return-async message (`A->B: result` in return position). Same surface as
 * {@link AsyncMessageContext} — kept as a distinct kind because the grammar
 * and `RetContext.returnAsyncMessage()` distinguish them.
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

/** `creationBody` rule. Only `parameters()` is consumed outside the parser layer. */
export interface CreationBodyContext extends IrNode {
  /** Consumers: Creation.tsx:35 (`creationBody()?.parameters()` start/stop), StylePanel.tsx:243. */
  parameters(): ParametersContext | null;
}

/**
 * Creation statement (`new A(…)`).
 * Also exported as a class for `instanceof` (useArrow.ts:21, useFragmentData.ts:21).
 */
export interface CreationContext extends IrNode {
  /**
   * KIND TEST: `typeof ctx.creationBody === "function"`
   * (vm/ReturnStatementVM.ts:51) — the creation twin of `messageBody`.
   * Consumers: Creation.tsx:35, StylePanel.tsx:243.
   */
  creationBody(): CreationBodyContext | null;

  /** Consumers: vm/CreationStatementVM.ts:32, Occurrence.tsx (shared component). */
  braceBlock(): BraceBlockContext | null;

  /**
   * The created participant's name: `"assignee:Type"` when an assignee
   * exists (this composite string IS the participant name for created
   * instances), else the type, else `"Missing Constructor"` (04 §3.2).
   * Consumers: useArrow.ts:12,26, useFragmentData.ts:25, Creation.tsx:33,43,
   * vm/CreationStatementVM.ts:20.
   */
  Owner(): string | undefined;

  /** Stat origin when parent is a stat, else `undefined`. Consumers: shared message flows (03 §4). */
  From(): string | undefined;

  /**
   * `«params»` when parameters exist, else `«create»` (guillemets baked in —
   * pinned quirk). Consumers: Creation.tsx:87; MessageCollector.
   */
  SignatureText(): string;

  /**
   * Formatted parameter list; named params as `name=value`, declarations as
   * `Type id`. Consumer: Creation.tsx:124.
   */
  ParametersText(): string;

  /** See {@link MessageContext.Assignment} (kind test applies here too). */
  Assignment(): AssignmentView | undefined;

  /** See {@link MessageContext.Statements}. Consumers: Occurrence.tsx:94,99. */
  Statements(): StatContext[];

  /** See {@link MessageContext.isCurrent}. Consumers: Creation.tsx:34. */
  isCurrent(cursor: number): boolean;

  /**
   * Alias of {@link CreationContext.creationBody} (src/parser/IsCurrent.js).
   * @v2 Drop the alias.
   */
  Body(): CreationBodyContext | null;

  /** Explicit receiver — alias of `Constructor()`; consumed by `Owner()`/Participants collection. */
  To(): string | undefined;

  /** Formatted assignee text or `undefined`. Indirect consumers via Owner()/Participants (03 §4). */
  Assignee(): string | undefined;

  /** `[assignee.start.start, assignee.stop.stop + 1]` or `undefined`. Indirect via Participants collection. */
  AssigneePosition(): IrPosition | undefined;

  /** Constructor (type) name, formatted, or `undefined`. Indirect via Owner()/Participants. */
  Constructor(): string | undefined;
}

/** Expression node (`expr` rule) — generic base for all expression alternatives. */
export type ExprContext = IrNode;

/**
 * Labeled alternative `#atomExpr` of `expr`. Exported as a class for
 * `instanceof` (Return.tsx:36,39 — then reads `.atom()` start/stop).
 */
export interface AtomExprContext extends ExprContext {
  atom(): AtomContext | null;
}

/** Atom node (literals, names). Read via offsets and `getFormattedText()`. */
export type AtomContext = IrNode;

/**
 * `return …` statement.
 */
export interface RetContext extends IrNode {
  /**
   * The embedded async message for `return A->B: x` forms, or `null`.
   * Consumers: Return.tsx:27, vm/ReturnStatementVM.ts:21; MessageCollector.enterRet.
   */
  asyncMessage(): AsyncMessageContext | null;

  /** Return-async twin of the above. Consumers: Return.tsx:27, vm/ReturnStatementVM.ts:21. */
  returnAsyncMessage(): ReturnAsyncMessageContext | null;

  /**
   * Plain return expression or `null`. May be an {@link AtomExprContext}
   * (then `.atom()` offsets are used) or another expr kind;
   * {@link ContentContext} is discriminated via `instanceof` (Return.tsx:36-41).
   * Consumers: Return.tsx:34.
   */
  expr(): ExprContext | null;

  /**
   * Label: embedded async/return-async content else `expr()` text, formatted;
   * `undefined` when empty (NOTE: `SignatureText()` returns `""` instead —
   * near-duplicate kept for compatibility).
   * Consumers: Return.tsx:29.
   *
   * @v2 Collapse `Signature()` / `SignatureText()` into one member with one
   * empty-value convention.
   */
  Signature(): string | undefined;

  /** Same as {@link RetContext.Signature} but `""` when empty. Consumers: MessageCollector. */
  SignatureText(): string;

  /**
   * The receiver of the `return`: explicit `to` of the embedded message if
   * present, else the wrapper-chain walk (stat → block → blockParent): root →
   * `Starter()`; enclosing Message → its explicit `from`, else stat origin
   * (04 §3.5 — the hairiest upward walk; port with RetContext specs).
   * Consumers: Return.tsx:32, vm/ReturnStatementVM.ts:25.
   */
  ReturnTo(): string | undefined;

  /** Sender: embedded message's `From()` else stat origin. Consumers: Return.tsx:30, vm/ReturnStatementVM.ts:22. */
  From(): string | undefined;

  /** Alias of `ReturnTo()`; consumed by `Owner()` internally (03 §4). */
  To(): string | undefined;

  /** Receiver: `To()` else ancestor owner. Consumers: MessageCollector (AllMessages). */
  Owner(): string | undefined;
}

/* ------------------------------------------------------------------------ */
/* Fragments                                                                */
/* ------------------------------------------------------------------------ */

/** `(condition)` wrapper (`parExpr` rule). */
export interface ParExprContext extends IrNode {
  /**
   * Consumers: FragmentAlt.tsx:23-43, FragmentLoop.tsx:30, FragmentOpt.tsx:19,
   * FragmentPar.tsx:30, FragmentCritical.tsx:29, vm/FragmentSingleBlockVM.ts:23,
   * vm/FragmentAltVM.ts:25-48.
   */
  condition(): ConditionContext | null;
}

/**
 * Fragment condition node. Read via `getFormattedText()` (label) and
 * `start.start` / `stop.stop` (inline editing:
 * `code.slice(0, start) + text + code.slice(end + 1)` — ConditionLabel.tsx:23-27).
 */
export type ConditionContext = IrNode;

/** `if` branch of an `alt` fragment. */
export interface IfBlockContext extends IrNode {
  /** Consumers: FragmentAlt.tsx:25, vm/FragmentAltVM.ts:29, vm/StatementVM.ts:84-88. */
  parExpr(): ParExprContext | null;
  /** Consumers: FragmentAlt.tsx:26, vm/FragmentAltVM.ts:29. */
  braceBlock(): BraceBlockContext | null;
  /** See {@link MessageContext.Statements} — defined on IfBlock/Loop too (04 §3.14). */
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
  /** Consumers: FragmentAlt.tsx:22-43, vm/FragmentAltVM.ts:25-55, vm/StatementVM.ts:84-88. */
  ifBlock(): IfBlockContext | null;

  /**
   * Dual arity; array element identity stable (React keys/deps in FragmentAlt).
   * Consumers: FragmentAlt.tsx, vm/FragmentAltVM.ts:41.
   * @v2 `elseIfBlocks: readonly ElseIfBlockContext[]`.
   */
  elseIfBlock(): ElseIfBlockContext[];
  elseIfBlock(i: number): ElseIfBlockContext | null;

  /** Consumers: FragmentAlt.tsx, vm/FragmentAltVM.ts:48. */
  elseBlock(): ElseBlockContext | null;
}

/** `opt` fragment. */
export interface OptContext extends IrNode {
  /** Consumers: FragmentOpt.tsx:19-20,70, vm/FragmentSingleBlockVM.ts:23-28. */
  parExpr(): ParExprContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `par` fragment. */
export interface ParContext extends IrNode {
  /** Consumers: FragmentPar.tsx:30-31,73-77, vm/FragmentSingleBlockVM.ts:23-28. */
  parExpr(): ParExprContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `critical` fragment. */
export interface CriticalContext extends IrNode {
  /** Consumers: FragmentCritical.tsx:29-32, vm/FragmentSingleBlockVM.ts:23-28. */
  parExpr(): ParExprContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `loop` / `while` / `for` / `forEach` fragment. */
export interface LoopContext extends IrNode {
  /** Consumers: FragmentLoop.tsx:30-32, vm/FragmentSingleBlockVM.ts:23-28. */
  parExpr(): ParExprContext | null;
  braceBlock(): BraceBlockContext | null;
  /** See {@link IfBlockContext.Statements}. */
  Statements(): StatContext[];
}

/** `section` / `frame` fragment. */
export interface SectionContext extends IrNode {
  /** Section label: `atom()?.getFormattedText()`. Consumers: FragmentSection.tsx:28-31. */
  atom(): AtomContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `try` block of a `tcf` fragment. */
export interface TryBlockContext extends IrNode {
  braceBlock(): BraceBlockContext | null;
}

/** `catch(…)` invocation node. */
export interface InvocationContext extends IrNode {
  /**
   * Exception parameter list — label via the parameters override of
   * `getFormattedText()`. Consumer: FragmentTryCatchFinally.tsx:31
   * (`invocation()?.parameters()?.getFormattedText()`).
   */
  parameters(): ParametersContext | null;
}

/** `catch` block of a `tcf` fragment. */
export interface CatchBlockContext extends IrNode {
  /** Consumers: FragmentTryCatchFinally.tsx:31,46-49, vm/FragmentTryCatchVM.ts:34. */
  invocation(): InvocationContext | null;
  braceBlock(): BraceBlockContext | null;
}

/** `finally` block of a `tcf` fragment. */
export interface FinallyBlockContext extends IrNode {
  braceBlock(): BraceBlockContext | null;
}

/** `try`/`catch`/`finally` fragment. */
export interface TcfContext extends IrNode {
  /** Consumers: FragmentTryCatchFinally.tsx:37, vm/FragmentTryCatchVM.ts:23. */
  tryBlock(): TryBlockContext | null;

  /**
   * Dual arity. Consumers: FragmentTryCatchFinally.tsx:38,46-49,
   * vm/FragmentTryCatchVM.ts:34.
   * @v2 `catchBlocks: readonly CatchBlockContext[]`.
   */
  catchBlock(): CatchBlockContext[];
  catchBlock(i: number): CatchBlockContext | null;

  /** Consumers: FragmentTryCatchFinally.tsx:39, vm/FragmentTryCatchVM.ts:38. */
  finallyBlock(): FinallyBlockContext | null;
}

/** `ref(label, A, B)` fragment. */
export interface RefContext extends IrNode {
  /**
   * All names: first is the ref label, the rest are participants the ref
   * spans. Dual arity. Consumers: via Content()/Participants() below.
   * @v2 `label: NameContext | null` + `participants: readonly NameContext[]`
   * — positional meaning encoded in an index is the awkwardness.
   */
  name(): NameContext[];
  name(i: number): NameContext | null;

  /** `name()[0]` — the ref label. Consumer: FragmentRef.tsx:18 (+ offsets at :21-22). */
  Content(): NameContext | undefined;

  /**
   * `name().slice(1)` — spanned participants.
   * Consumers: indirect via ToCollector.enterRef (Participants collection).
   */
  Participants(): NameContext[];
}

/* ------------------------------------------------------------------------ */
/* Divider                                                                  */
/* ------------------------------------------------------------------------ */

/** `== text ==` divider statement. */
export interface DividerContext extends IrNode {
  /**
   * The divider display text: formatted note with leading/trailing `=` runs
   * stripped. v1 COMPATIBILITY WARNING: THROWS `Error("Divider note must
   * start with ==")` if the parsed note does not start with `==`, and
   * Divider.tsx does not catch (03 §4). Kept for parity through the
   * migration; soften afterwards as a separate change (07 decide-and-document).
   * Consumer: Divider.tsx:22.
   *
   * @v2 Return a safe value (e.g. `""`) instead of throwing — a malformed
   * divider that parses must not crash the component.
   */
  Note(): string;
}

/* ------------------------------------------------------------------------ */
/* Parameters                                                               */
/* ------------------------------------------------------------------------ */

/** A single parameter (named parameter, declaration, or expression). */
export type ParameterContext = IrNode;

/**
 * Parameter list node. NOTE: this kind OVERRIDES the base
 * {@link IrNode.getFormattedText} with parameter-aware formatting (named
 * parameter → `id=expr`; declaration → `type id`; joined with `","`) —
 * per-kind override of a base method is part of the contract (03 §11.9,
 * 07 §3.4). The TypeScript signature is unchanged; the BEHAVIOR differs.
 */
export interface ParametersContext extends IrNode {
  /**
   * Dual arity. Consumers: indirect via ParametersText()/the
   * getFormattedText override (Creation.tsx:124, FragmentTryCatchFinally.tsx:31).
   * @v2 `parameters: readonly ParameterContext[]`.
   */
  parameter(): ParameterContext[];
  parameter(i: number): ParameterContext | null;

  /** See interface doc — parameter-aware override of the base method. */
  getFormattedText(): string;
}

/* ------------------------------------------------------------------------ */
/* Participants collection (tree-derived service output)                    */
/* ------------------------------------------------------------------------ */

/**
 * Plain-object snapshot of one participant (03 §7;
 * src/parser/Participants.ts `ToValue()` shape — the class is ported as-is).
 */
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

/**
 * The collection returned by {@link ParserModule.Participants} (03 §7).
 * Insertion order = source order.
 */
export interface ParticipantsCollection {
  /** All participant names in source order. */
  Names(): string[];
  /** Participants deduced from messages only (not explicitly declared). */
  ImplicitArray(): ParticipantView[];
  /** First participant or `undefined` when empty. Consumer: LifeLineLayer.tsx (`Participants(child).First()`). */
  First(): ParticipantView | undefined;
  /** Lookup by canonical name. */
  Get(name: string): ParticipantView | undefined;
  /** Number of participants. */
  Size(): number;
  /**
   * Declaration/mention offset ranges `[start, stop + 1]`, or `undefined` when
   * the name is unknown. Consumer normalizes with `Array.from(… ?? [])`
   * (Participant.tsx:45-48).
   */
  GetPositions(name: string): ReadonlySet<IrPosition> | undefined;
  /** Assignee offset ranges (see {@link ParticipantsCollection.GetPositions}). */
  GetAssigneePositions(name: string): ReadonlySet<IrPosition> | undefined;
}

/* ------------------------------------------------------------------------ */
/* Entry points (module-level contract of `@/parser`)                       */
/* ------------------------------------------------------------------------ */

/**
 * One syntax-error record, shape-compatible with the ANTLR
 * `SeqErrorListener` payload (src/parser/index.js:23-32).
 */
export interface ErrorDetail {
  /** 1-based line. */
  readonly line: number;
  /** 0-based column. */
  readonly column: number;
  readonly msg: string;
}

/**
 * `RootContext(code)`: parses `code` and returns the root node, or `null`.
 * v1 semantics (04 §1.1): a (partial) tree is effectively ALWAYS returned for
 * non-empty input — error recovery produces a renderable partial tree while
 * diagnostics accumulate in {@link ParserModule.Errors} /
 * {@link ParserModule.ErrorDetails}. Live typing of half-finished DSL must
 * still render. `null` is reserved for the blank-code convention.
 * Consumer: src/store/Store.ts:48-52 (`rootContextAtom`) — the only
 * renderer-side parse trigger.
 */
export type RootContextFn = (code: string) => ProgContext | null;

/**
 * Constructor-shaped value exported for renderer `instanceof` checks
 * (07 §R9 — facade classes ARE classes; `instanceof` keeps working).
 * The construction signature is deliberately uncallable: consumers only ever
 * use these on the right-hand side of `instanceof`.
 */
export type ContextClass<T extends IrNode> = abstract new (
  ...args: never[]
) => T;

/**
 * The module-level contract of `@/parser` (named exports + default export
 * object — 03 §1). The Stage-3 facade entry module must satisfy this shape.
 */
export interface ParserModule {
  /** See {@link RootContextFn}. */
  RootContext: RootContextFn;

  /**
   * LIVE mutable arrays (module singletons): accumulate one entry per syntax
   * error across ALL parses; never auto-cleared by the parser.
   * `src/core.tsx:245-250` clears with `.length = 0`, copies, reports —
   * the live-reference import shape must be preserved (07 §R12/G5).
   * `Errors` entries are preformatted strings
   * (`"<symbol> line <l>, col <c>: <msg>"`); `ErrorDetails` are structured.
   *
   * @v2 Per-parse diagnostics returned alongside the AST
   * (`{ root, errors }`); the singleton is a latent re-entrancy bug — do not
   * carry it past the cutover cleanup (Stage 6).
   */
  Errors: string[];
  /** See {@link ParserModule.Errors}. */
  ErrorDetails: ErrorDetail[];

  /**
   * Walks the subtree and returns the participants collection. Accepts
   * `null`/`undefined` (returns an empty collection).
   * Consumers: Store.ts:62-66 (`participantsAtom`),
   * positioning/LocalParticipants.ts:15, LifeLineLayer.tsx.
   */
  Participants(ctx: IrNode | null | undefined): ParticipantsCollection;

  /**
   * Max nesting depth of fragments inside `ctx`. No renderer consumers found
   * (03 §1) — kept on the contract for package-API parity only.
   * @v2 Drop from the public surface with a CHANGELOG note (07 open question 4).
   */
  Depth(ctx: IrNode): number;

  /** Class export for `instanceof` (LifeLineLayer.tsx:14,44-51 via GroupContext/ParticipantContext; ProgContext for API parity). */
  ProgContext: ContextClass<ProgContext>;
  /** Class export for `instanceof`. Consumer: LifeLineLayer.tsx:44-51. */
  GroupContext: ContextClass<GroupContext>;
  /** Class export for `instanceof`. Consumer: LifeLineLayer.tsx:44-51. */
  ParticipantContext: ContextClass<ParticipantContext>;
}

/**
 * Classes the renderer imports DIRECTLY from `@/generated-parser` for
 * `instanceof` (03 §1). The Stage-3 shim module replacing
 * `src/generated-parser` must export facade classes under these names:
 * - useArrow.ts — `MessageContext`, `CreationContext`, `StatContext`
 * - useFragmentData.ts — `MessageContext`, `CreationContext`
 * - Return.tsx — `AtomExprContext`, `ContentContext`
 */
export interface GeneratedParserShim {
  MessageContext: ContextClass<MessageContext>;
  CreationContext: ContextClass<CreationContext>;
  StatContext: ContextClass<StatContext>;
  AtomExprContext: ContextClass<AtomExprContext>;
  ContentContext: ContextClass<ContentContext>;
}

/* ------------------------------------------------------------------------ */
/* Test fixtures (sub-rule parse entry points)                              */
/* ------------------------------------------------------------------------ */

/**
 * Sub-rule fixture entries used by the spec suite
 * (src/parser/ContextsFixture.ts). Each parses `code` starting at the named
 * grammar rule — the Langium port rebuilds these on
 * `LangiumParser.parse(text, { rule })` (07 §P10/G9) while keeping the exact
 * names and return kinds so the 34-spec suite runs unchanged.
 *
 * NOTE: fixtures return the node even when the input has errors (no
 * `null`-on-error convention here; the no-op error listener swallows
 * diagnostics).
 */
export interface ContextsFixtureModule {
  ProgContextFixture(code: string): ProgContext;
  TitleContextFixture(code: string): TitleContext;
  StatContextFixture(code: string): StatContext;
  AsyncMessageContextFixture(code: string): AsyncMessageContext;
  /** Parses at the sync `message` rule. */
  SyncMessageContextFixture(code: string): MessageContext;
  DividerContextFixture(code: string): DividerContext;
  CreationContextFixture(code: string): CreationContext;
  RetContextFixture(code: string): RetContext;
}
