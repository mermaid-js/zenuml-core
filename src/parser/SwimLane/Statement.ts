/* eslint-disable @typescript-eslint/no-unused-vars */
import { IBlockStatement, isBlockStatement, IStatement, Tile } from "./types";
import { BaseNode } from "./Nodes";
import ParserRuleContext from "antlr4/context/ParserRuleContext";
import { SwimLane, SwimLanes } from "./SwimLane";
import { Edge } from "./Edge";

export class BaseStatement implements IStatement {
  protected ctx: ParserRuleContext;
  protected swimLanes: SwimLanes;
  protected firstChild: IStatement | null = null;
  protected previousStatement: IStatement | null = null;
  protected nextStatement: IStatement | null = null;
  protected parent: IBlockStatement | null = null;
  protected nodes: Map<string, BaseNode> = new Map();
  protected edges: Map<string, Edge> = new Map();
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
    } else {
      this.previousStatement?.setNext(this);
    }
  }

  getTile(node?: BaseNode | null): Tile {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }

  addNode(node: BaseNode) {
    this.nodes.set(node.id, node);
  }

  addEdge(edge: Edge) {
    this.edges.set(edge.id, edge);
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

  setOutboundNode(node: BaseNode) {
    this.outboundNode = node;
  }

  getOutboundNode(): BaseNode | null {
    return this.outboundNode;
  }

  setInboundNode(node: BaseNode) {
    this.inboundNode = node;
  }

  getInboundNode(): BaseNode | null {
    throw new Error("Method not implemented.");
  }

  protected connectNodes(
    inboundNode: BaseNode | null,
    outboundNode: BaseNode,
  ): void {
    if (inboundNode) {
      this.setInboundNode(inboundNode);
    }
    this.setOutboundNode(outboundNode);
  }
}

export class BlockStatement extends BaseStatement implements IBlockStatement {
  createBlock(node?: BaseNode | null): Tile {
    throw new Error("Method not implemented.");
  }
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

  addTile(tile: Tile) {
    tile.nodes.forEach((node) => this.nodes.set(node.id, node));
    tile.edges.forEach((edge) => this.edges.set(edge.id, edge));
  }
}

export class RootStatement implements IBlockStatement {
  private ctx: ParserRuleContext;
  private firstChild: IStatement | null = null;
  private nextStatement: IStatement | null = null;
  private swimLanes: SwimLanes;
  private nodes: Map<string, BaseNode> = new Map();
  private edges: Map<string, Edge> = new Map();
  private finished: boolean = false;

  constructor(ctx: ParserRuleContext, swimLanes: SwimLanes) {
    this.ctx = ctx;
    this.swimLanes = swimLanes;
  }

  getFirstSwimLane(): SwimLane {
    return Array.from(this.swimLanes.lanes.values())[0];
  }

  setFinished(): void {
    this.finished = true;
  }

  isFinished(): boolean {
    return this.finished;
  }

  getTile(node?: BaseNode | null): Tile {
    return this.createBlock();
  }

  setInboundNode(node: BaseNode): void {
    return;
  }

  setOutboundNode(node: BaseNode): void {
    return;
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

  createBlock(): Tile {
    let currentStatement = this.firstChild;

    while (currentStatement) {
      const tile = currentStatement.getTile();
      tile.nodes.forEach((node) => this.nodes.set(node.id, node));
      tile.edges.forEach((edge) => this.edges.set(edge.id, edge));

      currentStatement = currentStatement.getNext()!;
    }

    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
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
