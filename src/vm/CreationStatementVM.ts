import { CREATION_MESSAGE_HEIGHT } from "@/positioning/Constants";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class CreationStatementVM extends StatementVM {
  constructor(
    statement: any,
    private readonly creation: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  protected heightAfterComment(origin: string): number {
    const target = this.creation?.Owner?.() || origin;
    const nestedBlock = this.creation?.braceBlock?.()?.block?.();
    const nestedHeight = this.blockHeight(nestedBlock, target);
    return CREATION_MESSAGE_HEIGHT + nestedHeight;
  }
}
