import type { StatementCoordinate } from "@/positioning/vertical/StatementCoordinate";
import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";

export class FragmentTryCatchVM extends FragmentVM {
  readonly kind = "tcf" as const;

  constructor(
    statement: any,
    private readonly tcf: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  public measure(top: number, origin: string): StatementCoordinate {
    const {
      cursor: startCursor,
      commentHeight,
      headerHeight,
    } = this.beginFragment(this.tcf, top);
    let cursor = startCursor;
    const leftParticipant =
      this.findLeftParticipant(this.tcf, origin) || origin;

    const tryBlock = this.tcf?.tryBlock?.()?.braceBlock?.()?.block?.();
    if (tryBlock) {
      cursor = this.layoutBlock(tryBlock, leftParticipant, cursor);
    }

    const catchBlocks = this.tcf?.catchBlock?.() || [];
    catchBlocks.forEach((catchBlock: any) => {
      cursor += this.metrics.fragmentBranchGap;
      cursor += this.metrics.tcfSegmentHeaderHeight;
      const block = catchBlock?.braceBlock?.()?.block?.();
      cursor = this.layoutBlock(block, leftParticipant, cursor);
    });

    const finallyBlock = this.tcf?.finallyBlock?.()?.braceBlock?.()?.block?.();
    if (finallyBlock) {
      cursor += this.metrics.fragmentBranchGap;
      cursor += this.metrics.tcfSegmentHeaderHeight;
      cursor = this.layoutBlock(finallyBlock, leftParticipant, cursor);
    }

    const result = this.finalizeFragment(top, cursor, {
      commentHeight,
      headerHeight,
      branchGap: this.metrics.fragmentBranchGap,
      tryBlock: tryBlock ? 1 : 0,
      catchBlocks: catchBlocks.length,
      finallyBlock: finallyBlock ? 1 : 0,
    });

    return {
      top: result.top,
      height: result.height,
      kind: this.kind,
      meta: result.meta,
    };
  }
}
