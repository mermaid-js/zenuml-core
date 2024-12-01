import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { isBlockStatement, IStatement } from "./types";
import { BaseStatement } from "./Statement";
import { SwimLanes } from "./SwimLane";
import { BaseNode, MessageNode } from "./Nodes";

export class MessageStatement extends BaseStatement {
  constructor(
    ctx: ParserRuleContext,
    swimLanes: SwimLanes,
    previousStatement: IStatement | null,
  ) {
    super(ctx, swimLanes, previousStatement);
  }

  createBlock() {
    if (!this.previousStatement) {
      throw new Error("No previous statement");
    }

    // @ts-ignore
    const messageBodyCtx = this.ctx.messageBody();
    const to = messageBodyCtx.to();
    const message = messageBodyCtx.func().signature()[0].getFormattedText();
    const toName = to.getText();
    const toLane = this.swimLanes.getLane(toName);
    const outboundNode = this.previousStatement.getOutboundNode();

    // Otherwise create a new node and set connections
    const node = new MessageNode(message, toLane, outboundNode?.rank);

    if (outboundNode) {
      this.addInboundNode(outboundNode);
    }
    this.setOutboundNode(node);
  }
}
