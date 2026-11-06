import type { StatementCoordinate } from "../StatementCoordinate";
import { StatementVM } from "./StatementVM";

export class FragmentRefVM extends StatementVM {
  readonly kind = "ref" as const;

  public measure(top: number): StatementCoordinate {
    const context = this.context?.ref?.() || this.context;
    const commentHeight = this.measureComment(context);
    const headerHeight = this.metrics.fragmentHeaderHeight;
    const height =
      commentHeight + headerHeight + this.metrics.fragmentPaddingBottom;
    return { top, height, kind: this.kind };
  }
}
