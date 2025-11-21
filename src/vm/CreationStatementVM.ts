import { StatementAnchor } from "@/positioning/vertical/StatementTypes";
import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

interface CreationOffsets {
  anchorAdjustment: number;
  altBranchInset: number;
  visualAdjustment: number;
  assignmentAdjustment: number;
}

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

    const offsets = this.calculateOffsets(assignment);

    // Base anchors
    const anchors: Partial<Record<StatementAnchor, number>> = {
      message: messageTop,
      occurrence: occurrenceTop,
    };

    let height = commentHeight + messageHeight + occurrenceHeight;
    if (assignment) {
      anchors.return = occurrenceTop + occurrenceHeight;
      height += this.metrics.returnMessageHeight;
    }

    // Apply adjustments
    // 1. Anchor adjustment (e.g. nested in Alt/Tcf/Par) shifts everything down
    if (offsets.anchorAdjustment) {
      anchors.message! += offsets.anchorAdjustment;
      anchors.occurrence! += offsets.anchorAdjustment;
      if (anchors.return != null) {
        anchors.return += offsets.anchorAdjustment;
      }
    }

    // 2. Alt branch inset (if not already adjusted by anchorAdjustment)
    // Note: Original logic said "altBranchInset = anchorAdjustment === 0 ? rawAltBranchInset : 0"
    // This implies if we have anchorAdjustment, we ignore altBranchInset.
    if (offsets.altBranchInset && offsets.anchorAdjustment === 0) {
      anchors.message! += offsets.altBranchInset;
      anchors.occurrence! += offsets.altBranchInset;
      if (anchors.return != null) {
        anchors.return += offsets.altBranchInset;
      }
    }

    // 3. Visual adjustment (Section) and Assignment adjustment shift things UP
    const totalUpwardAdjustment =
      offsets.visualAdjustment + offsets.assignmentAdjustment;
    if (totalUpwardAdjustment) {
      anchors.message! -= totalUpwardAdjustment;
      anchors.occurrence! -= totalUpwardAdjustment;
      if (anchors.return != null) {
        anchors.return -= totalUpwardAdjustment;
      }
    }

    if (target) {
      // The lifeline start should align with the message arrow
      this.updateCreationTop(target, anchors.message!);
    }

    // The top of the statement block itself is adjusted by the upward adjustments
    // (This matches original logic: adjustedTop = top - totalAdjustment)
    const adjustedTop = top - totalUpwardAdjustment;

    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      messageHeight,
      occurrenceHeight,
      returnHeight: assignment ? this.metrics.returnMessageHeight : 0,
      anchorAdjustment: offsets.anchorAdjustment,
      visualAdjustment: offsets.visualAdjustment,
      assignmentAdjustment: offsets.assignmentAdjustment,
      altBranchInset: offsets.altBranchInset,
    };

    return {
      top: adjustedTop,
      height,
      kind: this.kind,
      anchors,
      meta,
    };
  }

  private calculateOffsets(assignment: any): CreationOffsets {
    let anchorAdjustment = 0;
    let altBranchInset = 0;
    let visualAdjustment = 0;

    // Traverse up once to gather all context-based offsets
    let parent = this.context?.parentCtx;
    let appliedAlt = false;
    let appliedTcf = false;

    while (parent) {
      // Anchor Adjustments
      if (
        !appliedAlt &&
        this.altHasMultipleBranches(parent) &&
        !this.isRootLevelStatement(parent)
      ) {
        anchorAdjustment += this.metrics.creationAltBranchOffset;
        appliedAlt = true;
      }
      if (!appliedTcf && this.isWithinTcfTrySegment(parent)) {
        anchorAdjustment += this.metrics.creationTcfSegmentOffset;
        appliedTcf = true;
      }

      // Alt Branch Inset
      // Only if we haven't found one yet (closest ancestor wins?)
      // Original logic: "while(parent) { if (altHasMultipleBranches) return inset; }"
      // So yes, first one found.
      if (altBranchInset === 0 && this.altHasMultipleBranches(parent)) {
        altBranchInset = this.metrics.creationAltBranchInset || 0;
      }

      // Visual Adjustment (Section)
      if (this.isSectionFragment(parent)) {
        visualAdjustment = this.metrics.creationSectionOffset;
      }

      parent = parent.parentCtx;
    }

    // Par Sibling Offset
    if (
      this.metrics.creationParSiblingOffset &&
      this.isDirectChildOfParBlock() &&
      !this.isFirstStatement(this.context)
    ) {
      anchorAdjustment += this.metrics.creationParSiblingOffset;
    }

    // Assignment Offset
    const assignmentAdjustment =
      assignment &&
      this.isRootLevelStatement(this.context) &&
      !this.isFirstStatement(this.context)
        ? this.metrics.creationAssignmentOffset
        : 0;

    return {
      anchorAdjustment,
      altBranchInset,
      visualAdjustment,
      assignmentAdjustment,
    };
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
