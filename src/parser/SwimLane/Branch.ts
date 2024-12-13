import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { IStatement, Tile } from "./types";
import { BaseNode, IfElseNode } from "./Nodes";
import { Edge, LabeledEdge } from "./Edge";
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

  getTile(previousBranch?: Branch, inboundNode?: BaseNode): Tile {
    return this.createBlock(previousBranch, inboundNode);
  }

  getInitialRank(
    previousBranch: Branch | undefined,
    inboundNode: BaseNode | undefined,
    firstNode: BaseNode | undefined,
  ) {
    const swimlane = firstNode?.swimLane;
    if (!swimlane) {
      throw new Error("Swimlane is undefined");
    }

    let isSameSwimLane = false;
    if (previousBranch) {
      const firstNode = previousBranch.getFirstNode();
      isSameSwimLane = firstNode?.swimLane === swimlane;
      if (isSameSwimLane) {
        return firstNode?.rank ?? 0;
      } else {
        return previousBranch.getMaxRank() + 1;
      }
    } else if (inboundNode) {
      return inboundNode.rank + 1;
    }

    return 0;
  }

  createBlock(previousBranch?: Branch, inboundNode?: BaseNode): Tile {
    // @ts-ignore
    const conditionExpr = this.ctx.parExpr?.().condition().getFormattedText();
    // @ts-ignore
    const isIf = "IF" in this.ctx && !("ELSE" in this.ctx);
    // @ts-ignore
    const isElseIf = "IF" in this.ctx && "ELSE" in this.ctx;

    for (let i = 0; i < this.statements.length; i++) {
      const statement = this.statements[i];

      const lastNode = this.getLastNode();
      const tile = statement.getTile(lastNode, i === 0 ? 1 : undefined);

      tile.nodes.forEach((node) => this.nodes.set(node.id, node));
      tile.edges.forEach((edge) => this.edges.set(edge.id, edge));

      this.addNodes(tile.nodes);
      this.addEdges(tile.edges);
    }

    if (this.nodes.size === 0) {
      return {
        nodes: [],
        edges: [],
      };
    }

    // Because condition node's swimlane can be undetermined when inboundNode is null`
    // So we need to set it after all nodes and edges are created
    const swimlane = this.nodes.getByIndex(0)!.swimLane;

    if (!swimlane) {
      throw new Error("Swimlane is undefined");
    }

    const initialRank = this.getInitialRank(
      previousBranch,
      inboundNode,
      this.getFirstNode(),
    );

    const conditionNode =
      isIf || isElseIf
        ? new IfElseNode(conditionExpr, swimlane, initialRank)
        : new IfElseNode("else", swimlane, initialRank);

    this.nodes.unshift(conditionNode.id, conditionNode);

    for (let i = 1; i < this.nodes.size; i++) {
      const node = this.nodes.getByIndex(i)!;
      node.setRank(node.rank + initialRank + 1);
      this.nodes.set(node.id, node);
    }

    const positiveEdge =
      isIf || isElseIf
        ? new LabeledEdge(conditionNode, this.nodes.getByIndex(1)!, "YES")
        : new Edge(conditionNode, this.nodes.getByIndex(1)!);

    this.edges.unshift(positiveEdge.id, positiveEdge);
    if (inboundNode) {
      conditionNode.setPrevNode(inboundNode);
      const negativeEdge = new LabeledEdge(inboundNode, conditionNode, "NO");
      this.edges.unshift(negativeEdge.id, negativeEdge);
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
