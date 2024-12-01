import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { IStatement } from "./types";
import { Branch } from "./Branch";
import { SwimLane, SwimLanes } from "./SwimLane";
import { BlockStatement } from "./Statement";
import { IfElseNode } from "./Nodes";

export class AltStatement extends BlockStatement {
  private ifBranch: Branch | null = null;
  private elseBranch: Branch | null = null;
  private ifElseBranches: Branch[] = [];
  private current: Branch | null = null;

  constructor(
    ctx: ParserRuleContext,
    swimLanes: SwimLanes,
    previousStatement: IStatement | null,
  ) {
    super(ctx, swimLanes, previousStatement);
  }

  getDefaultSwimLane() {
    if (!this.ifBranch) {
      throw new Error("No if branch");
    }
    return this.ifBranch.getDefaultSwimLane();
  }

  if(ctx: ParserRuleContext, swimLane: SwimLane) {
    this.ifBranch = new Branch(ctx, swimLane);
    this.current = this.ifBranch;
  }

  elseIf(ctx: ParserRuleContext, swimLane: SwimLane) {
    const newBranch = new Branch(ctx, swimLane);
    this.ifElseBranches.push(newBranch);
    this.current = newBranch;
  }

  else(ctx: ParserRuleContext, swimLane: SwimLane) {
    this.elseBranch = new Branch(ctx, swimLane);
  }

  appendChild(statement: IStatement) {
    if (!this.current) {
      throw new Error("No current branch");
    }
    this.current.add(statement);
  }

  createBlock() {
    if (!this.previousStatement) {
      throw new Error("No previous statement");
    }
    const prevOutboundNode = this.previousStatement.getOutboundNode();
    if (prevOutboundNode) {
      this.addInboundNode(prevOutboundNode);
    }
    if (!this.ifBranch) {
      throw new Error("No if branch");
    }


   reate the block for the if branch
    this.ifBranch.createBlock();

    // create nodes for each branch conditions
    // iterate over branches and create blocks
  }
}
