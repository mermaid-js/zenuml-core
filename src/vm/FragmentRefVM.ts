import { REF_FRAGMENT_MIN_HEIGHT } from "./FragmentMetrics";
import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";

export class FragmentRefVM extends FragmentVM {
  constructor(statement: any, runtime: LayoutRuntime) {
    super(statement, runtime);
  }

  protected fragmentBodyHeight(_fragmentOrigin: string): number {
    return REF_FRAGMENT_MIN_HEIGHT;
  }
}
