import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { SwimLane } from "./SwimLane";
import { IStatement } from "./types";
import { BaseNode, EndIfNode, IfElseNode } from "./Nodes";

export class Branch {
  private ctx: ParserRuleContext;
  private defaultSwimLane: SwimLane;
  private rootStatement: IStatement | null = null;
  private lastNode: BaseNode | null = null;

  constructor(ctx: ParserRuleContext, swimLane: SwimLane) {
    this.ctx = ctx;
    this.defaultSwimLane = swimLane;
  }

  getConditionLabel() {
    return this.ctx.getText();
  }

  getDefaultSwimLane() {
    return this.defaultSwimLane;
  }

  add(statement: IStatement) {
    if (this.rootStatement) {
      this.rootStatement.setNext(statement);
    } else {
      this.rootStatement = statement
    }
  }

  createBlock() {
    // create nodes for each branch conditions
    let currentStatement = this.rootStatement;

    const conditionNode = new IfElseNode(
      this.getConditionLabel(),
      this.defaultSwimLane,
    );
    this.lastNode = conditionNode;

    while (currentStatement) {
      currentStatement.createBlock();

      const outboundNode = currentStatement.getOutboundNode();
      if (outboundNode) {
        this.lastNode = outboundNode;
      }

      currentStatement = currentStatement.getNext();
    }
  }

  connectToEndIfNode(endIfNode: EndIfNode) {
    if (this.lastNode) {
      endIfNode.setPrevNode(this.lastNode);
    }
  }
}
