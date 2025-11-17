/**
 * Server-side layout pass that mirrors the per-pixel measurements the browser would
 * normally perform. The goal is to deterministically derive the vertical positions
 * of every statement (messages, fragments, dividers, etc.) using only parser context
 * and Theme metrics so that Playwright or any other DOM engine is no longer needed
 * in rendering tests.
 */
import { WidthFunc } from "@/positioning/Coordinate";
import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";
import {
  getLayoutMetrics,
  LayoutMetrics,
  ThemeName,
} from "@/positioning/vertical/LayoutMetrics";
import {
  createStatementKey,
  StatementKey,
} from "@/positioning/vertical/StatementIdentifier";
import {
  StatementAnchor,
  StatementKind,
} from "@/positioning/vertical/StatementTypes";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";

/**
 * Cached measurements for one statement. `top` is relative to the block that
 * owns the statement and `height` is the total vertical span. `anchors` exposes
 * important vertical reference points (message line, occurrence top, etc.) so
 * consumers can align other layers, while `meta` carries debugging telemetry to
 * cross-check browser results.
 */
interface StatementCoordinate {
  top: number;
  height: number;
  kind: StatementKind;
  anchors?: Partial<Record<StatementAnchor, number>>;
  meta?: Record<string, number>;
}

/**
 * Constructor parameters required to detach layout from the browser. We feed the
 * parser root context, a text width measuring function (mirroring canvas measureText
 * in the browser), the theme-driven spacing metrics, and the participant ordering so
 * async fragment traversals can infer their origin.
 */
interface VerticalCoordinatesOptions {
  rootContext: any;
  widthProvider: WidthFunc;
  theme?: ThemeName;
  originParticipant: string;
  participantOrder: string[];
}

/** Lightweight descriptor used while measuring alt/loop fragments. */
interface FragmentBranch {
  block?: any;
  conditionHeight?: number;
}

/**
 * Walks the parsed AST and deterministically assigns vertical coordinates to every
 * statement. The recursion mirrors how the renderer stacks statements inside blocks
 * and fragments so the resulting heights match what Playwright would capture from
 * the DOM.
 */
export class VerticalCoordinates {
  private readonly metrics: LayoutMetrics;
  private readonly statementMap = new Map<StatementKey, StatementCoordinate>();
  private readonly markdownMeasurer: MarkdownMeasurer;
  private readonly creationTopByParticipant = new Map<string, number>();
  private readonly rootBlock: any;
  private readonly rootOrigin: string;
  private readonly participantOrder: string[];
  readonly totalHeight: number;

  /**
   * Small offsets that compensate for DOM specific margins when starting a
   * statement. These were empirically derived by diffing Playwright screenshots
   * and ensure fragment headers overlap the same pixels server-side.
   */
  private static readonly statementCursorOffsets: Partial<
    Record<StatementKind, number>
  > = {
    loop: 1,
    tcf: -2,
    par: -1,
    opt: -3,
  };

  /**
   * Similar to `statementCursorOffsets`, but applied to the measured height to
   * emulate subtle DOM rounding differences (e.g. fragments with borders).
   */
  private static readonly statementHeightOffsets: Partial<
    Record<StatementKind, number>
  > = {
    alt: 2,
    loop: -5,
    tcf: -3,
    par: 3,
    opt: 2,
  };

  /**
   * Build the measurement helpers up-front and immediately walk the root block so
   * that `totalHeight` and the internal lookup tables are populated for callers.
   */
  constructor(options: VerticalCoordinatesOptions) {
    this.metrics = getLayoutMetrics(options.theme);
    this.markdownMeasurer = new MarkdownMeasurer(
      this.metrics,
      options.widthProvider,
    );
    this.rootBlock = options.rootContext?.block?.() ?? options.rootContext;
    this.rootOrigin = options.originParticipant || _STARTER_;
    this.participantOrder = options.participantOrder;
    const start = this.metrics.messageLayerPaddingTop;
    const end = this.layoutBlock(this.rootBlock, start, this.rootOrigin);
    this.totalHeight = end + this.metrics.messageLayerPaddingBottom;
  }

