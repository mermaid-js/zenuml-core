import { NodeVM } from "./NodeVM";
import type { LayoutRuntime } from "./types";
import { createStatementVM } from "./createStatementVM";
import type { StatementKind } from "@/positioning/vertical/StatementTypes";

export class BlockVM extends NodeVM {
  private readonly statements: any[];

  // private static readonly cursorOffsets: Partial<
  //   Record<StatementKind, number>
  // > = {
  //   loop: 1,
  //   par: 0,
  //   opt: -3,
  // };

  // private static readonly heightOffsets: Partial<
  //   Record<StatementKind, number>
  // > = {
  //   alt: 1,
  //   loop: -5,
  //   par: 3,
  //   opt: 2,
  //   section: 1,
  // };

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
    console.info(
      `blockVM::start cursor:${startTop} statements.size:${this.statements.length}`,
    );

    let cursor = startTop + metrics.statementMarginY; // .statement-container .my-4
    // let lastKind: StatementKind | undefined;

    this.statements.forEach((statement: any, index: number) => {
      if (parentKind === "par" && index !== 0) cursor += 1;

      const statementVM = createStatementVM(statement, this.runtime);
      console.info(`statementVM::start::${statementVM.kind} cursor:${cursor}`);
      const coordinate = statementVM.measure(cursor, originParticipant);
      this.runtime.recordCoordinate(statement, coordinate);
      cursor = coordinate.top + coordinate.height + metrics.statementMarginY;
      // lastKind = statementVM.kind;
      console.info(
        `statementVM::end::${statementVM.kind} height:${coordinate.height} cursor:${cursor}`,
      );
    });

    console.info(`blockVM::end cursor:${cursor}`);
    return cursor;
  }
}
