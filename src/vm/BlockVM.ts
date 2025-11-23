import { NodeVM } from "./NodeVM";
import type { LayoutRuntime } from "./types";
import { createStatementVM } from "./createStatementVM";
import { StatementKind } from "@/positioning/vertical/StatementTypes";

export class BlockVM extends NodeVM {
  private readonly statements: any[];

  private static readonly cursorOffsets: Partial<Record<StatementKind, number>> = {
    loop: 1,
    tcf: 0,
    par: -1,
    opt: -3,
  };

  private static readonly heightOffsets: Partial<Record<StatementKind, number>> = {
    alt: 2,
    loop: -5,
    tcf: -3,
    par: 3,
    opt: 2,
  };

  constructor(context: any, runtime: LayoutRuntime) {
    super(context, runtime);
    this.statements = context?.stat?.() || [];
  }

  public layout(origin: string, startTop: number): number {
    if (!this.statements.length) {
      return startTop;
    }
    const metrics = this.runtime.metrics;
    let cursor = startTop + metrics.statementMarginTop;
    let lastKind: StatementKind | undefined;

    this.statements.forEach((statement: any, index: number) => {
      const statementVM = createStatementVM(statement, this.runtime);
      const cursorOffset =
        BlockVM.cursorOffsets[statementVM.kind] ?? 0;
      const measureTop = cursor + cursorOffset;
      const coordinate = statementVM.measure(measureTop, origin);
      const heightOffset = BlockVM.heightOffsets[statementVM.kind] ?? 0;
      if (heightOffset) {
        coordinate.height += heightOffset;
      }
      this.runtime.recordCoordinate(statement, coordinate);
      cursor = coordinate.top + coordinate.height;
      lastKind = statementVM.kind;
      if (index < this.statements.length - 1) {
        cursor += metrics.statementGap;
      }
    });

    const bottomMargin =
      lastKind === "return"
        ? metrics.returnStatementMarginBottom
        : metrics.statementMarginBottom;
    return cursor + bottomMargin;
  }
}
