import {
  CONDITION_LABEL_HEIGHT,
  FRAGMENT_SEGMENT_MARGIN,
} from "./FragmentMetrics";
import { FragmentVM } from "./FragmentVM";
import { toArray } from "./toArray";

export class FragmentTryCatchVM extends FragmentVM {
  constructor(statement: any, private readonly tcf: any) {
    super(statement);
  }

  protected fragmentBodyHeight(fragmentOrigin: string): number {
    let height = 0;

    const tryBlock = this.tcf?.tryBlock?.()?.braceBlock?.()?.block?.();
    height += this.blockHeight(tryBlock, fragmentOrigin);

    const catchBlocks = toArray(this.tcf?.catchBlock?.());
    catchBlocks.forEach((catchBlock: any) => {
      height += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      const block = catchBlock?.braceBlock?.()?.block?.();
      height += this.blockHeight(block, fragmentOrigin);
    });

    const finallyBlock = this.tcf?.finallyBlock?.()?.braceBlock?.()?.block?.();
    if (finallyBlock) {
      height += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      height += this.blockHeight(finallyBlock, fragmentOrigin);
    }

    return height;
  }
}
