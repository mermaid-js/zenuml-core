import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { Tile, IStatement } from "./types";
import { Branch } from "./Branch";
import { SwimLane, SwimLanes } from "./SwimLane";
import { BlockStatement } from "./Statement";
import { Edge } from "./Edge";
import { EndIfNode } from "./Nodes";

export class AltStatement extends BlockStatement {
  private ifElseBranches: Branch[] = [];
  private elseBranch: Branch | null = null;
  private current: Branch | null = null;
  private initialRank: number = 0;
  private endIfNode: EndIfNode | null = null;

  constructor(
    ctx: ParserRuleContext,
    swimLanes: SwimLanes,
    previousStatement: IStatement | null,
  ) {
    super(ctx, swimLanes, previousStatement);
  }

  getDefaultSwimLane() {
    if (this.ifElseBranches.length === 0) {
      throw new Error("No if branch");
    }
    return this.ifElseBranches[0].getDefaultSwimLane();
  }

  if(ctx: ParserRuleContext, swimLane: SwimLane) {
    this.initialRank = swimLane.maxRank + 1;
    const newBranch = new Branch(ctx, swimLane, this.initialRank);
    this.ifElseBranches.push(newBranch);
    this.current = newBranch;
  }

  elseIf(ctx: ParserRuleContext, swimLane: SwimLane) {
    const newBranch = new Branch(ctx, swimLane, this.initialRank);
    this.ifElseBranches.push(newBranch);
    this.current = newBranch;
  }

  else(ctx: ParserRuleContext, swimLane: SwimLane) {
    this.elseBranch = new Branch(ctx, swimLane, this.initialRank);
    this.setFinished();
  }

  appendChild(statement: IStatement) {
    if (!this.current) {
      throw new Error("No current branch");
    }
    this.current.add(statement);
  }

  createBlock(): Tile {
    if (!this.previousStatement) {
      throw new Error("No previous statement");
    }
    const prevOutboundNode = this.previousStatement.getOutboundNode();
    if (prevOutboundNode) {
      this.setInboundNode(prevOutboundNode);
    }
    if (this.ifElseBranches.length === 0) {
      throw new Error("No if branch");
    }

    // create nodes for each branch conditions
    for (let i = 0; i < this.ifElseBranches.length; i++) {
      const branch = this.ifElseBranches[i];
      const inboundNode =
        i === 0 ? this.inboundNode : this.ifElseBranches[i - 1].getLastNode();
      const tile = branch.createBlock(inboundNode);
      this.addTile(tile);
    }

    const maxRank = [
      ...this.ifElseBranches.map((branch) => branch.getMaxRank()),
      this.elseBranch?.getMaxRank() ?? 0,
    ].reduce((max, rank) => Math.max(max, rank), 0);

    this.endIfNode = new EndIfNode(this.getDefaultSwimLane(), maxRank + 1);
    this.addNode(this.endIfNode);

    this.createEdges();

    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }

  createEdges() {
    if (!this.endIfNode) {
      throw new Error("No end if node");
    }
    // create edges between the previous condition node and the current branch condition node
    // and between the last node of the current branch and the end if node
    for (let i = 1; i < this.ifElseBranches.length; i++) {
      const prevBranch = this.ifElseBranches[i - 1];
      const curBranch = this.ifElseBranches[i];
      const prevFirstNode = prevBranch.getFirstNode();
      const curFirstNode = curBranch.getFirstNode();
      if (prevFirstNode && curFirstNode) {
        const edge = new Edge(prevFirstNode, curFirstNode);
        this.addEdge(edge);
      }

      const lastNode = curBranch.getLastNode();
      if (lastNode) {
        const edge = new Edge(lastNode, this.endIfNode);
        this.addEdge(edge);
      }
    }
  }
}
