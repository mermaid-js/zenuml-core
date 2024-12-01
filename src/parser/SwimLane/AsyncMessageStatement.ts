import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { IBlockStatement, IStatement } from "./types";
import { BaseStatement } from "./Statement";
import { SwimLanes } from "./SwimLane";
import { MessageNode } from "./Nodes";

export class MessageStatement extends BaseStatement {
  constructor(
    ctx: ParserRuleContext,
    swimLanes: SwimLanes,
    previousStatement: IStatement | null,
    parent: IBlockStatement | null,
  ) {
    super(ctx, swimLanes, previousStatement, parent);
  }

  createBlock() {
    // @ts-ignore
    const to = this.ctx.to();
    // @ts-ignore
    const message = this.ctx.content().getFormattedText();

    const toName = to.getFormattedText();
    const toLane = this.swimLanes.getLane(toName);

    const outboundNode = this.previousStatement?.getOutboundNode();
    if (outboundNode) {
      const node = new MessageNode(message, toLane, outboundNode.rank);
      this.addInboundNode(outboundNode);
      this.setOutboundNode(node);
    } else {
      const node = new MessageNode(message, toLane);
      this.setOutboundNode(node);
    }
  }
}
