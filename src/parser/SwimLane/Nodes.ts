import { SwimLane } from "./SwimLane";
import { NodeType, Shape } from "./types";

export class BaseNode implements Shape {
  id: string;
  name: string;
  swimLane: SwimLane;
  rank: number = -1;
  prevNode: BaseNode | null = null;
  nextNode: BaseNode | null = null;
  type: NodeType | undefined;

  constructor(name: string, swimLane: SwimLane, rank?: number) {
    this.id = `${swimLane.name}-${name}`;
    this.name = name;
    this.swimLane = swimLane;
    this.rank = rank ?? -1;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addToSwimLane(_swimLane: SwimLane, _rank?: number) {
    throw new Error("Method not implemented.");
  }

  setRank(rank: number) {
    this.rank = rank;
  }

  setPrevNode(node: BaseNode) {
    this.prevNode = node;
  }

  getSwimLane() {
    return this.swimLane;
  }

  getRank() {
    return this.rank;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      rank: this.rank,
      swimLane: this.swimLane.name,
    };
  }
}

export class MessageNode extends BaseNode {
  type: NodeType = "message";

  constructor(name: string, swimLane: SwimLane, rank?: number) {
    super(name, swimLane, rank);
  }

  addToSwimLane(swimLane: SwimLane, rank?: number) {
    if (rank) {
      if (this.rank > swimLane.maxRank) {
        this.rank = rank;
      } else {
        this.rank = swimLane.maxRank + 1;
      }
    } else {
      this.rank = swimLane.maxRank + 1;
    }
    swimLane.addNode(this);
  }
}

export class EmptyMessageNode extends MessageNode {
  constructor(swimLane: SwimLane, rank?: number) {
    super(" ", swimLane, rank);
    this.id = `${swimLane.name}-empty`;
  }
}

export class IfElseNode extends BaseNode {
  type: NodeType = "ifelse";

  constructor(name: string, swimLane: SwimLane) {
    super(name, swimLane);
  }
}

export class EndIfNode extends BaseNode {
  type: NodeType = "endif";

  constructor(swimLane: SwimLane, rank?: number) {
    super("END IF", swimLane, rank);
  }
}
