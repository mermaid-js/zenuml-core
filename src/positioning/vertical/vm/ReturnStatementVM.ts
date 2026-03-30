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
    // The collapse only applies to direct-child returns in the last position AND
    // only when the block is (directly or indirectly) inside an occurrence element
    // (i.e. a sync message or creation with a braceBlock body).
    //
    // If the return's fragment section block is NOT inside any occurrence, the CSS
    // ancestor selector `.occurrence .block` does not match, so the return occupies
    // its full 16px height in HTML.
    if (!isSelf) {
      const block = this.context?.parentCtx;
      const siblings = block?.stat?.() || [];
      const isLast = siblings[siblings.length - 1] === this.context;
      // Walk up to check if any ancestor context is a message/creation (occurrence body).
      // `message` context has a `messageBody()` method; `creation` has `creationBody()`.
      // Root-level or fragment-only contexts (alt/tcf/loop/etc.) have neither.
      const isInsideOccurrence = (() => {
        let ctx = block?.parentCtx; // start from braceBlock upward
        while (ctx) {
          if (typeof ctx.messageBody === "function" || typeof ctx.creationBody === "function") {
            return true;
          }
          ctx = ctx.parentCtx;
        }
        return false;
      })();
      if (!isLast || !isInsideOccurrence) {
        cursor += 16;
      }
    }

    const height = cursor - top;
    // console.info("returnVM::", top, commentHeight, source, target, height);

    return { top, height, kind: this.kind };
  }
}
