import { NodeVM } from "./NodeVM";
import type { LayoutRuntime } from "./types";
import { createStatementVM } from "./createStatementVM";
import type { StatementKind } from "../StatementTypes";

export class BlockVM extends NodeVM {
  private readonly statements: any[];

  constructor(context: any, runtime: LayoutRuntime) {
    super(context, runtime);
    this.statements = context?.stat?.() || [];
  }

  public layout(
    originParticipant: string,
    startTop: number,
    parentKind?: StatementKind,
  ): number {
    if (!this.statements.length) return startTop;

    const metrics = this.runtime.metrics;
    let cursor = startTop + metrics.statementMarginY; // .statement-container .my-4

    this.statements.forEach((statement: any, index: number) => {
      if (parentKind === "par" && index !== 0) cursor += 1;

      const statementVM = createStatementVM(statement, this.runtime);
      const coordinate = statementVM.measure(cursor, originParticipant);
      this.runtime.recordCoordinate(statement, coordinate);
      cursor = coordinate.top + coordinate.height + metrics.statementMarginY;
    });

    return cursor;
  }
}
