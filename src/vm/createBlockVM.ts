import { BlockVM } from "./BlockVM";
import type { LayoutRuntime } from "./types";

export const createBlockVM = (context: any, runtime: LayoutRuntime): BlockVM =>
  new BlockVM(context, runtime);
