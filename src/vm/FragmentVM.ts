import { StatementVM } from "./StatementVM";

export abstract class FragmentVM extends StatementVM {
  protected beginFragment(context: any, top: number) {
    const commentHeight = this.measureComment(context);
    const headerHeight = this.metrics.fragmentHeaderHeight;

    return {
      cursor: top + commentHeight + headerHeight,
      commentHeight,
      headerHeight,
    };
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
        ...meta,
      },
    } as const;
  }
}
