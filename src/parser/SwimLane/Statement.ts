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
  protected parent: IBlockStatement | null = null;
  protected nodes: Map<string, BaseNode> = new Map();
  protected edges: Map<string, Edge> = new Map();
  protected outboundNode: BaseNode | null = null;
  protected inboundNode: BaseNode | null = null;

  constructor(
    ctx: ParserRuleContext,
    swimLanes: SwimLanes,
    parentStatement: IBlockStatement | null,
  ) {
    this.ctx = ctx;
    this.swimLanes = swimLanes;

    this.parent = parentStatement;
    if (this.parent) {
      this.parent.appendChild(this);
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
  private statements: IStatement[] = [];
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
    this.statements.push(statement);
  }

  getInboundNode(): BaseNode | null {
    return null;
  }

  createBlock(): Tile {
    let inboundNode: BaseNode | null = null;
    for (const statement of this.statements) {
      const tile = statement.getTile(inboundNode);
      tile.nodes.forEach((node) => this.nodes.set(node.id, node));
      tile.edges.forEach((edge) => this.edges.set(edge.id, edge));
      inboundNode = statement.getOutboundNode();
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
