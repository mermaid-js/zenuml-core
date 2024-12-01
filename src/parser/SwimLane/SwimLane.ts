import { BaseNode } from "./Nodes";
import { RootStatement } from "./Statement";
import { IStatement, SwimLaneId } from "./types";
import { rootContext } from "./Diagram";

export class SwimLane {
  id: SwimLaneId;
  name: string;
  nodes: BaseNode[] = [];

  constructor(name: string) {
    this.id = name;
    this.name = name;
  }

  addNodes(nodes: BaseNode[]) {
    this.nodes.push(...nodes);
  }

  get maxRank() {
    return Math.max(-1, ...this.nodes.map((node) => node.rank));
  }
}

export class SwimLanes {
  lanes: Map<SwimLaneId, SwimLane> = new Map();
  rootStatement: RootStatement | null = null;
  currentStatement: IStatement | null = null;

  constructor(ctx: ReturnType<typeof rootContext>) {
    this.initializeRootStatement(ctx);
  }

  initializeRootStatement(ctx: ReturnType<typeof rootContext>) {
    this.rootStatement = new RootStatement(ctx, this);
    this.setCurrentStatement(this.rootStatement);
  }

  setCurrentStatement(statement: IStatement) {
    this.currentStatement = statement;
  }

  getLane(lane: SwimLaneId): SwimLane {
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
    const { nodes, edges } = this.rootStatement?.getTile() ?? {};
    return {
      nodes: nodes?.map((node) => node.toJSON()),
      edges: edges?.map((edge) => edge.toJSON()),
    };
  }

  createDiagram() {
    return this.rootStatement?.createBlock();
  }
}
