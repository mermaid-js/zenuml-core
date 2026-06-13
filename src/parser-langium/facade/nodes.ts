/**
 * Stage-3 compatibility facade — ANTLR-context-shaped classes over the
 * Langium AST (src/parser-langium/generated/ast.ts).
 *
 * Binding contract: src/parser/ir/contract.ts (+ docs/langium-migration/09).
 * Design rules implemented here (07-risk-map §3.4):
 *  1. one facade class per ANTLR context kind with external consumers;
 *     METHOD PLACEMENT PER KIND is the type discriminator — nothing
 *     kind-specific lives on the base class;
 *  2. construction memoized per parse: AST-backed nodes via WeakMap(astNode),
 *     synthesized wrappers via WeakMap(hostObject) -> Map(kind);
 *  3. start/stop are lazy TokenViews with the INCLUSIVE-stop convention
 *     (stop.stop = last char offset of the node);
 *  4. getText() concatenates non-hidden leaf texts; getFormattedText() is the
 *     raw doc slice [offset, end) through formatText (ParametersContext
 *     overrides it);
 *  5. getComment() reproduces src/parser/index.js:51-66 byte-for-byte over the
 *     CST leaf stream (BraceBlockContext anchors on its LAST token);
 *  6. wrapper levels (stat, head, dividerNote, parameter, condition, starter,
 *     content, property nodes) are synthesized so parentCtx chains and
 *     getAncestors() depth match ANTLR exactly (AncestorPath pin: 7).
 *
 * Deliberate do-NOT-ports (07 Part 2): no generic `Origin()` on the base
 * (latent infinite loop — Origin exists only on StatContext/ProgContext);
 * no `constructor.name` string checks (BraceBlock anchor is an override).
 */
import { GrammarUtils, isCompositeCstNode, isLeafCstNode } from "langium";
import type { AstNode, CstNode } from "langium";
import { formatText } from "@/utils/StringUtil";
import { Assignment } from "@/parser/Messages/Assignment";

/* ------------------------------------------------------------------ */
/* Document context: flattened leaf stream + memoization caches        */
/* ------------------------------------------------------------------ */

interface Leaf {
  offset: number;
  end: number;
  hidden: boolean;
  type: string;
  text: string;
  /** 0-based line of the first char. */
  line: number;
  /** 0-based column of the first char. */
  column: number;
}

interface Span {
  offset: number;
  end: number;
}

export class FacadeDocument {
  readonly text: string;
  readonly leaves: Leaf[] = [];
  readonly nodeCache = new WeakMap<AstNode, Ctx>();
  readonly synthCache = new WeakMap<object, Map<string, unknown>>();

  constructor(value: AstNode | undefined, code: string) {
    const root = value?.$cstNode?.root;
    this.text = root ? root.fullText : code;
    if (root) collectLeaves(root, this.leaves);
  }

  /** Index of the first leaf with leaf.offset >= offset. */
  lowerBound(offset: number): number {
    let lo = 0;
    let hi = this.leaves.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.leaves[mid].offset < offset) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
}

function collectLeaves(cst: CstNode, out: Leaf[]): void {
  if (isLeafCstNode(cst)) {
    out.push({
      offset: cst.offset,
      end: cst.end,
      hidden: cst.hidden,
      type: cst.tokenType?.name ?? "",
      text: cst.text,
      line: cst.range.start.line,
      column: cst.range.start.character,
    });
    return;
  }
  if (isCompositeCstNode(cst)) {
    for (const child of cst.content) collectLeaves(child, out);
  }
}

/* ------------------------------------------------------------------ */
/* Token views                                                          */
/* ------------------------------------------------------------------ */

class TokenView {
  readonly start: number;
  readonly stop: number;
  readonly line: number;
  readonly column: number;
  readonly text: string;
  constructor(
    start: number,
    stop: number,
    line: number,
    column: number,
    text: string,
  ) {
    this.start = start;
    this.stop = stop;
    this.line = line;
    this.column = column;
    this.text = text;
  }
}

/** Synthetic view for nodes whose span contains no real tokens (recovery). */
function syntheticView(
  doc: FacadeDocument,
  offset: number,
  stop: number,
): TokenView {
  let line = 0;
  let lineStart = 0;
  for (let i = 0; i < offset && i < doc.text.length; i++) {
    if (doc.text[i] === "\n") {
      line++;
      lineStart = i + 1;
    }
  }
  return new TokenView(offset, stop, line + 1, offset - lineStart, "");
}

class TerminalView {
  private readonly _text: string;
  constructor(text: string) {
    this._text = text;
  }
  getText(): string {
    return this._text;
  }
}

/* ------------------------------------------------------------------ */
/* Base facade node                                                     */
/* ------------------------------------------------------------------ */

const EXPR_TYPES = new Set([
  "AtomExpr",
  "UnaryMinusExpr",
  "NotExpr",
  "MultiplicationExpr",
  "AdditiveExpr",
  "RelationalExpr",
  "EqualityExpr",
  "AndExpr",
  "OrExpr",
  "FuncExpr",
  "CreationExpr",
  "ParenthesizedExpr",
  "AssignmentExpr",
]);

export abstract class Ctx {
  readonly _doc: FacadeDocument;
  /** Backing AST node (null for purely synthesized wrappers). */
  readonly _ast: any;
  readonly parentCtx: Ctx | null;
  private readonly _explicitSpan: Span | null;
  private _spanCache: Span | undefined;
  private _startView: TokenView | undefined;
  private _stopView: TokenView | null | undefined;
  protected _startIdx: number | undefined;
  protected _stopIdx: number | undefined;
  private _childList: Ctx[] | null | undefined;

  constructor(
    doc: FacadeDocument,
    ast: AstNode | null,
    parent: Ctx | null,
    span?: Span,
  ) {
    this._doc = doc;
    this._ast = ast;
    this.parentCtx = parent;
    this._explicitSpan = span ?? null;
  }

  /* ---- span / token views ---- */

  protected _span(): Span {
    if (this._spanCache) return this._spanCache;
    let span: Span;
    if (this._explicitSpan) span = this._explicitSpan;
    else if (this._ast?.$cstNode)
      span = { offset: this._ast.$cstNode.offset, end: this._ast.$cstNode.end };
    else span = { offset: 0, end: 0 };
    this._spanCache = span;
    return span;
  }

  /**
   * Trailing END tokens the ANTLR counterpart rule keeps as its stop token
   * (`stat: asyncMessage EVENT_END?`, `ret: … EVENT_END?`, `title: …
   * TITLE_END?`, and transitively block/prog whose last consumed token they
   * become). The Langium grammar marks EVENT_END/TITLE_END `hidden`, so they
   * sit directly after the AST node's CST span; `_computeViews` adopts the
   * adjacent END leaf as the stop without disturbing getText/comment scans.
   */
  protected _trailingEndTypes(): string[] | null {
    return null;
  }

