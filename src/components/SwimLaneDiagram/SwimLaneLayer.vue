<template>
  <div
    class="relative grid gap-0 w-full border rounded"
    :style="{
      gridTemplateColumns: `repeat(${diagramModel.swimLanes.length}, minmax(min-content, 1fr))`,
    }"
    ref="containerRef"
  >
    <!-- first row -->
    <div
      v-for="swimLane in diagramModel.swimLanes"
      :key="swimLane"
      class="text-center min-w-[48px] border-b border-r last:border-r-0"
      :class="{
        'border-r-0':
          swimLane ===
          diagramModel.swimLanes[diagramModel.swimLanes.length - 1],
      }"
    >
      {{ swimLane }}
    </div>
    <template v-for="(row, rowIndex) in gridItems" :key="rowIndex">
      <template v-for="(items, colIndex) in row" :key="colIndex">
        <div
          class="border-r px-4 py-6 z-10 flex flex-row gap-4"
          :class="{
            'border-r-0': colIndex === row.length - 1,
            'justify-center': items.length === 1,
            'justify-between': items.length > 1,
          }"
        >
          <template v-for="item in items" :key="item.id">
            <component :is="NodeComponents[item.type]" :node="item" />
          </template>
        </div>
      </template>
    </template>

    <connection-layer :connections="connections" />
  </div>
</template>

<script setup lang="ts">
import {
  ConnectionModel,
  NodeModel,
  SwimLaneDiagramModel,
  NodePositionModel,
  NodeType,
} from "@/parser/SwimLane/types";
import { ref, computed, onBeforeUnmount, onUpdated, watch, provide } from "vue";
import ConnectionLayer from "./ConnectionLayer.vue";
import MessageNode from "./MessageNode.vue";
import ConditionalNode from "./ConditionalNode.vue";
import { RegisterMountKey, UnregisterMountKey } from "./types";

interface Props {
  diagramModel: SwimLaneDiagramModel;
}

const props = defineProps<Props>();

const containerRef = ref<HTMLDivElement>();
const resizeObserver = ref<ResizeObserver>();

const gridItems = computed(() => {
  if (props.diagramModel.swimLanes.length === 0) {
    return [];
  }

  // Add 1 to maxRank since ranks are 0-based
  const rows = props.diagramModel.maxRank + 1;
  const cols = props.diagramModel.swimLanes.length;

  // Create 2D array using Array.from
  const items = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [] as NodeModel[]),
  );

  props.diagramModel.nodes.forEach((node) => {
    const swimLaneIndex = props.diagramModel.swimLanes.indexOf(node.swimLane);
    items[node.rank][swimLaneIndex].push(node);
  });

  return items;
});

const nodePositions = ref<NodePositionModel[]>([]);

const connections = computed(() => {
  return props.diagramModel.edges
    .map((edge) => ({
      id: edge.id,
      source: nodePositions.value.find((node) => node.id === edge.source),
      target: nodePositions.value.find((node) => node.id === edge.target),
    }))
    .filter((connection) => connection.source && connection.target)
    .sort((a, b) => {
      return (
        a.source!.rank * 2 +
        a.source!.swimLaneIndex -
        (b.source!.rank * 2 + b.source!.swimLaneIndex)
      );
    }) as ConnectionModel[];
});

const getNodePositions = () => {
  if (!containerRef.value) {
    return [];
  }

  const nodePositions = props.diagramModel.nodes
    .map((node) => {
      const element = document.getElementById(node.id);
      if (!element) {
        return null;
      }
      const rect = element.getBoundingClientRect();
      const domRect = new DOMRect(
        rect.left - containerRef.value!.offsetLeft,
        rect.top - containerRef.value!.offsetTop,
        rect.width,
        rect.height,
      );
      return {
        id: node.id,
        rect: domRect,
        rank: node.rank,
        swimLaneId: node.swimLane,
        swimLaneIndex: props.diagramModel.swimLanes.indexOf(node.swimLane),
        type: node.type,
      };
    })
    .filter((position) => position !== null);

  return nodePositions;
};

// Remove debounce from updateNodePositions
const pendingMounts = ref(new Set());
const isFullyMounted = ref(false);
const updateNodePositions = () => {
  nodePositions.value = getNodePositions();
};

// Add a flag to track if update is pending
// Provide mounting registration method to children
provide(RegisterMountKey, (id: string) => {
  pendingMounts.value.add(id);
});

provide(UnregisterMountKey, (id: string) => {
  pendingMounts.value.delete(id);
  if (pendingMounts.value.size === 0) {
    isFullyMounted.value = true;
  }
});

// Debounced version of triggerUpdate
// const triggerUpdate = debounce(() => {
//   if (!isUpdatePending.value) {
//     isUpdatePending.value = true;
//     // Use nextTick to ensure DOM is updated
//     nextTick(() => {
//       updateNodePositions();
//       isUpdatePending.value = false;
//     });
//   }
// }, 1000);

// Modified ResizeObserver setup
watch(isFullyMounted, () => {
  if (isFullyMounted.value && containerRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      console.log("resizeObserver");
      updateNodePositions();
    });
    resizeObserver.value.observe(containerRef.value);
    updateNodePositions();
  }
});

// Replace watch with watchEffect to handle all reactive dependencies
// watch(props.diagramModel, () => {
//   // Access diagram data to track changes
//   triggerUpdate();
// });

// Clean up
onBeforeUnmount(() => {
  resizeObserver.value?.disconnect();
});

// Keep existing onUpdated hook
onUpdated(() => {
  updateNodePositions();
});

// Register components for dynamic rendering
const NodeComponents: Record<NodeType, any> = {
  message: MessageNode,
  ifelse: ConditionalNode,
  endif: ConditionalNode,
  loop: ConditionalNode,
};
</script>