  getStatementTop(keyOrCtx: StatementKey | any): number | undefined {
    const key =
      typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.top;
  }

  getStatementHeight(keyOrCtx: StatementKey | any): number | undefined {
    const key =
      typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.height;
  }

  getStatementAnchors(
    keyOrCtx: StatementKey | any,
  ): Partial<Record<StatementAnchor, number>> | undefined {
    const key =
      typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.anchors;
  }

  getCreationTop(participant: string): number | undefined {
    return this.creationTopByParticipant.get(participant);
  }

  getMessageLayerPaddingTop(): number {
    return this.metrics.messageLayerPaddingTop;
  }

  getStatementMarginTop(): number {
    return this.metrics.statementMarginTop;
  }

  getLifelineLayerPaddingTop(): number {
    return this.metrics.lifelineLayerPaddingTop;
  }

  entries() {
    return Array.from(this.statementMap.entries());
  }

  /**
   * Recursively walks the statements inside a block, applying the same stacking
   * logic as the renderer. The method maintains a `cursor` that mimics DOM flow
   * layout: add margin, measure the statement, push the cursor by its height,
   * insert spacing, and finally add trailing block-specific padding.
   */
  private layoutBlock(
    blockContext: any,
    startTop: number,
    origin: string,
  ): number {
    if (!blockContext) {
      return startTop;
    }
    const statements: any[] = blockContext?.stat?.() || [];
    if (!statements.length) {
      return startTop;
    }
    let cursor = startTop + this.metrics.statementMarginTop;
    let lastKind: StatementKind | undefined;
    statements.forEach((stat, index) => {
      const key = createStatementKey(stat);
      if (
        typeof window !== "undefined" &&
        (window as any).__ZEN_CAPTURE_VERTICAL
      ) {
        const debugBlocks =
          (window as any).__zenumlBlockDebug ||
          ((window as any).__zenumlBlockDebug = []);
        debugBlocks.push({
          key,
          startTop,
          cursorStart: cursor,
          kind: this.resolveKind(stat),
          origin,
          index,
          count: statements.length,
        });
      }
      const kind = this.resolveKind(stat);
      const cursorOffset =
        VerticalCoordinates.statementCursorOffsets[kind] ?? 0;
      const adjustedCursor = cursor + cursorOffset;
      lastKind = kind;
      const coordinate = this.measureStatement(
        stat,
        adjustedCursor,
        kind,
        origin,
      );
      const heightOffset =
        VerticalCoordinates.statementHeightOffsets[kind] ?? 0;
      if (heightOffset) {
        coordinate.height += heightOffset;
      }
      this.statementMap.set(key, coordinate);
      cursor = coordinate.top + coordinate.height;
      if (index < statements.length - 1) {
        cursor += this.metrics.statementGap;
      }
    });
    const bottomMargin =
      lastKind === "return"
        ? this.metrics.returnStatementMarginBottom
        : this.metrics.statementMarginBottom;
    cursor += bottomMargin;
    return cursor;
  }

  /**
   * Infers the semantic classification of a statement based on which optional
   * parser methods return a value. This keeps the measuring logic independent
   * from the concrete antlr-generated types.
   */
  private resolveKind(stat: any): StatementKind {
    if (stat.loop()) return "loop";
    if (stat.alt()) return "alt";
    if (stat.par()) return "par";
    if (stat.opt()) return "opt";
    if (stat.section()) return "section";
    if (stat.critical()) return "critical";
    if (stat.tcf()) return "tcf";
    if (stat.ref()) return "ref";
    if (stat.creation()) return "creation";
    if (stat.message()) return "sync";
    if (stat.asyncMessage()) return "async";
    if (stat.divider()) return "divider";
    return "return";
  }

