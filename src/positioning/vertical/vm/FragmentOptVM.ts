import { FragmentSingleBlockVM } from "./FragmentSingleBlockVM";

export class FragmentOptVM extends FragmentSingleBlockVM {
  readonly kind = "opt" as const;
}