  private _computeViews(): void {
    if (this._startView) return;
    const { offset, end } = this._span();
    const doc = this._doc;
    let firstIdx = -1;
    let lastIdx = -1;
    for (let i = doc.lowerBound(offset); i < doc.leaves.length; i++) {
      const leaf = doc.leaves[i];
      if (leaf.offset >= end) break;
      if (leaf.hidden) continue;
      if (firstIdx === -1) firstIdx = i;
      lastIdx = i;
    }
    // ANTLR keeps a trailing EVENT_END/TITLE_END as the rule's stop token.
    // The Langium grammar hides it directly after the AST CST span; adopt that
    // adjacent END leaf as the stop (getText / comment scans are unaffected
    // since the END leaf stays hidden in the leaf stream).
    let stopIdx = lastIdx;
    const endTypes = this._trailingEndTypes();
    if (endTypes) {
      const cand = doc.leaves[doc.lowerBound(end)];
      if (cand && cand.offset === end && endTypes.includes(cand.type)) {
        stopIdx = doc.lowerBound(end);
      }
    }
    this._startIdx = firstIdx;
    this._stopIdx = stopIdx;
    if (firstIdx === -1) {
      this._startView = syntheticView(doc, offset, Math.max(offset, end - 1));
    } else {
      const f = doc.leaves[firstIdx];
      this._startView = new TokenView(
        f.offset,
        f.end - 1,
        f.line + 1,
        f.column,
        f.text,
      );
    }
    if (stopIdx === -1) {
      // ANTLR: a rule that consumed zero parser-visible tokens has stop=null
      // (e.g. ProgContext on an empty document).
      this._stopView = null;
    } else {
      const l = doc.leaves[stopIdx];
      this._stopView = new TokenView(
        l.offset,
        l.end - 1,
        l.line + 1,
        l.column,
        l.text,
      );
    }
  }

  get start(): TokenView {
    this._computeViews();
    return this._startView!;
  }

  get stop(): TokenView | null {
    this._computeViews();
    return this._stopView ?? null;
  }

  /* ---- text reconstruction ---- */

  getText(): string {
    const { offset, end } = this._span();
    const doc = this._doc;
    let out = "";
    for (let i = doc.lowerBound(offset); i < doc.leaves.length; i++) {
      const leaf = doc.leaves[i];
      if (leaf.offset >= end) break;
      if (!leaf.hidden) out += leaf.text;
    }
    return out;
  }

  getFormattedText(): string {
    const { offset, end } = this._span();
    return formatText(this._doc.text.slice(offset, end));
  }

  /* ---- comments (normative algorithm, 09 §3.4) ---- */

  /** Leaf index of the comment anchor token; BraceBlockContext overrides. */
  protected _commentAnchorIdx(): number {
    this._computeViews();
    return this._startIdx ?? -1;
  }

  getComment(): string | null {
    const anchor = this._commentAnchorIdx();
    if (anchor < 0) return null;
    const leaves = this._doc.leaves;
    const comments: string[] = [];
    for (let i = anchor - 1; i >= 0; i--) {
      const leaf = leaves[i];
      if (!leaf.hidden) break;
      if (leaf.type === "COMMENT") comments.unshift(leaf.text.substring(2));
    }
    return comments.length ? comments.join("\n") : null;
  }

  /* ---- tree navigation ---- */

  get children(): Ctx[] | null {
    if (this._childList === undefined) {
      const list = this._buildChildren();
      this._childList = list.length ? list : null;
    }
    return this._childList;
  }

  protected _buildChildren(): Ctx[] {
    return [];
  }

  getAncestors(predicate?: (ctx: Ctx) => boolean): Ctx[] {
    const ancestors: Ctx[] = [];
    if (!predicate || predicate(this)) ancestors.push(this);
    let current = this.parentCtx;
    while (current) {
      if (!predicate || predicate(current)) ancestors.push(current);
      current = current.parentCtx;
    }
    return ancestors;
  }

  ClosestAncestorStat(): StatContext | undefined {
    if (this instanceof StatContext) return this;
    let current = this.parentCtx;
    while (current && !(current instanceof StatContext))
      current = current.parentCtx;
    return current instanceof StatContext ? current : undefined;
  }

  /**
   * ANTLR API-compat tree dump (consumed by IfWithoutBody.spec via
   * `root.toStringTree(null, root.parser)`); ANTLR's two arguments are ignored
   * — JS drops the extra call args. Chevrotain recovery never renders
   * "missing"/"extraneous" markers, which is exactly the no-recovery-artifact
   * property the spec asserts.
   */
  toStringTree(): string {
    const kids = this.children ?? [];
    if (!kids.length) return this.getText();
    return `(${this.constructor.name} ${kids.map((k) => k.toStringTree()).join(" ")})`;
  }

  /* ---- construction helpers ---- */

  protected _wrap(ast: AstNode | undefined | null): any {
    if (!ast) return null;
    return wrapAst(this._doc, ast, this);
  }

  protected _synth<T>(key: object, kind: string, factory: () => T): T {
    let map = this._doc.synthCache.get(key);
    if (!map) {
      map = new Map();
      this._doc.synthCache.set(key, map);
    }
    let node = map.get(kind) as T | undefined;
    if (node === undefined) {
      node = factory();
      map.set(kind, node);
    }
    return node;
  }

  /** Synthesize a child node over the CST segment of an AST property. */
  protected _propNode(
    cls: new (doc: FacadeDocument, ast: null, parent: Ctx, span: Span) => Ctx,
    prop: string,
  ): any {
    const ast = this._ast;
    if (!ast || ast[prop] === undefined || !ast.$cstNode) return null;
    const cst = GrammarUtils.findNodeForProperty(ast.$cstNode, prop);
    if (!cst) return null;
    return this._synth(
      ast,
      `prop:${prop}`,
      () =>
        new cls(this._doc, null, this, { offset: cst.offset, end: cst.end }),
    );
  }

  protected _propTerminal(prop: string): TerminalView | null {
    const ast = this._ast;
    if (!ast || ast[prop] === undefined) return null;
    return this._synth(
      ast,
      `terminal:${prop}`,
      () => new TerminalView(String(ast[prop])),
    );
  }
}

function dual<T>(arr: T[], i?: number): any {
  return i === undefined ? arr : ((arr[i] as T | undefined) ?? null);
}

/* ------------------------------------------------------------------ */
/* Leaf-ish synthesized kinds                                           */
/* ------------------------------------------------------------------ */

export class NameContext extends Ctx {}
export class ParticipantTypeContext extends Ctx {}
export class WidthContext extends Ctx {}
export class ContentContext extends Ctx {}
export class DividerNoteContext extends Ctx {}

/**
 * ANTLR `starter: name`, `type: name`, `construct: name` — a single
 * NameContext child sharing the node's span.
 */
abstract class NameWrappingContext extends Ctx {
  name(): NameContext {
    return this._synth(
      this,
      "name",
      () => new NameContext(this._doc, null, this, this._span()),
    ) as NameContext;
  }

  protected override _buildChildren(): Ctx[] {
    return [this.name()];
  }
}

export class StarterContext extends NameWrappingContext {}
export class TypeContext extends NameWrappingContext {}
export class ConstructContext extends NameWrappingContext {}

