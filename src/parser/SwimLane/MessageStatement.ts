import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { IBlockStatement, Tile } from "./types";
import { BaseStatement } from "./Statement";
import { SwimLanes } from "./SwimLane";
import { BaseNode, MessageNode } from "./Nodes";
import { Edge } from "./Edge";

export class MessageStatement extends BaseStatement {
  constructor(
    ctx: ParserRuleContext,
    swimLanes: SwimLanes,
    parentStatement: IBlockStatement | null,
  ) {
    super(ctx, swimLanes, parentStatement);
  }

  private createNodes(inboundNode: BaseNode) {
    // @ts-ignore
    const messageBodyCtx = this.ctx.messageBody();
    const toName = messageBodyCtx.to().getText();
    const message = messageBodyCtx.func().signature()[0].getFormattedText();
    const swimLane = this.swimLanes.getLane(toName);
    const fromName = inboundNode?.swimLane.name;
    const fromSwimLaneMaxRank = fromName
      ? this.swimLanes.getLane(fromName).maxRank
      : 0;

    // TODO: optimize rank calculation
    const rank =
      inboundNode?.rank && fromName !== toName
        ? Math.max(swimLane.maxRank + 1, fromSwimLaneMaxRank + 1)
        : swimLane.maxRank + 1;

    const node = new MessageNode(message, swimLane, rank);

    this.addNode(node);
    this.connectNodes(inboundNode, node);
  }

  private createEdges() {
    if (this.inboundNode && this.outboundNode) {
      const edge = new Edge(this.inboundNode, this.outboundNode);
      this.addEdge(edge);
    }
  }

  getTile(inboundNode: BaseNode): Tile {
    this.createNodes(inboundNode);
    this.createEdges();
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }
}
