import { WidthFunc } from "@/positioning/Coordinate";
import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";
import {
  DEFAULT_LAYOUT_METRICS,
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

interface StatementCoordinate {
  top: number;
  height: number;
  kind: StatementKind;
  anchors?: Partial<Record<StatementAnchor, number>>;
}

interface VerticalCoordinatesOptions {
  rootContext: any;
  widthProvider: WidthFunc;
  theme?: ThemeName;
  originParticipant: string;
  participantOrder: string[];
}

interface FragmentBranch {
  block?: any;
  conditioned?: boolean;
}

export class VerticalCoordinates {
  private readonly metrics: LayoutMetrics;
  private readonly statementMap = new Map<StatementKey, StatementCoordinate>();
  private readonly markdownMeasurer: MarkdownMeasurer;
  private readonly creationTopByParticipant = new Map<string, number>();
  private readonly rootBlock: any;
  private readonly rootOrigin: string;
  private readonly participantOrder: string[];
  readonly totalHeight: number;

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
    const key = typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.top;
  }

  getStatementHeight(keyOrCtx: StatementKey | any): number | undefined {
    const key = typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.height;
  }

  getStatementAnchors(
    keyOrCtx: StatementKey | any,
  ): Partial<Record<StatementAnchor, number>> | undefined {
    const key = typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.anchors;
  }

  getCreationTop(participant: string): number | undefined {
    return this.creationTopByParticipant.get(participant);
  }

  entries() {
    return Array.from(this.statementMap.entries());
  }

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
    statements.forEach((stat, index) => {
      const key = createStatementKey(stat);
      const kind = this.resolveKind(stat);
      const coordinate = this.measureStatement(stat, cursor, kind, origin);
      this.statementMap.set(key, coordinate);
      cursor += coordinate.height;
      if (index < statements.length - 1) {
        cursor += this.metrics.statementGap;
      }
    });
    cursor += this.metrics.statementMarginBottom;
    return cursor;
  }

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
      case "tcf":
        return this.measureSingleBlockFragment(stat, top, kind, origin);
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
    if (target) {
      const prevTop = this.creationTopByParticipant.get(target);
      const anchorTop = anchors.message!;
      if (prevTop == null || anchorTop < prevTop) {
        this.creationTopByParticipant.set(target, anchorTop);
      }
    }
    return { top, height, kind: "creation", anchors };
  }

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
    const occurrenceHeight = this.measureOccurrence(
      messageContext,
      occurrenceTop,
      target,
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
    return { top, height, kind: "sync", anchors };
  }

  private measureAsync(
    stat: any,
    top: number,
    origin: string,
  ): StatementCoordinate {
    const asyncContext = stat.asyncMessage();
    const commentHeight = this.measureComment(asyncContext);
    const messageTop = top + commentHeight;
    const source =
      asyncContext?.ProvidedFrom?.() || asyncContext?.Origin?.() || origin;
    const target = asyncContext?.to?.()?.getFormattedText?.() || source;
    const isSelf = source === target;
    const messageHeight = isSelf
      ? this.metrics.selfAsyncHeight
      : this.metrics.asyncMessageHeight;
    const anchors: StatementCoordinate["anchors"] = { message: messageTop };
    if (commentHeight) {
      anchors.comment = top;
    }
    const height = commentHeight + messageHeight;
    return { top, height, kind: "async", anchors };
  }

  private measureReturn(stat: any, top: number): StatementCoordinate {
    const context = stat.ret();
    const commentHeight = this.measureComment(context);
    const messageTop = top + commentHeight;
    const anchors: StatementCoordinate["anchors"] = { message: messageTop };
    if (commentHeight) {
      anchors.comment = top;
    }
    const height = commentHeight + this.metrics.returnMessageHeight;
    return { top, height, kind: "return", anchors };
  }

  private measureDivider(stat: any, top: number): StatementCoordinate {
    const dividerHeight = this.metrics.dividerHeight;
    return { top, height: dividerHeight, kind: "divider" };
  }

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
      stat.critical?.() ||
      stat.tcf?.();
    const commentHeight = this.measureComment(fragmentContext);
    const headerHeight = this.metrics.fragmentHeaderHeight;
    let cursor = top + commentHeight + headerHeight + this.metrics.fragmentBodyGap;
    if (fragmentContext?.parExpr?.()?.condition?.()) {
      cursor += this.metrics.fragmentConditionHeight;
    }
    const block = fragmentContext?.braceBlock?.()?.block?.();
    const leftParticipant = this.findLeftParticipant(fragmentContext) || origin;
    const blockEnd = this.layoutBlock(block, cursor, leftParticipant);
    cursor = blockEnd;
    cursor += this.metrics.fragmentPaddingBottom;
    const height = cursor - top;
    return { top, height, kind };
  }

  private measureAlt(stat: any, top: number, origin: string): StatementCoordinate {
    const alt = stat.alt();
    const commentHeight = this.measureComment(alt);
    const headerHeight = this.metrics.fragmentHeaderHeight;
    let cursor = top + commentHeight + headerHeight + this.metrics.fragmentBodyGap;
    const leftParticipant = this.findLeftParticipant(alt) || origin;
    const branches: FragmentBranch[] = [];
    const ifBlock = alt?.ifBlock();
    if (ifBlock) {
      branches.push({ block: ifBlock.braceBlock()?.block(), conditioned: true });
    }
    alt?.elseIfBlock?.()?.forEach((block: any) => {
      branches.push({ block: block?.braceBlock?.()?.block?.(), conditioned: true });
    });
    const elseBlock = alt?.elseBlock?.()?.braceBlock?.()?.block?.();
    if (elseBlock) {
      branches.push({ block: elseBlock, conditioned: true });
    }
    branches.forEach((branch, index) => {
      if (branch.conditioned) {
        cursor += this.metrics.fragmentConditionHeight;
      }
      const branchEnd = this.layoutBlock(
        branch.block,
        cursor,
        leftParticipant,
      );
      cursor = branchEnd;
      if (index < branches.length - 1) {
        cursor += this.metrics.fragmentBranchGap;
      }
    });
    cursor += this.metrics.fragmentPaddingBottom;
    const height = cursor - top;
    return { top, height, kind: "alt" };
  }

  private measurePar(stat: any, top: number, origin: string): StatementCoordinate {
    const par = stat.par();
    const commentHeight = this.measureComment(par);
    const headerHeight = this.metrics.fragmentHeaderHeight;
    let cursor = top + commentHeight + headerHeight + this.metrics.fragmentBodyGap;
    if (par?.parExpr?.()?.condition?.()) {
      cursor += this.metrics.fragmentConditionHeight;
    }
    const block = par?.braceBlock?.()?.block?.();
    const leftParticipant = this.findLeftParticipant(par) || origin;
    const blockEnd = this.layoutBlock(block, cursor, leftParticipant);
    cursor = blockEnd + this.metrics.fragmentPaddingBottom;
    const height = cursor - top;
    return { top, height, kind: "par" };
  }

  private measureRef(stat: any, top: number): StatementCoordinate {
    const commentHeight = this.measureComment(stat.ref?.());
    const padding = this.metrics.fragmentPaddingBottom;
    const headerHeight = this.metrics.fragmentHeaderHeight;
    const height = commentHeight + headerHeight + padding;
    return { top, height, kind: "ref" };
  }

  private findLeftParticipant(ctx: any): string | undefined {
    if (!ctx) return undefined;
    const local = getLocalParticipantNames(ctx) || [];
    return (
      this.participantOrder.find((name) => local.includes(name)) ||
      local[0] ||
      undefined
    );
  }

  private measureOccurrence(
    context: any,
    top: number,
    participant?: string,
  ): number {
    const block = context?.braceBlock?.()?.block?.();
    if (!block) {
      return this.metrics.occurrenceMinHeight;
    }
    const blockEnd = this.layoutBlock(block, top, participant || this.rootOrigin);
    const height = blockEnd - top;
    return Math.max(this.metrics.occurrenceMinHeight, height);
  }

  private measureComment(context: any): number {
    if (!context?.getComment) {
      return 0;
    }
    return this.markdownMeasurer.measure(context.getComment());
  }
}
