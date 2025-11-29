import { FragmentSingleBlockVM } from "./FragmentSingleBlockVM";
import type { LayoutRuntime } from "./types";

export class FragmentLoopVM extends FragmentSingleBlockVM {
  readonly kind = "loop" as const;

  constructor(statement: any, loop: any, runtime: LayoutRuntime) {
    super(statement, loop, runtime);
  }

  /**
   * Browser measurements show loop bodies start ~5px higher than the generic
   * block cursor would place them. Nudge nested block layout up to match.
   */
  protected layoutNestedBlock(
    blockContext: any,
    origin: string,
    startTop: number,
  ): number {
    return super.layoutNestedBlock(blockContext, origin, startTop - 5);
  }
}
