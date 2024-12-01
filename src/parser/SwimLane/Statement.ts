/* eslint-disable @typescript-eslint/no-unused-vars */
import { IBlockStatement, isBlockStatement, IStatement } from "./types";
import { BaseNode } from "./Nodes";
import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { SwimLanes } from "./SwimLane";

export class BaseStatement implements IStatement {
  protected ctx: ParserRuleContext;
  protected swimLanes: SwimLanes;
  protected firstChild: IStatement | null = null;
  protected previousStatement: IStatement | null = null;
  protected nextStatement: IStatement | null = null;
  protected parent: IBlockStatement | null = null;
  protected outboundNode: BaseNode | null = null;
  protected inboundNode: BaseNode | null = null;

  constructor(
    ctx: ParserRuleContext,
    swimLanes: SwimLanes,
    previousStatement: IStatement | null,
  ) {
    this.ctx = ctx;
    this.swimLanes = swimLanes;
    this.previousStatement = previousStatement;

    if (
      previousStatement &&
      isBlockStatement(previousStatement) &&
      !previousStatement.isFinished()
    ) {
      this.parent = previousStatement;
      this.parent.appendChild(this);
    }
  }

  setNext(statement: IStatement): void {
    this.nextStatement = statement;
  }

  getNext(): IStatement | null {
    return this.nextStatement;
  }

  setParent(parent: IBlockStatement | null): void {
    this.parent = parent;
  }

  getParent(): IBlockStatement | null {
    return this.parent;
  }

  createBlock() {
    throw new Error("Method not implemented.");
  }

  setOutboundNode(node: BaseNode) {
    this.outboundNode = node;
  }

  getOutboundNode(): BaseNode | null {
    return this.outboundNode;
  }

  addInboundNode(node: BaseNode) {
    this.inboundNode = node;
  }

  getInboundNode(): BaseNode | null {
    throw new Error("Method not implemented.");
  }
}

export class BlockStatement extends BaseStatement implements IBlockStatement {
  protected finished: boolean = false;

  appendChild(statement: IStatement): void {
    throw new Error("Method not implemented.");
  }
  setFinished(): void {
    this.finished = true;
  }

  isFinished(): boolean {
    return this.finished;
  }
}

export class RootStatement implements IStatement {
  private ctx: ParserRuleContext;
  private firstChild: IStatement | null = null;
  private nextStatement: IStatement | null = null;
  private swimLanes: SwimLanes;

  constructor(ctx: ParserRuleContext, swimLanes: SwimLanes) {
    this.ctx = ctx;
    this.swimLanes = swimLanes;
  }
  addInboundNode(node: BaseNode): void {
    throw new Error("Method not implemented.");
  }
  setOutboundNode(node: BaseNode): void {
    throw new Error("Method not implemented.");
  }

  appendChild(statement: IStatement): void {
    if (this.firstChild === null) {
      this.firstChild = statement;
    } else {
      let current = this.firstChild;
      while (current?.getNext() !== null) {
        current = current.getNext()!;
      }
      current.setNext(statement);
    }
  }

  getInboundNode(): BaseNode | null {
    return null;
  }

  setNext(statement: IStatement): void {
    this.nextStatement = statement;
  }

  getNext(): IStatement | null {
    return this.nextStatement;
  }

  createBlock() {
    // Start with the first statement
    let currentStatement = this.firstChild;

    // Iterate through all statements
    while (currentStatement) {
      // Create a block for the current statement
      currentStatement.createBlock();

      // Move to the next statement
      currentStatement = currentStatement.getNext()!;
    }
  }

  getParent() {
    return null;
  }

  getPreviousStatement() {
    return null;
  }

  getOutboundNode() {
    return null;
  }
}
