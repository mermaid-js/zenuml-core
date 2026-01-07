import type { StatementCoordinate } from "../StatementCoordinate";
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

    const commentHeight = this.measureComment(this.creation);
    if (participant) {
      this.runtime.updateCreationTop(participant, top + commentHeight);
    }

    let cursor = top + commentHeight + CREATION_MESSAGE_HEIGHT;
    // console.info(
    //   `creation::${participant}::start cursor:${cursor} commentHeight:${commentHeight}`,
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
      cursor += 12;
    }

    const height = cursor - top;
    // console.info(
    //   `creation::${participant}::end cursor:${cursor} height:${height}`,
    // );

    return {
      top,
      height,
      kind: this.kind,
    };
  }
}
