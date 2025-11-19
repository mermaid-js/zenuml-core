import { StatementVM } from "./StatementVM";

export abstract class FragmentVM extends StatementVM {
  protected beginFragment(context: any, top: number) {
    const commentHeight = this.measureComment(context);
    const headerHeight = this.metrics.fragmentHeaderHeight;
    let cursor =
      top + commentHeight + headerHeight + this.metrics.fragmentBodyGap;
    return { cursor, commentHeight, headerHeight };
  }

  protected finalizeFragment(
    top: number,
    cursor: number,
    meta: Record<string, number>,
  ) {
    cursor += this.metrics.fragmentPaddingBottom;
    return {
      top,
      height: cursor - top,
      meta: {
        paddingBottom: this.metrics.fragmentPaddingBottom,
        bodyGap: this.metrics.fragmentBodyGap,
        ...meta,
      },
    } as const;
  }
}
