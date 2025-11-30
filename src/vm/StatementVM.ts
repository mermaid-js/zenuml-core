import { NodeVM } from "./NodeVM";
import { getCommentHeight } from "./getCommentHeight";
import { resolveFragmentOrigin } from "./resolveFragmentOrigin";
import type { LayoutRuntime } from "./types";
import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { StatementKind } from "@/positioning/vertical/StatementTypes";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { CreationTopBlock } from "@/positioning/vertical/CreationTopBlock";
import { createStatementKey } from "@/positioning/vertical/StatementIdentifier";

export abstract class StatementVM extends NodeVM {
  abstract readonly kind: StatementKind;

  constructor(statement: any, runtime: LayoutRuntime) {
    super(statement, runtime);
  }

  public abstract measure(top: number, origin: string): StatementCoordinate;

  protected get metrics() {
    return this.runtime.metrics;
  }

  protected get rootBlock() {
    return this.runtime.rootBlock;
  }

  protected get originParticipant() {
    return this.runtime.originParticipant;
  }

  protected measureComment(context: any = this.context): number {
    return getCommentHeight(context, this.runtime.markdown);
  }

  protected resolveFragmentOrigin(fallbackOrigin: string): string {
    return resolveFragmentOrigin(this.context, fallbackOrigin);
  }

  protected findLeftParticipant(
    ctx: any,
    fallbackOrigin: string,
  ): string | undefined {
    if (!ctx) return undefined;
    const local = getLocalParticipantNames(ctx) || [];
    const ordered = this.runtime.participants;
    return (
      ordered.find((name) => local.includes(name)) ||
      local[0] ||
      fallbackOrigin ||
      undefined
    );
  }

  protected layoutNestedBlock(
    blockContext: any,
    origin: string,
    startTop: number,
  ): number {
    return this.layoutBlock(blockContext, origin, startTop);
  }

  protected updateCreationTop(
    participant: string,
    top: number,
    components?: CreationTopBlock[],
  ): void {
    this.runtime.updateCreationTop(participant, top, components);
  }

  protected getStatementKey(): string {
    return createStatementKey(this.context);
  }

  protected measureOccurrence(
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
    const blockEnd = this.layoutNestedBlock(
      block,
      participant || this.originParticipant,
      blockStart,
    );
    const height = blockEnd - blockStart - offset;
    return Math.max(minHeight, height);
  }

  protected isRootLevelStatement(statCtx: any): boolean {
    const block = statCtx?.parentCtx;
    return block === this.rootBlock;
  }

  protected isFirstStatement(statCtx: any): boolean {
    const block = statCtx?.parentCtx;
    const statements: any[] = block?.stat?.() || [];
    return statements.length > 0 && statements[0] === statCtx;
  }

  protected altHasMultipleBranches(ctx: any): boolean {
    if (typeof ctx?.alt !== "function") {
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

  protected isSectionFragment(ctx: any): boolean {
    return typeof ctx?.section === "function" && Boolean(ctx.section());
  }

  protected isAncestorOf(target: any, maybeDescendant: any): boolean {
    let current = maybeDescendant;
    while (current) {
      if (current === target) {
        return true;
      }
      current = current.parentCtx;
    }
    return false;
  }

  protected isInsideFragment(stat: any = this.context): boolean {
    let parent = stat?.parentCtx;
    while (parent) {
      if (typeof parent.alt === "function" && parent.alt()) return true;
      if (typeof parent.loop === "function" && parent.loop()) return true;
      if (typeof parent.par === "function" && parent.par()) return true;
      if (typeof parent.opt === "function" && parent.opt()) return true;
      if (typeof parent.section === "function" && parent.section()) return true;
      if (typeof parent.critical === "function" && parent.critical())
        return true;
      if (typeof parent.tcf === "function" && parent.tcf()) return true;
      parent = parent.parentCtx;
    }
    return false;
  }
}
