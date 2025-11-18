import { StatementAnchor, StatementKind } from "@/positioning/vertical/StatementTypes";

export interface StatementCoordinate {
  top: number;
  height: number;
  kind: StatementKind;
  anchors?: Partial<Record<StatementAnchor, number>>;
  meta?: Record<string, number>;
}
