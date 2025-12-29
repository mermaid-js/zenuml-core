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
    // console.info(
    //   `blockVM::start cursor:${startTop} statements.size:${this.statements.length}`,
    // );
    let cursor = startTop + metrics.statementMarginY; // .statement-container .my-4

    this.statements.forEach((statement: any, index: number) => {
      if (parentKind === "par" && index !== 0) cursor += 1;

      const statementVM = createStatementVM(statement, this.runtime);
      // console.info(`statementVM::start::${statementVM.kind} cursor:${cursor}`);
      const coordinate = statementVM.measure(cursor, originParticipant);
      this.runtime.recordCoordinate(statement, coordinate);
      cursor = coordinate.top + coordinate.height + metrics.statementMarginY;
      // console.info(
      //   `statementVM::end::${statementVM.kind} height:${coordinate.height} cursor:${cursor}`,
      // );
    });

    // console.info(`blockVM::end cursor:${cursor}`);
    return cursor;
  }
}
