import { CREATION_MESSAGE_HEIGHT } from "@/positioning/Constants";
import { StatementVM } from "./StatementVM";

export class CreationStatementVM extends StatementVM {
  constructor(statement: any, private readonly creation: any) {
    super(statement);
  }

  protected heightAfterComment(origin: string): number {
    const target = this.creation?.Owner?.() || origin;
    const nestedBlock = this.creation?.braceBlock?.()?.block?.();
    const nestedHeight = this.blockHeight(nestedBlock, target);
    return CREATION_MESSAGE_HEIGHT + nestedHeight;
  }
}
