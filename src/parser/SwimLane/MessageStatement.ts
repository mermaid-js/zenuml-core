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

  private createNodes(inboundNode: BaseNode, rank?: number) {
    // @ts-ignore
    const messageBodyCtx = this.ctx.messageBody();
    if (!messageBodyCtx || !messageBodyCtx.to()) {
      // @ts-ignore
      console.warn(
        'Message body or "to" participant is missing',
        this.ctx.getFormattedText(),
      );
      return;
    }
    const toName = messageBodyCtx.to().getText();
    const message =
      messageBodyCtx.func()?.signature()?.[0]?.getFormattedText() || "";
    const swimLane = this.swimLanes.getLane(toName);
    const fromName = inboundNode?.swimLane.name;
    const fromSwimLaneMaxRank = fromName
      ? this.swimLanes.getLane(fromName).maxRank
      : 0;

    // TODO: optimize rank calculation
    // const rank =
    //   this.parent && fromName === toName
    //     ? Math.max(this.parent.getMaxRank() + 1, fromSwimLaneMaxRank + 1)
    //     : this.parent.getMaxRank()
    // let rank = 0;
    // if (this.parent) {
    //   const parentMaxRank = this.parent.getMaxRank();
    //   rank =
    //     fromName === toName
    //       ? Math.max(parentMaxRank + 1, fromSwimLaneMaxRank + 1)
    //       : parentMaxRank;
    // } else {
    //   rank =
    //     inboundNode?.rank && fromName !== toName
    //       ? Math.max(swimLane.maxRank + 1, fromSwimLaneMaxRank + 1)
    //       : swimLane.maxRank + 1;
    // }
    const parentMaxRank = this.parent ? this.parent.getMaxRank() : -1;
    const newRank = rank
      ? rank
      : Math.max(
          swimLane.maxRank + 1,
          parentMaxRank + 1,
          fromSwimLaneMaxRank + 1,
        );

    const node = new MessageNode(message, swimLane, newRank);

    this.addNode(node);
    this.connectNodes(inboundNode, node);
  }

  private createEdges() {
    if (this.inboundNode && this.outboundNode) {
      const edge = new Edge(this.inboundNode, this.outboundNode);
      this.addEdge(edge);
    }
  }

  getTile(inboundNode: BaseNode, rank?: number): Tile {
    this.createNodes(inboundNode, rank);
    this.createEdges();
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }
}
