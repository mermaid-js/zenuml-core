import {
  CONDITION_LABEL_HEIGHT,
  FRAGMENT_SEGMENT_MARGIN,
} from "./FragmentMetrics";
import { FragmentVM } from "./FragmentVM";
import { toArray } from "./toArray";

export class FragmentAltVM extends FragmentVM {
  constructor(statement: any, private readonly alt: any) {
    super(statement);
  }

  protected fragmentBodyHeight(fragmentOrigin: string): number {
    let height = 0;

    const ifBlock = this.alt?.ifBlock?.()?.braceBlock?.()?.block?.();
    if (ifBlock) {
      height += CONDITION_LABEL_HEIGHT;
      height += this.blockHeight(ifBlock, fragmentOrigin);
    }

    const elseIfBlocks = toArray(this.alt?.elseIfBlock?.());
    elseIfBlocks.forEach((elseIfBlock: any) => {
      height += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      const block = elseIfBlock?.braceBlock?.()?.block?.();
      height += this.blockHeight(block, fragmentOrigin);
    });

    const elseBlock = this.alt?.elseBlock?.()?.braceBlock?.()?.block?.();
    if (elseBlock) {
      height += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      height += this.blockHeight(elseBlock, fragmentOrigin);
    }

    return height;
  }
}
