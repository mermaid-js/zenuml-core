<template>
  <svg class="absolute inset-0 w-full h-full">
    <defs>
      <marker
        id="arrowhead"
        markerWidth="8"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="black" />
      </marker>
    </defs>
    <polyline
      :points="points"
      fill="none"
      stroke="black"
      stroke-width="2"
      marker-end="url(#arrowhead)"
    />
  </svg>
</template>

<script setup lang="ts">
import { ConnectionModel, NodePositionModel } from "@/parser/SwimLane/types";
import { computed } from "vue";

interface Props {
  connection: ConnectionModel;
}

const props = defineProps<Props>();

type Edge = "top" | "right" | "bottom" | "left";

type Point = {
  x: number;
  y: number;
};

type BoxPoints = {
  center: Point;
  top: Point;
  right: Point;
  bottom: Point;
  left: Point;
};

const getPoints = (rect: DOMRect) => {
  return {
    center: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
    top: { x: rect.x + rect.width / 2, y: rect.y },
    right: { x: rect.x + rect.width, y: rect.y + rect.height / 2 },
    bottom: { x: rect.x + rect.width / 2, y: rect.y + rect.height },
    left: { x: rect.x, y: rect.y + rect.height / 2 },
  };
};

const findEdgeCenter = (source: BoxPoints, target: BoxPoints) => {
  // Calculate distances to each edge center
  const edges: Record<
    Exclude<keyof BoxPoints, "center">,
    { x: number; y: number; dist: number }
  > = {
    top: { ...source.top, dist: 0 },
    right: { ...source.right, dist: 0 },
    bottom: { ...source.bottom, dist: 0 },
    left: { ...source.left, dist: 0 },
  };

  // Calculate distance from target to each edge center
  Object.values(edges).forEach((edge) => {
    edge.dist = Math.sqrt(
      Math.pow(target.center.x - edge.x, 2) +
        Math.pow(target.center.y - edge.y, 2),
    );
  });

  // Return the coordinates of the closest edge center
  const closestEdge = (Object.keys(edges) as Array<Edge>).reduce(
    (closest, current) =>
      edges[current].dist < edges[closest].dist ? current : closest,
  );
  const closestEdgePoint: Point = {
    x: edges[closestEdge].x,
    y: edges[closestEdge].y,
  };

  return [closestEdge, closestEdgePoint] as const;
};

const findClosestEdgeIntraSwimLane = (
  source: NodePositionModel,
  target: NodePositionModel,
) => {
  const sourcePoints = getPoints(source.rect);
  const targetPoints = getPoints(target.rect);

  const [startEdge, startEdgePoint] = findEdgeCenter(
    sourcePoints,
    targetPoints,
  );
  const [endEdge, endEdgePoint] = findEdgeCenter(targetPoints, sourcePoints);

  return [
    { edge: startEdge, point: startEdgePoint },
    { edge: endEdge, point: endEdgePoint },
  ] as const;
};

const findClosestEdgeInterSwimLane = (
  source: NodePositionModel,
  target: NodePositionModel,
) => {
  const sourcePoints = getPoints(source.rect);
  const targetPoints = getPoints(target.rect);
  let sourceEdges = Object.entries(sourcePoints).map(([k, p]) => ({
    key: k as Edge,
    point: p,
  }));
  let targetEdges = Object.entries(targetPoints).map(([k, v]) => ({
    key: k as Edge,
    point: v,
  }));

  if (source.rank === target.rank) {
    sourceEdges = sourceEdges.filter(
      (edge) => edge.key === "left" || edge.key === "right",
    );
    targetEdges = targetEdges.filter(
      (edge) => edge.key === "left" || edge.key === "right",
    );
  } else {
    if (source.rank > target.rank) {
      sourceEdges = sourceEdges.filter(
        (edge) => edge.key === "left" || edge.key === "right",
      );
      targetEdges = targetEdges.filter((edge) => edge.key === "bottom");
    } else {
      sourceEdges = sourceEdges.filter((edge) => edge.key === "bottom");
      targetEdges = targetEdges.filter(
        (edge) => edge.key === "left" || edge.key === "right",
      );
    }
  }

  // console.log({ sourceEdges, targetEdges });

  let minDist = Infinity;
  let closestEdges: [Edge, Edge] = ["top", "top"];
  for (const sourceEdge of sourceEdges) {
    for (const targetEdge of targetEdges) {
      const dist = Math.sqrt(
        Math.pow(targetEdge.point.x - sourceEdge.point.x, 2) +
          Math.pow(targetEdge.point.y - sourceEdge.point.y, 2),
      );
      if (dist <= minDist) {
        minDist = dist;
        closestEdges = [sourceEdge.key, targetEdge.key];
      }
    }
  }

  return [
    { edge: closestEdges[0], point: sourcePoints[closestEdges[0]] },
    { edge: closestEdges[1], point: targetPoints[closestEdges[1]] },
  ] as const;
};

const calculatePoints = (
  startNode: NodePositionModel,
  endNode: NodePositionModel,
) => {
  const [
    { edge: startEdge, point: startEdgePoint },
    { edge: endEdge, point: endEdgePoint },
  ] =
    startNode.swimLane === endNode.swimLane
      ? findClosestEdgeIntraSwimLane(startNode, endNode)
      : findClosestEdgeInterSwimLane(startNode, endNode);
  // console.log({
  //   startEdge,
  //   startEdgePoint,
  //   endEdge,
  //   endEdgePoint,
  // });

  const midX = (startEdgePoint.x + endEdgePoint.x) / 2;
  const midY = (startEdgePoint.y + endEdgePoint.y) / 2;

  if (
    (startEdge === "top" && endEdge === "bottom") ||
    (startEdge === "bottom" && endEdge === "top")
  ) {
    return `${startEdgePoint.x},${startEdgePoint.y} ${startEdgePoint.x},${midY} ${endEdgePoint.x},${midY} ${endEdgePoint.x},${endEdgePoint.y}`;
  }
  if (
    (startEdge === "left" || startEdge === "right") &&
    (endEdge === "top" || endEdge === "bottom")
  ) {
    return `${startEdgePoint.x},${startEdgePoint.y} ${endEdgePoint.x},${startEdgePoint.y} ${endEdgePoint.x},${endEdgePoint.y}`;
  }
  if (
    (startEdge === "top" || startEdge === "bottom") &&
    (endEdge === "left" || endEdge === "right")
  ) {
    return `${startEdgePoint.x},${startEdgePoint.y} ${startEdgePoint.x},${endEdgePoint.y} ${endEdgePoint.x},${endEdgePoint.y}`;
  }
  if (
    (startEdge === "left" && endEdge === "right") ||
    (startEdge === "right" && endEdge === "left")
  ) {
    return `${startEdgePoint.x},${startEdgePoint.y} ${midX},${startEdgePoint.y} ${midX},${endEdgePoint.y} ${endEdgePoint.x},${endEdgePoint.y}`;
  }

  return "";
};

const points = computed(() => {
  return calculatePoints(props.connection.source, props.connection.target);
});
</script>
