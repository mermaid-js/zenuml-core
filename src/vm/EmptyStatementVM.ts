import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { StatementVM } from "./StatementVM";

export class EmptyStatementVM extends StatementVM {
  readonly kind = "empty" as const;

  public measure(top: number): StatementCoordinate {
    return { top, height: 0, kind: this.kind };
  }
}
