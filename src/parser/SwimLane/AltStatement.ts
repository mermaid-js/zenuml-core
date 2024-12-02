import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { Tile, IStatement, IBlockStatement } from "./types";
import { Branch } from "./Branch";
import { SwimLanes } from "./SwimLane";
import { BlockStatement } from "./Statement";
import { Edge } from "./Edge";
import { BaseNode, EndIfNode } from "./Nodes";

export class AltStatement extends BlockStatement {
  private ifElseBranches: Branch[] = [];
  private elseBranch: Branch | null = null;
  private current: Branch | null = null;
  private endIfNode: EndIfNode | null = null;
  private initialRank: number = 0;

  constructor(
    ctx: ParserRuleContext,
    swimLanes: SwimLanes,
    parentStatement: IBlockStatement | null,
  ) {
    super(ctx, swimLanes, parentStatement);
  }

  if(ctx: ParserRuleContext) {
    const newBranch = new Branch(ctx);
    this.ifElseBranches.push(newBranch);
    this.current = newBranch;
  }

  elseIf(ctx: ParserRuleContext) {
    const newBranch = new Branch(ctx);
    this.ifElseBranches.push(newBranch);
    this.current = newBranch;
  }

  else(ctx: ParserRuleContext) {
    const newBranch = new Branch(ctx);
    this.elseBranch = newBranch;
    this.current = newBranch;
  }

  appendChild(statement: IStatement) {
    if (!this.current) {
      throw new Error("No current branch");
    }
    this.current.add(statement);
  }

  getTile(inboundNode: BaseNode | null): Tile {
    return this.createBlock(inboundNode);
  }

  createBlock(inboundNode: BaseNode | null): Tile {
    if (this.ifElseBranches.length === 0) {
      throw new Error("No if branch");
    }

    // create nodes for each branch conditions
    const branches = [...this.ifElseBranches, this.elseBranch].filter(
      (branch): branch is Branch => branch !== null,
    );
    this.initialRank = inboundNode ? inboundNode.rank + 1 : 0;
    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      const branchInboundNode =
        i === 0 ? inboundNode : branches[i - 1].getFirstNode();
      if (!branchInboundNode) {
        throw new Error("No inbound node");
      }
      const tile = branch.createBlock(branchInboundNode, this.initialRank);
      this.addTile(tile);
    }

    const maxRank = [
      ...this.ifElseBranches.map((branch) => branch.getMaxRank()),
      this.elseBranch?.getMaxRank() ?? 0,
    ].reduce((max, rank) => Math.max(max, rank), 0);

    const swimlane = this.ifElseBranches[0].getFirstNode()?.swimLane;
    this.endIfNode = new EndIfNode(swimlane, maxRank + 1);
    this.addNode(this.endIfNode);
    this.connectNodes(inboundNode, this.endIfNode);

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
    const branches = [...this.ifElseBranches, this.elseBranch].filter(
      (branch): branch is Branch => branch !== null,
    );

    const firstBranch = branches[0];
    if (!firstBranch) {
      throw new Error("No first branch");
    }
    if (this.inboundNode) {
      const inboundEdge = new Edge(
        this.inboundNode,
        firstBranch.getFirstNode(),
      );
      this.addEdge(inboundEdge);
    }
    const edge = new Edge(firstBranch.getLastNode(), this.endIfNode);
    this.addEdge(edge);

    for (let i = 1; i < branches.length; i++) {
      const prevBranch = branches[i - 1];
      const curBranch = branches[i];
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
