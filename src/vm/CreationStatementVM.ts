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
      cursor += 16;
    }

    if (participant) {
      this.runtime.updateCreationTop(participant, top + commentHeight);
    }

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
