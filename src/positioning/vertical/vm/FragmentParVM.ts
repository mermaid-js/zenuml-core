import { FragmentSingleBlockVM } from "./FragmentSingleBlockVM";

export class FragmentParVM extends FragmentSingleBlockVM {
  readonly kind = "par" as const;
}