/* ------------------------------------------------------------------ */
/* Root / head                                                          */
/* ------------------------------------------------------------------ */

export class ProgContext extends Ctx {
  title(): TitleContext | null {
    return this._wrap(this._ast?.title);
  }

  head(): HeadContext | null {
    const ast = this._ast;
    if (!ast) return null;
    const hasHead = (ast.headElements?.length ?? 0) > 0 || ast.starterExp;
    if (!hasHead) return null;
    return this._synth(
      ast,
      "head",
      () => new HeadContext(this._doc, ast, this),
    );
  }

  block(): BlockContext | null {
    return this._wrap(this._ast?.block);
  }

  Starter(): string | undefined {
    return this.head()?.starterExp()?.starter()?.getFormattedText();
  }

  Origin(): string | undefined {
    return this.Starter();
  }

  protected override _buildChildren(): Ctx[] {
    const out: Ctx[] = [];
    const title = this.title();
    if (title) out.push(title);
    const head = this.head();
    if (head) out.push(head);
    const block = this.block();
    if (block) out.push(block);
    return out;
  }

  /** prog's last consumed token can be a stat's EVENT_END or a lone title's TITLE_END. */
  protected override _trailingEndTypes(): string[] {
    return ["EVENT_END", "TITLE_END"];
  }
}

export class TitleContext extends Ctx {
  content(): string {
    const raw = this._ast?.content;
    return raw == null ? "" : String(raw).trim();
  }

  /** ANTLR `title: TITLE TITLE_CONTENT? TITLE_END?`. */
  protected override _trailingEndTypes(): string[] {
    return ["TITLE_END"];
  }
}

export class HeadContext extends Ctx {
  // _ast is the Prog node; span covers headElements + starterExp.
  constructor(doc: FacadeDocument, progAst: any, parent: Ctx) {
    const parts: any[] = [...(progAst.headElements ?? [])];
    if (progAst.starterExp) parts.push(progAst.starterExp);
    const withCst = parts.filter((p) => p.$cstNode);
    const span: Span = withCst.length
      ? {
          offset: Math.min(...withCst.map((p) => p.$cstNode.offset)),
          end: Math.max(...withCst.map((p) => p.$cstNode.end)),
        }
      : { offset: 0, end: 0 };
    super(doc, progAst, parent, span);
  }

  participant(i?: number): any {
    const arr = (this._ast.headElements ?? [])
      .filter((e: any) => e.$type === "Participant")
      .map((e: any) => this._wrap(e));
    return dual(arr, i);
  }

  group(i?: number): any {
    const arr = (this._ast.headElements ?? [])
      .filter((e: any) => e.$type === "Group")
      .map((e: any) => this._wrap(e));
    return dual(arr, i);
  }

  starterExp(): StarterExpContext | null {
    return this._wrap(this._ast?.starterExp);
  }

  protected override _buildChildren(): Ctx[] {
    const out: Ctx[] = (this._ast.headElements ?? []).map((e: any) =>
      this._wrap(e),
    );
    const starterExp = this.starterExp();
    if (starterExp) out.push(starterExp);
    return out;
  }
}

export class StarterExpContext extends Ctx {
  starter(): StarterContext | null {
    return this._propNode(StarterContext, "starter");
  }

  protected override _buildChildren(): Ctx[] {
    const starter = this.starter();
    return starter ? [starter] : [];
  }
}

export class GroupContext extends Ctx {
  name(): NameContext | null {
    return this._propNode(NameContext, "name");
  }

  participant(i?: number): any {
    const arr = (this._ast.participants ?? []).map((p: any) => this._wrap(p));
    return dual(arr, i);
  }

  /** ANTLR `group: GROUP name? (OBRACE participant* CBRACE?)?`. */
  protected override _buildChildren(): Ctx[] {
    const name = this.name();
    const participants = (this._ast.participants ?? []).map((p: any) =>
      this._wrap(p),
    );
    return name ? [name, ...participants] : participants;
  }
}

export class ParticipantContext extends Ctx {
  name(): NameContext | null {
    return this._propNode(NameContext, "name");
  }

  participantType(): ParticipantTypeContext | null {
    return this._propNode(ParticipantTypeContext, "participantType");
  }

  width(): WidthContext | null {
    return this._propNode(WidthContext, "width");
  }

  label(): LabelContext | null {
    return this._wrap(this._ast?.label);
  }

  stereotype(): StereotypeContext | null {
    return this._wrap(this._ast?.stereotype);
  }

  emoji(): EmojiContext | null {
    return this._wrap(this._ast?.emoji);
  }

  COLOR(): TerminalView | null {
    return this._propTerminal("color");
  }

  /** ANTLR `participant: participantType? stereotype? emoji? name width? label? COLOR?`. */
  protected override _buildChildren(): Ctx[] {
    return [
      this.participantType(),
      this.stereotype(),
      this.emoji(),
      this.name(),
      this.width(),
      this.label(),
    ].filter(Boolean) as Ctx[];
  }
}

export class StereotypeContext extends Ctx {
  name(): NameContext | null {
    return this._propNode(NameContext, "name");
  }

  protected override _buildChildren(): Ctx[] {
    const name = this.name();
    return name ? [name] : [];
  }
}

export class LabelContext extends Ctx {
  name(): NameContext | null {
    return this._propNode(NameContext, "name");
  }

  protected override _buildChildren(): Ctx[] {
    const name = this.name();
    return name ? [name] : [];
  }
}

export class EmojiContext extends Ctx {
  name(): NameContext | null {
    return this._propNode(NameContext, "name");
  }

  protected override _buildChildren(): Ctx[] {
    const name = this.name();
    return name ? [name] : [];
  }
}

/* ------------------------------------------------------------------ */
/* Blocks and statements                                                */
/* ------------------------------------------------------------------ */

export class BlockContext extends Ctx {
  stat(i?: number): any {
    const arr = (this._ast.stats ?? []).map((s: any) => this._statWrapper(s));
    return dual(arr, i);
  }

  /** ANTLR block.stop = last stat's stop, which can be an EVENT_END. */
  protected override _trailingEndTypes(): string[] {
    return ["EVENT_END"];
  }

  private _statWrapper(concrete: AstNode): StatContext {
    return this._synth(
      concrete,
      "stat",
      () => new StatContext(this._doc, concrete, this),
    );
  }

  protected override _buildChildren(): Ctx[] {
    return this.stat();
  }
}

export class BraceBlockContext extends Ctx {
  block(): BlockContext | null {
    return this._wrap(this._ast?.block);
  }

  /** Comment anchored on the CLOSING `}` (the node's last token). */
  protected override _commentAnchorIdx(): number {
    // Force view computation, then use the stop-leaf index.
    void this.stop;
    return this._stopIdx ?? -1;
  }

  protected override _buildChildren(): Ctx[] {
    const block = this.block();
    return block ? [block] : [];
  }
}

