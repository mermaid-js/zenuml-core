import type { StatementCoordinate } from "../StatementCoordinate";
import { CREATION_MESSAGE_HEIGHT } from "@/positioning/vertical/LayoutMetrics";
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

  public measure(top: number, originParticipant: string): StatementCoordinate {
    const participant = this.creation?.Owner?.() || originParticipant;

    const commentHeight = this.measureComment(this.creation);
    if (participant) {
      this.runtime.updateCreationTop(participant, top + commentHeight);
    }

    let cursor = top + commentHeight + CREATION_MESSAGE_HEIGHT;

    const block = this.creation?.braceBlock?.()?.block?.();
    if (block) {
      const fragmentOrigin =
        this.findLeftParticipant(this.creation, originParticipant) || originParticipant;
      cursor = this.layoutBlock(block, fragmentOrigin, cursor, this.kind);
      cursor += 2; // .occurrence.border-2 for bottom
    } else {
      cursor += 22; // .occurrence, .min-h-6, .mt-[-2px]
    }

    const assignment = this.creation?.Assignment?.();
    if (assignment) {
      cursor += 12;
    }

    const height = cursor - top;

    return {
      top,
      height,
      kind: this.kind,
    };
  }
}