  /** Returns true if the statement lives inside any fragment (alt/loop/... ). */
  private isInsideFragment(stat: any): boolean {
    let parent = stat?.parentCtx;
    while (parent) {
      if (typeof parent.alt === "function" && parent.alt()) {
        return true;
      }
      if (typeof parent.loop === "function" && parent.loop()) {
        return true;
      }
      if (typeof parent.par === "function" && parent.par()) {
        return true;
      }
      if (typeof parent.opt === "function" && parent.opt()) {
        return true;
      }
      if (typeof parent.section === "function" && parent.section()) {
        return true;
      }
      if (typeof parent.critical === "function" && parent.critical()) {
        return true;
      }
      if (typeof parent.tcf === "function" && parent.tcf()) {
        return true;
      }
      parent = parent.parentCtx;
    }
    return false;
  }

  /**
   * Creation messages inherit additional padding when rendered under ALTs or
   * try/catch blocks. Instead of re-implementing the entire CSS cascade we just
   * add empirically measured offsets here based on the ancestor contexts.
   */
  private getCreationAnchorOffset(stat: any): number {
    let offset = 0;
    let parent = stat?.parentCtx;
    let appliedAlt = false;
    let appliedTcf = false;
    while (parent) {
      if (
        !appliedAlt &&
        this.altHasMultipleBranches(parent) &&
        !this.isRootLevelStatement(parent)
      ) {
        offset += this.metrics.creationAltBranchOffset;
        appliedAlt = true;
      }
      if (!appliedTcf && this.isWithinTcfTrySegment(parent, stat)) {
        offset += this.metrics.creationTcfSegmentOffset;
        appliedTcf = true;
      }
      parent = parent.parentCtx;
    }
    return offset;
  }

  private getCreationAltBranchInset(stat: any): number {
    const inset = this.metrics.creationAltBranchInset || 0;
    if (!inset) {
      return 0;
    }
    let parent = stat?.parentCtx;
    while (parent) {
      if (this.altHasMultipleBranches(parent)) {
        return inset;
      }
      parent = parent.parentCtx;
    }
    return 0;
  }

  /** Helper that matches the DOM behavior where creation arrows shift when ALT has >1 branch. */
  private altHasMultipleBranches(ctx: any): boolean {
    if (typeof ctx.alt !== "function") {
      return false;
    }
    const altContext = ctx.alt();
    if (!altContext) {
      return false;
    }
    const elseIfBlocks = altContext?.elseIfBlock?.() || [];
    const hasElse = Boolean(altContext?.elseBlock?.());
    return elseIfBlocks.length > 0 || hasElse;
  }

  /** True when the statement sits inside the `try` segment of a try/catch/finally fragment. */
  private isWithinTcfTrySegment(parent: any, stat: any): boolean {
    if (typeof parent.tcf !== "function") {
      return false;
    }
    const tcfContext = parent.tcf();
    if (!tcfContext) {
      return false;
    }
    const tryBlock = tcfContext?.tryBlock?.()?.braceBlock?.()?.block?.();
    if (!tryBlock) {
      return false;
    }
    return this.isAncestorOf(tryBlock, stat);
  }

  /** Cheap pointer-identity ancestry check that mirrors antlr parentCtx traversal. */
  private isAncestorOf(target: any, maybeDescendant: any): boolean {
    let current = maybeDescendant;
    while (current) {
      if (current === target) {
        return true;
      }
      current = current.parentCtx;
    }
    return false;
  }

  /** Sections render slightly differently, so we track them separately. */
  private isSectionFragment(ctx: any): boolean {
    return typeof ctx.section === "function" && ctx.section();
  }

  private isRootLevelStatement(statCtx: any): boolean {
    const block = statCtx?.parentCtx;
    return block === this.rootBlock;
  }

  /** True when the statement is the first child within its parent block. */
  private isFirstStatement(statCtx: any): boolean {
    const block = statCtx?.parentCtx;
    const statements: any[] = block?.stat?.() || [];
    return statements.length > 0 && statements[0] === statCtx;
  }

  /**
   * Returns an additional offset when the creation arrow lives inside a SECTION
   * fragment. The DOM applies extra padding there to keep the dashed borders in
   * sync with the message head.
   */
  private getCreationVisualAdjustment(stat: any): number {
    let parent = stat?.parentCtx;
    while (parent) {
      if (this.isSectionFragment(parent)) {
        return this.metrics.creationSectionOffset;
      }
      parent = parent.parentCtx;
    }
    return 0;
  }

