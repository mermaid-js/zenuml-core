import { NodeVM } from "./NodeVM";
import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import type { StatementKind } from "@/positioning/vertical/StatementTypes";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";

export abstract class StatementVM extends NodeVM {
  abstract readonly kind: StatementKind;

  public abstract measure(top: number, origin: string): StatementCoordinate;

  protected get metrics() {
    return this.runtime.metrics;
  }

  protected measureComment(context: any = this.context): number {
    if (!context?.getComment) return 0;
    const rawComment = context.getComment() || "";
    if (!rawComment) return 0;

    const markdown = new MarkdownMeasurer(this.runtime.metrics);
    return markdown.measure(rawComment);
  }

  protected resolveFragmentOrigin(fallbackOrigin: string): string {
    try {
      const participants = getLocalParticipantNames(this.context) || [];
      return participants[0] || fallbackOrigin;
    } catch (error) {
      console.warn("Failed to resolve fragment origin", error);
      return fallbackOrigin;
    }
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

  protected measureOccurrence(
    context: any,
    top: number,
    participant?: string,
    minHeight = 24, // .occurrence .min-h-6
    contentInset = 1,
  ): number {
    // const enlog = participant === "c";
    const block = context?.braceBlock?.()?.block?.();
    if (!block) {
      return minHeight;
    }
    const offset = this.metrics.statementMarginY - contentInset;
    const blockStart = top - offset;
    const blockEnd = this.layoutBlock(
      block,
      participant || this.runtime.originParticipant,
      blockStart,
    );
    const height = blockEnd - blockStart - offset;
    return Math.max(minHeight, height);
  }

  protected isRootLevelStatement(statCtx: any): boolean {
    const block = statCtx?.parentCtx;
    return block === this.runtime.rootBlock;
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
}
