import { FragmentSingleBlockVM } from "./FragmentSingleBlockVM";

export class FragmentSectionVM extends FragmentSingleBlockVM {
  readonly kind = "section" as const;
}
