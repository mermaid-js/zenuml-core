import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
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

  public measure(top: number, origin: string): StatementCoordinate {
    const context = this.returnContext || this.context;
    const commentHeight = this.measureComment(context);
    const messageTop = top + commentHeight;
    const anchors: StatementCoordinate["anchors"] = { message: messageTop };
    if (commentHeight) {
      anchors.comment = top;
    }
    const ret = this.returnContext;
    const asyncMessage = ret?.asyncMessage?.();
    const source = asyncMessage?.From?.() || ret?.From?.() || _STARTER_;
    const target =
      asyncMessage?.to?.()?.getFormattedText?.() ||
      ret?.ReturnTo?.() ||
      _STARTER_;
    const isSelf = source === target;
    const messageHeight = isSelf
      ? this.metrics.returnSelfMessageHeight
      : this.metrics.returnMessageHeight;
    const height = commentHeight + messageHeight;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      messageHeight,
    };
    return { top, height, kind: this.kind, anchors, meta };
  }
}
