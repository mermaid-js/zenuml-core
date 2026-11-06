import type { StatementKind } from "./StatementTypes";

export interface StatementCoordinate {
  top: number;
  height: number;
  kind: StatementKind;
}