export class StatContext extends Ctx {
  // _ast is the CONCRETE statement node; this wrapper recreates ANTLR's
  // `stat` rule level (G8/P9 — Langium union rules flatten).
  constructor(doc: FacadeDocument, concrete: AstNode, parent: Ctx | null) {
    super(
      doc,
      concrete,
      parent,
      concrete.$cstNode
        ? { offset: concrete.$cstNode.offset, end: concrete.$cstNode.end }
        : { offset: 0, end: 0 },
    );
  }

  private _concreteIf(type: string): any {
    return this._ast?.$type === type ? this._wrap(this._ast) : null;
  }

  loop() {
    return this._concreteIf("Loop");
  }
  alt() {
    return this._concreteIf("Alt");
  }
  par() {
    return this._concreteIf("Par");
  }
  opt() {
    return this._concreteIf("Opt");
  }
  section() {
    return this._concreteIf("Section");
  }
  critical() {
    return this._concreteIf("Critical");
  }
  tcf() {
    return this._concreteIf("Tcf");
  }
  ref() {
    return this._concreteIf("Ref");
  }
  creation() {
    return this._concreteIf("Creation");
  }
  message() {
    return this._concreteIf("Message");
  }
  asyncMessage() {
    return this._concreteIf("AsyncMessage");
  }
  divider() {
    return this._concreteIf("Divider");
  }
  ret() {
    return this._concreteIf("Ret");
  }

  /**
   * The inferred sender ("current lifeline") of this statement
   * (src/parser/Origin.js StatContext override — the generic
   * ParserRuleContext.Origin latent-loop is deliberately NOT ported).
   */
  Origin(): string | undefined {
    let ctx: Ctx | null = this.parentCtx;
    while (ctx) {
      if (ctx instanceof ProgContext) return ctx.Starter();
      if (ctx instanceof MessageContext || ctx instanceof CreationContext) {
        const receiver = ctx.Owner();
        if (receiver) return receiver;
      }
      ctx = ctx.parentCtx;
    }
    return undefined;
  }

  protected override _buildChildren(): Ctx[] {
    const concrete = this._wrap(this._ast);
    return concrete ? [concrete] : [];
  }

  /** ANTLR `stat: … | asyncMessage EVENT_END? | ret …` (ret consumes its own). */
  protected override _trailingEndTypes(): string[] {
    return ["EVENT_END"];
  }
}

/* ------------------------------------------------------------------ */
/* Messages                                                             */
/* ------------------------------------------------------------------ */

function getOwnerFromAncestor(ctx: Ctx | null): string | undefined {
  while (ctx) {
    if (ctx instanceof CreationContext || ctx instanceof MessageContext)
      return ctx.Owner();
    ctx = ctx.parentCtx;
  }
  return undefined;
}

function isCurrentImpl(self: any, cursor: number): boolean {
  try {
    if (cursor === null || cursor === undefined) return false;
    const start = self.start.start;
    const stop = self.Body().stop!.stop + 1;
    return cursor >= start && cursor <= stop;
  } catch {
    return false;
  }
}

function extractAssignment(
  assignmentCtx: AssignmentContext | null,
): Assignment | undefined {
  if (!assignmentCtx) return undefined;
  const assigneeCtx = assignmentCtx.assignee();
  const assignee = assigneeCtx?.getFormattedText();
  const typeCtx = assignmentCtx.type();
  const type = typeCtx?.getFormattedText();
  const assigneePosition: [number, number] = assigneeCtx
    ? [assigneeCtx.start.start, assigneeCtx.stop!.stop]
    : [-1, -1];
  const typePosition: [number, number] = typeCtx
    ? [typeCtx.start.start, typeCtx.stop!.stop]
    : [-1, -1];
  if (assignee)
    return new Assignment(assignee, type, assigneePosition, typePosition);
  return undefined;
}

function endpointName(endpoint: any): string | undefined {
  return endpoint?.name?.()?.getFormattedText() || endpoint?.getFormattedText();
}

export class MessageContext extends Ctx {
  messageBody(): MessageBodyContext | null {
    return this._wrap(this._ast?.body);
  }

  braceBlock(): BraceBlockContext | null {
    return this._wrap(this._ast?.braceBlock);
  }

  To(): string | undefined {
    const toCtx = this.messageBody()?.fromTo()?.to();
    return toCtx?.name?.()?.getFormattedText() || toCtx?.getFormattedText();
  }

  Owner(): string | undefined {
    return this.To() || getOwnerFromAncestor(this.parentCtx);
  }

  ProvidedFrom(): string | undefined {
    const fromCtx = this.messageBody()?.fromTo()?.from();
    return endpointName(fromCtx);
  }

  From(): string | undefined {
    return this.ProvidedFrom() || this.ClosestAncestorStat()!.Origin();
  }

  SignatureText(): string {
    return (
      this.messageBody()
        ?.func()
        ?.signature()
        ?.map((s: SignatureContext) => s?.getFormattedText())
        .join(".") ?? ""
    );
  }

  Assignment(): Assignment | undefined {
    return extractAssignment(this.messageBody()!.assignment());
  }

  Statements(): StatContext[] {
    return this.braceBlock()?.block()?.stat() || [];
  }

  Body(): MessageBodyContext | null {
    return this.messageBody();
  }

  isCurrent(cursor: number): boolean {
    return isCurrentImpl(this, cursor);
  }

  protected override _buildChildren(): Ctx[] {
    const out: Ctx[] = [];
    const body = this.messageBody();
    if (body) out.push(body);
    const braceBlock = this.braceBlock();
    if (braceBlock) out.push(braceBlock);
    return out;
  }
}

export class MessageBodyContext extends Ctx {
  assignment(): AssignmentContext | null {
    return this._wrap(this._ast?.assignment);
  }

  fromTo(): FromToContext | null {
    return this._wrap(this._ast?.fromTo);
  }

  func(): FuncContext | null {
    return this._wrap(this._ast?.func);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.assignment(), this.fromTo(), this.func()].filter(
      Boolean,
    ) as Ctx[];
  }
}

export class FromToContext extends Ctx {
  from(): FromContext | null {
    return this._wrap(this._ast?.from);
  }

  to(): ToContext | null {
    return this._wrap(this._ast?.to);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.from(), this.to()].filter(Boolean) as Ctx[];
  }
}

export class FromContext extends Ctx {
  name(): NameContext | null {
    return this._propNode(NameContext, "name");
  }
  emoji(): EmojiContext | null {
    return this._wrap(this._ast?.emoji);
  }

  /** ANTLR `from: emoji? name`. */
  protected override _buildChildren(): Ctx[] {
    return [this.emoji(), this.name()].filter(Boolean) as Ctx[];
  }
}

export class ToContext extends Ctx {
  name(): NameContext | null {
    return this._propNode(NameContext, "name");
  }
  emoji(): EmojiContext | null {
    return this._wrap(this._ast?.emoji);
  }

  /** ANTLR `to: emoji? name`. */
  protected override _buildChildren(): Ctx[] {
    return [this.emoji(), this.name()].filter(Boolean) as Ctx[];
  }
}

export class FuncContext extends Ctx {
  signature(i?: number): any {
    const arr = (this._ast.signatures ?? []).map((s: any) => this._wrap(s));
    return dual(arr, i);
  }

