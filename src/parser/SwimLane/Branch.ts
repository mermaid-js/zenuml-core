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
    return this.nodes.getByIndex(0);
  }

  getLastNode() {
    return this.nodes.getByIndex(this.nodes.size - 1);
  }

  add(statement: IStatement) {
    this.statements.push(statement);
  }

  getTile(inboundNode: BaseNode, rank?: number): Tile {
    return this.createBlock(inboundNode, rank);
  }

  createBlock(inboundNode: BaseNode, rank?: number): Tile {
    const initialRank = rank ?? inboundNode.rank;
    // @ts-ignore
    const conditionExpr = this.ctx.parExpr?.().condition().getFormattedText();
    // @ts-ignore
    const isIf = "IF" in this.ctx && !("ELSE" in this.ctx);
    // @ts-ignore
    const isElseIf = "IF" in this.ctx && "ELSE" in this.ctx;
    // @ts-ignore
    const isElse = !("IF" in this.ctx) && "ELSE" in this.ctx;
    const firstNodeRank = initialRank + 1;

    const swimlane = inboundNode.swimLane;
    const firstNode: BaseNode | null =
      isIf || isElseIf
        ? new IfElseNode(conditionExpr, swimlane, firstNodeRank)
        : new IfElseNode("else", swimlane, firstNodeRank);

    this.nodes.set(firstNode.id, firstNode);
    firstNode.setPrevNode(inboundNode);

    for (let i = 0; i < this.statements.length; i++) {
      const statement = this.statements[i];

      const lastNode = this.getLastNode();
      const tile = statement.getTile(
        lastNode,
        isElse && i === 0 ? firstNodeRank + 1 : undefined,
      );

      // backtrack and update first node's swimlane of ifElse/else branch
      if (!isIf && i === 0) {
        const updatedFirstNode = new IfElseNode(
          isElse ? "else" : conditionExpr,
          tile.nodes[0].swimLane,
          firstNodeRank,
        );
        this.nodes.setByIndex(0, updatedFirstNode.id, updatedFirstNode);
        tile.edges[0].source = updatedFirstNode;
      }

      tile.nodes.forEach((node) => this.nodes.set(node.id, node));
      tile.edges.forEach((edge) => this.edges.set(edge.id, edge));

      this.addNodes(tile.nodes);
      this.addEdges(tile.edges);
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
