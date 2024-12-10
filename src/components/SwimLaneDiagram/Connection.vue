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
      :points="path"
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
import { NodeEdges } from "./types";
import { watch } from "vue";

interface Props {
  connection: ConnectionModel;
  nodeEdges: NodeEdges;
}

const props = defineProps<Props>();

type Edge = "top" | "right" | "bottom" | "left";

type Point = {
  x: number;
  y: number;
};

type RectPoints = {
  top: Point;
  right: Point;
  bottom: Point;
  left: Point;
};

const getPoints = (rect: DOMRect): RectPoints => {
  return {
    top: { x: rect.x + rect.width / 2, y: rect.y },
    right: { x: rect.x + rect.width, y: rect.y + rect.height / 2 },
    bottom: { x: rect.x + rect.width / 2, y: rect.y + rect.height },
    left: { x: rect.x, y: rect.y + rect.height / 2 },
  };
};

const findEdgeIntraSwimLane = (
  source: NodePositionModel,
  target: NodePositionModel,
) => {
  const sourcePoints = getPoints(source.rect);
  const targetPoints = getPoints(target.rect);
  let sourceEdges = Object.entries(sourcePoints).map(([k, p]) => ({
    key: k as Edge,
    point: p,
    weight: 100,
  }));
  let targetEdges = Object.entries(targetPoints).map(([k, v]) => ({
    key: k as Edge,
    point: v,
    weight: 100,
  }));

  sourceEdges.forEach((edge) => {
    if (props.nodeEdges.targetEdges.has(`${source.id}.${edge.key}`)) {
      // If the edge already has incoming connections, reduce its weight
      edge.weight -= 20;
    }

    if (props.nodeEdges.sourceEdges.has(`${source.id}.${edge.key}`)) {
      // If the edge already has outgoing connections, reduce its weight
      edge.weight -= 5;
      if (source.type === "ifelse") {
        // If the source is an ifelse node, reduce the weight of the edge
        edge.weight -= 10;
      }
    }

    if (source.rank === target.rank) {
      // If the source and target are adjacent, increase the weight of the left/right edges
      if (edge.key === "left" || edge.key === "right") {
        edge.weight += 10;
      }
    } else if (source.rank > target.rank) {
      if (edge.key === "top") {
        edge.weight += 5;
      }
      if (edge.key === "bottom") {
        edge.weight -= 10;
      }
    } else {
      // source is above target
      if (edge.key === "bottom") {
        edge.weight += 5;
      }
      if (edge.key === "top") {
        edge.weight -= 10;
      }
    }
  });

  targetEdges.forEach((edge) => {
    if (props.nodeEdges.sourceEdges.has(`${target.id}.${edge.key}`)) {
      // If the edge already has outgoing connections, reduce its weight
      edge.weight -= 30;
    }

    if (props.nodeEdges.targetEdges.has(`${target.id}.${edge.key}`)) {
      // If the edge already has incoming connections, reduce its weight
      edge.weight -= 5;
    }

    if (source.rank === target.rank) {
      // If the source and target are adjacent, increase the weight of the left/right edges
      if (edge.key === "left" || edge.key === "right") {
        edge.weight += 10;
      }
    } else if (source.rank > target.rank) {
      // source is below target
      if (target.type === "loop") {
        if (edge.key === "left" || edge.key === "right") {
          edge.weight += 10;
        }
      }
      // source is above target
      if (edge.key === "bottom") {
        edge.weight += 5;
      }
      if (edge.key === "top") {
        edge.weight -= 10;
      }
    } else {
      // source is above target
      if (edge.key === "top") {
        edge.weight += 5;
      }
      if (edge.key === "bottom") {
        edge.weight -= 10;
      }
    }
  });

  const sourceEdge = sourceEdges.reduce((prev, curr) =>
    prev.weight > curr.weight ? prev : curr,
  );

  const targetEdge = targetEdges.reduce((prev, curr) =>
    prev.weight > curr.weight ? prev : curr,
  );

  console.log({
    srcId: source.id,
    sourceEdges,
    srcEdge: sourceEdge,
    tgtId: target.id,
    targetEdges,
    tgtEdge: targetEdge,
  });

  return [
    { edge: sourceEdge.key, point: sourcePoints[sourceEdge.key] },
    { edge: targetEdge.key, point: targetPoints[targetEdge.key] },
  ] as const;
};