  protected override _buildChildren(): Ctx[] {
    return this.signature();
  }
}

export class SignatureContext extends Ctx {
  methodName(): MethodNameContext | null {
    return this._wrap(this._ast?.methodName);
  }

  invocation(): InvocationContext | null {
    return this._wrap(this._ast?.invocation);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.methodName(), this.invocation()].filter(Boolean) as Ctx[];
  }
}

export class MethodNameContext extends Ctx {
  name(): NameContext | null {
    return this._propNode(NameContext, "name");
  }
  emoji(): EmojiContext | null {
    return this._wrap(this._ast?.emoji);
  }

  /** ANTLR `methodName: emoji? name`. */
  protected override _buildChildren(): Ctx[] {
    return [this.emoji(), this.name()].filter(Boolean) as Ctx[];
  }
}

export class InvocationContext extends Ctx {
  parameters(): ParametersContext | null {
    return this._wrap(this._ast?.parameters);
  }

  protected override _buildChildren(): Ctx[] {
    const parameters = this.parameters();
    return parameters ? [parameters] : [];
  }
}

/* ------------------------------------------------------------------ */
/* Parameters                                                           */
/* ------------------------------------------------------------------ */

function formatParameter(param: ParameterContext): string {
  const named = param.namedParameter();
  if (named) {
    const expr = named.expr();
    const value = expr ? expr.getFormattedText() : "";
    return `${named._ast.name}=${value}`;
  }
  const decl = param.declaration();
  if (decl) {
    return `${decl._ast.type} ${decl._ast.name}`;
  }
  const expr = param.expr();
  if (expr) {
    return expr.getFormattedText();
  }
  return param.getFormattedText();
}

function formatParameters(params: ParameterContext[]): string {
  return params.map(formatParameter).join(",");
}

export class ParametersContext extends Ctx {
  parameter(i?: number): any {
    const arr = (this._ast.parameters ?? []).map((p: AstNode) =>
      this._synth(
        p,
        "parameter",
        () => new ParameterContext(this._doc, p, this),
      ),
    );
    return dual(arr, i);
  }

  /** Parameter-aware OVERRIDE of the base method (03 §11.9 — contract). */
  override getFormattedText(): string {
    const params = this.parameter();
    if (!params || params.length === 0) return "";
    return formatParameters(params);
  }

  protected override _buildChildren(): Ctx[] {
    return this.parameter();
  }
}

export class ParameterContext extends Ctx {
  // _ast is the concrete parameter node (NamedParameter | Declaration | Expr);
  // this wrapper recreates ANTLR's `parameter` rule level.
  constructor(doc: FacadeDocument, concrete: AstNode, parent: Ctx) {
    super(
      doc,
      concrete,
      parent,
      concrete.$cstNode
        ? { offset: concrete.$cstNode.offset, end: concrete.$cstNode.end }
        : { offset: 0, end: 0 },
    );
  }

  namedParameter(): NamedParameterContext | null {
    return this._ast?.$type === "NamedParameter" ? this._wrap(this._ast) : null;
  }

  declaration(): DeclarationContext | null {
    return this._ast?.$type === "Declaration" ? this._wrap(this._ast) : null;
  }

  expr(): any {
    return EXPR_TYPES.has(this._ast?.$type) ? this._wrap(this._ast) : null;
  }

  protected override _buildChildren(): Ctx[] {
    const concrete = this._wrap(this._ast);
    return concrete ? [concrete] : [];
  }
}

export class NamedParameterContext extends Ctx {
  ID(): TerminalView | null {
    const cst =
      this._ast?.$cstNode &&
      GrammarUtils.findNodeForProperty(this._ast.$cstNode, "name");
    if (!cst || !isLeafCstNode(cst) || cst.tokenType?.name !== "ID")
      return null;
    return this._synth(
      this._ast,
      "terminal:name",
      () => new TerminalView(cst.text),
    );
  }

  expr(): any {
    return this._wrap(this._ast?.value);
  }

  protected override _buildChildren(): Ctx[] {
    const expr = this.expr();
    return expr ? [expr] : [];
  }
}

export class DeclarationContext extends Ctx {}

/* ------------------------------------------------------------------ */
/* Assignment / assignee                                                */
/* ------------------------------------------------------------------ */

export class AssignmentContext extends Ctx {
  assignee(): AssigneeContext | null {
    return this._wrap(this._ast?.assignee);
  }

  type(): TypeContext | null {
    return this._propNode(TypeContext, "type");
  }

  /** ANTLR `assignment: type? assignee ASSIGN`. */
  protected override _buildChildren(): Ctx[] {
    return [this.type(), this.assignee()].filter(Boolean) as Ctx[];
  }
}

export class AssigneeContext extends Ctx {
  atom(): any {
    return this._wrap(this._ast?.atom);
  }

  protected override _buildChildren(): Ctx[] {
    const atom = this.atom();
    return atom ? [atom] : [];
  }
}

/* ------------------------------------------------------------------ */
/* Creation                                                             */
/* ------------------------------------------------------------------ */

export class CreationContext extends Ctx {
  creationBody(): CreationBodyContext | null {
    return this._wrap(this._ast?.body);
  }

  braceBlock(): BraceBlockContext | null {
    return this._wrap(this._ast?.braceBlock);
  }

  Assignee(): string | undefined {
    return this.creationBody()?.assignment()?.assignee()?.getFormattedText();
  }

  AssigneePosition(): [number, number] | undefined {
    const assignee = this.creationBody()?.assignment()?.assignee();
    if (!assignee) return undefined;
    return [assignee.start.start, assignee.stop!.stop + 1];
  }

  Constructor(): string | undefined {
    return this.creationBody()?.construct()?.getFormattedText();
  }

  To(): string | undefined {
    return this.Constructor();
  }

  Owner(): string | undefined {
    if (!this.Constructor()) return "Missing Constructor";
    const assignee = this.Assignee();
    const type = this.Constructor();
    return assignee ? `${assignee}:${type}` : type;
  }

  From(): string | undefined {
    if (this.parentCtx instanceof StatContext) {
      return this.ClosestAncestorStat()!.Origin();
    }
    return undefined;
  }

  ParametersText(): string {
    const params = this.creationBody()!.parameters();
    return (params?.parameter()?.length ?? 0) > 0
      ? formatParameters(params!.parameter())
      : "";
  }

  SignatureText(): string {
    const text = this.ParametersText() || "create";
    return `«${text}»`;
  }

  isParamValid(): boolean {
    return (this.creationBody()!.parameters()?.parameter()?.length ?? 0) > 0;
  }

  Assignment(): Assignment | undefined {
    return extractAssignment(this.creationBody()?.assignment() ?? null);
  }

  Statements(): StatContext[] {
    return this.braceBlock()?.block()?.stat() || [];
  }

  Body(): CreationBodyContext | null {
    return this.creationBody();
  }

  isCurrent(cursor: number): boolean {
    return isCurrentImpl(this, cursor);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.creationBody(), this.braceBlock()].filter(Boolean) as Ctx[];
  }
}

