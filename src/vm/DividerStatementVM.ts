import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";
import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";

export class DividerStatementVM extends StatementVM {
  readonly kind = "divider" as const;

  constructor(statement: any, runtime: LayoutRuntime) {
    super(statement, runtime);
  }

  public measure(top: number): StatementCoordinate {
    return { top, height: this.metrics.dividerHeight, kind: this.kind };
  }
}
