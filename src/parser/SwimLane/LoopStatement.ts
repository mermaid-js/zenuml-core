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

  getTile(inboundNode: BaseNode): Tile {
    return this.createBlock(inboundNode);
  }

  createBlock(inboundNode: BaseNode): Tile {
    const loopNode = new LoopNode(
      // @ts-ignore
      this.ctx.parExpr?.().condition()?.getFormattedText(),
      inboundNode?.swimLane,
      inboundNode?.rank + 1,
    );
    loopNode.setPrevNode(inboundNode);
    const edge = new Edge(inboundNode, loopNode);
    this.addNode(loopNode);
    this.addEdge(edge);

    let prevNode: BaseNode | null = loopNode;
    for (let i = 0; i < this.statements.length; i++) {
      const statement = this.statements[i];
      const tile = statement.getTile(prevNode);
      this.addTile(tile);
      prevNode = statement.getOutboundNode();
      if (i === this.statements.length - 1) {
        const outboundNode = prevNode;
        if (outboundNode) {
          const edge = new Edge(outboundNode, loopNode, "loop");
          this.addEdge(edge);
        }
      }
    }

    this.connectNodes(inboundNode, loopNode);

    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }
}