export class CreationBodyContext extends Ctx {
  assignment(): AssignmentContext | null {
    return this._wrap(this._ast?.assignment);
  }

  construct(): ConstructContext | null {
    return this._propNode(ConstructContext, "construct");
  }

  parameters(): ParametersContext | null {
    return this._wrap(this._ast?.parameters);
  }

  /** ANTLR `creationBody: assignment? NEW construct (OPAR parameters? CPAR)?`. */
  protected override _buildChildren(): Ctx[] {
    return [this.assignment(), this.construct(), this.parameters()].filter(
      Boolean,
    ) as Ctx[];
  }
}

/* ------------------------------------------------------------------ */
/* Async / return messages                                              */
/* ------------------------------------------------------------------ */

abstract class AbstractAsyncMessageContext extends Ctx {
  content(): ContentContext | null {
    return this._propNode(ContentContext, "content");
  }

  to(): ToContext | null {
    return this._wrap(this._ast?.to);
  }

  from(): FromContext | null {
    return this._wrap(this._ast?.from);
  }

  To(): string | undefined {
    return endpointName(this.to());
  }

  Owner(): string | undefined {
    return this.To() || getOwnerFromAncestor(this.parentCtx);
  }

  ProvidedFrom(): string | undefined {
    return endpointName(this.from());
  }

  From(): string | undefined {
    return this.ProvidedFrom() || this.ClosestAncestorStat()!.Origin();
  }

  SignatureText(): string {
    return this.content()?.getFormattedText() ?? "";
  }

  protected override _buildChildren(): Ctx[] {
    return [this.from(), this.to(), this.content()].filter(Boolean) as Ctx[];
  }
}

export class AsyncMessageContext extends AbstractAsyncMessageContext {}
export class ReturnAsyncMessageContext extends AbstractAsyncMessageContext {}

/* ------------------------------------------------------------------ */
/* Return                                                               */
/* ------------------------------------------------------------------ */

export class RetContext extends Ctx {
  asyncMessage(): AsyncMessageContext | null {
    return this._wrap(this._ast?.asyncMessage);
  }

  returnAsyncMessage(): ReturnAsyncMessageContext | null {
    return this._wrap(this._ast?.returnAsyncMessage);
  }

  expr(): any {
    return this._wrap(this._ast?.expr);
  }

  Signature(): string | undefined {
    return (
      this.asyncMessage()?.content()?.getFormattedText() ||
      this.returnAsyncMessage()?.content()?.getFormattedText() ||
      this.expr()?.getFormattedText()
    );
  }

  SignatureText(): string {
    return (
      this.asyncMessage()?.content()?.getFormattedText() ??
      this.returnAsyncMessage()?.content()?.getFormattedText() ??
      this.expr()?.getFormattedText() ??
      ""
    );
  }

  /** Port of src/parser/RetContext.js ReturnTo() — the hairiest upward walk. */
  ReturnTo(): string | undefined {
    const asyncToCtx =
      this.asyncMessage()?.to() || this.returnAsyncMessage()?.to();
    const asyncTo =
      asyncToCtx?.name?.()?.getFormattedText() ||
      asyncToCtx?.getFormattedText();
    if (asyncTo) return asyncTo;

    const stat = this.parentCtx as Ctx;
    const block = stat.parentCtx as Ctx;
    const blockParent = block.parentCtx as Ctx;
    if (blockParent instanceof ProgContext) {
      return blockParent.Starter();
    }
    let ctx: Ctx | null = blockParent;
    while (
      ctx &&
      !(ctx instanceof MessageContext) &&
      !(ctx instanceof CreationContext)
    ) {
      if (ctx instanceof ProgContext) return ctx.Starter();
      ctx = ctx.parentCtx;
    }
    if (ctx instanceof MessageContext) {
      return (
        ctx.messageBody()?.fromTo()?.from()?.name?.()?.getFormattedText() ||
        ctx.messageBody()?.fromTo()?.from()?.getFormattedText() ||
        ctx.ClosestAncestorStat()!.Origin()
      );
    }
    return (ctx as Ctx).ClosestAncestorStat()!.Origin();
  }

  From(): string | undefined {
    return (
      this.asyncMessage()?.From() ||
      this.returnAsyncMessage()?.From() ||
      this.ClosestAncestorStat()!.Origin()
    );
  }

  To(): string | undefined {
    return this.ReturnTo();
  }

  Owner(): string | undefined {
    return this.To() || getOwnerFromAncestor(this.parentCtx);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.expr(), this.asyncMessage(), this.returnAsyncMessage()].filter(
      Boolean,
    ) as Ctx[];
  }

  /** ANTLR `ret: … asyncMessage EVENT_END? | returnAsyncMessage EVENT_END?`. */
  protected override _trailingEndTypes(): string[] {
    return ["EVENT_END"];
  }
}

/* ------------------------------------------------------------------ */
/* Divider                                                              */
/* ------------------------------------------------------------------ */

export class DividerContext extends Ctx {
  dividerNote(): DividerNoteContext | null {
    const ast = this._ast;
    if (!ast || ast.note === undefined || !ast.$cstNode) return null;
    const cst = GrammarUtils.findNodeForProperty(ast.$cstNode, "note");
    if (!cst) return null;
    return this._synth(
      ast,
      "dividerNote",
      () =>
        new DividerNoteContext(this._doc, null, this, {
          offset: cst.offset,
          end: cst.end,
        }),
    );
  }

  /**
   * v1-compat: THROWS on a parsed note that does not start with `==`
   * (kept for parity through the migration — 07 decide-and-document).
   */
  Note(): string {
    const formattedText = this.dividerNote()?.getFormattedText().trim();
    if (!formattedText || !formattedText.startsWith("==")) {
      throw new Error("Divider note must start with ==");
    }
    return formattedText.replace(/^=+|=+$/g, "");
  }

  protected override _buildChildren(): Ctx[] {
    const note = this.dividerNote();
    return note ? [note] : [];
  }
}

/* ------------------------------------------------------------------ */
/* Fragments                                                            */
/* ------------------------------------------------------------------ */

export class ParExprContext extends Ctx {
  condition(): ConditionContext | null {
    const cond = this._ast?.condition;
    if (!cond) return null;
    return this._synth(
      cond,
      "condition",
      () => new ConditionContext(this._doc, cond, this),
    );
  }

  protected override _buildChildren(): Ctx[] {
    const condition = this.condition();
    return condition ? [condition] : [];
  }
}

export class ConditionContext extends Ctx {
  // _ast is the concrete condition value (Expr | InExpr | TextExpr); this
  // wrapper recreates ANTLR's `condition` rule level. ANTLR's leading
  // direct-`atom` alternative maps to AtomExpr here (10-ast-mapping §5.4):
  // atom() unwraps it, and expr() deliberately excludes it.
  constructor(doc: FacadeDocument, concrete: AstNode, parent: Ctx) {
    super(
      doc,
      concrete,
      parent,
      concrete.$cstNode
        ? { offset: concrete.$cstNode.offset, end: concrete.$cstNode.end }
        : { offset: 0, end: 0 },
    );
  }

