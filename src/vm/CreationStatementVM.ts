import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

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
    const participant = this.creation?.Owner?.() || originParticipant;
    const enlog = true;
    // const enlog = participant === "b" || participant === "c";

    const commentHeight = this.measureComment(this.creation);
    let cursor = top + commentHeight + CREATION_MESSAGE_HEIGHT;
    if (enlog)
      console.info(
        `creation::${participant}::start cursor:${cursor} commentHeight:${commentHeight}`,
      );

    // const occurrenceHeight = this.measureOccurrence(
    //   creation,
    //   cursor,
    //   participant,
    //   undefined,
    //   this.metrics.creationOccurrenceContentInset,
    // );

    const block = this.creation?.braceBlock?.()?.block?.();
    if (block) {
      const fragmentOrigin =
        this.findLeftParticipant(this.creation, origin) || origin;
      cursor = this.layoutBlock(block, fragmentOrigin, cursor, this.kind);
      cursor += 2; // .occurrence.border-2 for bottom
    } else {
      cursor += 22; // .occurrence, .min-h-6, .mt-[-2px]
    }

    const assignment = this.creation?.creationBody?.()?.assignment?.();
    if (assignment) {
      console.info(`creation::assignment::${participant}`);
      cursor += this.metrics.returnMessageHeight;
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

    if (participant) {
      this.runtime.updateCreationTop(participant, top + commentHeight);
    }

    // The top of the statement block itself is adjusted by the upward adjustments
    // (This matches original logic: adjustedTop = top - totalAdjustment)

    const height = cursor - top;
    if (enlog)
      console.info(
        `creation::${participant}::end cursor:${cursor} height:${height}`,
      );

    return {
      top,
      height,
      kind: this.kind,
    };
  }
}
