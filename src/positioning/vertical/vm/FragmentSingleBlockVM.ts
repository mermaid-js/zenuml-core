import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import type { SingleBlockFragmentKind } from "@/positioning/vertical/StatementTypes";
import { FRAGMENT_BORDER_WIDTH } from "@/positioning/vertical/LayoutMetrics";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class FragmentSingleBlockVM extends StatementVM {
  constructor(
    statement: any,
    protected readonly fragment: any,
    runtime: LayoutRuntime,
    public readonly kind: SingleBlockFragmentKind,
  ) {
    super(statement, runtime);
  }

  public measure(top: number, origin: string): StatementCoordinate {
    const commentHeight = this.measureComment(this.fragment);
    let cursor =
      top +
      FRAGMENT_BORDER_WIDTH +
      this.metrics.fragmentHeaderHeight +
      commentHeight;

    const hasCondition = Boolean(this.fragment?.parExpr?.()?.condition?.());
    if (hasCondition) cursor += 20;

    const block = this.fragment?.braceBlock?.()?.block?.();
    if (block) {
      const fragmentOrigin =
        this.findLeftParticipant(this.fragment, origin) || origin;
      cursor = this.layoutBlock(block, fragmentOrigin, cursor, this.kind);
    }

    cursor += this.metrics.fragmentPaddingBottom + FRAGMENT_BORDER_WIDTH;

    return {
      top,
      height: cursor - top,
      kind: this.kind,
    };
  }
}
