import { MESSAGE_HEIGHT } from "@/positioning/Constants";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class DividerStatementVM extends StatementVM {
  constructor(statement: any, runtime: LayoutRuntime) {
    super(statement, runtime);
  }

  protected heightAfterComment(_origin: string): number {
    return MESSAGE_HEIGHT;
  }
}