  atom(): any {
    if (this._ast?.$type === "AtomExpr") return this._wrap(this._ast.atom);
    return null;
  }

  expr(): any {
    const t = this._ast?.$type;
    if (t === "AtomExpr" || !EXPR_TYPES.has(t)) return null;
    return this._wrap(this._ast);
  }

  inExpr(): InExprContext | null {
    return this._ast?.$type === "InExpr" ? this._wrap(this._ast) : null;
  }

  textExpr(): TextExprContext | null {
    return this._ast?.$type === "TextExpr" ? this._wrap(this._ast) : null;
  }

  protected override _buildChildren(): Ctx[] {
    const child =
      this.atom() ??
      this.expr() ??
      this.inExpr() ??
      this.textExpr() ??
      this._wrap(this._ast);
    return child ? [child] : [];
  }
}

export class InExprContext extends Ctx {}
export class TextExprContext extends Ctx {}

abstract class SingleBlockFragmentContext extends Ctx {
  parExpr(): ParExprContext | null {
    return this._wrap(this._ast?.parExpr);
  }

  braceBlock(): BraceBlockContext | null {
    return this._wrap(this._ast?.braceBlock);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.parExpr(), this.braceBlock()].filter(Boolean) as Ctx[];
  }
}

export class OptContext extends SingleBlockFragmentContext {}
export class ParContext extends SingleBlockFragmentContext {}
export class CriticalContext extends SingleBlockFragmentContext {}

export class LoopContext extends SingleBlockFragmentContext {
  Statements(): StatContext[] {
    return this.braceBlock()?.block()?.stat() || [];
  }
}

export class SectionContext extends Ctx {
  atom(): any {
    return this._wrap(this._ast?.atom);
  }

  braceBlock(): BraceBlockContext | null {
    return this._wrap(this._ast?.braceBlock);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.atom(), this.braceBlock()].filter(Boolean) as Ctx[];
  }
}

export class AltContext extends Ctx {
  ifBlock(): IfBlockContext | null {
    return this._wrap(this._ast?.ifBlock);
  }

  elseIfBlock(i?: number): any {
    const arr = (this._ast.elseIfBlocks ?? []).map((b: any) => this._wrap(b));
    return dual(arr, i);
  }

  elseBlock(): ElseBlockContext | null {
    return this._wrap(this._ast?.elseBlock);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.ifBlock(), ...this.elseIfBlock(), this.elseBlock()].filter(
      Boolean,
    ) as Ctx[];
  }
}

export class IfBlockContext extends Ctx {
  parExpr(): ParExprContext | null {
    return this._wrap(this._ast?.parExpr);
  }

  braceBlock(): BraceBlockContext | null {
    return this._wrap(this._ast?.braceBlock);
  }

  Statements(): StatContext[] {
    return this.braceBlock()?.block()?.stat() || [];
  }

  protected override _buildChildren(): Ctx[] {
    return [this.parExpr(), this.braceBlock()].filter(Boolean) as Ctx[];
  }
}

export class ElseIfBlockContext extends Ctx {
  parExpr(): ParExprContext | null {
    return this._wrap(this._ast?.parExpr);
  }

  braceBlock(): BraceBlockContext | null {
    return this._wrap(this._ast?.braceBlock);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.parExpr(), this.braceBlock()].filter(Boolean) as Ctx[];
  }
}

export class ElseBlockContext extends Ctx {
  braceBlock(): BraceBlockContext | null {
    return this._wrap(this._ast?.braceBlock);
  }

  protected override _buildChildren(): Ctx[] {
    const braceBlock = this.braceBlock();
    return braceBlock ? [braceBlock] : [];
  }
}

export class TcfContext extends Ctx {
  tryBlock(): TryBlockContext | null {
    return this._wrap(this._ast?.tryBlock);
  }

  catchBlock(i?: number): any {
    const arr = (this._ast.catchBlocks ?? []).map((b: any) => this._wrap(b));
    return dual(arr, i);
  }

  finallyBlock(): FinallyBlockContext | null {
    return this._wrap(this._ast?.finallyBlock);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.tryBlock(), ...this.catchBlock(), this.finallyBlock()].filter(
      Boolean,
    ) as Ctx[];
  }
}

export class TryBlockContext extends Ctx {
  braceBlock(): BraceBlockContext | null {
    return this._wrap(this._ast?.braceBlock);
  }

  protected override _buildChildren(): Ctx[] {
    const braceBlock = this.braceBlock();
    return braceBlock ? [braceBlock] : [];
  }
}

export class CatchBlockContext extends Ctx {
  invocation(): InvocationContext | null {
    return this._wrap(this._ast?.invocation);
  }

  braceBlock(): BraceBlockContext | null {
    return this._wrap(this._ast?.braceBlock);
  }

  protected override _buildChildren(): Ctx[] {
    return [this.invocation(), this.braceBlock()].filter(Boolean) as Ctx[];
  }
}

export class FinallyBlockContext extends Ctx {
  braceBlock(): BraceBlockContext | null {
    return this._wrap(this._ast?.braceBlock);
  }

  protected override _buildChildren(): Ctx[] {
    const braceBlock = this.braceBlock();
    return braceBlock ? [braceBlock] : [];
  }
}

export class RefContext extends Ctx {
  name(i?: number): any {
    const arr = this._names();
    return dual(arr, i);
  }

  private _names(): NameContext[] {
    const ast = this._ast;
    if (!ast?.$cstNode || !ast.names?.length) return [];
    return this._synth(ast, "names", () => {
      const csts = GrammarUtils.findNodesForProperty(ast.$cstNode, "names");
      return csts.map(
        (cst: CstNode) =>
          new NameContext(this._doc, null, this, {
            offset: cst.offset,
            end: cst.end,
          }),
      );
    });
  }

  Content(): NameContext | undefined {
    return this.name()[0];
  }

  Participants(): NameContext[] {
    return this.name().slice(1) ?? [];
  }
}

/* ------------------------------------------------------------------ */
/* Expressions                                                          */
/* ------------------------------------------------------------------ */

export class AtomExprContext extends Ctx {
  atom(): any {
    return this._wrap(this._ast?.atom);
  }

  protected override _buildChildren(): Ctx[] {
    const atom = this.atom();
    return atom ? [atom] : [];
  }
}

abstract class UnaryExprContext extends Ctx {
  protected override _buildChildren(): Ctx[] {
    const expr = this._wrap(this._ast?.expr);
    return expr ? [expr] : [];
  }
}

export class UnaryMinusExprContext extends UnaryExprContext {}
export class NotExprContext extends UnaryExprContext {}
export class ParenthesizedExprContext extends UnaryExprContext {}

abstract class BinaryExprContext extends Ctx {
  protected override _buildChildren(): Ctx[] {
    return [this._wrap(this._ast?.left), this._wrap(this._ast?.right)].filter(
      Boolean,
    ) as Ctx[];
  }
}