const findEdgeInterSwimLane = (
  source: NodePositionModel,
  target: NodePositionModel,
) => {
  const sourcePoints = getPoints(source.rect);
  const targetPoints = getPoints(target.rect);
  let sourceEdges = Object.entries(sourcePoints).map(([k, p]) => ({
    key: k as Edge,
    point: p,
    weight: 100,
  }));
  let targetEdges = Object.entries(targetPoints).map(([k, v]) => ({
    key: k as Edge,
    point: v,
    weight: 100,
  }));

  sourceEdges.forEach((edge) => {
    if (props.nodeEdges.targetEdges.has(`${source.id}.${edge.key}`)) {
      // If the edge already has incoming connections, reduce its weight
      edge.weight -= 20;
    }

    if (props.nodeEdges.sourceEdges.has(`${source.id}.${edge.key}`)) {
      // If the edge already has outgoing connections, reduce its weight
      edge.weight -= 5;
      if (source.type === "ifelse") {
        // If the source is an ifelse node, reduce the weight of the edge
        edge.weight -= 10;
      }
    }

    if (source.rank === target.rank) {
      // If the source and target are adjacent, increase the weight of the left/right edges
      if (edge.key === "left" || edge.key === "right") {
        edge.weight += 10;
      }
    } else if (source.rank > target.rank) {
      // source is below target
      if (target.type === "loop") {
        if (edge.key === "left" || edge.key === "right") {
          edge.weight += 10;
        }
        if (
          source.swimLaneIndex < target.swimLaneIndex ||
          edge.key === "right"
        ) {
          edge.weight += 5;
        }
      }
      if (edge.key === "top") {
        edge.weight += 5;
      }
      if (edge.key === "bottom") {
        edge.weight -= 10;
      }
    } else {
      // source is above target
      if (edge.key === "bottom") {
        edge.weight += 5;
      }
      if (edge.key === "top") {
        edge.weight -= 10;
      }
    }

    if (source.swimLaneIndex < target.swimLaneIndex) {
      // If the source is to the left of the target, increase the weight of the right edge
      if (edge.key === "right") {
        edge.weight += 3;
      }
      if (edge.key === "left") {
        edge.weight -= 3;
      }
    } else if (source.swimLaneIndex > target.swimLaneIndex) {
      // If the source is to the right of the target, increase the weight of the left edge
      if (edge.key === "left") {
        edge.weight += 3;
      }
      if (edge.key === "right") {
        edge.weight -= 3;
      }
    }
  });

  targetEdges.forEach((edge) => {
    if (props.nodeEdges.sourceEdges.has(`${target.id}.${edge.key}`)) {
      // If the edge already has outgoing connections, reduce its weight
      edge.weight -= 30;
    }

    if (props.nodeEdges.targetEdges.has(`${target.id}.${edge.key}`)) {
      // If the edge already has incoming connections, reduce its weight
      edge.weight -= 5;
    }

    if (source.rank === target.rank) {
      // If the source and target are adjacent, increase the weight of the left/right edges
      if (edge.key === "left" || edge.key === "right") {
        edge.weight += 10;
      }
    } else if (source.rank > target.rank) {
      // source is below target
      if (target.type === "loop") {
        if (edge.key === "left" || edge.key === "right") {
          edge.weight += 10;
        }
      }
      // source is above target
      if (edge.key === "bottom") {
        edge.weight += 5;
      }
      if (edge.key === "top") {
        edge.weight -= 10;
      }
    } else {
      // source is above target
      if (edge.key === "top") {
        edge.weight += 5;
      }
      if (edge.key === "bottom") {
        edge.weight -= 10;
      }
    }

    if (source.swimLaneIndex > target.swimLaneIndex) {
      if (edge.key === "right") {
        // If the target is to the left of the source, increase the weight of the right edge
        edge.weight += 3;
      }
      if (edge.key === "left") {
        edge.weight -= 5;
      }
    } else if (source.swimLaneIndex < target.swimLaneIndex) {
      if (edge.key === "left") {
        // If the target is to the right of the source, increase the weight of the left edge
        edge.weight += 3;
      }
      if (edge.key === "right") {
        edge.weight -= 5;
      }
    }
  });

  const sourceEdge = sourceEdges.reduce((prev, curr) =>
    prev.weight > curr.weight ? prev : curr,
  );

  const targetEdge = targetEdges.reduce((prev, curr) =>
    prev.weight > curr.weight ? prev : curr,
  );

  console.log({
    srcId: source.id,
    sourceEdges,
    srcEdge: sourceEdge,
    tgtId: target.id,
    targetEdges,
    tgtEdge: targetEdge,
  });

  return [
    { edge: sourceEdge.key, point: sourcePoints[sourceEdge.key] },
    { edge: targetEdge.key, point: targetPoints[targetEdge.key] },
  ] as const;
};

