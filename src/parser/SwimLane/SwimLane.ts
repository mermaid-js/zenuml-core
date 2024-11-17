import { Edge } from "./Edge";
import { Node } from "./Node";
import { Shape } from "./types";

export class SwimLane implements Shape {
  id: string;
  name: string;
  nodes: Node[] = [];
  inBoundNode: Node | null = null;

  constructor(name: string) {
    this.id = crypto.randomUUID();
    this.name = name;
  }

  setInBoundNode(node: Node) {
    this.inBoundNode = node;
  }

  lastNode() {
    return this.nodes[this.nodes.length - 1];
  }

  addNode(node: Node) {
    if (this.inBoundNode) {
      node.setPrevNode(this.inBoundNode);
      this.inBoundNode = null;
    } else if (this.lastNode()) {
      node.setPrevNode(this.lastNode());
    }
    this.nodes.push(node);
  }

  get maxRank() {
    return Math.max(-1, ...this.nodes.map((node) => node.rank));
  }

  get edges() {
    return this.nodes.reduce((acc, node) => {
      if (node.prevNode) {
        const edge = new Edge(node.prevNode, node);
        acc.push(edge);
      }
      return acc;
    }, [] as Edge[]);
  }

  toJSON() {
    return {
      name: this.name,
      nodes: this.nodes.map((node) => node.toJSON()),
      edges: this.edges.map((edge) => edge.toJSON()),
    };
  }
}

export class SwimLanes {
  lanes: Map<string, SwimLane> = new Map();
  rank: number = 0;

  getLane(lane: string): SwimLane {
    if (lane === "") {
      throw new Error("Lane name cannot be empty");
    }
    if (this.lanes.has(lane)) {
      return this.lanes.get(lane)!;
    } else {
      const swimLane = new SwimLane(lane);
      this.lanes.set(lane, swimLane);
      return swimLane;
    }
  }

  getMaxRank() {
    return Math.max(
      0,
      ...Array.from(this.lanes.values()).map((lane) => lane.maxRank),
    );
  }

  toJson() {
    return Object.fromEntries(
      Array.from(this.lanes.entries()).map(([key, value]) => [
        key,
        value.toJSON(),
      ]),
    );
  }
}
