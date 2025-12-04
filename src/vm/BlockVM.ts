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
    let cursor = startTop + metrics.statementMarginY; // .statement-container .my-4
    let lastKind: StatementKind | undefined;

    this.statements.forEach((statement: any, index: number) => {
      if (parentKind === "par" && index !== 0) cursor += 1;

      const statementVM = createStatementVM(statement, this.runtime);
      // const cursorOffset = BlockVM.cursorOffsets[statementVM.kind] ?? 0;
      // const measureTop = cursor + cursorOffset;
      console.info(`statementVM::start::${statementVM.kind} cursor:${cursor}`);
      const coordinate = statementVM.measure(cursor, originParticipant);
      // const heightOffset = BlockVM.heightOffsets[statementVM.kind] ?? 0;
      // if (heightOffset) {
      //   coordinate.height += heightOffset;
      // }
      this.runtime.recordCoordinate(statement, coordinate);
      cursor = coordinate.top + coordinate.height + metrics.statementMarginY;
      lastKind = statementVM.kind;
      console.info(
        `statementVM::end::${statementVM.kind} top:${coordinate.top} height:${coordinate.height} cursor:${cursor}`,
      );
    });

    const bottomMargin =
      lastKind === "return" ? metrics.returnStatementMarginBottom : 0;
    return cursor + bottomMargin;
  }
}