export class MultiplicationExprContext extends BinaryExprContext {}
export class AdditiveExprContext extends BinaryExprContext {}
export class RelationalExprContext extends BinaryExprContext {}
export class EqualityExprContext extends BinaryExprContext {}
export class AndExprContext extends BinaryExprContext {}
export class OrExprContext extends BinaryExprContext {}

export class FuncExprContext extends Ctx {
  protected override _buildChildren(): Ctx[] {
    return [this._wrap(this._ast?.to), this._wrap(this._ast?.func)].filter(
      Boolean,
    ) as Ctx[];
  }
}

export class CreationExprContext extends Ctx {
  protected override _buildChildren(): Ctx[] {
    const creation = this._wrap(this._ast?.creation);
    return creation ? [creation] : [];
  }
}

export class AssignmentExprContext extends Ctx {
  protected override _buildChildren(): Ctx[] {
    return [
      this._wrap(this._ast?.assignment),
      this._wrap(this._ast?.expr),
    ].filter(Boolean) as Ctx[];
  }
}

/* ------------------------------------------------------------------ */
/* Atoms                                                                */
/* ------------------------------------------------------------------ */

export class NumberAtomContext extends Ctx {}
export class NumberUnitAtomContext extends Ctx {}
export class MoneyAtomContext extends Ctx {}
export class BooleanAtomContext extends Ctx {}
export class NilAtomContext extends Ctx {}
export class StringAtomContext extends Ctx {}

export class IdAtomContext extends Ctx {
  ID(): TerminalView | null {
    return this._propTerminal("value");
  }
}

export class DigitLeadingNameAtomContext extends Ctx {
  DIGIT_LEADING_NAME(): TerminalView | null {
    return this._propTerminal("value");
  }
}

/* ------------------------------------------------------------------ */
/* $type -> facade class dispatch                                       */
/* ------------------------------------------------------------------ */

type CtxClass = new (
  doc: FacadeDocument,
  ast: any,
  parent: Ctx | null,
  span?: Span,
) => Ctx;

const CLASS_BY_TYPE: Record<string, CtxClass> = {
  Prog: ProgContext,
  Title: TitleContext,
  Group: GroupContext,
  Participant: ParticipantContext,
  Stereotype: StereotypeContext,
  Label: LabelContext,
  Emoji: EmojiContext,
  StarterExp: StarterExpContext,
  Block: BlockContext,
  BraceBlock: BraceBlockContext,
  Message: MessageContext,
  MessageBody: MessageBodyContext,
  FromTo: FromToContext,
  From: FromContext,
  To: ToContext,
  Func: FuncContext,
  Signature: SignatureContext,
  MethodName: MethodNameContext,
  Invocation: InvocationContext,
  Parameters: ParametersContext,
  NamedParameter: NamedParameterContext,
  Declaration: DeclarationContext,
  Assignment: AssignmentContext,
  Assignee: AssigneeContext,
  Creation: CreationContext,
  CreationBody: CreationBodyContext,
  AsyncMessage: AsyncMessageContext,
  ReturnAsyncMessage: ReturnAsyncMessageContext,
  Ret: RetContext,
  Divider: DividerContext,
  ParExpr: ParExprContext,
  InExpr: InExprContext,
  TextExpr: TextExprContext,
  Opt: OptContext,
  Par: ParContext,
  Critical: CriticalContext,
  Loop: LoopContext,
  Section: SectionContext,
  Alt: AltContext,
  IfBlock: IfBlockContext,
  ElseIfBlock: ElseIfBlockContext,
  ElseBlock: ElseBlockContext,
  Tcf: TcfContext,
  TryBlock: TryBlockContext,
  CatchBlock: CatchBlockContext,
  FinallyBlock: FinallyBlockContext,
  Ref: RefContext,
  AtomExpr: AtomExprContext,
  UnaryMinusExpr: UnaryMinusExprContext,
  NotExpr: NotExprContext,
  MultiplicationExpr: MultiplicationExprContext,
  AdditiveExpr: AdditiveExprContext,
  RelationalExpr: RelationalExprContext,
  EqualityExpr: EqualityExprContext,
  AndExpr: AndExprContext,
  OrExpr: OrExprContext,
  FuncExpr: FuncExprContext,
  CreationExpr: CreationExprContext,
  ParenthesizedExpr: ParenthesizedExprContext,
  AssignmentExpr: AssignmentExprContext,
  NumberAtom: NumberAtomContext,
  NumberUnitAtom: NumberUnitAtomContext,
  MoneyAtom: MoneyAtomContext,
  BooleanAtom: BooleanAtomContext,
  IdAtom: IdAtomContext,
  DigitLeadingNameAtom: DigitLeadingNameAtomContext,
  StringAtom: StringAtomContext,
  NilAtom: NilAtomContext,
};

/**
 * ANTLR context class NAME -> facade class, for the Stage-3 generated-parser
 * `instanceof` shim (src/parser-langium/instanceof-shim.ts). Keys are derived
 * from string literals (the Langium `$type` + "Context", plus the synthesized
 * kinds that have no `$type`) so they survive identifier minification — the
 * generated parser is referenced by stable property name on both sides.
 */
export const FACADE_CLASS_BY_NAME: Record<string, CtxClass> = {};
for (const [type, cls] of Object.entries(CLASS_BY_TYPE)) {
  FACADE_CLASS_BY_NAME[`${type}Context`] = cls;
}
for (const [name, cls] of Object.entries({
  StatContext,
  NameContext,
  ParticipantTypeContext,
  WidthContext,
  StarterContext,
  ContentContext,
  TypeContext,
  ConstructContext,
  DividerNoteContext,
})) {
  FACADE_CLASS_BY_NAME[name] = cls as CtxClass;
}

class GenericContext extends Ctx {}

export function wrapAst(
  doc: FacadeDocument,
  ast: AstNode,
  parent: Ctx | null,
): Ctx {
  const cached = doc.nodeCache.get(ast);
  if (cached) return cached;
  const cls = CLASS_BY_TYPE[(ast as any).$type] ?? GenericContext;
  const node = new cls(doc, ast, parent);
  doc.nodeCache.set(ast, node);
  return node;
}

/* ------------------------------------------------------------------ */
/* Root builders                                                        */
/* ------------------------------------------------------------------ */

export function buildRootFacade(
  value: AstNode | undefined,
  code: string,
): ProgContext {
  const doc = new FacadeDocument(value, code);
  if (value) return wrapAst(doc, value, null) as ProgContext;
  // Defensive: parseZen always yields a value object; an empty Prog facade
  // mirrors ANTLR's empty-input ProgContext.
  return new ProgContext(
    doc,
    { $type: "Prog", headElements: [] } as unknown as AstNode,
    null,
    { offset: 0, end: 0 },
  );
}

/** Wrap a sub-rule parse result (ContextsFixture entry points). */
export function buildSubRuleFacade(
  value: AstNode | undefined,
  code: string,
  opts?: { statWrapper?: boolean },
): any {
  const doc = new FacadeDocument(value, code);
  if (!value) return new GenericContext(doc, null, null, { offset: 0, end: 0 });
  if (opts?.statWrapper) return new StatContext(doc, value, null);
  return wrapAst(doc, value, null);
}
