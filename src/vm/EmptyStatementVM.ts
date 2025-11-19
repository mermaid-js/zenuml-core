import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class EmptyStatementVM extends StatementVM {
  readonly kind = "empty" as const;

  constructor(statement: any, runtime: LayoutRuntime) {
    super(statement, runtime);
  }

  public measure(top: number, _origin: string): StatementCoordinate {
    return { top, height: 0, kind: this.kind };
  }
}
