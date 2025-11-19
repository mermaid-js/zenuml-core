import { FragmentSingleBlockVM } from "./FragmentSingleBlockVM";
import type { LayoutRuntime } from "./types";

export class FragmentLoopVM extends FragmentSingleBlockVM {
  readonly kind = "loop" as const;

  constructor(
    statement: any,
    loop: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, loop, runtime);
  }
}
