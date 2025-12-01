import { StatementVM } from "./StatementVM";
import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";

export class DividerStatementVM extends StatementVM {
  readonly kind = "divider" as const;

  public measure(top: number): StatementCoordinate {
    return { top, height: this.metrics.dividerHeight, kind: this.kind };
  }
}
