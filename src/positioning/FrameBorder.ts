import { FRAGMENT_PADDING_X } from "@/positioning/Constants";

export interface Frame {
  type?: string;
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

/**
 * Type of the frame FrameBuilder.getFrame returns when a context holds several
 * top-level fragments. It is not a fragment itself, so it adds no border; its
 * border is the widest border of the fragments it holds.
 */
export const TOP_LEVEL_FRAGMENTS = "top-level-fragments";

/**
 * One top-level fragment is returned as is. Several are wrapped so that
 * FrameBorder sees all of them; returning only the first one made the diagram
 * frame too narrow for a later, more deeply nested fragment.
 */
export function topLevelFrame(frames: Frame[]): Frame | null {
  if (frames.length === 0) return null;
  if (frames.length === 1) return frames[0];
  return { type: TOP_LEVEL_FRAGMENTS, left: "", right: "", children: frames };
}

export default function FrameBorder(frame: Frame | null): {
  left: number;
  right: number;
} {
  if (!frame) {
    return { left: 0, right: 0 };
  }
  if (frame.type === TOP_LEVEL_FRAGMENTS) {
    const borders = (frame.children ?? []).map(FrameBorder);
    return {
      left: Math.max(0, ...borders.map((b) => b.left)),
      right: Math.max(0, ...borders.map((b) => b.right)),
    };
  }
  return {
    left: FRAGMENT_PADDING_X * longestPath(frame, PathType.LEFT),
    right: FRAGMENT_PADDING_X * longestPath(frame, PathType.RIGHT),
  };
}
