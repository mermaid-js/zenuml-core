import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { IBlockStatement } from "./types";
import { BaseStatement } from "./Statement";
import { SwimLanes } from "./SwimLane";
import { Edge } from "./Edge";
import { MessageNode, EmptyMessageNode } from "./Nodes";

export class AsyncMessageStatement extends BaseStatement {
  constructor(
    ctx: ParserRuleContext,
    swimLanes: SwimLanes,
    currentBlockStatement: IBlockStatement | null,
  ) {
    super(ctx, swimLanes, currentBlockStatement);
  }

  createNodes() {
    // const inboundNode =
    //   _inboundNode ?? this.previousStatement?.getOutboundNode() ?? null;

    // // @ts-ignore
    // const toName = this.ctx.to().getFormattedText();
    // // @ts-ignore
    // const message = this.ctx.content().getFormattedText();
    // // TODO: optimize rank calculation
    // const toLane = this.swimLanes.getLane(toName);

    // if (inboundNode) {
    //   const fromName = inboundNode.swimLane.name;
    //   const fromLane = inboundNode.swimLane;
    //   const fromSwimLaneMaxRank = fromLane ? fromLane.maxRank : 0;

    //   const rank =
    //     inboundNode?.rank && fromName !== toName
    //       ? Math.max(toLane.maxRank + 1, fromSwimLaneMaxRank + 1)
    //       : toLane.maxRank + 1;

    //   this.setInboundNode(inboundNode);
    //   const node = new MessageNode(message, toLane, rank);
    //   this.addNode(node);
    //   this.connectNodes(inboundNode, node);
    // } else if (this.previousStatement instanceof RootStatement) {
    //   // @ts-ignore
    //   const fromName = this.ctx.from().getFormattedText();
    //   const fromLane = this.swimLanes.getLane(fromName);
    //   const emptyNode = new EmptyMessageNode(fromLane);
    //   this.setInboundNode(emptyNode);
    //   const node = new MessageNode(message, toLane, emptyNode.rank);
    //   this.addNode(emptyNode);
    //   this.addNode(node);
    //   this.connectNodes(inboundNode, node);
    // } else {
    //   const node = new MessageNode(message, toLane, rank);
    //   this.addNode(node);
    // }
    // @ts-ignore
    const from = this.ctx.from();
    // @ts-ignore
    const to = this.ctx.to();
    // @ts-ignore
    const message = this.ctx.content().getFormattedText().trim();

    const fromName = from.getFormattedText();
    const toName = to.getFormattedText();
    const fromLane = this.swimLanes.getLane(fromName);
    const toLane = this.swimLanes.getLane(toName);

    // get the last node of the from lane
    const inboundNode = fromLane.nodes[fromLane.nodes.length - 1];

    if (inboundNode) {
      this.setInboundNode(inboundNode);
      const node = new MessageNode(message, toLane, inboundNode.rank);
      this.addNode(node);
      this.connectNodes(inboundNode, node);
    } else {
      const emptyNode = new EmptyMessageNode(fromLane);
      fromLane.addNodes([emptyNode]);
      const node = new MessageNode(message, toLane, emptyNode.rank);
      this.addNode(emptyNode);
      this.addNode(node);
      this.connectNodes(emptyNode, node);
    }
  }

  createEdges() {
    if (this.inboundNode && this.outboundNode) {
      const edge = new Edge(this.inboundNode, this.outboundNode);
      this.addEdge(edge);
    }
  }

  getTile() {
    this.createNodes();
    this.createEdges();
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }
}