  /** Central dispatcher that routes each grammar node to the correct measuring routine. */
  private measureStatement(
    stat: any,
    top: number,
    kind: StatementKind,
    origin: string,
  ): StatementCoordinate {
    switch (kind) {
      case "creation":
        return this.measureCreation(stat, top);
      case "sync":
        return this.measureSync(stat, top);
      case "async":
        return this.measureAsync(stat, top, origin);
      case "divider":
        return this.measureDivider(stat, top);
      case "return":
        return this.measureReturn(stat, top);
      case "loop":
      case "opt":
      case "section":
      case "critical":
        return this.measureSingleBlockFragment(stat, top, kind, origin);
      case "tcf":
        return this.measureTryCatchFinally(stat, top, origin);
      case "alt":
        return this.measureAlt(stat, top, origin);
      case "par":
        return this.measurePar(stat, top, origin);
      case "ref":
        return this.measureRef(stat, top);
      default:
        return { top, height: 0, kind };
    }
  }

  /**
   * Creation arrows are special because they mint the target participant and can
   * optionally carry assignments. We therefore split the measurement into the
   * comment, the arrow itself, its inline occurrence block, and an optional
   * return arrow, tracking anchor offsets for later use.
   */
  private measureCreation(stat: any, top: number): StatementCoordinate {
    const creation = stat.creation();
    const commentHeight = this.measureComment(creation);
    const messageTop = top + commentHeight;
    const messageHeight = this.metrics.creationMessageHeight;
    const occurrenceTop = messageTop + messageHeight;
    const target = creation?.Owner?.();
    const occurrenceHeight = this.measureOccurrence(
      creation,
      occurrenceTop,
      target,
      undefined,
      this.metrics.creationOccurrenceContentInset,
    );
    const assignment = creation?.creationBody?.()?.assignment?.();
    const anchors: StatementCoordinate["anchors"] = {
      message: messageTop,
      occurrence: occurrenceTop,
    };
    let height = commentHeight + messageHeight + occurrenceHeight;
    if (assignment) {
      anchors.return = occurrenceTop + occurrenceHeight;
      height += this.metrics.returnMessageHeight;
    }
    const anchorAdjustment = this.getCreationAnchorOffset(stat);
    const rawAltBranchInset = this.getCreationAltBranchInset(stat);
    const altBranchInset = anchorAdjustment === 0 ? rawAltBranchInset : 0;
    if (altBranchInset) {
      anchors.message! += altBranchInset;
      anchors.occurrence! += altBranchInset;
      if (anchors.return != null) {
        anchors.return += altBranchInset;
      }
    }
    const visualAdjustment = this.getCreationVisualAdjustment(stat);
    const assignmentAdjustment =
      assignment &&
      this.isRootLevelStatement(stat) &&
      !this.isFirstStatement(stat)
        ? this.metrics.creationAssignmentOffset
        : 0;
    const totalAdjustment = visualAdjustment + assignmentAdjustment;
    if (totalAdjustment) {
      anchors.message! -= totalAdjustment;
      anchors.occurrence! -= totalAdjustment;
      if (anchors.return != null) {
        anchors.return -= totalAdjustment;
      }
    }
    if (target) {
      const prevTop = this.creationTopByParticipant.get(target);
      const anchorTop = anchors.message! + anchorAdjustment;
      if (prevTop == null || anchorTop < prevTop) {
        this.creationTopByParticipant.set(target, anchorTop);
        console.debug(
          "[VerticalCoordinates] creation anchor",
          target,
          anchorTop,
        );
      }
    }
    const adjustedTop = top - totalAdjustment;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      messageHeight,
      occurrenceHeight,
      returnHeight: assignment ? this.metrics.returnMessageHeight : 0,
      anchorAdjustment,
      visualAdjustment,
      assignmentAdjustment: assignment
        ? assignmentAdjustment
        : 0,
      altBranchInset,
    };
    return { top: adjustedTop, height, kind: "creation", anchors, meta };
  }

  /** Measures synchronous messages and their occurrence blocks (if present). */
  private measureSync(stat: any, top: number): StatementCoordinate {
    const messageContext = stat.message();
    const commentHeight = this.measureComment(messageContext);
    const messageTop = top + commentHeight;
    const source = messageContext?.From?.() || _STARTER_;
    const target = messageContext?.Owner?.() || _STARTER_;
    const isSelf = source === target;
    const messageHeight = isSelf
      ? this.metrics.selfInvocationHeight
      : this.metrics.messageHeight;
    const occurrenceTop = messageTop + messageHeight;
    const insideFragment = this.isInsideFragment(stat);
    const minOccurrenceHeight =
      insideFragment && !messageContext?.braceBlock?.()?.block?.()
        ? this.metrics.fragmentOccurrenceMinHeight
        : this.metrics.occurrenceMinHeight;
    const occurrenceHeight = this.measureOccurrence(
      messageContext,
      occurrenceTop,
      target,
      minOccurrenceHeight,
    );
    const assignee = messageContext?.Assignment?.()?.getText?.();
    const anchors: StatementCoordinate["anchors"] = {
      message: messageTop,
      occurrence: occurrenceTop,
    };
    let height = commentHeight + messageHeight + occurrenceHeight;
    if (assignee && !isSelf) {
      anchors.return = occurrenceTop + occurrenceHeight;
      height += this.metrics.returnMessageHeight;
    }
    if (commentHeight) {
      anchors.comment = top;
    }
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      messageHeight,
      occurrenceHeight,
      returnHeight: assignee && !isSelf ? this.metrics.returnMessageHeight : 0,
    };
    return { top, height, kind: "sync", anchors, meta };
  }

  /** Async arrows never spawn occurrences, so we only care about the arrow height plus comments. */
  private measureAsync(
    stat: any,
    top: number,
    origin: string,
  ): StatementCoordinate {
    const asyncContext = stat.asyncMessage();
    const commentHeight = this.measureComment(asyncContext);
    const messageTop = top + commentHeight;
    const source =
      asyncContext?.From?.() ||
      asyncContext?.ProvidedFrom?.() ||
      asyncContext?.Origin?.() ||
      origin;
    const target =
      asyncContext?.Owner?.() ||
      asyncContext?.to?.()?.getFormattedText?.() ||
      source;
    const isSelf = source === target;
    const messageHeight = isSelf
      ? this.metrics.selfAsyncHeight
      : this.metrics.asyncMessageHeight;
    const anchors: StatementCoordinate["anchors"] = { message: messageTop };
    if (commentHeight) {
      anchors.comment = top;
    }
    const height = commentHeight + messageHeight;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      messageHeight,
      isSelf: isSelf ? 1 : 0,
    };
    return { top, height, kind: "async", anchors, meta };
  }

  /** Mirrors the simple dotted return lines rendered above occurrences. */
  private measureReturn(stat: any, top: number): StatementCoordinate {
    const context = stat.ret();
    const commentHeight = this.measureComment(context);
    const messageTop = top + commentHeight;
    const anchors: StatementCoordinate["anchors"] = { message: messageTop };
    if (commentHeight) {
      anchors.comment = top;
    }
    const height = commentHeight + this.metrics.returnMessageHeight;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      messageHeight: this.metrics.returnMessageHeight,
    };
    return { top, height, kind: "return", anchors, meta };
  }

  /** Dividers are fixed height boxes. */
  private measureDivider(stat: any, top: number): StatementCoordinate {
    const dividerHeight = this.metrics.dividerHeight;
    return { top, height: dividerHeight, kind: "divider" };
  }

  /** Handles loop/opt/section/critical fragments that wrap a single block. */
  private measureSingleBlockFragment(
    stat: any,
    top: number,
    kind: StatementKind,
    origin: string,
  ): StatementCoordinate {
    const fragmentContext =
      stat[kind]?.() ||
      stat.loop?.() ||
      stat.opt?.() ||
      stat.section?.() ||
      stat.critical?.();
    const commentHeight = this.measureComment(fragmentContext);
    const headerHeight = this.metrics.fragmentHeaderHeight;
    const hasCondition = Boolean(fragmentContext?.parExpr?.()?.condition?.());
    const conditionHeight = hasCondition
      ? this.metrics.fragmentConditionHeight
      : 0;
    let cursor =
      top + commentHeight + headerHeight + this.metrics.fragmentBodyGap;
    if (hasCondition) {
      cursor += conditionHeight;
    }
    const block = fragmentContext?.braceBlock?.()?.block?.();
    const leftParticipant = this.findLeftParticipant(fragmentContext) || origin;
    const blockEnd = this.layoutBlock(block, cursor, leftParticipant);
    cursor = blockEnd;
    cursor += this.metrics.fragmentPaddingBottom;
    const height = cursor - top;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      headerHeight,
      bodyGap: this.metrics.fragmentBodyGap,
      conditionHeight,
      paddingBottom: this.metrics.fragmentPaddingBottom,
    };
    return { top, height, kind, meta };
  }

  /** Measures ALT fragments by iterating each branch sequentially, respecting gaps/conditions. */
  private measureAlt(
    stat: any,
    top: number,
    origin: string,
  ): StatementCoordinate {
    const alt = stat.alt();
    const commentHeight = this.measureComment(alt);
    const headerHeight = this.metrics.fragmentHeaderHeight;
    let cursor =
      top + commentHeight + headerHeight + this.metrics.fragmentBodyGap;
    const leftParticipant = this.findLeftParticipant(alt) || origin;
    const branches: FragmentBranch[] = [];
    const ifBlock = alt?.ifBlock();
    if (ifBlock) {
      branches.push({
        block: ifBlock.braceBlock()?.block(),
        conditionHeight: this.metrics.fragmentConditionHeight,
      });
    }
    alt?.elseIfBlock?.()?.forEach((block: any) => {
      branches.push({
        block: block?.braceBlock?.()?.block?.(),
        conditionHeight: this.metrics.fragmentConditionHeight,
      });
    });
    const elseBlock = alt?.elseBlock?.()?.braceBlock?.()?.block?.();
    if (elseBlock) {
      branches.push({
        block: elseBlock,
        conditionHeight: this.metrics.fragmentElseLabelHeight,
      });
    }
    let conditionedBranches = 0;
    let totalConditionHeight = 0;
    branches.forEach((branch, index) => {
      if (branch.conditionHeight) {
        cursor += branch.conditionHeight;
        conditionedBranches += 1;
        totalConditionHeight += branch.conditionHeight;
      }
      const branchEnd = this.layoutBlock(branch.block, cursor, leftParticipant);
      cursor = branchEnd;
      if (index < branches.length - 1) {
        cursor += this.metrics.fragmentBranchGap;
      }
    });
    cursor += this.metrics.fragmentPaddingBottom;
    const height = cursor - top;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      headerHeight,
      bodyGap: this.metrics.fragmentBodyGap,
      branchGap: this.metrics.fragmentBranchGap,
      paddingBottom: this.metrics.fragmentPaddingBottom,
      branchCount: branches.length,
      conditionedBranches,
      conditionHeight: totalConditionHeight,
    };
    return { top, height, kind: "alt", meta };
  }

  /** PAR fragments behave like a single block with optional condition header. */
  private measurePar(
    stat: any,
    top: number,
    origin: string,
  ): StatementCoordinate {
    const par = stat.par();
    const commentHeight = this.measureComment(par);
    const headerHeight = this.metrics.fragmentHeaderHeight;
    let cursor =
      top + commentHeight + headerHeight + this.metrics.fragmentBodyGap;
    if (par?.parExpr?.()?.condition?.()) {
      cursor += this.metrics.fragmentConditionHeight;
    }
    const block = par?.braceBlock?.()?.block?.();
    const leftParticipant = this.findLeftParticipant(par) || origin;
    const blockEnd = this.layoutBlock(block, cursor, leftParticipant);
    cursor = blockEnd + this.metrics.fragmentPaddingBottom;
    const height = cursor - top;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      headerHeight,
      bodyGap: this.metrics.fragmentBodyGap,
      conditionHeight: par?.parExpr?.()?.condition?.()
        ? this.metrics.fragmentConditionHeight
        : 0,
      paddingBottom: this.metrics.fragmentPaddingBottom,
    };
    return { top, height, kind: "par", meta };
  }

  /** External references are rendered as header-only fragments. */
  private measureRef(stat: any, top: number): StatementCoordinate {
    const commentHeight = this.measureComment(stat.ref?.());
    const padding = this.metrics.fragmentPaddingBottom;
    const headerHeight = this.metrics.fragmentHeaderHeight;
    const height = commentHeight + headerHeight + padding;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      headerHeight,
      paddingBottom: padding,
    };
    return { top, height, kind: "ref", meta };
  }

  /** Dedicated routine for try/catch/finally because each segment has its own header. */
  private measureTryCatchFinally(
    stat: any,
    top: number,
    origin: string,
  ): StatementCoordinate {
    const tcf = stat.tcf();
    const commentHeight = this.measureComment(tcf);
    const headerHeight = this.metrics.fragmentHeaderHeight;
    const leftParticipant = this.findLeftParticipant(tcf) || origin;
    let cursor =
      top + commentHeight + headerHeight + this.metrics.fragmentBodyGap;

    const tryBlock = tcf?.tryBlock?.()?.braceBlock?.()?.block?.();
    if (tryBlock) {
      cursor = this.layoutBlock(tryBlock, cursor, leftParticipant);
    }

    const catchBlocks = tcf?.catchBlock?.() || [];
    catchBlocks.forEach((catchBlock: any) => {
      cursor += this.metrics.fragmentBranchGap;
      cursor += this.metrics.tcfSegmentHeaderHeight;
      const block = catchBlock?.braceBlock?.()?.block?.();
      cursor = this.layoutBlock(block, cursor, leftParticipant);
    });

    const finallyBlock = tcf?.finallyBlock?.()?.braceBlock?.()?.block?.();
    if (finallyBlock) {
      cursor += this.metrics.fragmentBranchGap;
      cursor += this.metrics.tcfSegmentHeaderHeight;
      cursor = this.layoutBlock(finallyBlock, cursor, leftParticipant);
    }

    cursor += this.metrics.fragmentPaddingBottom;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      headerHeight,
      bodyGap: this.metrics.fragmentBodyGap,
      branchGap: this.metrics.fragmentBranchGap,
      paddingBottom: this.metrics.fragmentPaddingBottom,
      tryBlock: tryBlock ? 1 : 0,
      catchBlocks: catchBlocks.length,
      finallyBlock: finallyBlock ? 1 : 0,
    };
    return { top, height: cursor - top, kind: "tcf", meta };
  }

  /**
   * Mirrors the renderer heuristic for determining which participant anchors the
   * fragment header. We prefer the leftmost participant in the scene order so
   * nested fragments align consistently.
   */
  private findLeftParticipant(ctx: any): string | undefined {
    if (!ctx) return undefined;
    const local = getLocalParticipantNames(ctx) || [];
    return (
      this.participantOrder.find((name) => local.includes(name)) ||
      local[0] ||
      undefined
    );
  }

  /**
   * Measures the block nested under a message (the gray activation bar). We
   * recursively layout the nested block starting above the actual occurrence so
   * the measured height matches the DOM inset padding.
   */
  private measureOccurrence(
    context: any,
    top: number,
    participant?: string,
    minHeight = this.metrics.occurrenceMinHeight,
    contentInset = this.metrics.occurrenceContentInset,
  ): number {
    const block = context?.braceBlock?.()?.block?.();
    if (!block) {
      return minHeight;
    }
    const inset = contentInset ?? this.metrics.occurrenceContentInset;
    const offset = this.metrics.statementMarginTop - inset;
    const blockStart = top - offset;
    const blockEnd = this.layoutBlock(
      block,
      blockStart,
      participant || this.rootOrigin,
    );
    const height = blockEnd - blockStart - offset;
    return Math.max(minHeight, height);
  }

  /** Delegates markdown comment height measurement so statements can offset properly. */
  private measureComment(context: any): number {
    if (!context?.getComment) {
      return 0;
    }
    return this.markdownMeasurer.measure(context.getComment());
  }
}
