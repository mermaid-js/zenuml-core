import { StatementAnchor } from "@/positioning/vertical/StatementTypes";
import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { CreationTopBlock } from "@/positioning/vertical/CreationTopBlock";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

interface CreationOffsets {
  anchorAdjustment: number;
  altBranchInset: number;
  visualAdjustment: number;
  assignmentAdjustment: number;
  /** Component breakdown for debug purposes */
  components: CreationTopBlock[];
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
    const statementKey = this.getStatementKey();

    // Build component breakdown for debugging
    const components: CreationTopBlock[] = [
      {
        name: "cursorTop",
        value: top,
        statementKey,
        description: "Initial cursor position passed to measure()",
      },
    ];

    if (commentHeight > 0) {
      components.push({
        name: "commentHeight",
        value: commentHeight,
        statementKey,
        description: "Height of comment above creation",
      });
    }

    // Base anchors
    const anchors: Partial<Record<StatementAnchor, number>> = {
      message: messageTop,
      occurrence: occurrenceTop,
    };

    let height = commentHeight + messageHeight + occurrenceHeight;
    const parSiblingOffset =
      offsets.components.find((c) => c.name === "creationParSiblingOffset")
        ?.value || 0;
    if (parSiblingOffset) {
      height += parSiblingOffset;
    }
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
      // Add offset components to breakdown
      components.push(...offsets.components.filter((c) => c.value > 0));
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
      // Add inset component
      const insetComponent = offsets.components.find(
        (c) => c.name === "altBranchInset",
      );
      if (insetComponent) {
        components.push(insetComponent);
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
      // Add negative adjustment components
      if (offsets.visualAdjustment) {
        const visComp = offsets.components.find(
          (c) => c.name === "visualAdjustment",
        );
        if (visComp) {
          components.push({ ...visComp, value: -visComp.value });
        }
      }
      if (offsets.assignmentAdjustment) {
        const assComp = offsets.components.find(
          (c) => c.name === "assignmentAdjustment",
        );
        if (assComp) {
          components.push({ ...assComp, value: -assComp.value });
        }
      }
    }

    // Add final message anchor component
    components.push({
      name: "finalMessageAnchor",
      value: anchors.message!,
      statementKey,
      description: "Final calculated message anchor (= creationTop)",
    });

    const adjustedTop = top - totalUpwardAdjustment;
    const creationAnchor = anchors.message!;

    if (target) {
      // Lifeline start aligns to the rendered creation arrow, which is the final
      // message anchor (not the statement's pre-comment cursorTop).
      this.updateCreationTop(target, creationAnchor, components);
    }

    // The top of the statement block itself is adjusted by the upward adjustments
    // (This matches original logic: adjustedTop = top - totalAdjustment)

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
    const visualAdjustment = 0;
    const components: CreationTopBlock[] = [];
    const statementKey = this.getStatementKey();

    // Traverse up once to gather all context-based offsets
    let parent = this.context?.parentCtx;
    let appliedAlt = false;
    let appliedTcf = false;

    while (parent) {
      // Anchor Adjustments
      // Only apply creationAltBranchOffset when the alt is NOT inside another fragment
      // (par, loop, opt, etc.). If the alt is inside a fragment, the browser doesn't
      // apply this offset.
      if (
        !appliedAlt &&
        this.altHasMultipleBranches(parent) &&
        !this.isRootLevelStatement(parent) &&
        !this.isAltInsideFragment(parent)
      ) {
        anchorAdjustment += this.metrics.creationAltBranchOffset;
        components.push({
          name: "creationAltBranchOffset",
          value: this.metrics.creationAltBranchOffset,
          statementKey,
          description: "Offset for creation inside alt with multiple branches",
        });
        appliedAlt = true;
      }
      if (!appliedTcf && this.isWithinTcfTrySegment(parent)) {
        anchorAdjustment += this.metrics.creationTcfSegmentOffset;
        components.push({
          name: "creationTcfSegmentOffset",
          value: this.metrics.creationTcfSegmentOffset,
          statementKey,
          description: "Offset for creation inside try/catch try segment",
        });
        appliedTcf = true;
      }

      // Alt Branch Inset
      // Only if we haven't found one yet (closest ancestor wins?)
      // Original logic: "while(parent) { if (altHasMultipleBranches) return inset; }"
      // So yes, first one found.
      // When alt is inside a fragment, use a larger inset (3) to match browser behavior.
      if (altBranchInset === 0 && this.altHasMultipleBranches(parent)) {
        const insideFragment = this.isAltInsideFragment(parent);
        altBranchInset = insideFragment
          ? 1
          : this.metrics.creationAltBranchInset || 0;
        if (altBranchInset > 0) {
          components.push({
            name: "altBranchInset",
            value: altBranchInset,
            statementKey,
            description: insideFragment
              ? "Alt branch inset (inside fragment, larger value)"
              : "Alt branch inset",
          });
        }
      }

      // Visual Adjustment (Section)
      if (this.isSectionFragment(parent)) {
        anchorAdjustment += this.metrics.creationSectionOffset;
        components.push({
          name: "creationSectionOffset",
          value: this.metrics.creationSectionOffset,
          statementKey,
          description: "Anchor adjustment for creation inside section fragment",
        });
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
      components.push({
        name: "creationParSiblingOffset",
        value: this.metrics.creationParSiblingOffset,
        statementKey,
        description: "Offset for non-first creation inside par block",
      });
    }

    // Assignment Offset
    const assignmentAdjustment =
      assignment &&
      this.isRootLevelStatement(this.context) &&
      !this.isFirstStatement(this.context)
        ? this.metrics.creationAssignmentOffset
        : 0;
    if (assignmentAdjustment > 0) {
      components.push({
        name: "assignmentAdjustment",
        value: assignmentAdjustment,
        statementKey,
        description: "Assignment offset for non-first root-level creation",
      });
    }

    return {
      anchorAdjustment,
      altBranchInset,
      visualAdjustment,
      assignmentAdjustment,
      components,
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

  /**
   * Checks if the alt statement containing the creation is itself inside another
   * fragment (par, loop, opt, section, critical). In this case, the
   * creationAltBranchOffset should NOT be applied.
   */
  private isAltInsideFragment(altStatContext: any): boolean {
    if (!altStatContext || typeof altStatContext.alt !== "function") {
      return false;
    }
    // Start from the alt statement's parent (the block containing the alt)
    let parent = altStatContext?.parentCtx;
    while (parent) {
      // Check for fragment types that would contain the alt
      if (typeof parent.par === "function" && parent.par()) return true;
      if (typeof parent.loop === "function" && parent.loop()) return true;
      if (typeof parent.opt === "function" && parent.opt()) return true;
      if (typeof parent.section === "function" && parent.section()) return true;
      if (typeof parent.critical === "function" && parent.critical())
        return true;
      // Note: We don't check for tcf here because alt inside try/catch is handled
      // by creationTcfSegmentOffset separately
      parent = parent.parentCtx;
    }
    return false;
  }
}
