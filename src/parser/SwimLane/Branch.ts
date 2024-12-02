import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { IStatement, Tile } from "./types";
import { BaseNode, IfElseNode } from "./Nodes";
import { Edge } from "./Edge";
import { OrderedMap } from "./OrderMap";

export class Branch {
  private ctx: ParserRuleContext;
  private statements: IStatement[] = [];
  private nodes: OrderedMap<string, BaseNode> = new OrderedMap();
  private edges: OrderedMap<string, Edge> = new OrderedMap();

  constructor(ctx: ParserRuleContext) {
    this.ctx = ctx;
    // get condition expression    this.conditionExpr = this.ctx.getText();
  }

  getFirstNode() {
    return Array.from(this.nodes.values())[0];
  }

  getLastNode() {
    return Array.from(this.nodes.values())[this.nodes.size - 1];
  }

  add(statement: IStatement) {
    this.statements.push(statement);
  }

  getTile(inboundNode: BaseNode, rank: number): Tile {
    return this.createBlock(inboundNode, rank);
  }

  createBlock(inboundNode: BaseNode, rank: number): Tile {
    // @ts-ignore
    const conditionExpr = this.ctx.parExpr?.().condition().getFormattedText();
    // @ts-ignore
    const isIf = "IF" in this.ctx && !("ELSE" in this.ctx);

    const swimlane = inboundNode.swimLane;
    const firstNode: BaseNode | null = conditionExpr
      ? new IfElseNode(conditionExpr, swimlane, rank)
      : new IfElseNode("else", swimlane, rank);

    this.nodes.set(firstNode.id, firstNode);
    firstNode.setPrevNode(inboundNode);

    for (let i = 0; i < this.statements.length; i++) {
      const statement = this.statements[i];
      const block = statement.getTile(this.getLastNode());

      block.nodes.forEach((node) => this.nodes.set(node.id, node));
      block.edges.forEach((edge) => this.edges.set(edge.id, edge));

      if (!isIf && i === 0) {
        firstNode.setSwimLane(block.nodes[0].swimLane);
      }

      this.addNodes(block.nodes);
      this.addEdges(block.edges);
    }

    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }

  addNodes(nodes: BaseNode[]) {
    nodes.forEach((node) => this.nodes.set(node.id, node));
  }

  addEdges(edges: Edge[]) {
    edges.forEach((edge) => this.edges.set(edge.id, edge));
  }

  getMaxRank() {
    return Math.max(
      ...Array.from(this.nodes.values()).map((node) => node.rank),
    );
  }
}
