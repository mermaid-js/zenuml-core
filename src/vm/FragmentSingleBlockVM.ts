import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import type { StatementKind } from "@/positioning/vertical/StatementTypes";
import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";

export abstract class FragmentSingleBlockVM extends FragmentVM {
  abstract readonly kind: StatementKind;

  constructor(
    statement: any,
    protected readonly fragment: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  public measure(top: number, origin: string): StatementCoordinate {
    const {
      cursor: startCursor,
      commentHeight,
      headerHeight,
    } = this.beginFragment(this.fragment, top);
    let cursor = startCursor;
    const hasCondition = Boolean(this.fragment?.parExpr?.()?.condition?.());
    const conditionHeight = hasCondition
      ? this.metrics.fragmentConditionHeight
      : 0;
    if (hasCondition) {
      cursor += conditionHeight;
    }
    const block = this.fragment?.braceBlock?.()?.block?.();
    const fragmentOrigin =
      this.findLeftParticipant(this.fragment, origin) || origin;
    cursor = this.layoutNestedBlock(block, fragmentOrigin, cursor);
    const result = this.finalizeFragment(top, cursor, {
      commentHeight,
      headerHeight,
      conditionHeight,
    });
    return {
      top: result.top,
      height: result.height,
      kind: this.kind,
      meta: result.meta,
    } as StatementCoordinate;
  }
}
