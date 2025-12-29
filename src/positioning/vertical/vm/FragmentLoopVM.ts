import { FragmentSingleBlockVM } from "./FragmentSingleBlockVM";

export class FragmentLoopVM extends FragmentSingleBlockVM {
  readonly kind = "loop" as const;
}
