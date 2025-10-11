import { STATEMENT_CONTAINER_MARGIN } from "@/positioning/Constants";
import { NodeVM } from "./NodeVM";
import type { BlockLayout } from "./types";
import { createStatementVM } from "./createStatementVM";

export class BlockVM extends NodeVM {
  private readonly statements: any[];

  constructor(context: any) {
    super(context);
    this.statements = context?.stat?.() || [];
  }

  public layout(origin: string, startTop: number): BlockLayout {
    const tops: number[] = [];
    let currentTop = startTop;

    this.statements.forEach((statement: any) => {
      const statementTop = currentTop;
      const statementVM = createStatementVM(statement);
      const statementHeight = statementVM.height(origin);
      currentTop += statementHeight;
      tops.push(statementTop);
    });
    console.log('Add margin after last statement:', STATEMENT_CONTAINER_MARGIN)
    currentTop += STATEMENT_CONTAINER_MARGIN;
    return { tops, endTop: currentTop };
  }

  public advance(origin: string, startTop: number): number {
    return this.layout(origin, startTop).endTop;
  }

  public height(origin: string): number {
    return this.layout(origin, 0).endTop;
  }
}
