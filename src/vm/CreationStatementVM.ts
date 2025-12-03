import type { StatementAnchor } from "@/positioning/vertical/StatementTypes";
import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

// interface CreationOffsets {
//   anchorAdjustment: number;
//   altBranchInset: number;
//   visualAdjustment: number;
//   assignmentAdjustment: number;
// }

const CREATION_MESSAGE_HEIGHT = 40; // [data-type="creation"], .h-10

export class CreationStatementVM extends StatementVM {
  readonly kind = "creation" as const;

  constructor(
    statement: any,
    private readonly creation: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  public measure(top: number, originParticipant: string): StatementCoordinate {
    const creation = this.creation;
    const participant = creation?.Owner?.() || originParticipant;
    const enlog = true;
    // const enlog = participant === "b" || participant === "c";

    const commentHeight = this.measureComment(creation);
    const cursor = top + commentHeight + CREATION_MESSAGE_HEIGHT;
    if (enlog)
      console.info(
        `creation::${participant}::0 top:${top} commentHeight:${commentHeight}`,
      );

    // const occurrenceHeight = this.measureOccurrence(
    //   creation,
    //   cursor,
    //   participant,
    //   undefined,
    //   this.metrics.creationOccurrenceContentInset,
    // );

    const occurrenceHeight = 22; // .occurrence, .min-h-6, .mt-[-2px]

    let height = commentHeight + CREATION_MESSAGE_HEIGHT + occurrenceHeight;
    if (enlog)
      console.info(
        `creation::${participant}::1 occurrenceHeight:${occurrenceHeight}`,
      );

    const assignment = creation?.creationBody?.()?.assignment?.();
    // const offsets = this.calculateOffsets(assignment);

    const anchors: Partial<Record<StatementAnchor, number>> = {
      message: top + commentHeight,
      occurrence: cursor,
    };

    if (assignment) {
      anchors.return = cursor + occurrenceHeight;
      height += this.metrics.returnMessageHeight;
      if (enlog) console.info(`creation::${participant}::assignment`);
    }

    // // Apply adjustments
    // // 1. Anchor adjustment (e.g. nested in Alt/Tcf/Par) shifts everything down
    // if (offsets.anchorAdjustment) {
    //   anchors.message! += offsets.anchorAdjustment;
    //   anchors.occurrence! += offsets.anchorAdjustment;
    //   if (anchors.return != null) {
    //     anchors.return += offsets.anchorAdjustment;
    //   }
    // }

    // // 2. Alt branch inset (if not already adjusted by anchorAdjustment)
    // // Note: Original logic said "altBranchInset = anchorAdjustment === 0 ? rawAltBranchInset : 0"
    // // This implies if we have anchorAdjustment, we ignore altBranchInset.
    // if (offsets.altBranchInset && offsets.anchorAdjustment === 0) {
    //   anchors.message! += offsets.altBranchInset;
    //   anchors.occurrence! += offsets.altBranchInset;
    //   if (anchors.return != null) {
    //     anchors.return += offsets.altBranchInset;
    //   }
    // }

    // // 3. Visual adjustment (Section) and Assignment adjustment shift things UP
    // const totalUpwardAdjustment =
    //   offsets.visualAdjustment + offsets.assignmentAdjustment;
    // if (totalUpwardAdjustment) {
    //   anchors.message! -= totalUpwardAdjustment;
    //   anchors.occurrence! -= totalUpwardAdjustment;
    //   if (anchors.return != null) {
    //     anchors.return -= totalUpwardAdjustment;
    //   }
    // }

    // const adjustedTop = top - totalUpwardAdjustment;
    const creationAnchor = anchors.message!;

    if (participant) {
      this.runtime.updateCreationTop(participant, creationAnchor);
    }

    // The top of the statement block itself is adjusted by the upward adjustments
    // (This matches original logic: adjustedTop = top - totalAdjustment)

    if (enlog)
      console.info(`creation::${participant}::2 top:${top} height:${height}`);

    return {
      // top: adjustedTop,
      top,
      height,
      kind: this.kind,
      anchors,
    };
  }

  // private calculateOffsets(assignment: any): CreationOffsets {
  //   let anchorAdjustment = 0;
  //   let altBranchInset = 0;
  //   const visualAdjustment = 0;

  //   // Traverse up once to gather all context-based offsets
  //   let parent = this.context?.parentCtx;
  //   let appliedAlt = false;
  //   let appliedTcf = false;

  //   while (parent) {
  //     // Anchor Adjustments
  //     // Only apply creationAltBranchOffset when the alt is NOT inside another fragment
  //     // (par, loop, opt, etc.). If the alt is inside a fragment, the browser doesn't
  //     // apply this offset.
  //     if (
  //       !appliedAlt &&
  //       this.altHasMultipleBranches(parent) &&
  //       !this.isRootLevelStatement(parent) &&
  //       !this.isAltInsideFragment(parent)
  //     ) {
  //       anchorAdjustment += this.metrics.creationAltBranchOffset;
  //       appliedAlt = true;
  //     }
  //     if (!appliedTcf && this.isWithinTcfTrySegment(parent)) {
  //       anchorAdjustment += this.metrics.creationTcfSegmentOffset;
  //       appliedTcf = true;
  //     }

  //     // Alt Branch Inset
  //     // Only if we haven't found one yet (closest ancestor wins?)
  //     // Original logic: "while(parent) { if (altHasMultipleBranches) return inset; }"
  //     // So yes, first one found.
  //     // When alt is inside a fragment, use a larger inset (3) to match browser behavior.
  //     if (altBranchInset === 0 && this.altHasMultipleBranches(parent)) {
  //       const insideFragment = this.isAltInsideFragment(parent);
  //       altBranchInset = insideFragment
  //         ? 1
  //         : this.metrics.creationAltBranchInset || 0;
  //     }

  //     // Visual Adjustment (Section)
  //     if (this.isSectionFragment(parent)) {
  //       anchorAdjustment += this.metrics.creationSectionOffset;
  //     }

  //     parent = parent.parentCtx;
  //   }

  //   // Par Sibling Offset
  //   if (
  //     this.metrics.creationParSiblingOffset &&
  //     this.isDirectChildOfParBlock() &&
  //     !this.isFirstStatement(this.context)
  //   ) {
  //     anchorAdjustment += this.metrics.creationParSiblingOffset;
  //   }

  //   // Assignment Offset
  //   const assignmentAdjustment =
  //     assignment &&
  //     this.isRootLevelStatement(this.context) &&
  //     !this.isFirstStatement(this.context)
  //       ? this.metrics.creationAssignmentOffset
  //       : 0;

  //   return {
  //     anchorAdjustment,
  //     altBranchInset,
  //     visualAdjustment,
  //     assignmentAdjustment,
  //   };
  // }

  // private isWithinTcfTrySegment(parent: any): boolean {
  //   if (typeof parent?.tcf !== "function") {
  //     return false;
  //   }
  //   const tcfContext = parent.tcf();
  //   if (!tcfContext) {
  //     return false;
  //   }
  //   const tryBlock = tcfContext?.tryBlock?.()?.braceBlock?.()?.block?.();
  //   if (!tryBlock) {
  //     return false;
  //   }
  //   return this.isAncestorOf(tryBlock, this.context);
  // }

  // private isDirectChildOfParBlock(): boolean {
  //   const parentStat = this.context;
  //   if (!parentStat) {
  //     return false;
  //   }
  //   let ancestor = parentStat.parentCtx;
  //   while (ancestor) {
  //     if (typeof ancestor.par === "function") {
  //       const parContext = ancestor.par();
  //       const block = parContext?.braceBlock?.()?.block?.();
  //       if (block) {
  //         const statements: any[] = block.stat?.() || [];
  //         if (statements.some((stat) => stat === parentStat)) {
  //           return true;
  //         }
  //       }
  //     }
  //     ancestor = ancestor.parentCtx;
  //   }
  //   return false;
  // }

  /**
   * Checks if the alt statement containing the creation is itself inside another
   * fragment (par, loop, opt, section, critical). In this case, the
   * creationAltBranchOffset should NOT be applied.
   */
  // private isAltInsideFragment(altStatContext: any): boolean {
  //   if (!altStatContext || typeof altStatContext.alt !== "function") {
  //     return false;
  //   }
  //   // Start from the alt statement's parent (the block containing the alt)
  //   let parent = altStatContext?.parentCtx;
  //   while (parent) {
  //     // Check for fragment types that would contain the alt
  //     if (typeof parent.par === "function" && parent.par()) return true;
  //     if (typeof parent.loop === "function" && parent.loop()) return true;
  //     if (typeof parent.opt === "function" && parent.opt()) return true;
  //     if (typeof parent.section === "function" && parent.section()) return true;
  //     if (typeof parent.critical === "function" && parent.critical())
  //       return true;
  //     // Note: We don't check for tcf here because alt inside try/catch is handled
  //     // by creationTcfSegmentOffset separately
  //     parent = parent.parentCtx;
  //   }
  //   return false;
  // }
}
