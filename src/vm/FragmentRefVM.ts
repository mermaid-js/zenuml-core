import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { FragmentVM } from "./FragmentVM";

export class FragmentRefVM extends FragmentVM {
  readonly kind = "ref" as const;

  public measure(top: number): StatementCoordinate {
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
