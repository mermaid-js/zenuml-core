import { FRAGMENT_PADDING_X } from "@/positioning/Constants";

export interface Frame {
  left: string;
  right: string;
  children?: Frame[];
}

enum PathType {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

function longestPath(frame: Frame, pathType: PathType): number {
  if (!frame.children || frame.children.length === 0) {
    return 1;
  }

  let maxDepth = 0;
  for (const child of frame.children) {
    if (
      (pathType === PathType.LEFT && child.left !== frame.left) ||
      (pathType === PathType.RIGHT && child.right !== frame.right)
    ) {
      continue;
    }
    maxDepth = Math.max(maxDepth, longestPath(child, pathType));
  }

  return maxDepth + 1;
}

export default function FrameBorder(frame: Frame) {
  if (!frame) {
    return { left: 0, right: 0 };
  }
  return {
    left: FRAGMENT_PADDING_X * longestPath(frame, PathType.LEFT),
    right: FRAGMENT_PADDING_X * longestPath(frame, PathType.RIGHT),
  };
}
