import type { StatementCoordinate } from "../StatementCoordinate";
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
    const leftParticipant =
      this.findLeftParticipant(this.tcf, origin) || origin;

    const commentHeight = this.measureComment(this.tcf);
    let cursor = top + 1 + this.metrics.fragmentHeaderHeight + commentHeight;

    const tryBlock = this.tcf?.tryBlock?.()?.braceBlock?.()?.block?.();
    if (tryBlock) {
      cursor = this.layoutBlock(tryBlock, leftParticipant, cursor);
    }

    const catchBlocks = this.tcf?.catchBlock?.() || [];
    catchBlocks.forEach((catchBlock: any) => {
      cursor += 20; // .text-skin-fragment > label
      cursor += 8; // .mt-2
      cursor += 1; // .segment.border-t.border-solid
      const block = catchBlock?.braceBlock?.()?.block?.();
      cursor = this.layoutBlock(block, leftParticipant, cursor);
    });

    const finallyBlock = this.tcf?.finallyBlock?.()?.braceBlock?.()?.block?.();
    if (finallyBlock) {
      cursor += 20; // .text-skin-fragment > label
      cursor += 8; // .mt-2
      cursor += 1; // .segment.border-t.border-solid
      cursor = this.layoutBlock(finallyBlock, leftParticipant, cursor);
    }

    cursor += this.metrics.fragmentPaddingBottom + 1; // .fragment =>padding-bottom: 10px
    // console.info("FragmentTryCatchVM::end", cursor, cursor - top);

    return {
      top,
      height: cursor - top,
      kind: this.kind,
    };
  }
}
