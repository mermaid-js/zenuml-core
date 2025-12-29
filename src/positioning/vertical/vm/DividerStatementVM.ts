import { StatementVM } from "./StatementVM";
import type { StatementCoordinate } from "../StatementCoordinate";

export class DividerStatementVM extends StatementVM {
  readonly kind = "divider" as const;

  public measure(top: number): StatementCoordinate {
    return { top, height: 40, kind: this.kind };
  }
}
