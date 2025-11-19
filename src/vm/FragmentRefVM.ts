import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";

export class FragmentRefVM extends FragmentVM {
  readonly kind = "ref" as const;

  constructor(statement: any, runtime: LayoutRuntime) {
    super(statement, runtime);
  }

  public measure(top: number, _origin: string): StatementCoordinate {
    const context = this.context?.ref?.() || this.context;
    const commentHeight = this.measureComment(context);
    const headerHeight = this.metrics.fragmentHeaderHeight;
    const height =
      commentHeight + headerHeight + this.metrics.fragmentPaddingBottom;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      headerHeight,
      paddingBottom: this.metrics.fragmentPaddingBottom,
    };
    return { top, height, kind: this.kind, meta };
  }
}
