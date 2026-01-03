import type { StatementAnchor, StatementKind } from "./StatementTypes";

export interface StatementCoordinate {
  top: number;
  height: number;
  kind: StatementKind;
  anchors?: Partial<Record<StatementAnchor, number>>;
  meta?: Record<string, number>;
}
