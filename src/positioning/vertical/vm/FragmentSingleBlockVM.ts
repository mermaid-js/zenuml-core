import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import type { StatementKind } from "@/positioning/vertical/StatementTypes";
import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";

export class FragmentSingleBlockVM extends FragmentVM {
  constructor(
    statement: any,
    protected readonly fragment: any,
    runtime: LayoutRuntime,
    public readonly kind: Extract<
      StatementKind,
      "critical" | "loop" | "opt" | "par" | "section"
    >,
  ) {
    super(statement, runtime);
  }

  public measure(top: number, origin: string): StatementCoordinate {
    const commentHeight = this.measureComment(this.fragment);
    let cursor = top + 1 + this.metrics.fragmentHeaderHeight + commentHeight;

    const hasCondition = Boolean(this.fragment?.parExpr?.()?.condition?.());
    if (hasCondition) cursor += 20;

    const block = this.fragment?.braceBlock?.()?.block?.();
    if (block) {
      const fragmentOrigin =
        this.findLeftParticipant(this.fragment, origin) || origin;
      cursor = this.layoutBlock(block, fragmentOrigin, cursor, this.kind);
    }

    cursor += this.metrics.fragmentPaddingBottom + 1;

    return {
      top,
      height: cursor - top,
      kind: this.kind,
    };
  }
}
