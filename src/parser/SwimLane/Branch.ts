import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { SwimLane } from "./SwimLane";
import { IStatement, Tile } from "./types";
import { BaseNode, IfElseNode } from "./Nodes";
import { Edge } from "./Edge";

export class Branch {
  private ctx: ParserRuleContext;
  private defaultSwimLane: SwimLane;
  private rootStatement: IStatement | null = null;
  private lastNode: BaseNode | null = null;
  private firstNode: BaseNode | null = null;
  private nodes: Map<string, BaseNode> = new Map();
  private edges: Map<string, Edge> = new Map();

  constructor(ctx: ParserRuleContext, swimLane: SwimLane, rank: number) {
    this.ctx = ctx;
    this.defaultSwimLane = swimLane;
    // get condition expression
    const conditionExpr = this.ctx.getText();

    // else branch does not have condition expression so we can skip creating the node
    if (conditionExpr) {
      this.initializeNodes(new IfElseNode(conditionExpr, swimLane, rank));
    }
  }

  initializeNodes(node: BaseNode) {
    this.firstNode = node;
    this.lastNode = node;
  }

  getFirstNode() {
    return this.firstNode;
  }

  getLastNode() {
    return this.lastNode;
  }

  getDefaultSwimLane() {
    return this.defaultSwimLane;
  }

  add(statement: IStatement) {
    if (this.rootStatement) {
      this.rootStatement.setNext(statement);
    } else {
      this.rootStatement = statement;
    }
  }

  getTile(inboundNode: BaseNode | null): Tile {
    return this.createBlock(inboundNode);
  }

  createBlock(inboundNode: BaseNode | null): Tile {
    if (!this.firstNode && inboundNode) {
      this.initializeNodes(inboundNode);
    }

    if (inboundNode && this.lastNode) {
      this.lastNode.setPrevNode(inboundNode);
    }

    let currentStatement = this.rootStatement;
    while (currentStatement) {
      const block = currentStatement.getTile(this.lastNode);
      block.nodes.forEach((node) => this.nodes.set(node.id, node));
      block.edges.forEach((edge) => this.edges.set(edge.id, edge));

      const outboundNode = currentStatement.getOutboundNode();
      if (outboundNode) {
        this.lastNode = outboundNode;
      }

      currentStatement = currentStatement.getNext();
    }

    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }

  getMaxRank() {
    return this.lastNode?.rank ?? 0;
  }
}
