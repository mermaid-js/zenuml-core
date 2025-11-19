import { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class ReturnStatementVM extends StatementVM {
  readonly kind = "return" as const;
  private readonly returnContext: any;

  constructor(statement: any, runtime: LayoutRuntime) {
    super(statement, runtime);
    this.returnContext = statement?.ret?.();
  }

  public measure(top: number, _origin: string): StatementCoordinate {
    const context = this.returnContext || this.context;
    const commentHeight = this.measureComment(context);
    const messageTop = top + commentHeight;
    const anchors: StatementCoordinate["anchors"] = { message: messageTop };
    if (commentHeight) {
      anchors.comment = top;
    }
    const messageHeight = this.metrics.returnMessageHeight;
    const height = commentHeight + messageHeight;
    const meta: StatementCoordinate["meta"] = {
      commentHeight,
      messageHeight,
    };
    return { top, height, kind: this.kind, anchors, meta };
  }
}