const findPath = (
  start: { point: Point; edge: Edge; node: NodePositionModel },
  end: { point: Point; edge: Edge; node: NodePositionModel },
) => {
  const { point: startPoint, edge: startEdge, node: startNode } = start;
  const { point: endPoint, edge: endEdge, node: endNode } = end;

  const minRectWidth = Math.min(startNode.rect.width, endNode.rect.width);

  const minRectHeight = Math.min(startNode.rect.height, endNode.rect.height);

  const deltaX = Math.max(30, minRectWidth * 0.5);
  const deltaY = Math.max(10, minRectHeight * 0.2);

  // Get window scroll position
  const scrollLeft = window.scrollX || 0;
  const scrollTop = window.scrollY || 0;

  const generatePath = (points: Array<{ x: number; y: number }>) => {
    return points.map((p) => `${p.x},${p.y}`).join("  ");
  };

  // Both edges are top/bottom
  if (
    (startEdge === "top" || startEdge === "bottom") &&
    (endEdge === "top" || endEdge === "bottom")
  ) {
    const startY =
      startEdge === "top" ? startPoint.y - deltaY : startPoint.y + deltaY;
    const endY = endEdge === "top" ? endPoint.y - deltaY : endPoint.y + deltaY;

    return generatePath([
      { x: startPoint.x + scrollLeft, y: startPoint.y + scrollTop },
      { x: startPoint.x + scrollLeft, y: startY + scrollTop },
      { x: endPoint.x + scrollLeft, y: startY + scrollTop },
      { x: endPoint.x + scrollLeft, y: endY + scrollTop },
      { x: endPoint.x + scrollLeft, y: endPoint.y + scrollTop },
    ]);
  }

  // Both edges are left/right
  if (
    (startEdge === "left" || startEdge === "right") &&
    (endEdge === "left" || endEdge === "right")
  ) {
    const startX =
      startEdge === "left" ? startPoint.x - deltaX : startPoint.x + deltaX;
    const endX = endEdge === "left" ? endPoint.x - deltaX : endPoint.x + deltaX;

    return generatePath([
      { x: startPoint.x + scrollLeft, y: startPoint.y + scrollTop },
      { x: startX + scrollLeft, y: startPoint.y + scrollTop },
      { x: startX + scrollLeft, y: endPoint.y + scrollTop },
      { x: endX + scrollLeft, y: endPoint.y + scrollTop },
      { x: endPoint.x + scrollLeft, y: endPoint.y + scrollTop },
    ]);
  }

  // Start is top/bottom, end is left/right
  if (
    (startEdge === "top" || startEdge === "bottom") &&
    (endEdge === "left" || endEdge === "right")
  ) {
    const startY =
      startEdge === "top" ? startPoint.y - deltaY : startPoint.y + deltaY;
    const endX = endEdge === "left" ? endPoint.x - deltaX : endPoint.x + deltaX;

    return generatePath([
      { x: startPoint.x + scrollLeft, y: startPoint.y + scrollTop },
      { x: startPoint.x + scrollLeft, y: startY + scrollTop },
      { x: startPoint.x + scrollLeft, y: endPoint.y + scrollTop },
      { x: endX + scrollLeft, y: endPoint.y + scrollTop },
      { x: endPoint.x + scrollLeft, y: endPoint.y + scrollTop },
    ]);
  }

  // Start is left/right, end is top/bottom
  if (
    (startEdge === "left" || startEdge === "right") &&
    (endEdge === "top" || endEdge === "bottom")
  ) {
    const startX =
      startEdge === "left" ? startPoint.x - deltaX : startPoint.x + deltaX;
    const endY = endEdge === "top" ? endPoint.y - deltaY : endPoint.y + deltaY;

    return generatePath([
      { x: startPoint.x + scrollLeft, y: startPoint.y + scrollTop },
      { x: startX + scrollLeft, y: startPoint.y + scrollTop },
      { x: startX + scrollLeft, y: endY + scrollTop },
      { x: endPoint.x + scrollLeft, y: endY + scrollTop },
      { x: endPoint.x + scrollLeft, y: endPoint.y + scrollTop },
    ]);
  }

  return "";
};

const edge = computed(() => {
  const [
    { edge: startEdge, point: startEdgePoint },
    { edge: endEdge, point: endEdgePoint },
  ] =
    props.connection.source.swimLaneId === props.connection.target.swimLaneId
      ? findEdgeIntraSwimLane(props.connection.source, props.connection.target)
      : findEdgeInterSwimLane(props.connection.source, props.connection.target);
  return { startEdge, startEdgePoint, endEdge, endEdgePoint };
});

const path = computed(() => {
  return findPath(
    {
      point: edge.value.startEdgePoint,
      edge: edge.value.startEdge,
      node: props.connection.source,
    },
    {
      point: edge.value.endEdgePoint,
      edge: edge.value.endEdge,
      node: props.connection.target,
    },
  );
});

watch(
  edge,
  (newEdge) => {
    const { source, target } = props.connection;
    props.nodeEdges.sourceEdges?.add(`${source.id}.${newEdge.startEdge}`);
    props.nodeEdges.targetEdges?.add(`${target.id}.${newEdge.endEdge}`);
  },
  { immediate: true },
);
</script>
