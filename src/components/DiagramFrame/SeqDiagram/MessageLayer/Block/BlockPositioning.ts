import { BlockVM } from "@/vm/BlockVM";
import type { BlockLayout } from "@/vm/types";

export { getCommentHeight } from "@/vm/getCommentHeight";
export {
  CONDITION_LABEL_HEIGHT,
  FRAGMENT_SEGMENT_MARGIN,
} from "@/vm/FragmentMetrics";

export const accumulateBlock = (
  blockContext: any,
  origin: string,
  startTop: number,
): BlockLayout => {
  return new BlockVM(blockContext).layout(origin, startTop);
};

export const advanceNestedBlock = (
  blockContext: any,
  origin: string,
  startTop: number,
) => {
  if (!blockContext) return startTop;
  return new BlockVM(blockContext).advance(origin, startTop);
};
