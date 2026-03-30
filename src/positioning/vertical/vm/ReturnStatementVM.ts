import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";
import { _STARTER_ } from "@/parser/OrderedParticipants";

export class ReturnStatementVM extends StatementVM {
  readonly kind = "return" as const;
  private readonly returnContext: any;

  constructor(statement: any, runtime: LayoutRuntime) {
    super(statement, runtime);
    this.returnContext = statement?.ret?.();
  }

  public measure(top: number): StatementCoordinate {
    const context = this.returnContext || this.context;
    const commentHeight = this.measureComment(context);
    let cursor = top + commentHeight;

    const ret = this.returnContext;
    const asyncMessage = ret?.asyncMessage?.();
    const source = asyncMessage?.From?.() || ret?.From?.() || _STARTER_;
    const target =
      asyncMessage?.to?.()?.getFormattedText?.() ||
      ret?.ReturnTo?.() ||
      _STARTER_;
    const isSelf = source === target;

    const messageHeight = isSelf ? 20 : 0;
    cursor += messageHeight;

    // CSS: .occurrence .block > .statement-container:last-child > .interaction.return
    // applies margin-bottom: -16px, collapsing the return's bottom space.
    // The collapse only applies to direct-child returns in the last position.
    // Non-last returns render with their full height (16px from .h-4 interaction).
    if (!isSelf) {
      const block = this.context?.parentCtx;
      const siblings = block?.stat?.() || [];
      const isLast = siblings[siblings.length - 1] === this.context;
      if (!isLast) {
        cursor += 16;
      }
    }

    const height = cursor - top;
    // console.info("returnVM::", top, commentHeight, source, target, height);

    return { top, height, kind: this.kind };
  }
}
