export type NodeEdge = `${string}.${"top" | "bottom" | "left" | "right"}`;

export type NodeEdges = {
  sourceEdges: Set<NodeEdge>;
  targetEdges: Set<NodeEdge>;
};
