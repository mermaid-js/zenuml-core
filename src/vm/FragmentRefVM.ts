import { REF_FRAGMENT_MIN_HEIGHT } from "./FragmentMetrics";
import { FragmentVM } from "./FragmentVM";

export class FragmentRefVM extends FragmentVM {
  protected fragmentBodyHeight(_fragmentOrigin: string): number {
    return REF_FRAGMENT_MIN_HEIGHT;
  }
}
