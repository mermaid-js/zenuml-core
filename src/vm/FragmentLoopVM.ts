import { CONDITION_LABEL_HEIGHT } from "./FragmentMetrics";
import { FragmentVM } from "./FragmentVM";

export class FragmentLoopVM extends FragmentVM {
  constructor(statement: any, private readonly loop: any) {
    super(statement);
  }

  protected fragmentBodyHeight(fragmentOrigin: string): number {
    let height = 0;
    if (this.loop?.parExpr?.()?.condition?.()) {
      height += CONDITION_LABEL_HEIGHT;
    }
    const nestedBlock = this.loop?.braceBlock?.()?.block?.();
    height += this.blockHeight(nestedBlock, fragmentOrigin);
    return height;
  }
}
