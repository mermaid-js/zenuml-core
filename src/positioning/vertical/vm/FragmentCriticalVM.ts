import { FragmentSingleBlockVM } from "./FragmentSingleBlockVM";

export class FragmentCriticalVM extends FragmentSingleBlockVM {
  readonly kind = "critical" as const;
}
