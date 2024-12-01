import { BaseNode, EmptyMessageNode } from "./Nodes";
import { RootStatement } from "./Statement";
import { IStatement, JSONable } from "./types";
import { rootContext } from "./Diagram";
import { Edge } from "./Edge";

export class SwimLane implements JSONable {
  id: string;
  name: string;
  nodes: BaseNode[] = [];
  inBoundNode: BaseNode | null = null;

  constructor(name: string) {
    this.id = crypto.randomUUID();
    this.name = name;
  }

  setInboundNode(node: BaseNode) {
    this.inBoundNode = node;
  }

  lastNode() {
    return this.nodes[this.nodes.length - 1];
  }

  addNode(node: BaseNode) {
    if (this.inBoundNode) {
      node.setPrevNode(this.inBoundNode);
      this.inBoundNode = null;
      this.nodes.push(node);
      return;
    }

    const lastNode = this.lastNode();
    if (lastNode) {
      if (lastNode instanceof EmptyMessageNode) {
        if (lastNode.prevNode) {
          node.setPrevNode(lastNode.prevNode);
        }
        node.setRank(lastNode.rank);
        this.nodes.splice(-1, 1, node);
        return;
      } else {
        node.setPrevNode(lastNode);
        this.nodes.push(node);
        return;
      }
    } else {
      this.nodes.push(node);
    }
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
  rootStatement: RootStatement | null = null;
  currentStatement: IStatement | null = null;

  constructor() { }

  initializeRootStatement(ctx: ReturnType<typeof rootContext>) {
    this.rootStatement = new RootStatement(ctx, this);
  }

  setCurrentStatement(statement: IStatement) {
    this.currentStatement = statement;
  }

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

  get maxRank() {
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
