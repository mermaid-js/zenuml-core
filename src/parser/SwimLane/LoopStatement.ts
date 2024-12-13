import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { SwimLanes } from "./SwimLane";
import { BlockStatement } from "./Statement";
import { BaseNode, LoopNode } from "./Nodes";
import { Tile, IBlockStatement, IStatement } from "./types";
import { Edge } from "./Edge";

export class LoopStatement extends BlockStatement {
  protected statements: IStatement[] = [];

  constructor(
    ctx: ParserRuleContext,
    swimLanes: SwimLanes,
    parentStatement: IBlockStatement | null,
  ) {
    super(ctx, swimLanes, parentStatement);
  }

  appendChild(statement: IStatement): void {
    this.statements.push(statement);
  }

  getTile(inboundNode: BaseNode | null): Tile {
    return this.createBlock(inboundNode);
  }

  createBlock(inboundNode: BaseNode | null): Tile {
    const firstNodeRank = inboundNode?.rank ? inboundNode.rank + 1 : 0;

    let prevNode = null;
    for (let i = 0; i < this.statements.length; i++) {
      const statement = this.statements[i];
      const tile = statement.getTile(
        prevNode,
        i === 0 ? firstNodeRank + 1 : undefined,
      );
      this.addTile(tile);
      prevNode = statement.getOutboundNode();
    }

    const swimlane = inboundNode?.swimLane
      ? inboundNode.swimLane
      : this.nodes.getByIndex(0)
      ? this.nodes.getByIndex(0)!.swimLane
      : undefined;
    if (!swimlane) {
      throw new Error("Swimlane is undefined");
    }

    // @ts-ignore
    const loopExpr = this.ctx.parExpr?.().condition()?.getFormattedText();
    const loopNode = new LoopNode(loopExpr, swimlane, firstNodeRank);

    this.nodes.unshift(loopNode.id, loopNode);

    const firstEdge = new Edge(loopNode, this.nodes.getByIndex(1)!);
    this.edges.unshift(firstEdge.id, firstEdge);

    const lastEdge = new Edge(
      this.nodes.getByIndex(this.nodes.size - 1)!,
      loopNode,
    );
    this.edges.push(lastEdge.id, lastEdge);

    if (inboundNode) {
      const inboundEdge = new Edge(inboundNode, loopNode);
      this.edges.unshift(inboundEdge.id, inboundEdge);
    }

    this.setBoundNodes(inboundNode, loopNode);

    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }
}
