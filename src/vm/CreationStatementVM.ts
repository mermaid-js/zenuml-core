import { StatementAnchor } from "@/positioning/vertical/StatementTypes";
import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class CreationStatementVM extends StatementVM {
  readonly kind = "creation" as const;

  constructor(
    statement: any,
    private readonly creation: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  public measure(top: number, origin: string): StatementCoordinate {
    const creation = this.creation;
    const commentHeight = this.measureComment(creation);
    const messageTop = top + commentHeight;
    const messageHeight = this.metrics.creationMessageHeight;
    const occurrenceTop = messageTop + messageHeight;
    const target = creation?.Owner?.() || origin;
    const occurrenceHeight = this.measureOccurrence(
      creation,
      occurrenceTop,
      target,
      undefined,
      this.metrics.creationOccurrenceContentInset,
    );
    const assignment = creation?.creationBody?.()?.assignment?.();
    const anchors: Partial<Record<StatementAnchor, number>> = {
      message: messageTop,
      occurrence: occurrenceTop,
    };
    let height = commentHeight + messageHeight + occurrenceHeight;
    if (assignment) {
      anchors.return = occurrenceTop + occurrenceHeight;
      height += this.metrics.returnMessageHeight;
    }

    const anchorAdjustment = this.getCreationAnchorOffset();
    const rawAltBranchInset = this.getCreationAltBranchInset();
    const altBranchInset = anchorAdjustment === 0 ? rawAltBranchInset : 0;
    if (altBranchInset) {
      anchors.message! += altBranchInset;
      anchors.occurrence! += altBranchInset;
      if (anchors.return != null) {
        anchors.return += altBranchInset;
      }
    }

    const visualAdjustment = this.getCreationVisualAdjustment();
    const assignmentAdjustment =
      assignment &&
      this.isRootLevelStatement(this.context) &&
      !this.isFirstStatement(this.context)
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
      const anchorTop = anchors.message! + anchorAdjustment;
      this.updateCreationTop(target, anchorTop);
    }

    const adjustedTop = top - totalAdjustment;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      messageHeight,
      occurrenceHeight,
      returnHeight: assignment ? this.metrics.returnMessageHeight : 0,
      anchorAdjustment,
      visualAdjustment,
      assignmentAdjustment: assignment ? assignmentAdjustment : 0,
      altBranchInset,
    };

    return {
      top: adjustedTop,
      height,
      kind: this.kind,
      anchors,
      meta,
    };
  }

  private getCreationAnchorOffset(): number {
    let offset = 0;
    let parent = this.context?.parentCtx;
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
      if (!appliedTcf && this.isWithinTcfTrySegment(parent)) {
        offset += this.metrics.creationTcfSegmentOffset;
        appliedTcf = true;
      }
      parent = parent.parentCtx;
    }
    if (
      this.metrics.creationParSiblingOffset &&
      this.isDirectChildOfParBlock() &&
      !this.isFirstStatement(this.context)
    ) {
      offset += this.metrics.creationParSiblingOffset;
    }
    return offset;
  }

  private getCreationAltBranchInset(): number {
    const inset = this.metrics.creationAltBranchInset || 0;
    if (!inset) {
      return 0;
    }
    let parent = this.context?.parentCtx;
    while (parent) {
      if (this.altHasMultipleBranches(parent)) {
        return inset;
      }
      parent = parent.parentCtx;
    }
    return 0;
  }

  private getCreationVisualAdjustment(): number {
    let parent = this.context?.parentCtx;
    while (parent) {
      if (this.isSectionFragment(parent)) {
        return this.metrics.creationSectionOffset;
      }
      parent = parent.parentCtx;
    }
    return 0;
  }

  private isWithinTcfTrySegment(parent: any): boolean {
    if (typeof parent?.tcf !== "function") {
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
    return this.isAncestorOf(tryBlock, this.context);
  }

  private isDirectChildOfParBlock(): boolean {
    const parentStat = this.context;
    if (!parentStat) {
      return false;
    }
    let ancestor = parentStat.parentCtx;
    while (ancestor) {
      if (typeof ancestor.par === "function") {
        const parContext = ancestor.par();
        const block = parContext?.braceBlock?.()?.block?.();
        if (block) {
          const statements: any[] = block.stat?.() || [];
          if (statements.some((stat) => stat === parentStat)) {
            return true;
          }
        }
      }
      ancestor = ancestor.parentCtx;
    }
    return false;
  }
}
