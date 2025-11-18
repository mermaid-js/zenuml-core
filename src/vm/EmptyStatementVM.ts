import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class EmptyStatementVM extends StatementVM {
  constructor(statement: any, runtime: LayoutRuntime) {
    super(statement, runtime);
  }

  protected heightAfterComment(_origin: string): number {
    return 0;
  }
}
